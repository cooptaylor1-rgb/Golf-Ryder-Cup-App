import SwiftUI

/// Shareable card view for current standings
struct StandingsShareCard: View {
    let trip: Trip
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: DesignTokens.Spacing.sm) {
                Text("🏆")
                    .font(.system(size: 48))
                
                Text(trip.name)
                    .font(.title.weight(.black))
                    .foregroundColor(.primary)
                
                Text(trip.dateRangeFormatted)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.top, DesignTokens.Spacing.xxxl)
            .padding(.bottom, DesignTokens.Spacing.xl)
            
            // Scores
            HStack(spacing: DesignTokens.Spacing.xxxl) {
                // Team A
                VStack(spacing: DesignTokens.Spacing.sm) {
                    Text(trip.teamA?.name ?? "Team A")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.teamUSA)
                    
                    Text(String(format: "%.1f", trip.teamATotalPoints))
                        .font(.system(size: 72, weight: .black, design: .rounded))
                        .foregroundColor(.teamUSA)
                }
                
                // Divider
                VStack {
                    Rectangle()
                        .fill(Color.secondary.opacity(0.3))
                        .frame(width: 2, height: 80)
                }
                
                // Team B
                VStack(spacing: DesignTokens.Spacing.sm) {
                    Text(trip.teamB?.name ?? "Team B")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.teamEurope)
                    
                    Text(String(format: "%.1f", trip.teamBTotalPoints))
                        .font(.system(size: 72, weight: .black, design: .rounded))
                        .foregroundColor(.teamEurope)
                }
            }
            .padding(.vertical, DesignTokens.Spacing.xl)
            
            // Stats
            HStack(spacing: DesignTokens.Spacing.xl) {
                VStack(spacing: 4) {
                    Text("\(String(format: "%.1f", trip.pointsToWin))")
                        .font(.title3.weight(.bold))
                    Text("to win")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 30)
                
                VStack(spacing: 4) {
                    let completed = trip.sortedSessions.filter { $0.isComplete }.count
                    Text("\(completed)/\(trip.sortedSessions.count)")
                        .font(.title3.weight(.bold))
                    Text("sessions")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 30)
                
                VStack(spacing: 4) {
                    let remaining = trip.totalPointsAvailable - trip.teamATotalPoints - trip.teamBTotalPoints
                    Text("\(String(format: "%.0f", remaining))")
                        .font(.title3.weight(.bold))
                    Text("remaining")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, DesignTokens.Spacing.lg)
            
            Spacer()
            
            // Footer
            VStack(spacing: DesignTokens.Spacing.xs) {
                Text("The Ryder Cup Companion")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(.secondary)
                
                if let location = trip.location {
                    Text(location)
                        .font(.caption2)
                        .foregroundColor(.secondary.opacity(0.7))
                }
            }
            .padding(.bottom, DesignTokens.Spacing.xl)
        }
        .frame(width: 600, height: 800)
        .background(
            LinearGradient(
                colors: [Color.surfaceBackground, Color.surface, Color.surfaceVariant],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

#Preview {
    StandingsShareCard(
        trip: Trip(
            name: "Annual Golf Trip 2024",
            startDate: Date(),
            endDate: Date().addingTimeInterval(3 * 24 * 3600),
            location: "Pebble Beach, CA"
        )
    )
}
