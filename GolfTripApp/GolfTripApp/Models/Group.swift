import Foundation
import SwiftData

/// Group of players within a schedule item (e.g., foursome)
@Model
final class Group {
    var id: UUID
    var name: String
    var notes: String?
    var createdAt: Date
    
    // Relationships
    var scheduleItem: ScheduleItem?
    
    @Relationship(deleteRule: .cascade, inverse: \GroupPlayer.group)
    var players: [GroupPlayer]?
    
    init(
        id: UUID = UUID(),
        name: String,
        notes: String? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.notes = notes
        self.createdAt = createdAt
    }
}

extension Group {
    /// Sorted players by position
    var sortedPlayers: [Player] {
        (players ?? [])
            .sorted { $0.position < $1.position }
            .compactMap { $0.player }
    }
    
    /// Number of players in group
    var playerCount: Int {
        players?.count ?? 0
    }
}
