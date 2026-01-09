import SwiftUI
import SwiftData

struct ScorecardSummaryView: View {
    let scorecard: Scorecard
    
    var teeSet: TeeSet? {
        scorecard.teeSet
    }
    
    var players: [Player] {
        scorecard.players
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                if let teeSet = teeSet, let course = teeSet.course {
                    VStack(spacing: 4) {
                        Text(course.name)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("\(teeSet.displayName) - Rating: \(String(format: "%.1f", teeSet.rating)) / Slope: \(teeSet.slope)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding()
                }
                
                // Scorecard grid
                ScorecardGrid(scorecard: scorecard, teeSet: teeSet, players: players)
                    .padding(.horizontal)
            }
        }
        .navigationTitle("Scorecard")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ScorecardGrid: View {
    let scorecard: Scorecard
    let teeSet: TeeSet?
    let players: [Player]
    
    var body: some View {
        VStack(spacing: 0) {
            // Front 9
            ScorecardSection(
                title: "Front 9",
                holes: Array(1...9),
                scorecard: scorecard,
                teeSet: teeSet,
                players: players
            )
            
            // Back 9
            ScorecardSection(
                title: "Back 9",
                holes: Array(10...18),
                scorecard: scorecard,
                teeSet: teeSet,
                players: players
            )
            
            // Totals
            TotalsRow(scorecard: scorecard, teeSet: teeSet, players: players)
        }
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}

struct ScorecardSection: View {
    let title: String
    let holes: [Int]
    let scorecard: Scorecard
    let teeSet: TeeSet?
    let players: [Player]
    
    var body: some View {
        VStack(spacing: 0) {
            // Section header
            Text(title)
                .font(.caption)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.green.opacity(0.2))
            
            // Hole numbers row
            HStack(spacing: 0) {
                Text("Hole")
                    .frame(width: 60, alignment: .leading)
                    .font(.caption2)
                    .fontWeight(.bold)
                
                ForEach(holes, id: \.self) { hole in
                    Text("\(hole)")
                        .frame(maxWidth: .infinity)
                        .font(.caption2)
                        .fontWeight(.bold)
                }
                
                Text("Out")
                    .frame(width: 40)
                    .font(.caption2)
                    .fontWeight(.bold)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(.gray.opacity(0.1))
            
            // Par row
            if let teeSet = teeSet, let pars = teeSet.holePars {
                HStack(spacing: 0) {
                    Text("Par")
                        .frame(width: 60, alignment: .leading)
                        .font(.caption2)
                    
                    ForEach(holes, id: \.self) { hole in
                        Text("\(pars[hole - 1])")
                            .frame(maxWidth: .infinity)
                            .font(.caption2)
                    }
                    
                    let total = holes.reduce(0) { $0 + pars[$1 - 1] }
                    Text("\(total)")
                        .frame(width: 40)
                        .font(.caption2)
                        .fontWeight(.semibold)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
            }
            
            // Handicap row
            if let teeSet = teeSet {
                HStack(spacing: 0) {
                    Text("HCP")
                        .frame(width: 60, alignment: .leading)
                        .font(.caption2)
                        .foregroundStyle(.green)
                    
                    ForEach(holes, id: \.self) { hole in
                        Text("\(teeSet.holeHandicaps[hole - 1])")
                            .frame(maxWidth: .infinity)
                            .font(.caption2)
                            .foregroundStyle(.green)
                    }
                    
                    Text("")
                        .frame(width: 40)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.green.opacity(0.05))
            }
            
            // Player scores
            ForEach(players) { player in
                PlayerScoreRow(
                    player: player,
                    holes: holes,
                    scorecard: scorecard,
                    teeSet: teeSet
                )
            }
        }
    }
}

struct PlayerScoreRow: View {
    let player: Player
    let holes: [Int]
    let scorecard: Scorecard
    let teeSet: TeeSet?
    
    var scores: [Int: HoleScore] {
        var dict: [Int: HoleScore] = [:]
        for score in scorecard.scores(for: player) {
            dict[score.holeNumber] = score
        }
        return dict
    }
    
    var strokesAllocation: [Int] {
        guard let teeSet = teeSet else { return Array(repeating: 0, count: 18) }
        let courseHandicap = player.courseHandicap(for: teeSet)
        return HandicapCalculator.allocateStrokes(
            courseHandicap: courseHandicap,
            holeHandicaps: teeSet.holeHandicaps
        )
    }
    
    var body: some View {
        HStack(spacing: 0) {
            Text(player.name.prefix(8))
                .frame(width: 60, alignment: .leading)
                .font(.caption2)
                .lineLimit(1)
            
            ForEach(holes, id: \.self) { hole in
                ZStack {
                    if let score = scores[hole], score.strokes > 0 {
                        let par = teeSet?.holePars?[hole - 1] ?? 4
                        let strokes = strokesAllocation[hole - 1]
                        let net = score.strokes - strokes
                        let diff = net - par
                        
                        Text("\(score.strokes)")
                            .font(.caption2)
                            .fontWeight(strokes > 0 ? .bold : .regular)
                            .foregroundStyle(scoreColor(diff))
                            .padding(2)
                            .background(scoreBackground(diff))
                            .cornerRadius(4)
                    } else {
                        Text("-")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
            }
            
            // Total for this 9
            let total = holes.compactMap { scores[$0]?.strokes }.reduce(0, +)
            Text("\(total)")
                .frame(width: 40)
                .font(.caption2)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }
    
    private func scoreColor(_ diff: Int) -> Color {
        if diff < 0 { return .white }
        if diff == 0 { return .primary }
        return .primary
    }
    
    private func scoreBackground(_ diff: Int) -> Color {
        if diff <= -2 { return .yellow }
        if diff == -1 { return .green }
        if diff == 0 { return .clear }
        if diff == 1 { return .clear }
        return .red.opacity(0.3)
    }
}

struct TotalsRow: View {
    let scorecard: Scorecard
    let teeSet: TeeSet?
    let players: [Player]
    
    var body: some View {
        VStack(spacing: 0) {
            Divider()
            
            // Header
            HStack(spacing: 0) {
                Text("Player")
                    .frame(width: 100, alignment: .leading)
                    .font(.caption)
                    .fontWeight(.bold)
                
                Text("Gross")
                    .frame(maxWidth: .infinity)
                    .font(.caption)
                    .fontWeight(.bold)
                
                Text("Net")
                    .frame(maxWidth: .infinity)
                    .font(.caption)
                    .fontWeight(.bold)
                
                if scorecard.format?.type == .stableford {
                    Text("Pts")
                        .frame(maxWidth: .infinity)
                        .font(.caption)
                        .fontWeight(.bold)
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(.gray.opacity(0.2))
            
            // Player totals
            ForEach(players) { player in
                HStack(spacing: 0) {
                    Text(player.name)
                        .frame(width: 100, alignment: .leading)
                        .font(.caption)
                        .lineLimit(1)
                    
                    let gross = scorecard.totalGross(for: player)
                    Text("\(gross)")
                        .frame(maxWidth: .infinity)
                        .font(.caption)
                    
                    if let teeSet = teeSet {
                        let net = scorecard.totalNet(for: player, teeSet: teeSet)
                        Text("\(net)")
                            .frame(maxWidth: .infinity)
                            .font(.caption)
                            .fontWeight(.semibold)
                        
                        if scorecard.format?.type == .stableford {
                            let points = scorecard.stablefordPoints(for: player, teeSet: teeSet)
                            Text("\(points)")
                                .frame(maxWidth: .infinity)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(.green)
                        }
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
            }
        }
    }
}

#Preview {
    NavigationStack {
        ScorecardSummaryView(scorecard: Scorecard(status: .inProgress))
    }
    .modelContainer(for: [Scorecard.self, HoleScore.self, Player.self], inMemory: true)
}
