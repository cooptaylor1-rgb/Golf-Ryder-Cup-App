import SwiftUI

/// Shareable card view for session results
struct SessionResultCard: View {
    let session: RyderCupSession
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: DesignTokens.Spacing.sm) {
                Image(systemName: session.sessionType.iconName)
                    .font(.system(size: 40))
                    .foregroundColor(.accentColor)
                
                Text(session.displayTitle)
                    .font(.title2.weight(.black))
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
                
                if let notes = session.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.top, DesignTokens.Spacing.xxxl)
            .padding(.horizontal, DesignTokens.Spacing.xl)
            .padding(.bottom, DesignTokens.Spacing.xl)
            
            // Scores
            HStack(spacing: DesignTokens.Spacing.xxxl) {
                // Team A
                VStack(spacing: DesignTokens.Spacing.sm) {
                    Text("Team A")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.teamUSA)
                    
                    Text(String(format: "%.1f", session.teamAPoints))
                        .font(.system(size: 64, weight: .black, design: .rounded))
                        .foregroundColor(.teamUSA)
                }
                
                // Divider
                VStack {
                    Rectangle()
                        .fill(Color.secondary.opacity(0.3))
                        .frame(width: 2, height: 60)
                }
                
                // Team B
                VStack(spacing: DesignTokens.Spacing.sm) {
                    Text("Team B")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.teamEurope)
                    
                    Text(String(format: "%.1f", session.teamBPoints))
                        .font(.system(size: 64, weight: .black, design: .rounded))
                        .foregroundColor(.teamEurope)
                }
            }
            .padding(.vertical, DesignTokens.Spacing.xl)
            
            // Match Summary
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
                Text("MATCHES")
                    .font(.caption.weight(.black))
                    .foregroundColor(.secondary)
                    .tracking(1)
                
                ForEach(session.sortedMatches.prefix(5), id: \.id) { match in
                    matchRow(match)
                }
                
                if session.sortedMatches.count > 5 {
                    Text("+ \(session.sortedMatches.count - 5) more matches")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.top, DesignTokens.Spacing.xs)
                }
            }
            .padding(.horizontal, DesignTokens.Spacing.xl)
            .padding(.vertical, DesignTokens.Spacing.lg)
            
            Spacer()
            
            // Footer
            VStack(spacing: DesignTokens.Spacing.xs) {
                Text("The Ryder Cup Companion")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(.secondary)
                
                Text(session.sessionType.displayName)
                    .font(.caption2)
                    .foregroundColor(.secondary.opacity(0.7))
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
    
    @ViewBuilder
    private func matchRow(_ match: Match) -> some View {
        HStack {
            HStack(spacing: 4) {
                Circle()
                    .fill(Color.teamUSA.opacity(0.3))
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(Color.teamUSA, lineWidth: 1))
                Text("vs")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Circle()
                    .fill(Color.teamEurope.opacity(0.3))
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(Color.teamEurope, lineWidth: 1))
            }
            
            Spacer()
            
            if match.status == .final {
                Text(match.resultString)
                    .font(.caption.weight(.medium))
                    .foregroundColor(
                        match.result == .teamAWin ? .teamUSA :
                        (match.result == .teamBWin ? .teamEurope : .secondary)
                    )
            } else {
                Text(match.status.displayName)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SessionResultCard(
        session: RyderCupSession(
            name: "Friday AM",
            sessionType: .fourball,
            scheduledDate: Date(),
            timeSlot: "AM",
            pointsPerMatch: 1.0
        )
    )
}
