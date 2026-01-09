import Foundation
import SwiftData

/// Session type for Ryder Cup format
enum SessionType: String, Codable, CaseIterable {
    case foursomes = "foursomes"      // Alternate shot
    case fourball = "fourball"        // Best ball
    case singles = "singles"          // 1v1 match play
    
    var displayName: String {
        switch self {
        case .foursomes: return "Foursomes"
        case .fourball: return "Fourball"
        case .singles: return "Singles"
        }
    }
    
    var description: String {
        switch self {
        case .foursomes: return "Alternate shot - partners take turns hitting the same ball"
        case .fourball: return "Best ball - each player plays their own ball, best score counts"
        case .singles: return "1v1 match play - head to head competition"
        }
    }
    
    var playersPerTeam: Int {
        switch self {
        case .foursomes: return 2
        case .fourball: return 2
        case .singles: return 1
        }
    }
    
    var iconName: String {
        switch self {
        case .foursomes: return "arrow.left.arrow.right"
        case .fourball: return "person.2.circle"
        case .singles: return "person.circle"
        }
    }
}

/// Ryder Cup session (e.g., Friday AM Foursomes)
@Model
final class RyderCupSession {
    var id: UUID
    var name: String
    var sessionType: SessionType
    var scheduledDate: Date
    var timeSlot: String  // "AM" or "PM"
    var pointsPerMatch: Double
    var notes: String?
    var isLocked: Bool
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    var trip: Trip?
    
    @Relationship(deleteRule: .cascade, inverse: \Match.session)
    var matches: [Match]?
    
    init(
        id: UUID = UUID(),
        name: String,
        sessionType: SessionType,
        scheduledDate: Date,
        timeSlot: String = "AM",
        pointsPerMatch: Double = 1.0,
        notes: String? = nil,
        isLocked: Bool = false,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.sessionType = sessionType
        self.scheduledDate = scheduledDate
        self.timeSlot = timeSlot
        self.pointsPerMatch = pointsPerMatch
        self.notes = notes
        self.isLocked = isLocked
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension RyderCupSession {
    /// Sorted matches by order
    var sortedMatches: [Match] {
        (matches ?? []).sorted { $0.matchOrder < $1.matchOrder }
    }
    
    /// Total points available in this session
    var totalPointsAvailable: Double {
        Double(matches?.count ?? 0) * pointsPerMatch
    }
    
    /// Points earned by Team A
    var teamAPoints: Double {
        sortedMatches.reduce(0.0) { total, match in
            total + match.teamAPoints
        }
    }
    
    /// Points earned by Team B
    var teamBPoints: Double {
        sortedMatches.reduce(0.0) { total, match in
            total + match.teamBPoints
        }
    }
    
    /// Check if all matches are complete
    var isComplete: Bool {
        guard let matches = matches, !matches.isEmpty else { return false }
        return matches.allSatisfy { $0.status == .final }
    }
    
    /// Display title with date
    var displayTitle: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        let dayName = formatter.string(from: scheduledDate)
        return "\(dayName) \(timeSlot) \(sessionType.displayName)"
    }
}
