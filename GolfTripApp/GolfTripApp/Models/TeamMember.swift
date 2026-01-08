import Foundation
import SwiftData

/// Team member linking a player to a team
@Model
final class TeamMember {
    var id: UUID
    var isCaptain: Bool
    var sortOrder: Int
    var createdAt: Date
    
    // Relationships
    var team: Team?
    var player: Player?
    
    init(
        id: UUID = UUID(),
        isCaptain: Bool = false,
        sortOrder: Int = 0,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.isCaptain = isCaptain
        self.sortOrder = sortOrder
        self.createdAt = createdAt
    }
}
