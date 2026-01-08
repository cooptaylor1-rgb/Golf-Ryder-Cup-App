import SwiftUI
import SwiftData

struct ScorecardResultsView: View {
    let scorecard: Scorecard
    
    var teeSet: TeeSet? {
        scorecard.teeSet
    }
    
    var players: [Player] {
        scorecard.players
    }
    
    var sortedResults: [(player: Player, gross: Int, net: Int, points: Int)] {
        guard let teeSet = teeSet else {
            return players.map { ($0, scorecard.totalGross(for: $0), 0, 0) }
        }
        
        return players.map { player in
            let gross = scorecard.totalGross(for: player)
            let net = scorecard.totalNet(for: player, teeSet: teeSet)
            let points = scorecard.stablefordPoints(for: player, teeSet: teeSet)
            return (player, gross, net, points)
        }.sorted { first, second in
            if scorecard.format?.type == .stableford {
                return first.points > second.points
            } else {
                return first.net < second.net
            }
        }
    }
    
    var body: some View {
        List {
            // Podium
            Section {
                VStack(spacing: 16) {
                    HStack(alignment: .bottom, spacing: 12) {
                        // 2nd place
                        if sortedResults.count > 1 {
                            PodiumPlace(
                                place: 2,
                                player: sortedResults[1].player,
                                score: formatScore(sortedResults[1]),
                                height: 60
                            )
                        }
                        
                        // 1st place
                        if !sortedResults.isEmpty {
                            PodiumPlace(
                                place: 1,
                                player: sortedResults[0].player,
                                score: formatScore(sortedResults[0]),
                                height: 80
                            )
                        }
                        
                        // 3rd place
                        if sortedResults.count > 2 {
                            PodiumPlace(
                                place: 3,
                                player: sortedResults[2].player,
                                score: formatScore(sortedResults[2]),
                                height: 50
                            )
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
            }
            .listRowBackground(Color.clear)
            
            // Full results
            Section("Leaderboard") {
                ForEach(Array(sortedResults.enumerated()), id: \.element.player.id) { index, result in
                    HStack {
                        Text("\(index + 1)")
                            .font(.headline)
                            .frame(width: 24)
                            .foregroundStyle(index < 3 ? .green : .secondary)
                        
                        VStack(alignment: .leading) {
                            Text(result.player.name)
                                .font(.headline)
                            
                            Text("HCP: \(result.player.formattedHandicap)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing) {
                            if scorecard.format?.type == .stableford {
                                Text("\(result.points) pts")
                                    .font(.headline)
                                    .foregroundStyle(.green)
                            } else {
                                Text("\(result.net)")
                                    .font(.headline)
                            }
                            
                            Text("Gross: \(result.gross)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            
            // Full scorecard link
            Section {
                NavigationLink {
                    ScorecardSummaryView(scorecard: scorecard)
                } label: {
                    Label("View Full Scorecard", systemImage: "tablecells")
                }
            }
            
            // Round info
            Section("Round Info") {
                if let format = scorecard.format {
                    LabeledContent("Format", value: format.type.displayName)
                }
                
                if let teeSet = teeSet, let course = teeSet.course {
                    LabeledContent("Course", value: course.name)
                    LabeledContent("Tees", value: teeSet.displayName)
                }
                
                if let completed = scorecard.completedAt {
                    LabeledContent("Completed", value: completed.formatted(date: .abbreviated, time: .shortened))
                }
            }
        }
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func formatScore(_ result: (player: Player, gross: Int, net: Int, points: Int)) -> String {
        if scorecard.format?.type == .stableford {
            return "\(result.points) pts"
        }
        return "\(result.net)"
    }
}

struct PodiumPlace: View {
    let place: Int
    let player: Player
    let score: String
    let height: CGFloat
    
    var placeColor: Color {
        switch place {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .orange
        default: return .gray
        }
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Player name
            Text(player.name)
                .font(.caption)
                .fontWeight(.semibold)
                .lineLimit(1)
            
            // Score
            Text(score)
                .font(.headline)
            
            // Podium
            ZStack {
                RoundedRectangle(cornerRadius: 4)
                    .fill(placeColor.opacity(0.3))
                
                Text("\(place)")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundStyle(placeColor)
            }
            .frame(height: height)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    NavigationStack {
        ScorecardResultsView(scorecard: Scorecard(status: .final))
    }
    .modelContainer(for: [Scorecard.self, HoleScore.self, Player.self], inMemory: true)
}
