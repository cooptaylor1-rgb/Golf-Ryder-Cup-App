import Foundation
import SwiftData

/// Trip entity representing a golf trip/event
@Model
final class Trip {
    var id: UUID
    var name: String
    var startDate: Date
    var endDate: Date
    var location: String?
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    @Relationship(deleteRule: .cascade, inverse: \ScheduleDay.trip)
    var scheduleDays: [ScheduleDay]?
    
    @Relationship(deleteRule: .cascade, inverse: \Team.trip)
    var teams: [Team]?
    
    init(
        id: UUID = UUID(),
        name: String,
        startDate: Date,
        endDate: Date,
        location: String? = nil,
        notes: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.startDate = startDate
        self.endDate = endDate
        self.location = location
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension Trip {
    /// Sorted schedule days by date
    var sortedDays: [ScheduleDay] {
        (scheduleDays ?? []).sorted { $0.date < $1.date }
    }
    
    /// Get formatted date range
    var dateRangeFormatted: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        let start = formatter.string(from: startDate)
        let end = formatter.string(from: endDate)
        
        let yearFormatter = DateFormatter()
        yearFormatter.dateFormat = "yyyy"
        let year = yearFormatter.string(from: startDate)
        
        return "\(start) - \(end), \(year)"
    }
    
    /// Duration in days
    var durationDays: Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: startDate, to: endDate)
        return (components.day ?? 0) + 1
    }
}
