import SwiftUI
import SwiftData

/// Home tab - Trip Command Center
struct HomeTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var trips: [Trip]
    @Query(sort: \RyderCupSession.scheduledDate) private var sessions: [RyderCupSession]
    @State private var showTripForm = false
    
    private var currentTrip: Trip? {
        trips.first
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DesignTokens.Spacing.lg) {
                    if let trip = currentTrip {
                        tripContent(trip)
                    } else {
                        emptyTripState
                    }
                }
                .padding(DesignTokens.Spacing.lg)
            }
            .navigationTitle("🏆 Ryder Cup")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if currentTrip != nil {
                        Menu {
                            Button("Edit Trip", systemImage: "pencil") {
                                showTripForm = true
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .sheet(isPresented: $showTripForm) {
                if let trip = currentTrip {
                    TripFormView(trip: trip)
                }
            }
        }
    }
    
    // MARK: - Trip Content
    
    @ViewBuilder
    private func tripContent(_ trip: Trip) -> some View {
        // Trip Header
        VStack(spacing: DesignTokens.Spacing.xs) {
            Text(trip.name)
                .font(.title2.weight(.bold))
            
            if let location = trip.location {
                HStack(spacing: DesignTokens.Spacing.xs) {
                    Image(systemName: "mappin")
                    Text(location)
                }
                .font(.subheadline)
                .foregroundColor(.secondary)
            }
            
            Text(trip.dateRangeFormatted)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, DesignTokens.Spacing.sm)
        
        // Standings Summary
        if trip.teamA != nil && trip.teamB != nil {
            standingsSummaryCard(trip)
        }
        
        // Next Up Card
        if let nextMatch = nextUpMatch(for: trip) {
            nextUpCard(nextMatch, trip: trip)
        }
        
        // Today's Schedule
        todayScheduleSection(trip)
        
        // Captain Actions
        captainActionsSection(trip)
        
        // Trip Vibe
        tripVibeSection(trip)
    }
    
    // MARK: - Standings Summary Card
    
    @ViewBuilder
    private func standingsSummaryCard(_ trip: Trip) -> some View {
        VStack(spacing: DesignTokens.Spacing.md) {
            BigScoreDisplay(
                teamAScore: trip.teamATotalPoints,
                teamBScore: trip.teamBTotalPoints,
                teamAName: trip.teamA?.name ?? "Team A",
                teamBName: trip.teamB?.name ?? "Team B",
                teamAColor: .teamUSA,
                teamBColor: .teamEurope
            )
            
            // Points info
            HStack {
                Text("Points to win: \(String(format: "%.1f", trip.pointsToWin))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("\(trip.sortedSessions.filter { $0.isComplete }.count)/\(trip.sortedSessions.count) sessions complete")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(DesignTokens.Spacing.lg)
        .cardStyle(elevation: 2)
    }
    
    // MARK: - Next Up Card
    
    @ViewBuilder
    private func nextUpCard(_ match: Match, trip: Trip) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
            HStack {
                Image(systemName: "clock.fill")
                    .foregroundColor(.secondaryGold)
                Text("NEXT UP")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.secondaryGold)
                Spacer()
                if let time = match.startTime {
                    Text(time, style: .time)
                        .font(.subheadline.weight(.semibold))
                }
            }
            
            Divider()
            
            // Match info
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.sm) {
                if let session = match.session {
                    Text(session.sessionType.displayName)
                        .font(.headline)
                }
                
                if let course = match.course {
                    HStack {
                        Image(systemName: "flag.fill")
                            .foregroundColor(.fairway)
                        Text(course.name)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Players
            HStack(spacing: DesignTokens.Spacing.xl) {
                // Team A
                VStack {
                    HStack {
                        ForEach(match.teamAIds, id: \.self) { playerId in
                            AvatarView(name: "P", size: 36, teamColor: .teamUSA)
                        }
                    }
                    Text(trip.teamA?.name ?? "Team A")
                        .font(.caption)
                        .foregroundColor(.teamUSA)
                }
                
                Text("vs")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                // Team B
                VStack {
                    HStack {
                        ForEach(match.teamBIds, id: \.self) { playerId in
                            AvatarView(name: "P", size: 36, teamColor: .teamEurope)
                        }
                    }
                    Text(trip.teamB?.name ?? "Team B")
                        .font(.caption)
                        .foregroundColor(.teamEurope)
                }
            }
            .frame(maxWidth: .infinity)
            
            // Start Scoring CTA
            NavigationLink(destination: MatchScoringView(match: match)) {
                Text("Start Scoring")
                    .primaryButtonStyle()
            }
        }
        .padding(DesignTokens.Spacing.lg)
        .cardStyle(elevation: 2)
    }
    
    // MARK: - Today's Schedule
    
    @ViewBuilder
    private func todayScheduleSection(_ trip: Trip) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
            Text("TODAY'S SCHEDULE")
                .font(.caption.weight(.bold))
                .foregroundColor(.secondary)
            
            let todaySessions = trip.sortedSessions.filter { 
                Calendar.current.isDateInToday($0.scheduledDate)
            }
            
            if todaySessions.isEmpty {
                Text("No sessions scheduled for today")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.vertical, DesignTokens.Spacing.md)
            } else {
                ForEach(todaySessions, id: \.id) { session in
                    sessionRow(session)
                }
            }
        }
        .padding(DesignTokens.Spacing.lg)
        .cardStyle()
    }
    
    @ViewBuilder
    private func sessionRow(_ session: RyderCupSession) -> some View {
        HStack {
            Circle()
                .fill(session.isComplete ? Color.success : Color.info)
                .frame(width: 8, height: 8)
            
            VStack(alignment: .leading) {
                Text(session.displayTitle)
                    .font(.subheadline.weight(.medium))
                
                Text("\(session.sortedMatches.count) matches • \(String(format: "%.0f", session.totalPointsAvailable)) points")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if session.isComplete {
                Text("\(String(format: "%.1f", session.teamAPoints))-\(String(format: "%.1f", session.teamBPoints))")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(.secondary)
            } else {
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, DesignTokens.Spacing.xs)
    }
    
    // MARK: - Captain Actions
    
    @ViewBuilder
    private func captainActionsSection(_ trip: Trip) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
            Text("CAPTAIN ACTIONS")
                .font(.caption.weight(.bold))
                .foregroundColor(.secondary)
            
            HStack(spacing: DesignTokens.Spacing.md) {
                NavigationLink(destination: MatchupsTabView()) {
                    actionButton(icon: "list.bullet.rectangle", title: "Set Lineups")
                }
                
                NavigationLink(destination: StandingsTabView()) {
                    actionButton(icon: "trophy", title: "Standings")
                }
            }
        }
    }
    
    @ViewBuilder
    private func actionButton(icon: String, title: String) -> some View {
        VStack(spacing: DesignTokens.Spacing.sm) {
            Image(systemName: icon)
                .font(.title2)
            Text(title)
                .font(.caption)
        }
        .frame(maxWidth: .infinity)
        .padding(DesignTokens.Spacing.md)
        .background(Color.surfaceVariant)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.md))
    }
    
    // MARK: - Trip Vibe
    
    @ViewBuilder
    private func tripVibeSection(_ trip: Trip) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.sm) {
            if let notes = trip.notes, !notes.isEmpty {
                Text("📝 " + notes)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding(DesignTokens.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
    
    // MARK: - Empty State
    
    private var emptyTripState: some View {
        EmptyStateView(
            icon: "airplane",
            title: "No Trip Yet",
            description: "Create your Ryder Cup trip to get started with teams, matchups, and scoring.",
            actionTitle: "Create Trip",
            action: { showTripForm = true }
        )
    }
    
    // MARK: - Helpers
    
    private func nextUpMatch(for trip: Trip) -> Match? {
        for session in trip.sortedSessions {
            for match in session.sortedMatches where match.status == .scheduled {
                return match
            }
        }
        return nil
    }
}

#Preview {
    HomeTabView()
        .modelContainer(for: [Trip.self, Player.self, Course.self], inMemory: true)
}
