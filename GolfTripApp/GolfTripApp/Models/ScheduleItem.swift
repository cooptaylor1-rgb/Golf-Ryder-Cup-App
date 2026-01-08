import Foundation
import SwiftData

/// Type of schedule item
enum ScheduleItemType: String, Codable, CaseIterable {
    case teeTime = "tee_time"
    case event = "event"
    
    var displayName: String {
        switch self {
        case .teeTime: return "Tee Time"
        case .event: return "Event"
        }
    }
    
    var iconName: String {
        switch self {
        case .teeTime: return "figure.golf"
        case .event: return "calendar.badge.clock"
        }
    }
}

/// Schedule item within a day (tee time or event)
@Model
final class ScheduleItem {
    var id: UUID
    var type: ScheduleItemType
    var title: String?
    var startTime: Date?
    var endTime: Date?
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    var scheduleDay: ScheduleDay?
    var teeSet: TeeSet?
    
    @Relationship(deleteRule: .cascade, inverse: \Group.scheduleItem)
    var groups: [Group]?
    
    @Relationship(deleteRule: .cascade, inverse: \Scorecard.scheduleItem)
    var scorecards: [Scorecard]?
    
    init(
        id: UUID = UUID(),
        type: ScheduleItemType,
        title: String? = nil,
        startTime: Date? = nil,
        endTime: Date? = nil,
        notes: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.type = type
        self.title = title
        self.startTime = startTime
        self.endTime = endTime
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension ScheduleItem {
    /// Display title
    var displayTitle: String {
        if let title = title, !title.isEmpty {
            return title
        }
        if type == .teeTime, let teeSet = teeSet, let course = teeSet.course {
            return "\(course.name) - \(teeSet.displayName)"
        }
        return type.displayName
    }
    
    /// Formatted start time
    var formattedStartTime: String {
        guard let time = startTime else { return "" }
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: time)
    }
    
    /// Course name if this is a tee time
    var courseName: String? {
        teeSet?.course?.name
    }
    
    /// Sorted groups by name
    var sortedGroups: [Group] {
        (groups ?? []).sorted { $0.name < $1.name }
    }
    
    /// All players in this schedule item
    var allPlayers: [Player] {
        (groups ?? []).flatMap { $0.sortedPlayers }
    }
    
    /// Active scorecard for this item
    var activeScorecard: Scorecard? {
        scorecards?.first { $0.status != .final }
    }
}
