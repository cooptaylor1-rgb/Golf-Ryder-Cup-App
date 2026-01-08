import SwiftUI
import SwiftData

struct ScoringTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Trip.startDate, order: .descending) private var trips: [Trip]
    @Query(sort: \Scorecard.createdAt, order: .descending) private var allScorecards: [Scorecard]
    
    @State private var selectedTrip: Trip?
    
    var upcomingTeeTimes: [ScheduleItem] {
        guard let trip = selectedTrip else { return [] }
        let now = Date()
        return trip.sortedDays
            .flatMap { $0.sortedItems }
            .filter { $0.type == .teeTime && ($0.startTime ?? Date.distantPast) > now }
            .sorted { ($0.startTime ?? Date.distantFuture) < ($1.startTime ?? Date.distantFuture) }
    }
    
    var inProgressScorecards: [Scorecard] {
        allScorecards.filter { $0.status == .inProgress }
    }
    
    var completedScorecards: [Scorecard] {
        allScorecards.filter { $0.status == .final }
    }
    
    var body: some View {
        NavigationStack {
            Group {
                if trips.isEmpty {
                    ContentUnavailableView {
                        Label("No Trips", systemImage: "list.number")
                    } description: {
                        Text("Create a trip and schedule tee times to start scoring.")
                    }
                } else {
                    List {
                        // In-progress scorecards
                        if !inProgressScorecards.isEmpty {
                            Section("In Progress") {
                                ForEach(inProgressScorecards) { scorecard in
                                    NavigationLink {
                                        ScoreEntryView(scorecard: scorecard)
                                    } label: {
                                        ScorecardRow(scorecard: scorecard)
                                    }
                                }
                            }
                        }
                        
                        // Upcoming tee times
                        if !upcomingTeeTimes.isEmpty {
                            Section("Upcoming Tee Times") {
                                ForEach(upcomingTeeTimes) { item in
                                    NavigationLink {
                                        ScorecardSetupView(scheduleItem: item)
                                    } label: {
                                        UpcomingTeeTimeRow(item: item)
                                    }
                                }
                            }
                        }
                        
                        // Completed scorecards
                        if !completedScorecards.isEmpty {
                            Section("Completed") {
                                ForEach(completedScorecards) { scorecard in
                                    NavigationLink {
                                        ScorecardResultsView(scorecard: scorecard)
                                    } label: {
                                        ScorecardRow(scorecard: scorecard)
                                    }
                                }
                            }
                        }
                        
                        // Leaderboard section
                        Section("Leaderboards") {
                            NavigationLink {
                                LeaderboardView()
                            } label: {
                                Label("View Leaderboards", systemImage: "trophy")
                            }
                        }
                    }
                }
            }
            .navigationTitle("Scoring")
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
            }
            .onAppear {
                if selectedTrip == nil && !trips.isEmpty {
                    selectedTrip = trips.first
                }
            }
        }
    }
}

struct ScorecardRow: View {
    let scorecard: Scorecard
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(scorecard.title)
                    .font(.headline)
                
                Spacer()
                
                Image(systemName: scorecard.status.iconName)
                    .foregroundStyle(scorecard.status == .final ? .green : .orange)
            }
            
            HStack {
                if let format = scorecard.format {
                    Text(format.type.displayName)
                        .font(.caption)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.blue.opacity(0.2))
                        .cornerRadius(4)
                }
                
                Text("\(scorecard.players.count) players")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct UpcomingTeeTimeRow: View {
    let item: ScheduleItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(item.displayTitle)
                .font(.headline)
            
            HStack {
                if !item.formattedStartTime.isEmpty {
                    Text(item.formattedStartTime)
                }
                
                if let day = item.scheduleDay {
                    Text("• \(day.formattedDate)")
                }
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ScoringTabView()
        .modelContainer(for: [Trip.self, Scorecard.self], inMemory: true)
}
