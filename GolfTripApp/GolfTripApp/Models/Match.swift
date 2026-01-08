import Foundation
import SwiftData

/// Match status for match play
enum MatchStatus: String, Codable, CaseIterable {
    case scheduled = "scheduled"
    case inProgress = "in_progress"
    case final = "final"
    case cancelled = "cancelled"
    
    var displayName: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .inProgress: return "In Progress"
        case .final: return "Final"
        case .cancelled: return "Cancelled"
        }
    }
    
    var iconName: String {
        switch self {
        case .scheduled: return "clock"
        case .inProgress: return "play.circle.fill"
        case .final: return "checkmark.circle.fill"
        case .cancelled: return "xmark.circle"
        }
    }
}

/// Match result type
enum MatchResultType: String, Codable {
    case teamAWin = "team_a_win"
    case teamBWin = "team_b_win"
    case halved = "halved"
    case notFinished = "not_finished"
}

/// Match entity for match play scoring
@Model
final class Match {
    var id: UUID
    var matchOrder: Int
    var status: MatchStatus
    var startTime: Date?
    var currentHole: Int
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    // Team A players (stored as comma-separated player IDs for simplicity)
    var teamAPlayerIds: String
    // Team B players
    var teamBPlayerIds: String
    
    // Handicap information
    var teamAHandicapAllowance: Int
    var teamBHandicapAllowance: Int
    
    // Match result
    var result: MatchResultType
    var margin: Int  // e.g., 3 for "3&2" or 1 for "1 up"
    var holesRemaining: Int  // e.g., 2 for "3&2"
    
    // Relationships
    var session: RyderCupSession?
    var course: Course?
    var teeSet: TeeSet?
    
    @Relationship(deleteRule: .cascade, inverse: \HoleResult.match)
    var holeResults: [HoleResult]?
    
    init(
        id: UUID = UUID(),
        matchOrder: Int = 0,
        status: MatchStatus = .scheduled,
        startTime: Date? = nil,
        currentHole: Int = 1,
        teamAPlayerIds: String = "",
        teamBPlayerIds: String = "",
        teamAHandicapAllowance: Int = 0,
        teamBHandicapAllowance: Int = 0,
        notes: String? = nil,
        result: MatchResultType = .notFinished,
        margin: Int = 0,
        holesRemaining: Int = 0,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.matchOrder = matchOrder
        self.status = status
        self.startTime = startTime
        self.currentHole = currentHole
        self.teamAPlayerIds = teamAPlayerIds
        self.teamBPlayerIds = teamBPlayerIds
        self.teamAHandicapAllowance = teamAHandicapAllowance
        self.teamBHandicapAllowance = teamBHandicapAllowance
        self.notes = notes
        self.result = result
        self.margin = margin
        self.holesRemaining = holesRemaining
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension Match {
    /// Get team A player IDs as array
    var teamAIds: [UUID] {
        teamAPlayerIds.split(separator: ",").compactMap { UUID(uuidString: String($0)) }
    }
    
    /// Get team B player IDs as array
    var teamBIds: [UUID] {
        teamBPlayerIds.split(separator: ",").compactMap { UUID(uuidString: String($0)) }
    }
    
    /// Set team A player IDs
    func setTeamAPlayers(_ players: [Player]) {
        teamAPlayerIds = players.map { $0.id.uuidString }.joined(separator: ",")
    }
    
    /// Set team B player IDs
    func setTeamBPlayers(_ players: [Player]) {
        teamBPlayerIds = players.map { $0.id.uuidString }.joined(separator: ",")
    }
    
    /// Sorted hole results
    var sortedHoleResults: [HoleResult] {
        (holeResults ?? []).sorted { $0.holeNumber < $1.holeNumber }
    }
    
    /// Current match score (positive = Team A leading, negative = Team B leading)
    var matchScore: Int {
        sortedHoleResults.reduce(0) { total, result in
            switch result.winner {
            case .teamA: return total + 1
            case .teamB: return total - 1
            case .halved: return total
            }
        }
    }
    
    /// Number of holes played
    var holesPlayed: Int {
        holeResults?.count ?? 0
    }
    
    /// Holes remaining
    var holesLeft: Int {
        18 - holesPlayed
    }
    
    /// Is the match dormie?
    var isDormie: Bool {
        abs(matchScore) == holesLeft && holesLeft > 0
    }
    
    /// Is the match closed out?
    var isClosedOut: Bool {
        abs(matchScore) > holesLeft
    }
    
    /// Match status string (e.g., "Team A 2 UP")
    var statusString: String {
        guard status != .scheduled else { return "Not Started" }
        
        if status == .final {
            return resultString
        }
        
        if matchScore == 0 {
            return "All Square"
        } else if matchScore > 0 {
            return "Team A \(matchScore) UP"
        } else {
            return "Team B \(abs(matchScore)) UP"
        }
    }
    
    /// Final result string (e.g., "Team A 3&2")
    var resultString: String {
        switch result {
        case .teamAWin:
            if holesRemaining == 0 {
                return "Team A \(margin) UP"
            }
            return "Team A \(margin)&\(holesRemaining)"
        case .teamBWin:
            if holesRemaining == 0 {
                return "Team B \(margin) UP"
            }
            return "Team B \(margin)&\(holesRemaining)"
        case .halved:
            return "Halved"
        case .notFinished:
            return statusString
        }
    }
    
    /// Points earned by Team A
    var teamAPoints: Double {
        guard status == .final else { return 0 }
        let pointValue = session?.pointsPerMatch ?? 1.0
        switch result {
        case .teamAWin: return pointValue
        case .teamBWin: return 0
        case .halved: return pointValue / 2
        case .notFinished: return 0
        }
    }
    
    /// Points earned by Team B
    var teamBPoints: Double {
        guard status == .final else { return 0 }
        let pointValue = session?.pointsPerMatch ?? 1.0
        switch result {
        case .teamAWin: return 0
        case .teamBWin: return pointValue
        case .halved: return pointValue / 2
        case .notFinished: return 0
        }
    }
    
    /// Finalize the match
    func finalizeMatch() {
        guard holesPlayed > 0 else { return }
        
        if isClosedOut || holesPlayed == 18 {
            status = .final
            
            if matchScore > 0 {
                result = .teamAWin
                margin = abs(matchScore)
                holesRemaining = holesLeft
            } else if matchScore < 0 {
                result = .teamBWin
                margin = abs(matchScore)
                holesRemaining = holesLeft
            } else {
                result = .halved
                margin = 0
                holesRemaining = 0
            }
            
            updatedAt = Date()
        }
    }
}
