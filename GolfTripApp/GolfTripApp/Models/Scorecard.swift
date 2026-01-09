import Foundation
import SwiftData

/// Scorecard status
enum ScorecardStatus: String, Codable, CaseIterable {
    case draft = "draft"
    case inProgress = "in_progress"
    case final = "final"
    
    var displayName: String {
        switch self {
        case .draft: return "Draft"
        case .inProgress: return "In Progress"
        case .final: return "Final"
        }
    }
    
    var iconName: String {
        switch self {
        case .draft: return "doc"
        case .inProgress: return "pencil.circle"
        case .final: return "checkmark.circle.fill"
        }
    }
}

/// Scorecard entity for tracking scores
@Model
final class Scorecard {
    var id: UUID
    var status: ScorecardStatus
    var createdAt: Date
    var updatedAt: Date
    var completedAt: Date?
    
    // Relationships
    var scheduleItem: ScheduleItem?
    var format: Format?
    
    @Relationship(deleteRule: .cascade, inverse: \HoleScore.scorecard)
    var holeScores: [HoleScore]?
    
    @Relationship(deleteRule: .cascade, inverse: \TeamScore.scorecard)
    var teamScores: [TeamScore]?
    
    init(
        id: UUID = UUID(),
        status: ScorecardStatus = .draft,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        completedAt: Date? = nil
    ) {
        self.id = id
        self.status = status
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.completedAt = completedAt
    }
}

extension Scorecard {
    /// Get the tee set for this scorecard
    var teeSet: TeeSet? {
        scheduleItem?.teeSet
    }
    
    /// Get course for this scorecard
    var course: Course? {
        teeSet?.course
    }
    
    /// Title for display
    var title: String {
        if let item = scheduleItem {
            return item.displayTitle
        }
        return "Scorecard"
    }
    
    /// Get scores for a specific player
    func scores(for player: Player) -> [HoleScore] {
        (holeScores ?? [])
            .filter { $0.player?.id == player.id }
            .sorted { $0.holeNumber < $1.holeNumber }
    }
    
    /// Get scores for a specific team
    func scores(for team: Team) -> [HoleScore] {
        (holeScores ?? [])
            .filter { $0.team?.id == team.id }
            .sorted { $0.holeNumber < $1.holeNumber }
    }
    
    /// Total gross score for a player
    func totalGross(for player: Player) -> Int {
        scores(for: player).reduce(0) { $0 + $1.strokes }
    }
    
    /// Total net score for a player
    func totalNet(for player: Player, teeSet: TeeSet) -> Int {
        let courseHandicap = player.courseHandicap(for: teeSet)
        let strokesAllocation = HandicapCalculator.allocateStrokes(
            courseHandicap: courseHandicap,
            holeHandicaps: teeSet.holeHandicaps
        )
        
        return scores(for: player).reduce(0) { total, score in
            let strokes = strokesAllocation[score.holeNumber - 1]
            return total + score.strokes - strokes
        }
    }
    
    /// Calculate Stableford points for a player
    func stablefordPoints(for player: Player, teeSet: TeeSet) -> Int {
        let courseHandicap = player.courseHandicap(for: teeSet)
        let strokesAllocation = HandicapCalculator.allocateStrokes(
            courseHandicap: courseHandicap,
            holeHandicaps: teeSet.holeHandicaps
        )
        
        let pars = teeSet.holePars ?? TeeSet.defaultHolePars
        
        return scores(for: player).reduce(0) { total, score in
            let strokes = strokesAllocation[score.holeNumber - 1]
            let par = pars[score.holeNumber - 1]
            let points = HandicapCalculator.stablefordPoints(
                grossScore: score.strokes,
                par: par,
                strokesReceived: strokes
            )
            return total + points
        }
    }
    
    /// Get all unique players in this scorecard
    var players: [Player] {
        let playerSet = Set((holeScores ?? []).compactMap { $0.player })
        return Array(playerSet).sorted { $0.name < $1.name }
    }
    
    /// Check if scorecard is complete (all holes scored)
    var isComplete: Bool {
        let players = self.players
        guard !players.isEmpty else { return false }
        
        for player in players {
            let scores = self.scores(for: player)
            if scores.count < 18 {
                return false
            }
        }
        return true
    }
}
