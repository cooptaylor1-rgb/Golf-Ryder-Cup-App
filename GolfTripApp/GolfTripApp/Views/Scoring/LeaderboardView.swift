import SwiftUI
import SwiftData

enum LeaderboardScope: String, CaseIterable {
    case singleEvent = "Single Event"
    case dayTotal = "Day Total"
    case tripTotal = "Trip Total"
}

struct LeaderboardView: View {
    @Query(sort: \Trip.startDate, order: .descending) private var trips: [Trip]
    @Query(sort: \Scorecard.createdAt, order: .descending) private var allScorecards: [Scorecard]
    
    @State private var selectedTrip: Trip?
    @State private var scope: LeaderboardScope = .tripTotal
    @State private var selectedDay: ScheduleDay?
    @State private var selectedScorecard: Scorecard?
    
    var completedScorecards: [Scorecard] {
        allScorecards.filter { $0.status == .final }
    }
    
    var tripScorecards: [Scorecard] {
        guard let trip = selectedTrip else { return completedScorecards }
        let tripDayIds = Set((trip.scheduleDays ?? []).map { $0.id })
        return completedScorecards.filter { scorecard in
            if let dayId = scorecard.scheduleItem?.scheduleDay?.id {
                return tripDayIds.contains(dayId)
            }
            return false
        }
    }
    
    var dayScorecards: [Scorecard] {
        guard let day = selectedDay else { return [] }
        return completedScorecards.filter { $0.scheduleItem?.scheduleDay?.id == day.id }
    }
    
    var relevantScorecards: [Scorecard] {
        switch scope {
        case .singleEvent:
            return selectedScorecard.map { [$0] } ?? []
        case .dayTotal:
            return dayScorecards
        case .tripTotal:
            return tripScorecards
        }
    }
    
    var aggregatedResults: [(player: Player, totalNet: Int, totalGross: Int, totalPoints: Int, rounds: Int)] {
        var playerStats: [UUID: (player: Player, totalNet: Int, totalGross: Int, totalPoints: Int, rounds: Int)] = [:]
        
        for scorecard in relevantScorecards {
            guard let teeSet = scorecard.teeSet else { continue }
            
            for player in scorecard.players {
                let gross = scorecard.totalGross(for: player)
                let net = scorecard.totalNet(for: player, teeSet: teeSet)
                let points = scorecard.stablefordPoints(for: player, teeSet: teeSet)
                
                if var existing = playerStats[player.id] {
                    existing.totalGross += gross
                    existing.totalNet += net
                    existing.totalPoints += points
                    existing.rounds += 1
                    playerStats[player.id] = existing
                } else {
                    playerStats[player.id] = (player, net, gross, points, 1)
                }
            }
        }
        
        return playerStats.values.sorted { $0.totalNet < $1.totalNet }
    }
    
    var body: some View {
        List {
            // Scope picker
            Section {
                Picker("Scope", selection: $scope) {
                    ForEach(LeaderboardScope.allCases, id: \.self) { s in
                        Text(s.rawValue).tag(s)
                    }
                }
                .pickerStyle(.segmented)
            }
            
            // Scope-specific selectors
            if scope == .dayTotal, let trip = selectedTrip {
                Section("Select Day") {
                    ForEach(trip.sortedDays) { day in
                        Button {
                            selectedDay = day
                        } label: {
                            HStack {
                                Text(day.formattedDate)
                                Spacer()
                                if selectedDay?.id == day.id {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(.green)
                                }
                            }
                        }
                        .foregroundStyle(.primary)
                    }
                }
            }
            
            if scope == .singleEvent {
                Section("Select Event") {
                    ForEach(tripScorecards) { scorecard in
                        Button {
                            selectedScorecard = scorecard
                        } label: {
                            HStack {
                                Text(scorecard.title)
                                Spacer()
                                if selectedScorecard?.id == scorecard.id {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(.green)
                                }
                            }
                        }
                        .foregroundStyle(.primary)
                    }
                }
            }
            
            // Results
            if !aggregatedResults.isEmpty {
                Section("Leaderboard - Net Strokes") {
                    ForEach(Array(aggregatedResults.enumerated()), id: \.element.player.id) { index, result in
                        HStack {
                            Text("\(index + 1)")
                                .font(.headline)
                                .frame(width: 24)
                                .foregroundStyle(index < 3 ? .green : .secondary)
                            
                            VStack(alignment: .leading) {
                                Text(result.player.name)
                                    .font(.headline)
                                
                                Text("\(result.rounds) round\(result.rounds == 1 ? "" : "s")")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            
                            Spacer()
                            
                            VStack(alignment: .trailing) {
                                Text("\(result.totalNet)")
                                    .font(.headline)
                                
                                Text("Gross: \(result.totalGross)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
                
                // Stableford leaderboard
                Section("Leaderboard - Stableford Points") {
                    let pointsSorted = aggregatedResults.sorted { $0.totalPoints > $1.totalPoints }
                    ForEach(Array(pointsSorted.enumerated()), id: \.element.player.id) { index, result in
                        HStack {
                            Text("\(index + 1)")
                                .font(.headline)
                                .frame(width: 24)
                                .foregroundStyle(index < 3 ? .yellow : .secondary)
                            
                            Text(result.player.name)
                                .font(.headline)
                            
                            Spacer()
                            
                            Text("\(result.totalPoints) pts")
                                .font(.headline)
                                .foregroundStyle(.green)
                        }
                    }
                }
            } else {
                Section {
                    ContentUnavailableView {
                        Label("No Results", systemImage: "trophy")
                    } description: {
                        Text("Complete some rounds to see leaderboard data.")
                    }
                }
            }
        }
        .navigationTitle("Leaderboards")
        .onAppear {
            if selectedTrip == nil && !trips.isEmpty {
                selectedTrip = trips.first
            }
        }
    }
}

#Preview {
    NavigationStack {
        LeaderboardView()
    }
    .modelContainer(for: [Trip.self, Scorecard.self], inMemory: true)
}
