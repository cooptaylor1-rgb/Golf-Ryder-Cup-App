import Foundation
import SwiftData

/// Individual hole score
@Model
final class HoleScore {
    var id: UUID
    var holeNumber: Int
    var strokes: Int
    var createdAt: Date
    var updatedAt: Date
    
    // Relationships
    var scorecard: Scorecard?
    var player: Player?
    var team: Team?
    
    init(
        id: UUID = UUID(),
        holeNumber: Int,
        strokes: Int,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.holeNumber = holeNumber
        self.strokes = strokes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension HoleScore {
    /// Score relative to par
    func relativeToPar(par: Int) -> Int {
        strokes - par
    }
    
    /// Display string for score relative to par
    func relativeToParDisplay(par: Int) -> String {
        let diff = relativeToPar(par: par)
        switch diff {
        case ..<(-2): return "Eagle+"
        case -2: return "Eagle"
        case -1: return "Birdie"
        case 0: return "Par"
        case 1: return "Bogey"
        case 2: return "Double"
        default: return "+\(diff)"
        }
    }
}
