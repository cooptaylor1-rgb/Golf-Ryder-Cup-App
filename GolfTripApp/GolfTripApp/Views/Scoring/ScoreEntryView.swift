import SwiftUI
import SwiftData

struct ScoreEntryView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @Bindable var scorecard: Scorecard
    
    @State private var currentHole: Int = 1
    @State private var showingFinishAlert = false
    
    var teeSet: TeeSet? {
        scorecard.teeSet
    }
    
    var players: [Player] {
        scorecard.players
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Hole selector
            HoleSelector(currentHole: $currentHole)
            
            // Current hole info
            if let teeSet = teeSet {
                HoleInfoBar(
                    hole: currentHole,
                    par: teeSet.holePars?[currentHole - 1] ?? 4,
                    handicap: teeSet.holeHandicaps[currentHole - 1]
                )
            }
            
            // Score entry for each player
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(players) { player in
                        PlayerScoreCard(
                            player: player,
                            scorecard: scorecard,
                            currentHole: currentHole,
                            teeSet: teeSet
                        )
                    }
                }
                .padding()
            }
            
            // Navigation and action buttons
            HStack(spacing: 20) {
                Button {
                    if currentHole > 1 {
                        currentHole -= 1
                    }
                } label: {
                    Image(systemName: "chevron.left.circle.fill")
                        .font(.system(size: 44))
                }
                .disabled(currentHole <= 1)
                
                Spacer()
                
                VStack {
                    Text("Hole \(currentHole)")
                        .font(.title2)
                        .fontWeight(.bold)
                    Text("of 18")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                if currentHole < 18 {
                    Button {
                        currentHole += 1
                    } label: {
                        Image(systemName: "chevron.right.circle.fill")
                            .font(.system(size: 44))
                    }
                } else {
                    Button {
                        showingFinishAlert = true
                    } label: {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(.green)
                    }
                }
            }
            .padding()
            .background(.ultraThinMaterial)
        }
        .navigationTitle(scorecard.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button {
                        finishRound()
                    } label: {
                        Label("Finish Round", systemImage: "checkmark.circle")
                    }
                    
                    NavigationLink {
                        ScorecardSummaryView(scorecard: scorecard)
                    } label: {
                        Label("View Summary", systemImage: "list.bullet")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .alert("Finish Round?", isPresented: $showingFinishAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Finish") {
                finishRound()
            }
        } message: {
            Text("Mark this round as complete? You can still edit scores later.")
        }
    }
    
    private func finishRound() {
        scorecard.status = .final
        scorecard.completedAt = Date()
        try? modelContext.save()
        dismiss()
    }
}

struct HoleSelector: View {
    @Binding var currentHole: Int
    
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(1...18, id: \.self) { hole in
                        Button {
                            currentHole = hole
                        } label: {
                            Text("\(hole)")
                                .font(.headline)
                                .frame(width: 36, height: 36)
                                .background(hole == currentHole ? .green : .gray.opacity(0.2))
                                .foregroundStyle(hole == currentHole ? .white : .primary)
                                .cornerRadius(18)
                        }
                        .id(hole)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, 8)
            .background(.ultraThinMaterial)
            .onChange(of: currentHole) { _, newHole in
                withAnimation {
                    proxy.scrollTo(newHole, anchor: .center)
                }
            }
        }
    }
}

struct HoleInfoBar: View {
    let hole: Int
    let par: Int
    let handicap: Int
    
    var body: some View {
        HStack(spacing: 24) {
            VStack {
                Text("Par")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("\(par)")
                    .font(.title3)
                    .fontWeight(.bold)
            }
            
            Divider()
                .frame(height: 30)
            
            VStack {
                Text("Handicap")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("\(handicap)")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundStyle(.green)
            }
        }
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity)
        .background(.green.opacity(0.1))
    }
}

struct PlayerScoreCard: View {
    @Environment(\.modelContext) private var modelContext
    
    let player: Player
    let scorecard: Scorecard
    let currentHole: Int
    let teeSet: TeeSet?
    
    var holeScore: HoleScore? {
        scorecard.scores(for: player).first { $0.holeNumber == currentHole }
    }
    
    var strokesReceived: Int {
        guard let teeSet = teeSet else { return 0 }
        let courseHandicap = player.courseHandicap(for: teeSet)
        let allocation = HandicapCalculator.allocateStrokes(
            courseHandicap: courseHandicap,
            holeHandicaps: teeSet.holeHandicaps
        )
        return allocation[currentHole - 1]
    }
    
    var par: Int {
        teeSet?.holePars?[currentHole - 1] ?? 4
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Player header
            HStack {
                Text(player.name)
                    .font(.headline)
                
                Spacer()
                
                // Strokes received indicator
                if strokesReceived > 0 {
                    HStack(spacing: 4) {
                        ForEach(0..<strokesReceived, id: \.self) { _ in
                            Circle()
                                .fill(.orange)
                                .frame(width: 8, height: 8)
                        }
                    }
                } else if strokesReceived < 0 {
                    HStack(spacing: 4) {
                        ForEach(0..<abs(strokesReceived), id: \.self) { _ in
                            Circle()
                                .stroke(.red, lineWidth: 2)
                                .frame(width: 8, height: 8)
                        }
                    }
                }
            }
            
            // Score input
            HStack(spacing: 16) {
                Button {
                    decrementScore()
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(.red)
                }
                .disabled((holeScore?.strokes ?? 0) <= 0)
                
                VStack {
                    Text("\(holeScore?.strokes ?? 0)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                    
                    if let score = holeScore, score.strokes > 0 {
                        Text(scoreDescription(gross: score.strokes, par: par, strokes: strokesReceived))
                            .font(.caption)
                            .foregroundStyle(scoreColor(gross: score.strokes, par: par, strokes: strokesReceived))
                    }
                }
                .frame(width: 80)
                
                Button {
                    incrementScore()
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(.green)
                }
            }
            
            // Running totals
            HStack {
                let totalGross = scorecard.totalGross(for: player)
                let scoredHoles = scorecard.scores(for: player).filter { $0.strokes > 0 }.count
                
                Text("Gross: \(totalGross)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                
                Spacer()
                
                Text("Thru \(scoredHoles)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
    
    private func incrementScore() {
        if let score = holeScore {
            score.strokes += 1
            score.updatedAt = Date()
        } else {
            let newScore = HoleScore(holeNumber: currentHole, strokes: 1)
            newScore.scorecard = scorecard
            newScore.player = player
            modelContext.insert(newScore)
        }
        try? modelContext.save()
    }
    
    private func decrementScore() {
        if let score = holeScore, score.strokes > 0 {
            score.strokes -= 1
            score.updatedAt = Date()
            try? modelContext.save()
        }
    }
    
    private func scoreDescription(gross: Int, par: Int, strokes: Int) -> String {
        let net = gross - strokes
        let diff = net - par
        
        switch diff {
        case ..<(-2): return "Eagle+"
        case -2: return "Eagle"
        case -1: return "Birdie"
        case 0: return "Par"
        case 1: return "Bogey"
        case 2: return "Double"
        default: return "+\(diff)"
        }
    }
    
    private func scoreColor(gross: Int, par: Int, strokes: Int) -> Color {
        let net = gross - strokes
        let diff = net - par
        
        if diff < 0 { return .green }
        if diff == 0 { return .primary }
        return .red
    }
}

#Preview {
    NavigationStack {
        ScoreEntryView(scorecard: Scorecard(status: .inProgress))
    }
    .modelContainer(for: [Scorecard.self, HoleScore.self, Player.self], inMemory: true)
}
