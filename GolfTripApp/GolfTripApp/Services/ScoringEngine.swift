import Foundation

/// Engine for match play scoring - state machine, calculations, undo
///
/// Match play scoring rules implemented:
/// - Each hole is worth +1, -1, or 0 (halved)
/// - Match score = cumulative hole results (positive = Team A leading)
/// - **Dormie**: When one team is up by exactly the number of holes remaining
/// - **Closed out**: When one team is up by more holes than remain (e.g., 4&3)
/// - Final results expressed as "X&Y" (closed out) or "X UP" (won at 18)
struct ScoringEngine {
    
    // MARK: - Match State
    
    /// Match state summary
    struct MatchState {
        var matchScore: Int  // Positive = Team A leading
        var holesPlayed: Int
        var holesRemaining: Int
        var isDormie: Bool
        var isClosedOut: Bool
        var statusText: String
        var canContinue: Bool
    }
    
    /// Calculate match state from hole results.
    ///
    /// State transitions:
    /// 1. **All Square**: matchScore == 0, match continues
    /// 2. **X UP**: abs(matchScore) < holesRemaining, match continues
    /// 3. **Dormie**: abs(matchScore) == holesRemaining, critical moment
    /// 4. **Closed Out**: abs(matchScore) > holesRemaining, match ends (X&Y format)
    /// 5. **Final at 18**: holesRemaining == 0, match ends (X UP or Halved)
    ///
    /// - Parameter holeResults: Array of hole results (should be sorted by hole number)
    /// - Returns: MatchState with current standing and status
    static func calculateMatchState(holeResults: [HoleResult]) -> MatchState {
        let holesPlayed = holeResults.count
        let holesRemaining = 18 - holesPlayed
        
        var matchScore = 0
        for result in holeResults {
            switch result.winner {
            case .teamA: matchScore += 1
            case .teamB: matchScore -= 1
            case .halved: break
            }
        }
        
        let isDormie = abs(matchScore) == holesRemaining && holesRemaining > 0
        let isClosedOut = abs(matchScore) > holesRemaining
        let canContinue = !isClosedOut && holesRemaining > 0
        
        var statusText: String
        if isClosedOut {
            if matchScore > 0 {
                statusText = "Team A wins \(abs(matchScore))&\(holesRemaining)"
            } else {
                statusText = "Team B wins \(abs(matchScore))&\(holesRemaining)"
            }
        } else if holesPlayed == 18 {
            if matchScore > 0 {
                statusText = "Team A wins \(matchScore) UP"
            } else if matchScore < 0 {
                statusText = "Team B wins \(abs(matchScore)) UP"
            } else {
                statusText = "Match Halved"
            }
        } else if isDormie {
            if matchScore > 0 {
                statusText = "Team A Dormie (\(matchScore) UP, \(holesRemaining) to play)"
            } else {
                statusText = "Team B Dormie (\(abs(matchScore)) UP, \(holesRemaining) to play)"
            }
        } else if matchScore == 0 {
            statusText = "All Square through \(holesPlayed)"
        } else if matchScore > 0 {
            statusText = "Team A \(matchScore) UP through \(holesPlayed)"
        } else {
            statusText = "Team B \(abs(matchScore)) UP through \(holesPlayed)"
        }
        
        return MatchState(
            matchScore: matchScore,
            holesPlayed: holesPlayed,
            holesRemaining: holesRemaining,
            isDormie: isDormie,
            isClosedOut: isClosedOut,
            statusText: statusText,
            canContinue: canContinue
        )
    }
    
    // MARK: - Hole Result Calculation
    
    /// Determine hole winner based on net scores
    static func determineHoleWinner(
        teamANetScore: Int,
        teamBNetScore: Int
    ) -> HoleWinner {
        if teamANetScore < teamBNetScore {
            return .teamA
        } else if teamBNetScore < teamANetScore {
            return .teamB
        }
        return .halved
    }
    
    /// Calculate net score for stroke-by-stroke entry
    static func calculateNetScore(
        grossStrokes: Int,
        strokesReceived: Int
    ) -> Int {
        return grossStrokes - strokesReceived
    }
    
    /// For fourball: determine hole winner from multiple scores
    static func fourballHoleWinner(
        teamAScores: [(gross: Int, strokes: Int)],
        teamBScores: [(gross: Int, strokes: Int)]
    ) -> HoleWinner {
        let teamABestNet = teamAScores.map { $0.gross - $0.strokes }.min() ?? Int.max
        let teamBBestNet = teamBScores.map { $0.gross - $0.strokes }.min() ?? Int.max
        
        return determineHoleWinner(teamANetScore: teamABestNet, teamBNetScore: teamBBestNet)
    }
    
    // MARK: - Match Finalization
    
    /// Determine final match result
    static func finalizeMatch(holeResults: [HoleResult]) -> (result: MatchResultType, margin: Int, holesRemaining: Int) {
        let state = calculateMatchState(holeResults: holeResults)
        
        guard state.isClosedOut || state.holesRemaining == 0 else {
            return (.notFinished, 0, state.holesRemaining)
        }
        
        if state.matchScore > 0 {
            return (.teamAWin, abs(state.matchScore), state.holesRemaining)
        } else if state.matchScore < 0 {
            return (.teamBWin, abs(state.matchScore), state.holesRemaining)
        }
        return (.halved, 0, 0)
    }
    
    // MARK: - Undo History
    
    /// Undo action for match scoring
    struct UndoAction {
        let holeNumber: Int
        let previousWinner: HoleWinner?  // nil if hole wasn't scored
        let timestamp: Date
    }
    
    /// Manage undo history (max 5 actions)
    class UndoManager {
        private var history: [UndoAction] = []
        private let maxHistory = 5
        
        func recordAction(_ action: UndoAction) {
            history.append(action)
            if history.count > maxHistory {
                history.removeFirst()
            }
        }
        
        func popLastAction() -> UndoAction? {
            return history.popLast()
        }
        
        func canUndo() -> Bool {
            return !history.isEmpty
        }
        
        func clear() {
            history.removeAll()
        }
        
        var lastAction: UndoAction? {
            return history.last
        }
    }
    
    // MARK: - Strokes Per Hole
    
    /// Calculate which holes a player receives strokes on
    static func strokesPerHole(
        totalStrokes: Int,
        holeHandicaps: [Int]
    ) -> [Int] {
        return HandicapCalculator.allocateStrokes(
            courseHandicap: totalStrokes,
            holeHandicaps: holeHandicaps
        )
    }
    
    /// Get strokes received on a specific hole
    static func strokesOnHole(
        holeNumber: Int,
        totalStrokes: Int,
        holeHandicaps: [Int]
    ) -> Int {
        let allocation = strokesPerHole(totalStrokes: totalStrokes, holeHandicaps: holeHandicaps)
        guard holeNumber >= 1 && holeNumber <= 18 else { return 0 }
        return allocation[holeNumber - 1]
    }
    
    // MARK: - Match Progress Stats
    
    /// Calculate momentum (last N hole results)
    static func momentum(holeResults: [HoleResult], lastN: Int = 5) -> (teamAWins: Int, teamBWins: Int, halves: Int) {
        let recent = Array(holeResults.suffix(lastN))
        var teamA = 0
        var teamB = 0
        var halves = 0
        
        for result in recent {
            switch result.winner {
            case .teamA: teamA += 1
            case .teamB: teamB += 1
            case .halved: halves += 1
            }
        }
        
        return (teamA, teamB, halves)
    }
    
    /// Clutch stat: performance in final 3 holes of a match
    static func clutchPerformance(
        playerId: UUID,
        matches: [Match],
        teamAPlayerIds: Set<UUID>
    ) -> (holesWon: Int, holesLost: Int) {
        var won = 0
        var lost = 0
        
        for match in matches where match.status == .final {
            let isTeamA = match.teamAIds.contains(playerId)
            let isTeamB = match.teamBIds.contains(playerId)
            guard isTeamA || isTeamB else { continue }
            
            // Get final 3 holes of this match (or fewer if closed out early)
            let results = match.sortedHoleResults
            let clutchHoles = Array(results.suffix(3))
            
            for result in clutchHoles {
                let playerWonHole = (isTeamA && result.winner == .teamA) ||
                                   (isTeamB && result.winner == .teamB)
                let playerLostHole = (isTeamA && result.winner == .teamB) ||
                                    (isTeamB && result.winner == .teamA)
                
                if playerWonHole { won += 1 }
                if playerLostHole { lost += 1 }
            }
        }
        
        return (won, lost)
    }
}
