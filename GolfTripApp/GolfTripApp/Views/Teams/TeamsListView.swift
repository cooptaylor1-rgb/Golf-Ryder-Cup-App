import SwiftUI
import SwiftData

struct TeamsListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Trip.startDate, order: .descending) private var trips: [Trip]
    @Query(sort: \Team.name) private var allTeams: [Team]
    
    @State private var selectedTrip: Trip?
    @State private var showingAddTeam = false
    @State private var teamToDelete: Team?
    
    var tripTeams: [Team] {
        guard let trip = selectedTrip else { return [] }
        return (trip.teams ?? []).sorted { $0.name < $1.name }
    }
    
    var body: some View {
        NavigationStack {
            Group {
                if trips.isEmpty {
                    ContentUnavailableView {
                        Label("No Trips", systemImage: "airplane")
                    } description: {
                        Text("Create a trip first, then add teams.")
                    }
                } else if selectedTrip == nil && !trips.isEmpty {
                    ProgressView()
                        .onAppear {
                            selectedTrip = trips.first
                        }
                } else {
                    List {
                        // Trip teams
                        Section {
                            if tripTeams.isEmpty {
                                ContentUnavailableView {
                                    Label("No Teams", systemImage: "person.2.badge.gearshape")
                                } description: {
                                    Text("Create teams to organize players for competitions.")
                                } actions: {
                                    Button("Create Team") {
                                        showingAddTeam = true
                                    }
                                    .buttonStyle(.borderedProminent)
                                }
                            } else {
                                ForEach(tripTeams) { team in
                                    NavigationLink {
                                        TeamDetailView(team: team)
                                    } label: {
                                        TeamRowView(team: team)
                                    }
                                }
                                .onDelete(perform: confirmDelete)
                            }
                        } header: {
                            if let trip = selectedTrip {
                                HStack {
                                    Text(trip.name)
                                    Spacer()
                                    if !tripTeams.isEmpty {
                                        Text("\(tripTeams.count) team\(tripTeams.count == 1 ? "" : "s")")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                        
                        // Ryder Cup mode hint
                        if tripTeams.count == 2 {
                            Section {
                                RyderCupStatusView(teams: tripTeams)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Teams")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if trips.count > 1 {
                        Menu {
                            ForEach(trips) { trip in
                                Button {
                                    selectedTrip = trip
                                } label: {
                                    HStack {
                                        Text(trip.name)
                                        if trip.id == selectedTrip?.id {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                        } label: {
                            Image(systemName: "chevron.down.circle")
                        }
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddTeam = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .disabled(selectedTrip == nil)
                }
            }
            .sheet(isPresented: $showingAddTeam) {
                if let trip = selectedTrip {
                    TeamFormView(trip: trip, mode: .add)
                }
            }
            .alert("Delete Team?", isPresented: .init(
                get: { teamToDelete != nil },
                set: { if !$0 { teamToDelete = nil } }
            )) {
                Button("Cancel", role: .cancel) { teamToDelete = nil }
                Button("Delete", role: .destructive) {
                    if let team = teamToDelete {
                        deleteTeam(team)
                    }
                }
            } message: {
                if let team = teamToDelete {
                    Text("Delete \(team.name) and remove all player assignments?")
                }
            }
        }
    }
    
    private func confirmDelete(at offsets: IndexSet) {
        if let index = offsets.first {
            teamToDelete = tripTeams[index]
        }
    }
    
    private func deleteTeam(_ team: Team) {
        modelContext.delete(team)
        try? modelContext.save()
        teamToDelete = nil
    }
}

struct TeamRowView: View {
    let team: Team
    
    var body: some View {
        HStack(spacing: 12) {
            // Color indicator
            if let colorHex = team.colorHex {
                Circle()
                    .fill(Color(hex: colorHex))
                    .frame(width: 24, height: 24)
            } else {
                Circle()
                    .fill(.gray.opacity(0.3))
                    .frame(width: 24, height: 24)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(team.name)
                        .font(.headline)
                    
                    if team.mode == .ryderCup {
                        Text("Ryder Cup")
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.blue.opacity(0.2))
                            .cornerRadius(4)
                    }
                }
                
                HStack(spacing: 8) {
                    Text("\(team.size) player\(team.size == 1 ? "" : "s")")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    
                    if let captain = team.captain {
                        Text("• Captain: \(captain.name)")
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

struct RyderCupStatusView: View {
    let teams: [Team]
    
    var isBalanced: Bool {
        teams.count == 2 && teams[0].size == teams[1].size && teams[0].size > 0
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: isBalanced ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                    .foregroundStyle(isBalanced ? .green : .orange)
                Text("Ryder Cup Mode")
                    .font(.headline)
            }
            
            if isBalanced {
                Text("Teams are balanced (\(teams[0].size) vs \(teams[1].size) players)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                Text("For Ryder Cup, ensure both teams have the same number of players")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    TeamsListView()
        .modelContainer(for: [Trip.self, Team.self, TeamMember.self], inMemory: true)
}
