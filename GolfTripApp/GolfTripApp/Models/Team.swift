import Foundation
import SwiftData

/// Team mode
enum TeamMode: String, Codable, CaseIterable {
    case freeform = "freeform"
    case ryderCup = "ryder_cup"
    
    var displayName: String {
        switch self {
        case .freeform: return "Freeform"
        case .ryderCup: return "Ryder Cup"
        }
    }
    
    var description: String {
        switch self {
        case .freeform: return "Any number of teams with flexible roster sizes"
        case .ryderCup: return "Two teams with equal roster sizes"
        }
    }
}

/// Team entity for managing team competitions
@Model
final class Team {
    var id: UUID
    var name: String
    var colorHex: String?
    var icon: String?
    var notes: String?
    var mode: TeamMode
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    var trip: Trip?
    
    @Relationship(deleteRule: .cascade, inverse: \TeamMember.team)
    var members: [TeamMember]?
    
    @Relationship(deleteRule: .cascade, inverse: \HoleScore.team)
    var holeScores: [HoleScore]?
    
    @Relationship(deleteRule: .cascade, inverse: \TeamScore.team)
    var teamScores: [TeamScore]?
    
    init(
        id: UUID = UUID(),
        name: String,
        colorHex: String? = nil,
        icon: String? = nil,
        notes: String? = nil,
        mode: TeamMode = .freeform,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.colorHex = colorHex
        self.icon = icon
        self.notes = notes
        self.mode = mode
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension Team {
    /// Sorted members by sort order
    var sortedMembers: [TeamMember] {
        (members ?? []).sorted { $0.sortOrder < $1.sortOrder }
    }
    
    /// Players on this team
    var players: [Player] {
        sortedMembers.compactMap { $0.player }
    }
    
    /// Captain of this team
    var captain: Player? {
        sortedMembers.first { $0.isCaptain }?.player
    }
    
    /// Team size (number of players)
    var size: Int {
        members?.count ?? 0
    }
    
    /// Available team colors
    static var availableColors: [(name: String, hex: String)] {
        [
            ("Red", "#E53935"),
            ("Blue", "#1E88E5"),
            ("Green", "#43A047"),
            ("Gold", "#FDD835"),
            ("Purple", "#8E24AA"),
            ("Orange", "#FB8C00"),
            ("Teal", "#00897B"),
            ("Navy", "#283593")
        ]
    }
}
