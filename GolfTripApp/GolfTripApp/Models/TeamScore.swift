import Foundation
import SwiftData

/// Team aggregate score for fast leaderboard queries
@Model
final class TeamScore {
    var id: UUID
    var total: Int
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    var scorecard: Scorecard?
    var team: Team?
    
    init(
        id: UUID = UUID(),
        total: Int = 0,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.total = total
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
