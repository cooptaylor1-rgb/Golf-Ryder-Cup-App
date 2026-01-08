import Foundation
import SwiftData

/// Hole winner for match play
enum HoleWinner: String, Codable, CaseIterable {
    case teamA = "team_a"
    case teamB = "team_b"
    case halved = "halved"
}

/// Result for a single hole in match play
@Model
final class HoleResult {
    var id: UUID
    var holeNumber: Int
    var winner: HoleWinner
    var teamAStrokes: Int?  // Optional stroke-by-stroke detail
    var teamBStrokes: Int?
    var notes: String?
    var timestamp: Date
    
    // Relationships
    var match: Match?
    
    init(
        id: UUID = UUID(),
        holeNumber: Int,
        winner: HoleWinner,
        teamAStrokes: Int? = nil,
        teamBStrokes: Int? = nil,
        notes: String? = nil,
        timestamp: Date = Date()
    ) {
        self.id = id
        self.holeNumber = holeNumber
        self.winner = winner
        self.teamAStrokes = teamAStrokes
        self.teamBStrokes = teamBStrokes
        self.notes = notes
        self.timestamp = timestamp
    }
}

extension HoleWinner {
    var displayName: String {
        switch self {
        case .teamA: return "Team A"
        case .teamB: return "Team B"
        case .halved: return "Halved"
        }
    }
    
    var iconName: String {
        switch self {
        case .teamA: return "circle.fill"
        case .teamB: return "circle.fill"
        case .halved: return "equal.circle"
        }
    }
}
