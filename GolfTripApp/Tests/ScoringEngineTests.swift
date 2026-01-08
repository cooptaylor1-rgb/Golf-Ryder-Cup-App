import XCTest
@testable import GolfTripApp

final class ScoringEngineTests: XCTestCase {
    
    // MARK: - Match State Tests
    
    func testAllSquare() {
        let results: [HoleResult] = [
            HoleResult(holeNumber: 1, winner: .teamA),
            HoleResult(holeNumber: 2, winner: .teamB),
            HoleResult(holeNumber: 3, winner: .halved)
        ]
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, 0)
        XCTAssertEqual(state.holesPlayed, 3)
        XCTAssertEqual(state.holesRemaining, 15)
        XCTAssertFalse(state.isDormie)
        XCTAssertFalse(state.isClosedOut)
        XCTAssertTrue(state.canContinue)
        XCTAssertTrue(state.statusText.contains("All Square"))
    }
    
    func testTeamALeading() {
        let results: [HoleResult] = [
            HoleResult(holeNumber: 1, winner: .teamA),
            HoleResult(holeNumber: 2, winner: .teamA),
            HoleResult(holeNumber: 3, winner: .teamB)
        ]
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, 1)
        XCTAssertTrue(state.statusText.contains("Team A 1 UP"))
    }
    
    func testTeamBLeading() {
        let results: [HoleResult] = [
            HoleResult(holeNumber: 1, winner: .teamB),
            HoleResult(holeNumber: 2, winner: .teamB),
            HoleResult(holeNumber: 3, winner: .teamB)
        ]
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, -3)
        XCTAssertTrue(state.statusText.contains("Team B 3 UP"))
    }
    
    func testDormie() {
        // Team A 3 up with 3 to play = dormie
        var results: [HoleResult] = []
        for i in 1...15 {
            let winner: HoleWinner = i <= 3 ? .teamA : .halved
            results.append(HoleResult(holeNumber: i, winner: winner))
        }
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, 3)
        XCTAssertEqual(state.holesRemaining, 3)
        XCTAssertTrue(state.isDormie)
        XCTAssertFalse(state.isClosedOut)
        XCTAssertTrue(state.statusText.contains("Dormie"))
    }
    
    func testClosedOut() {
        // Team A 4 up with 3 to play = closed out
        var results: [HoleResult] = []
        for i in 1...15 {
            let winner: HoleWinner = i <= 4 ? .teamA : .halved
            results.append(HoleResult(holeNumber: i, winner: winner))
        }
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, 4)
        XCTAssertEqual(state.holesRemaining, 3)
        XCTAssertTrue(state.isClosedOut)
        XCTAssertFalse(state.canContinue)
        XCTAssertTrue(state.statusText.contains("Team A wins 4&3"))
    }
    
    func testMatchHalved() {
        // All 18 holes halved
        var results: [HoleResult] = []
        for i in 1...18 {
            results.append(HoleResult(holeNumber: i, winner: .halved))
        }
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, 0)
        XCTAssertEqual(state.holesRemaining, 0)
        XCTAssertFalse(state.canContinue)
        XCTAssertTrue(state.statusText.contains("Halved"))
    }
    
    func testTeamAWinsOn18() {
        // Team A 1 up after 18
        var results: [HoleResult] = []
        results.append(HoleResult(holeNumber: 1, winner: .teamA))
        for i in 2...18 {
            results.append(HoleResult(holeNumber: i, winner: .halved))
        }
        
        let state = ScoringEngine.calculateMatchState(holeResults: results)
        
        XCTAssertEqual(state.matchScore, 1)
        XCTAssertFalse(state.canContinue)
        XCTAssertTrue(state.statusText.contains("Team A wins 1 UP"))
    }
    
    // MARK: - Hole Winner Tests
    
    func testDetermineHoleWinner_TeamAWins() {
        let winner = ScoringEngine.determineHoleWinner(teamANetScore: 3, teamBNetScore: 4)
        XCTAssertEqual(winner, .teamA)
    }
    
    func testDetermineHoleWinner_TeamBWins() {
        let winner = ScoringEngine.determineHoleWinner(teamANetScore: 5, teamBNetScore: 4)
        XCTAssertEqual(winner, .teamB)
    }
    
    func testDetermineHoleWinner_Halved() {
        let winner = ScoringEngine.determineHoleWinner(teamANetScore: 4, teamBNetScore: 4)
        XCTAssertEqual(winner, .halved)
    }
    
    // MARK: - Fourball Hole Winner Tests
    
    func testFourballHoleWinner_TeamAWins() {
        let teamA = [(gross: 4, strokes: 1), (gross: 5, strokes: 0)]  // Best net: 3
        let teamB = [(gross: 4, strokes: 0), (gross: 5, strokes: 1)]  // Best net: 4
        
        let winner = ScoringEngine.fourballHoleWinner(teamAScores: teamA, teamBScores: teamB)
        XCTAssertEqual(winner, .teamA)
    }
    
    func testFourballHoleWinner_TeamBWins() {
        let teamA = [(gross: 5, strokes: 0), (gross: 5, strokes: 0)]  // Best net: 5
        let teamB = [(gross: 4, strokes: 0), (gross: 6, strokes: 2)]  // Best net: 4
        
        let winner = ScoringEngine.fourballHoleWinner(teamAScores: teamA, teamBScores: teamB)
        XCTAssertEqual(winner, .teamB)
    }
    
    func testFourballHoleWinner_Halved() {
        let teamA = [(gross: 4, strokes: 0), (gross: 5, strokes: 1)]  // Best net: 4
        let teamB = [(gross: 5, strokes: 1), (gross: 6, strokes: 2)]  // Best net: 4
        
        let winner = ScoringEngine.fourballHoleWinner(teamAScores: teamA, teamBScores: teamB)
        XCTAssertEqual(winner, .halved)
    }
    
    // MARK: - Match Finalization Tests
    
    func testFinalizeMatch_TeamAWins3And2() {
        var results: [HoleResult] = []
        // Team A wins first 4 holes
        for i in 1...4 {
            results.append(HoleResult(holeNumber: i, winner: .teamA))
        }
        // Remaining holes halved until closed out
        for i in 5...16 {
            results.append(HoleResult(holeNumber: i, winner: .halved))
        }
        
        let (result, margin, remaining) = ScoringEngine.finalizeMatch(holeResults: results)
        
        XCTAssertEqual(result, .teamAWin)
        XCTAssertEqual(margin, 4)  // 4 up
        XCTAssertEqual(remaining, 2)  // 2 to play
    }
    
    func testFinalizeMatch_Halved() {
        var results: [HoleResult] = []
        for i in 1...18 {
            results.append(HoleResult(holeNumber: i, winner: .halved))
        }
        
        let (result, margin, remaining) = ScoringEngine.finalizeMatch(holeResults: results)
        
        XCTAssertEqual(result, .halved)
        XCTAssertEqual(margin, 0)
        XCTAssertEqual(remaining, 0)
    }
    
    func testFinalizeMatch_NotFinished() {
        let results: [HoleResult] = [
            HoleResult(holeNumber: 1, winner: .teamA)
        ]
        
        let (result, _, _) = ScoringEngine.finalizeMatch(holeResults: results)
        
        XCTAssertEqual(result, .notFinished)
    }
    
    // MARK: - Momentum Tests
    
    func testMomentum() {
        let results: [HoleResult] = [
            HoleResult(holeNumber: 1, winner: .teamA),
            HoleResult(holeNumber: 2, winner: .teamA),
            HoleResult(holeNumber: 3, winner: .teamB),
            HoleResult(holeNumber: 4, winner: .halved),
            HoleResult(holeNumber: 5, winner: .teamA)
        ]
        
        let momentum = ScoringEngine.momentum(holeResults: results, lastN: 3)
        
        XCTAssertEqual(momentum.teamAWins, 1)
        XCTAssertEqual(momentum.teamBWins, 1)
        XCTAssertEqual(momentum.halves, 1)
    }
    
    func testMomentumLast5() {
        let results: [HoleResult] = [
            HoleResult(holeNumber: 1, winner: .teamA),
            HoleResult(holeNumber: 2, winner: .teamA),
            HoleResult(holeNumber: 3, winner: .teamA),
            HoleResult(holeNumber: 4, winner: .teamA),
            HoleResult(holeNumber: 5, winner: .teamA)
        ]
        
        let momentum = ScoringEngine.momentum(holeResults: results, lastN: 5)
        
        XCTAssertEqual(momentum.teamAWins, 5)
        XCTAssertEqual(momentum.teamBWins, 0)
        XCTAssertEqual(momentum.halves, 0)
    }
    
    // MARK: - Undo Manager Tests
    
    func testUndoManager() {
        let undoManager = ScoringEngine.UndoManager()
        
        XCTAssertFalse(undoManager.canUndo())
        
        undoManager.recordAction(ScoringEngine.UndoAction(holeNumber: 1, previousWinner: nil, timestamp: Date()))
        XCTAssertTrue(undoManager.canUndo())
        
        let action = undoManager.popLastAction()
        XCTAssertNotNil(action)
        XCTAssertEqual(action?.holeNumber, 1)
        XCTAssertFalse(undoManager.canUndo())
    }
    
    func testUndoManagerMaxHistory() {
        let undoManager = ScoringEngine.UndoManager()
        
        // Add 7 actions (max is 5)
        for i in 1...7 {
            undoManager.recordAction(ScoringEngine.UndoAction(holeNumber: i, previousWinner: nil, timestamp: Date()))
        }
        
        // Should only have last 5
        var count = 0
        while undoManager.canUndo() {
            _ = undoManager.popLastAction()
            count += 1
        }
        
        XCTAssertEqual(count, 5)
    }
}
