import Foundation
import SwiftData

/// Photo for trip albums
@Model
final class TripPhoto {
    var id: UUID
    var imageData: Data?
    var caption: String?
    var takenAt: Date
    var uploadedAt: Date
    var uploadedBy: String?  // Player ID
    var albumDay: Date?  // Which day this belongs to
    var relatedMatchId: String?  // If attached to a match
    
    // Relationships
    var trip: Trip?
    
    init(
        id: UUID = UUID(),
        imageData: Data? = nil,
        caption: String? = nil,
        takenAt: Date = Date(),
        uploadedAt: Date = Date(),
        uploadedBy: String? = nil,
        albumDay: Date? = nil,
        relatedMatchId: String? = nil
    ) {
        self.id = id
        self.imageData = imageData
        self.caption = caption
        self.takenAt = takenAt
        self.uploadedAt = uploadedAt
        self.uploadedBy = uploadedBy
        self.albumDay = albumDay
        self.relatedMatchId = relatedMatchId
    }
}
