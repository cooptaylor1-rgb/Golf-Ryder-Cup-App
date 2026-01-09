import Foundation
import SwiftData

/// Game format type
enum FormatType: String, Codable, CaseIterable {
    case strokePlayGross = "stroke_play_gross"
    case strokePlayNet = "stroke_play_net"
    case stableford = "stableford"
    case bestBall = "best_ball"
    case scramble = "scramble"
    
    var displayName: String {
        switch self {
        case .strokePlayGross: return "Stroke Play (Gross)"
        case .strokePlayNet: return "Stroke Play (Net)"
        case .stableford: return "Stableford"
        case .bestBall: return "2-Person Best Ball"
        case .scramble: return "4-Person Scramble"
        }
    }
    
    var description: String {
        switch self {
        case .strokePlayGross: return "Count total strokes, lowest score wins"
        case .strokePlayNet: return "Count net strokes after handicap adjustment"
        case .stableford: return "Points based on net score per hole"
        case .bestBall: return "Best net score of 2-person team counts"
        case .scramble: return "Team plays from best shot each stroke"
        }
    }
    
    var isTeamFormat: Bool {
        switch self {
        case .bestBall, .scramble: return true
        default: return false
        }
    }
    
    var iconName: String {
        switch self {
        case .strokePlayGross, .strokePlayNet: return "number.circle"
        case .stableford: return "star.circle"
        case .bestBall: return "person.2.circle"
        case .scramble: return "person.3.sequence"
        }
    }
}

/// Format entity for game formats
@Model
final class Format {
    var id: UUID
    var name: String
    var type: FormatType
    var optionsJson: String?
    var createdAt: Date
    
    // Relationships
    @Relationship(deleteRule: .cascade, inverse: \Scorecard.format)
    var scorecards: [Scorecard]?
    
    init(
        id: UUID = UUID(),
        name: String,
        type: FormatType,
        optionsJson: String? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.optionsJson = optionsJson
        self.createdAt = createdAt
    }
}

extension Format {
    /// Parse format options from JSON
    var options: FormatOptions {
        guard let json = optionsJson,
              let data = json.data(using: .utf8),
              let opts = try? JSONDecoder().decode(FormatOptions.self, from: data) else {
            return FormatOptions()
        }
        return opts
    }
    
    /// Set format options
    func setOptions(_ opts: FormatOptions) {
        if let data = try? JSONEncoder().encode(opts),
           let json = String(data: data, encoding: .utf8) {
            optionsJson = json
        }
    }
}

/// Additional format options
struct FormatOptions: Codable {
    var useBack9Tiebreak: Bool = true
    var teamSize: Int = 2
    var handicapPercentage: Double = 100.0
}
