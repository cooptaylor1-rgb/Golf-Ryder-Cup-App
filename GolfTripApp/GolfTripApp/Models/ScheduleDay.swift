import Foundation
import SwiftData

/// Schedule day within a trip
@Model
final class ScheduleDay {
    var id: UUID
    var date: Date
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    var trip: Trip?
    
    @Relationship(deleteRule: .cascade, inverse: \ScheduleItem.scheduleDay)
    var items: [ScheduleItem]?
    
    init(
        id: UUID = UUID(),
        date: Date,
        notes: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.date = date
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension ScheduleDay {
    /// Sorted items by start time
    var sortedItems: [ScheduleItem] {
        (items ?? []).sorted { ($0.startTime ?? Date.distantFuture) < ($1.startTime ?? Date.distantFuture) }
    }
    
    /// Formatted date for display
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMM d"
        return formatter.string(from: date)
    }
    
    /// Day number relative to trip start
    func dayNumber(in trip: Trip) -> Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: trip.startDate, to: date)
        return (components.day ?? 0) + 1
    }
}
