import Foundation
import SwiftData

/// Course entity representing a golf course
@Model
final class Course {
    var id: UUID
    var name: String
    var location: String?
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    @Relationship(deleteRule: .cascade, inverse: \TeeSet.course)
    var teeSets: [TeeSet]?
    
    init(
        id: UUID = UUID(),
        name: String,
        location: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.location = location
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension Course {
    /// Get sorted tee sets by slope (typically hardest first)
    var sortedTeeSets: [TeeSet] {
        (teeSets ?? []).sorted { $0.slope > $1.slope }
    }
}
