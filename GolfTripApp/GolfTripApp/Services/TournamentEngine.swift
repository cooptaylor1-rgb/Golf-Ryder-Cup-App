import Foundation

/// Engine for tournament management - pairings, points, rules
struct TournamentEngine {
    
    // MARK: - Points Calculation
    
    /// Default Ryder Cup points per match
    static let defaultPointsPerMatch: Double = 1.0
    
    /// Calculate total points earned by a player across all matches
    static func playerPoints(playerId: UUID, matches: [Match], teamAPlayerIds: Set<UUID>) -> Double {
        var points: Double = 0.0
        
        for match in matches where match.status == .final {
            let isTeamA = match.teamAIds.contains(playerId)
            let isTeamB = match.teamBIds.contains(playerId)
            
            guard isTeamA || isTeamB else { continue }
            
            let matchPoints = match.session?.pointsPerMatch ?? 1.0
            
            switch match.result {
            case .teamAWin:
                if isTeamA { points += matchPoints }
            case .teamBWin:
                if isTeamB { points += matchPoints }
            case .halved:
                points += matchPoints / 2
            case .notFinished:
                break
            }
        }
        
        return points
    }
    
    /// Calculate player record (wins, losses, halves)
    static func playerRecord(playerId: UUID, matches: [Match]) -> (wins: Int, losses: Int, halves: Int) {
        var wins = 0
        var losses = 0
        var halves = 0
        
        for match in matches where match.status == .final {
            let isTeamA = match.teamAIds.contains(playerId)
            let isTeamB = match.teamBIds.contains(playerId)
            
            guard isTeamA || isTeamB else { continue }
            
            switch match.result {
            case .teamAWin:
                if isTeamA { wins += 1 } else { losses += 1 }
            case .teamBWin:
                if isTeamB { wins += 1 } else { losses += 1 }
            case .halved:
                halves += 1
            case .notFinished:
                break
            }
        }
        
        return (wins, losses, halves)
    }
    
    // MARK: - Handicap Allowances
    
    /// Handicap allowance for different formats
    enum HandicapAllowance {
        case singles          // 100% of course handicap difference
        case fourballDefault  // 90% of lowest, others % off lowest
        case foursomesDefault // 50% of combined team handicap
        case custom(Double)   // Custom percentage
        
        var description: String {
            switch self {
            case .singles:
                return "100% of the difference in course handicaps"
            case .fourballDefault:
                return "90% of lowest handicap, others play off that"
            case .foursomesDefault:
                return "50% of combined team handicaps"
            case .custom(let pct):
                return "\(Int(pct * 100))% of handicap"
            }
        }
    }
    
    /// Calculate strokes given in singles match
    static func singlesStrokes(
        playerACourseHandicap: Int,
        playerBCourseHandicap: Int,
        allowance: Double = 1.0  // 100%
    ) -> (playerAStrokes: Int, playerBStrokes: Int) {
        let difference = playerACourseHandicap - playerBCourseHandicap
        let adjustedDiff = Int(Double(abs(difference)) * allowance)
        
        if difference > 0 {
            // Player A has higher handicap, gets strokes
            return (adjustedDiff, 0)
        } else if difference < 0 {
            // Player B has higher handicap, gets strokes
            return (0, adjustedDiff)
        }
        return (0, 0)
    }
    
    /// Calculate strokes in fourball (best ball)
    /// Standard method: lowest handicap plays at scratch, others get percentage of difference
    static func fourballStrokes(
        teamACourseHandicaps: [Int],
        teamBCourseHandicaps: [Int],
        allowance: Double = 0.9  // 90%
    ) -> (teamAStrokes: [Int], teamBStrokes: [Int]) {
        let allHandicaps = teamACourseHandicaps + teamBCourseHandicaps
        guard let lowest = allHandicaps.min() else {
            return (Array(repeating: 0, count: teamACourseHandicaps.count),
                    Array(repeating: 0, count: teamBCourseHandicaps.count))
        }
        
        let teamAStrokes = teamACourseHandicaps.map { hcp in
            Int(Double(hcp - lowest) * allowance)
        }
        
        let teamBStrokes = teamBCourseHandicaps.map { hcp in
            Int(Double(hcp - lowest) * allowance)
        }
        
        return (teamAStrokes, teamBStrokes)
    }
    
    /// Calculate strokes in foursomes (alternate shot)
    /// Standard method: 50% of combined team handicaps, difference given
    static func foursomesStrokes(
        teamACourseHandicaps: [Int],
        teamBCourseHandicaps: [Int],
        allowance: Double = 0.5  // 50%
    ) -> (teamAStrokes: Int, teamBStrokes: Int) {
        let teamATotal = teamACourseHandicaps.reduce(0, +)
        let teamBTotal = teamBCourseHandicaps.reduce(0, +)
        
        let teamACombined = Int(Double(teamATotal) * allowance)
        let teamBCombined = Int(Double(teamBTotal) * allowance)
        
        let difference = teamACombined - teamBCombined
        
        if difference > 0 {
            return (abs(difference), 0)
        } else if difference < 0 {
            return (0, abs(difference))
        }
        return (0, 0)
    }
    
    // MARK: - Pairing Validation
    
    /// Validation result for pairings
    struct PairingValidationResult {
        var isValid: Bool
        var warnings: [String]
        var errors: [String]
        var fairnessScore: Double  // 0-100, 100 is perfectly fair
    }
    
    /// Validate session pairings
    static func validatePairings(
        session: RyderCupSession,
        teamAPlayers: [Player],
        teamBPlayers: [Player]
    ) -> PairingValidationResult {
        var warnings: [String] = []
        var errors: [String] = []
        
        let matches = session.sortedMatches
        let playersPerTeam = session.sessionType.playersPerTeam
        
        // Check all matches have correct player counts
        for (index, match) in matches.enumerated() {
            if match.teamAIds.count != playersPerTeam {
                errors.append("Match \(index + 1) needs \(playersPerTeam) Team A players")
            }
            if match.teamBIds.count != playersPerTeam {
                errors.append("Match \(index + 1) needs \(playersPerTeam) Team B players")
            }
        }
        
        // Check for duplicate players in same session
        var usedTeamAIds = Set<UUID>()
        var usedTeamBIds = Set<UUID>()
        
        for match in matches {
            for id in match.teamAIds {
                if usedTeamAIds.contains(id) {
                    let playerName = teamAPlayers.first { $0.id == id }?.name ?? "Unknown"
                    warnings.append("\(playerName) appears in multiple Team A pairings")
                }
                usedTeamAIds.insert(id)
            }
            
            for id in match.teamBIds {
                if usedTeamBIds.contains(id) {
                    let playerName = teamBPlayers.first { $0.id == id }?.name ?? "Unknown"
                    warnings.append("\(playerName) appears in multiple Team B pairings")
                }
                usedTeamBIds.insert(id)
            }
        }
        
        // Calculate fairness score based on handicap spread
        let fairnessScore = calculateFairnessScore(matches: matches, 
                                                   teamAPlayers: teamAPlayers,
                                                   teamBPlayers: teamBPlayers)
        
        if fairnessScore < 70 {
            warnings.append("Handicap spread seems unbalanced (Fairness: \(Int(fairnessScore))%)")
        }
        
        return PairingValidationResult(
            isValid: errors.isEmpty,
            warnings: warnings,
            errors: errors,
            fairnessScore: fairnessScore
        )
    }
    
    /// Calculate fairness score for pairings (0-100)
    static func calculateFairnessScore(
        matches: [Match],
        teamAPlayers: [Player],
        teamBPlayers: [Player]
    ) -> Double {
        guard !matches.isEmpty else { return 100 }
        
        var totalHandicapDiff: Double = 0
        
        for match in matches {
            let teamAHcps = match.teamAIds.compactMap { id in
                teamAPlayers.first { $0.id == id }?.handicapIndex
            }
            let teamBHcps = match.teamBIds.compactMap { id in
                teamBPlayers.first { $0.id == id }?.handicapIndex
            }
            
            let teamAAvg = teamAHcps.isEmpty ? 0 : teamAHcps.reduce(0, +) / Double(teamAHcps.count)
            let teamBAvg = teamBHcps.isEmpty ? 0 : teamBHcps.reduce(0, +) / Double(teamBHcps.count)
            
            totalHandicapDiff += abs(teamAAvg - teamBAvg)
        }
        
        let avgDiff = totalHandicapDiff / Double(matches.count)
        
        // Score: 100 for 0 diff, decreasing with larger differences
        // 5 stroke difference = 50 score
        return max(0, 100 - (avgDiff * 10))
    }
    
    // MARK: - Draft Helpers
    
    /// Generate snake draft order for N picks
    static func snakeDraftOrder(totalPicks: Int, teams: Int = 2) -> [(team: Int, pick: Int)] {
        var order: [(team: Int, pick: Int)] = []
        var pickNum = 1
        var round = 0
        
        while order.count < totalPicks {
            let isEvenRound = round % 2 == 0
            
            for teamIndex in 0..<teams {
                let team = isEvenRound ? teamIndex : (teams - 1 - teamIndex)
                order.append((team: team, pick: pickNum))
                pickNum += 1
                if order.count >= totalPicks { break }
            }
            
            round += 1
        }
        
        return order
    }
    
    /// Suggest balanced pairings based on handicaps
    static func suggestPairings(
        teamAPlayers: [Player],
        teamBPlayers: [Player],
        matchCount: Int
    ) -> [(teamA: [Player], teamB: [Player])] {
        // Sort players by handicap
        let sortedA = teamAPlayers.sorted { $0.handicapIndex < $1.handicapIndex }
        let sortedB = teamBPlayers.sorted { $0.handicapIndex < $1.handicapIndex }
        
        var pairings: [(teamA: [Player], teamB: [Player])] = []
        
        // Simple pairing: match similar ranked players
        for i in 0..<matchCount {
            let teamA = sortedA.count > i ? [sortedA[i]] : []
            let teamB = sortedB.count > i ? [sortedB[i]] : []
            pairings.append((teamA, teamB))
        }
        
        return pairings
    }
}
