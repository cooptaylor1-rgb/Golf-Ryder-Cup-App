import Foundation
import SwiftData

/// Player assignment within a group
@Model
final class GroupPlayer {
    var id: UUID
    var position: Int
    var createdAt: Date
    
    // Relationships
    var group: Group?
    var player: Player?
    
    init(
        id: UUID = UUID(),
        position: Int = 0,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.position = position
        self.createdAt = createdAt
    }
}
