import SwiftUI
import SwiftData

struct ScorecardSetupView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let scheduleItem: ScheduleItem
    
    @Query(sort: \Format.name) private var formats: [Format]
    @Query(sort: \Player.name) private var allPlayers: [Player]
    
    @State private var selectedFormat: Format?
    @State private var selectedFormatType: FormatType = .strokePlayNet
    @State private var selectedPlayerIds: Set<UUID> = []
    @State private var navigateToScoring = false
    @State private var createdScorecard: Scorecard?
    
    var itemPlayers: [Player] {
        scheduleItem.allPlayers
    }
    
    var body: some View {
        List {
            // Tee time info
            Section("Tee Time") {
                LabeledContent("Time", value: scheduleItem.formattedStartTime)
                
                if let teeSet = scheduleItem.teeSet, let course = teeSet.course {
                    LabeledContent("Course", value: course.name)
                    LabeledContent("Tees", value: teeSet.displayName)
                    LabeledContent("Rating/Slope", value: "\(String(format: "%.1f", teeSet.rating))/\(teeSet.slope)")
                }
            }
            
            // Format selection
            Section("Game Format") {
                ForEach(FormatType.allCases, id: \.self) { formatType in
                    Button {
                        selectedFormatType = formatType
                    } label: {
                        HStack {
                            Image(systemName: formatType.iconName)
                                .frame(width: 24)
                            
                            VStack(alignment: .leading) {
                                Text(formatType.displayName)
                                    .font(.headline)
                                Text(formatType.description)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            
                            Spacer()
                            
                            if selectedFormatType == formatType {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(.green)
                            }
                        }
                    }
                    .foregroundStyle(.primary)
                }
            }
            
            // Player selection
            Section("Players") {
                if itemPlayers.isEmpty {
                    Text("Select from all players:")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    ForEach(allPlayers) { player in
                        PlayerSelectionRow(
                            player: player,
                            teeSet: scheduleItem.teeSet,
                            isSelected: selectedPlayerIds.contains(player.id)
                        ) {
                            togglePlayer(player)
                        }
                    }
                } else {
                    ForEach(itemPlayers) { player in
                        PlayerSelectionRow(
                            player: player,
                            teeSet: scheduleItem.teeSet,
                            isSelected: selectedPlayerIds.contains(player.id)
                        ) {
                            togglePlayer(player)
                        }
                    }
                }
            }
            
            // Start scoring
            Section {
                Button {
                    createScorecard()
                } label: {
                    HStack {
                        Spacer()
                        Text("Start Scoring")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                }
                .disabled(selectedPlayerIds.isEmpty)
            }
        }
        .navigationTitle("Setup Scorecard")
        .navigationDestination(isPresented: $navigateToScoring) {
            if let scorecard = createdScorecard {
                ScoreEntryView(scorecard: scorecard)
            }
        }
        .onAppear {
            // Pre-select all players from the tee time groups
            selectedPlayerIds = Set(itemPlayers.map { $0.id })
        }
    }
    
    private func togglePlayer(_ player: Player) {
        if selectedPlayerIds.contains(player.id) {
            selectedPlayerIds.remove(player.id)
        } else {
            selectedPlayerIds.insert(player.id)
        }
    }
    
    private func createScorecard() {
        // Create or get format
        let format = Format(name: selectedFormatType.displayName, type: selectedFormatType)
        modelContext.insert(format)
        
        // Create scorecard
        let scorecard = Scorecard(status: .inProgress)
        scorecard.scheduleItem = scheduleItem
        scorecard.format = format
        modelContext.insert(scorecard)
        
        // Initialize hole scores for each selected player
        let selectedPlayers = (itemPlayers.isEmpty ? allPlayers : itemPlayers)
            .filter { selectedPlayerIds.contains($0.id) }
        
        for player in selectedPlayers {
            for hole in 1...18 {
                let holeScore = HoleScore(holeNumber: hole, strokes: 0)
                holeScore.scorecard = scorecard
                holeScore.player = player
                modelContext.insert(holeScore)
            }
        }
        
        do {
            try modelContext.save()
            createdScorecard = scorecard
            navigateToScoring = true
        } catch {
            print("Error creating scorecard: \(error)")
        }
    }
}

struct PlayerSelectionRow: View {
    let player: Player
    let teeSet: TeeSet?
    let isSelected: Bool
    let onTap: () -> Void
    
    var courseHandicap: Int? {
        guard let teeSet = teeSet else { return nil }
        return player.courseHandicap(for: teeSet)
    }
    
    var body: some View {
        Button {
            onTap()
        } label: {
            HStack {
                VStack(alignment: .leading) {
                    Text(player.name)
                        .font(.headline)
                    
                    HStack(spacing: 8) {
                        Text("Index: \(player.formattedHandicap)")
                        
                        if let ch = courseHandicap {
                            Text("• Course: \(ch)")
                        }
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                } else {
                    Image(systemName: "circle")
                        .foregroundStyle(.gray)
                }
            }
        }
        .foregroundStyle(.primary)
    }
}

#Preview {
    NavigationStack {
        ScorecardSetupView(scheduleItem: ScheduleItem(type: .teeTime, title: "Morning Round"))
    }
    .modelContainer(for: [ScheduleItem.self, Format.self, Scorecard.self, Player.self], inMemory: true)
}
