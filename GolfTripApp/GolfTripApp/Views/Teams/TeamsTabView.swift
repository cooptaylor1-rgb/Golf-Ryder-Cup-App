import SwiftUI
import SwiftData

/// Teams tab - Enhanced team management with captain tools
struct TeamsTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var trips: [Trip]
    @Query private var players: [Player]
    @State private var selectedTeamIndex = 0
    @State private var showTeamForm = false
    @State private var teamToEdit: Team?
    
    private var currentTrip: Trip? {
        trips.first
    }
    
    private var teams: [Team] {
        currentTrip?.teams?.filter { $0.mode == .ryderCup } ?? []
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if let trip = currentTrip, teams.count >= 2 {
                    // Team selector
                    teamSelector
                    
                    // Selected team content
                    if selectedTeamIndex < teams.count {
                        teamContent(teams[selectedTeamIndex], trip: trip)
                    }
                } else if let trip = currentTrip {
                    setupTeamsPrompt(trip)
                } else {
                    EmptyStateView(
                        icon: "person.2",
                        title: "No Trip",
                        description: "Create a trip first to manage teams."
                    )
                }
            }
            .navigationTitle("Teams")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if teams.count < 2 {
                        Button(action: { showTeamForm = true }) {
                            Image(systemName: "plus")
                        }
                    } else {
                        Menu {
                            Button("Edit Team A", systemImage: "pencil") {
                                teamToEdit = teams.first
                            }
                            Button("Edit Team B", systemImage: "pencil") {
                                teamToEdit = teams.count > 1 ? teams[1] : nil
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .sheet(isPresented: $showTeamForm) {
                TeamFormView(trip: currentTrip)
            }
            .sheet(item: $teamToEdit) { team in
                TeamFormView(trip: currentTrip, team: team)
            }
        }
    }
    
    // MARK: - Team Selector
    
    private var teamSelector: some View {
        HStack(spacing: 0) {
            ForEach(Array(teams.enumerated()), id: \.element.id) { index, team in
                Button(action: { selectedTeamIndex = index }) {
                    VStack(spacing: DesignTokens.Spacing.xs) {
                        Text(team.name)
                            .font(.headline)
                        Text("\(team.size) players")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, DesignTokens.Spacing.md)
                    .background(selectedTeamIndex == index ? teamColor(index).opacity(0.15) : Color.clear)
                }
                .foregroundColor(teamColor(index))
            }
        }
        .background(Color.surfaceVariant)
    }
    
    private func teamColor(_ index: Int) -> Color {
        index == 0 ? .teamUSA : .teamEurope
    }
    
    // MARK: - Team Content
    
    @ViewBuilder
    private func teamContent(_ team: Team, trip: Trip) -> some View {
        let isTeamA = teams.first?.id == team.id
        let allMatches = trip.sortedSessions.flatMap { $0.sortedMatches }
        
        ScrollView {
            VStack(spacing: DesignTokens.Spacing.lg) {
                // Team header
                teamHeader(team, color: isTeamA ? .teamUSA : .teamEurope)
                
                // Team stats
                teamStatsCard(team, matches: allMatches, isTeamA: isTeamA)
                
                // Roster
                rosterSection(team, matches: allMatches, isTeamA: isTeamA)
                
                // Pairing matrix (if matches exist)
                if !allMatches.isEmpty {
                    pairingMatrixSection(team, matches: allMatches, isTeamA: isTeamA)
                }
            }
            .padding(DesignTokens.Spacing.lg)
        }
    }
    
    // MARK: - Team Header
    
    @ViewBuilder
    private func teamHeader(_ team: Team, color: Color) -> some View {
        VStack(spacing: DesignTokens.Spacing.md) {
            Circle()
                .fill(color)
                .frame(width: 64, height: 64)
                .overlay(
                    Image(systemName: "flag.fill")
                        .font(.title)
                        .foregroundColor(.white)
                )
            
            Text(team.name)
                .font(.title2.weight(.bold))
            
            if let captain = team.captain {
                HStack {
                    Image(systemName: "crown.fill")
                        .foregroundColor(.secondaryGold)
                    Text("Captain: \(captain.name)")
                        .font(.subheadline)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(DesignTokens.Spacing.lg)
        .cardStyle()
    }
    
    // MARK: - Team Stats
    
    @ViewBuilder
    private func teamStatsCard(_ team: Team, matches: [Match], isTeamA: Bool) -> some View {
        let teamMatches = matches.filter { match in
            isTeamA ? !match.teamAIds.isEmpty : !match.teamBIds.isEmpty
        }
        
        let wins = teamMatches.filter { ($0.result == .teamAWin && isTeamA) || ($0.result == .teamBWin && !isTeamA) }.count
        let losses = teamMatches.filter { ($0.result == .teamBWin && isTeamA) || ($0.result == .teamAWin && !isTeamA) }.count
        let halves = teamMatches.filter { $0.result == .halved }.count
        
        let points = isTeamA ? currentTrip?.teamATotalPoints ?? 0 : currentTrip?.teamBTotalPoints ?? 0
        
        HStack(spacing: DesignTokens.Spacing.xl) {
            statItem(value: String(format: "%.1f", points), label: "Points")
            statItem(value: "\(wins)-\(losses)-\(halves)", label: "Record")
            statItem(value: "\(team.size)", label: "Players")
        }
        .padding(DesignTokens.Spacing.lg)
        .cardStyle()
    }
    
    @ViewBuilder
    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: DesignTokens.Spacing.xs) {
            Text(value)
                .font(.title2.weight(.bold))
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Roster Section
    
    @ViewBuilder
    private func rosterSection(_ team: Team, matches: [Match], isTeamA: Bool) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
            Text("ROSTER")
                .font(.caption.weight(.bold))
                .foregroundColor(.secondary)
            
            ForEach(team.sortedMembers, id: \.id) { member in
                if let player = member.player {
                    playerRosterRow(player: player, isCaptain: member.isCaptain, matches: matches, isTeamA: isTeamA)
                }
            }
        }
        .padding(DesignTokens.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
    
    @ViewBuilder
    private func playerRosterRow(player: Player, isCaptain: Bool, matches: [Match], isTeamA: Bool) -> some View {
        let teamAIds = Set((currentTrip?.teamA?.players ?? []).map { $0.id })
        let points = TournamentEngine.playerPoints(playerId: player.id, matches: matches, teamAPlayerIds: teamAIds)
        let record = TournamentEngine.playerRecord(playerId: player.id, matches: matches)
        
        HStack {
            AvatarView(name: player.name, imageData: player.avatarData, size: 44)
            
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(player.name)
                        .font(.subheadline.weight(.medium))
                    
                    if isCaptain {
                        Image(systemName: "crown.fill")
                            .font(.caption2)
                            .foregroundColor(.secondaryGold)
                    }
                }
                
                Text("\(String(format: "%.1f", player.handicapIndex)) HCP")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text(String(format: "%.1f pts", points))
                    .font(.subheadline.weight(.semibold))
                
                Text("\(record.0)-\(record.1)-\(record.2)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, DesignTokens.Spacing.sm)
    }
    
    // MARK: - Pairing Matrix
    
    @ViewBuilder
    private func pairingMatrixSection(_ team: Team, matches: [Match], isTeamA: Bool) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
            Text("PAIRING HISTORY")
                .font(.caption.weight(.bold))
                .foregroundColor(.secondary)
            
            Text("Who has played with whom")
                .font(.caption)
                .foregroundColor(.secondary)
            
            // Simple count display for now
            let players = team.players
            if players.count > 1 {
                ForEach(players, id: \.id) { player in
                    let partnerCounts = countPartners(for: player, in: matches, teamPlayers: players, isTeamA: isTeamA)
                    if !partnerCounts.isEmpty {
                        VStack(alignment: .leading, spacing: DesignTokens.Spacing.xs) {
                            Text(player.name)
                                .font(.caption.weight(.medium))
                            
                            HStack(spacing: DesignTokens.Spacing.sm) {
                                ForEach(partnerCounts.prefix(3), id: \.partner.id) { item in
                                    Text("\(firstName(item.partner.name)): \(item.count)")
                                        .font(.caption2)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 2)
                                        .background(Color.surfaceVariant)
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }
                }
            }
        }
        .padding(DesignTokens.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
    
    private func countPartners(for player: Player, in matches: [Match], teamPlayers: [Player], isTeamA: Bool) -> [(partner: Player, count: Int)] {
        var counts: [UUID: Int] = [:]
        
        for match in matches {
            let teamIds = isTeamA ? match.teamAIds : match.teamBIds
            if teamIds.contains(player.id) {
                for partnerId in teamIds where partnerId != player.id {
                    counts[partnerId, default: 0] += 1
                }
            }
        }
        
        return teamPlayers
            .filter { counts[$0.id] != nil }
            .map { (partner: $0, count: counts[$0.id]!) }
            .sorted { $0.count > $1.count }
    }
    
    private func firstName(_ fullName: String) -> String {
        fullName.split(separator: " ").first.map(String.init) ?? fullName
    }
    
    // MARK: - Setup Prompt
    
    @ViewBuilder
    private func setupTeamsPrompt(_ trip: Trip) -> some View {
        EmptyStateView(
            icon: "person.2.fill",
            title: "Set Up Teams",
            description: "Create two teams for your Ryder Cup competition. You need exactly 2 teams with equal rosters.",
            actionTitle: "Create Team",
            action: { showTeamForm = true }
        )
    }
}

// MARK: - Team Form View

struct TeamFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var players: [Player]
    
    let trip: Trip?
    var team: Team?
    
    @State private var name = ""
    @State private var selectedPlayers: Set<UUID> = []
    @State private var captainId: UUID?
    @State private var notes = ""
    
    private var isEditing: Bool { team != nil }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Team Info") {
                    TextField("Team Name", text: $name)
                        .autocorrectionDisabled()
                    
                    TextEditor(text: $notes)
                        .frame(height: 60)
                }
                
                Section("Players (\(selectedPlayers.count) selected)") {
                    ForEach(players, id: \.id) { player in
                        playerSelectionRow(player)
                    }
                }
                
                if !selectedPlayers.isEmpty {
                    Section("Captain") {
                        Picker("Captain", selection: $captainId) {
                            Text("None").tag(nil as UUID?)
                            ForEach(players.filter { selectedPlayers.contains($0.id) }, id: \.id) { player in
                                Text(player.name).tag(player.id as UUID?)
                            }
                        }
                    }
                }
            }
            .navigationTitle(isEditing ? "Edit Team" : "New Team")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isEditing ? "Save" : "Create") { saveTeam() }
                        .disabled(name.isEmpty || selectedPlayers.isEmpty)
                }
            }
            .onAppear {
                if let team = team {
                    name = team.name
                    notes = team.notes ?? ""
                    selectedPlayers = Set(team.players.map { $0.id })
                    captainId = team.captain?.id
                }
            }
        }
    }
    
    @ViewBuilder
    private func playerSelectionRow(_ player: Player) -> some View {
        Button(action: { togglePlayer(player) }) {
            HStack {
                AvatarView(name: player.name, imageData: player.avatarData, size: 36)
                
                VStack(alignment: .leading) {
                    Text(player.name)
                    Text("\(String(format: "%.1f", player.handicapIndex)) HCP")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if selectedPlayers.contains(player.id) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.accentColor)
                }
            }
        }
        .foregroundColor(.primary)
    }
    
    private func togglePlayer(_ player: Player) {
        if selectedPlayers.contains(player.id) {
            selectedPlayers.remove(player.id)
            if captainId == player.id {
                captainId = nil
            }
        } else {
            selectedPlayers.insert(player.id)
        }
    }
    
    private func saveTeam() {
        if let team = team {
            // Update existing
            team.name = name
            team.notes = notes.isEmpty ? nil : notes
            
            // Update members
            for member in team.sortedMembers {
                modelContext.delete(member)
            }
            
            for (index, playerId) in selectedPlayers.enumerated() {
                if let player = players.first(where: { $0.id == playerId }) {
                    let member = TeamMember(isCaptain: playerId == captainId, sortOrder: index)
                    member.team = team
                    member.player = player
                    modelContext.insert(member)
                }
            }
            
            team.updatedAt = Date()
        } else {
            // Create new
            let newTeam = Team(name: name, mode: .ryderCup)
            newTeam.notes = notes.isEmpty ? nil : notes
            newTeam.trip = trip
            modelContext.insert(newTeam)
            
            for (index, playerId) in selectedPlayers.enumerated() {
                if let player = players.first(where: { $0.id == playerId }) {
                    let member = TeamMember(isCaptain: playerId == captainId, sortOrder: index)
                    member.team = newTeam
                    member.player = player
                    modelContext.insert(member)
                }
            }
        }
        
        dismiss()
    }
}

#Preview {
    TeamsTabView()
        .modelContainer(for: [Trip.self, Team.self, Player.self, Match.self], inMemory: true)
}
