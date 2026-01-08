import SwiftUI
import SwiftData

enum PlayerSortOption: String, CaseIterable {
    case name = "Name"
    case handicap = "Handicap"
    
    var systemImage: String {
        switch self {
        case .name: return "textformat.abc"
        case .handicap: return "number.circle"
        }
    }
}

struct PlayersListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Player.name) private var players: [Player]
    
    @State private var searchText = ""
    @State private var showingAddPlayer = false
    @State private var sortOption: PlayerSortOption = .name
    @State private var playerToDelete: Player?
    @State private var showingDeleteAlert = false
    
    var filteredPlayers: [Player] {
        var result = players
        
        // Filter by search
        if !searchText.isEmpty {
            result = result.filter {
                $0.name.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Sort
        switch sortOption {
        case .name:
            result.sort { $0.name < $1.name }
        case .handicap:
            result.sort { $0.handicapIndex < $1.handicapIndex }
        }
        
        return result
    }
    
    var body: some View {
        NavigationStack {
            Group {
                if players.isEmpty {
                    ContentUnavailableView {
                        Label("No Players", systemImage: "person.3")
                    } description: {
                        Text("Add players to get started with your golf trip.")
                    } actions: {
                        Button("Add Player") {
                            showingAddPlayer = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                } else {
                    List {
                        ForEach(filteredPlayers) { player in
                            NavigationLink {
                                PlayerDetailView(player: player)
                            } label: {
                                PlayerRowView(player: player)
                            }
                        }
                        .onDelete(perform: confirmDelete)
                    }
                    .searchable(text: $searchText, prompt: "Search players")
                }
            }
            .navigationTitle("Players")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Menu {
                        ForEach(PlayerSortOption.allCases, id: \.self) { option in
                            Button {
                                sortOption = option
                            } label: {
                                HStack {
                                    Image(systemName: option.systemImage)
                                    Text("Sort by \(option.rawValue)")
                                    if sortOption == option {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        Image(systemName: "arrow.up.arrow.down.circle")
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddPlayer = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddPlayer) {
                PlayerFormView(mode: .add)
            }
            .alert("Delete Player?", isPresented: $showingDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    if let player = playerToDelete {
                        deletePlayer(player)
                    }
                }
            } message: {
                if let player = playerToDelete {
                    Text("Are you sure you want to delete \(player.name)?")
                }
            }
        }
    }
    
    private func confirmDelete(at offsets: IndexSet) {
        if let index = offsets.first {
            playerToDelete = filteredPlayers[index]
            showingDeleteAlert = true
        }
    }
    
    private func deletePlayer(_ player: Player) {
        modelContext.delete(player)
        try? modelContext.save()
    }
}

struct PlayerRowView: View {
    let player: Player
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            if let avatarData = player.avatarData,
               let uiImage = UIImage(data: avatarData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 44, height: 44)
                    .clipShape(Circle())
            } else {
                Circle()
                    .fill(.gray.opacity(0.3))
                    .frame(width: 44, height: 44)
                    .overlay {
                        Text(player.name.prefix(1).uppercased())
                            .font(.headline)
                            .foregroundStyle(.gray)
                    }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(player.name)
                    .font(.headline)
                
                HStack(spacing: 8) {
                    Text("HCP: \(player.formattedHandicap)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    
                    if let tee = player.teePreference {
                        Text("• \(tee)")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    PlayersListView()
        .modelContainer(for: Player.self, inMemory: true)
}
