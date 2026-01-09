import Foundation
import SwiftData

/// Player entity representing a golfer with their profile information
@Model
final class Player {
    var id: UUID
    var name: String
    var handicapIndex: Double
    var ghin: String?
    var teePreference: String?
    @Attribute(.externalStorage)
    var avatarData: Data?
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    @Relationship(deleteRule: .cascade, inverse: \TeamMember.player)
    var teamMemberships: [TeamMember]?
    
    @Relationship(deleteRule: .cascade, inverse: \GroupPlayer.player)
    var groupAssignments: [GroupPlayer]?
    
    @Relationship(deleteRule: .cascade, inverse: \HoleScore.player)
    var holeScores: [HoleScore]?
    
    init(
        id: UUID = UUID(),
        name: String,
        handicapIndex: Double = 0.0,
        ghin: String? = nil,
        teePreference: String? = nil,
        avatarData: Data? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.handicapIndex = handicapIndex
        self.ghin = ghin
        self.teePreference = teePreference
        self.avatarData = avatarData
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension Player {
    /// Formatted handicap for display
    var formattedHandicap: String {
        if handicapIndex >= 0 {
            return String(format: "%.1f", handicapIndex)
        } else {
            return String(format: "+%.1f", abs(handicapIndex))
        }
    }
    
    /// Computed course handicap for a given tee set
    func courseHandicap(for teeSet: TeeSet) -> Int {
        return HandicapCalculator.calculateCourseHandicap(
            handicapIndex: handicapIndex,
            slopeRating: teeSet.slope,
            courseRating: teeSet.rating,
            par: teeSet.par
        )
    }
}
