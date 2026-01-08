import SwiftUI
import SwiftData

struct TeamDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @Bindable var team: Team
    @Query(sort: \Player.name) private var allPlayers: [Player]
    
    @State private var showingEditSheet = false
    @State private var showingPlayerPicker = false
    @State private var showingDeleteAlert = false
    @State private var memberToToggleCaptain: TeamMember?
    
    var body: some View {
        List {
            // Team info
            Section("Team Information") {
                HStack {
                    Text("Name")
                    Spacer()
                    if let colorHex = team.colorHex {
                        Circle()
                            .fill(Color(hex: colorHex))
                            .frame(width: 16, height: 16)
                    }
                    Text(team.name)
                }
                
                LabeledContent("Mode", value: team.mode.displayName)
                LabeledContent("Players", value: "\(team.size)")
                
                if let captain = team.captain {
                    LabeledContent("Captain", value: captain.name)
                }
            }
            
            // Team roster
            Section {
                if team.sortedMembers.isEmpty {
                    ContentUnavailableView {
                        Label("No Players", systemImage: "person.3")
                    } description: {
                        Text("Add players to this team.")
                    } actions: {
                        Button("Add Players") {
                            showingPlayerPicker = true
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    ForEach(team.sortedMembers) { member in
                        if let player = member.player {
                            TeamMemberRow(member: member, player: player, onToggleCaptain: {
                                toggleCaptain(member)
                            })
                        }
                    }
                    .onDelete(perform: removeMember)
                    .onMove(perform: moveMember)
                }
            } header: {
                HStack {
                    Text("Roster")
                    Spacer()
                    Button {
                        showingPlayerPicker = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.green)
                    }
                }
            }
            
            // Notes
            if let notes = team.notes, !notes.isEmpty {
                Section("Notes") {
                    Text(notes)
                }
            }
            
            // Delete
            Section {
                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Delete Team")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle(team.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                EditButton()
            }
            
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            if let trip = team.trip {
                TeamFormView(trip: trip, mode: .edit(team))
            }
        }
        .sheet(isPresented: $showingPlayerPicker) {
            TeamPlayerPickerView(team: team, allPlayers: allPlayers)
        }
        .alert("Delete Team?", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deleteTeam()
            }
        } message: {
            Text("Delete \(team.name) and remove all player assignments?")
        }
    }
    
    private func removeMember(at offsets: IndexSet) {
        for index in offsets {
            let member = team.sortedMembers[index]
            modelContext.delete(member)
        }
        try? modelContext.save()
    }
    
    private func moveMember(from source: IndexSet, to destination: Int) {
        var members = team.sortedMembers
        members.move(fromOffsets: source, toOffset: destination)
        
        for (index, member) in members.enumerated() {
            member.sortOrder = index
        }
        
        try? modelContext.save()
    }
    
    private func toggleCaptain(_ member: TeamMember) {
        // If already captain, remove captain status
        if member.isCaptain {
            member.isCaptain = false
        } else {
            // Remove captain from others first
            for m in team.sortedMembers {
                m.isCaptain = false
            }
            member.isCaptain = true
        }
        try? modelContext.save()
    }
    
    private func deleteTeam() {
        modelContext.delete(team)
        try? modelContext.save()
        dismiss()
    }
}

struct TeamMemberRow: View {
    let member: TeamMember
    let player: Player
    let onToggleCaptain: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(player.name)
                        .font(.headline)
                    
                    if member.isCaptain {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                            .font(.caption)
                    }
                }
                
                Text("HCP: \(player.formattedHandicap)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Button {
                onToggleCaptain()
            } label: {
                Text(member.isCaptain ? "Captain" : "Make Captain")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(member.isCaptain ? .yellow.opacity(0.3) : .gray.opacity(0.2))
                    .cornerRadius(4)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 4)
    }
}

struct TeamPlayerPickerView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let team: Team
    let allPlayers: [Player]
    
    @State private var selectedPlayerIds: Set<UUID> = []
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(allPlayers) { player in
                    Button {
                        if selectedPlayerIds.contains(player.id) {
                            selectedPlayerIds.remove(player.id)
                        } else {
                            selectedPlayerIds.insert(player.id)
                        }
                    } label: {
                        HStack {
                            Text(player.name)
                            Spacer()
                            Text("HCP: \(player.formattedHandicap)")
                                .foregroundStyle(.secondary)
                            if selectedPlayerIds.contains(player.id) {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(.green)
                            }
                        }
                    }
                    .foregroundStyle(.primary)
                }
            }
            .navigationTitle("Select Players")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        updateTeamMembers()
                        dismiss()
                    }
                }
            }
            .onAppear {
                // Pre-select existing members
                selectedPlayerIds = Set(team.sortedMembers.compactMap { $0.player?.id })
            }
        }
    }
    
    private func updateTeamMembers() {
        // Get existing member player IDs
        let existingIds = Set(team.sortedMembers.compactMap { $0.player?.id })
        
        // Remove members no longer selected
        for member in team.sortedMembers {
            if let playerId = member.player?.id, !selectedPlayerIds.contains(playerId) {
                modelContext.delete(member)
            }
        }
        
        // Add new members
        var maxOrder = team.sortedMembers.map { $0.sortOrder }.max() ?? -1
        for player in allPlayers where selectedPlayerIds.contains(player.id) && !existingIds.contains(player.id) {
            maxOrder += 1
            let member = TeamMember(sortOrder: maxOrder)
            member.team = team
            member.player = player
            modelContext.insert(member)
        }
        
        try? modelContext.save()
    }
}

#Preview {
    NavigationStack {
        TeamDetailView(team: Team(name: "Team A", colorHex: "#E53935"))
    }
    .modelContainer(for: [Team.self, TeamMember.self, Player.self], inMemory: true)
}
