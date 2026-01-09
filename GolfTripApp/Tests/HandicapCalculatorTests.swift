import XCTest
@testable import GolfTripApp

final class HandicapCalculatorTests: XCTestCase {
    
    // MARK: - Course Handicap Tests
    
    func testCourseHandicapCalculation_StandardCase() {
        // Given: A player with 10.0 handicap index
        // Course: Slope 113 (standard), Rating 72.0, Par 72
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 10.0,
            slopeRating: 113,
            courseRating: 72.0,
            par: 72
        )
        
        // Expected: 10.0 * (113/113) + (72.0 - 72) = 10.0 -> rounds to 10
        XCTAssertEqual(result, 10)
    }
    
    func testCourseHandicapCalculation_HardCourse() {
        // Given: A player with 15.0 handicap index
        // Course: Slope 145 (hard), Rating 74.5, Par 72
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 15.0,
            slopeRating: 145,
            courseRating: 74.5,
            par: 72
        )
        
        // Expected: 15.0 * (145/113) + (74.5 - 72) = 15.0 * 1.283 + 2.5 = 19.25 + 2.5 = 21.75 -> rounds to 22
        XCTAssertEqual(result, 22)
    }
    
    func testCourseHandicapCalculation_EasyCourse() {
        // Given: A player with 12.0 handicap index
        // Course: Slope 100 (easy), Rating 69.5, Par 72
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 12.0,
            slopeRating: 100,
            courseRating: 69.5,
            par: 72
        )
        
        // Expected: 12.0 * (100/113) + (69.5 - 72) = 12.0 * 0.885 + (-2.5) = 10.62 - 2.5 = 8.12 -> rounds to 8
        XCTAssertEqual(result, 8)
    }
    
    func testCourseHandicapCalculation_PlusHandicap() {
        // Given: A player with -2.5 (plus) handicap index
        // Course: Slope 130, Rating 73.0, Par 72
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: -2.5,
            slopeRating: 130,
            courseRating: 73.0,
            par: 72
        )
        
        // Expected: -2.5 * (130/113) + (73.0 - 72) = -2.5 * 1.15 + 1.0 = -2.875 + 1.0 = -1.875 -> rounds to -2
        XCTAssertEqual(result, -2)
    }
    
    func testCourseHandicapCalculation_ZeroHandicap() {
        // Given: A scratch golfer with 0.0 handicap index
        // Course: Slope 120, Rating 71.0, Par 72
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 0.0,
            slopeRating: 120,
            courseRating: 71.0,
            par: 72
        )
        
        // Expected: 0.0 * (120/113) + (71.0 - 72) = 0 + (-1.0) = -1.0 -> rounds to -1
        XCTAssertEqual(result, -1)
    }
    
    func testCourseHandicapCalculation_HighHandicap() {
        // Given: A high handicapper with 30.0 handicap index
        // Course: Slope 135, Rating 72.5, Par 72
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 30.0,
            slopeRating: 135,
            courseRating: 72.5,
            par: 72
        )
        
        // Expected: 30.0 * (135/113) + (72.5 - 72) = 30.0 * 1.195 + 0.5 = 35.84 + 0.5 = 36.34 -> rounds to 36
        XCTAssertEqual(result, 36)
    }
    
    func testCourseHandicapCalculation_RoundingUp() {
        // Test case where result should round up
        // 7.4 * (125/113) + (71.2 - 72) = 7.4 * 1.106 + (-0.8) = 8.19 - 0.8 = 7.39 -> rounds to 7
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 7.4,
            slopeRating: 125,
            courseRating: 71.2,
            par: 72
        )
        
        XCTAssertEqual(result, 7)
    }
    
    func testCourseHandicapCalculation_RoundingExactHalf() {
        // Test standard rounding at exactly 0.5
        // Need values that produce exactly X.5
        // 4.5 * (113/113) + (72 - 72) = 4.5 -> rounds to 5 (round half away from zero)
        let result = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: 4.5,
            slopeRating: 113,
            courseRating: 72.0,
            par: 72
        )
        
        // Swift's rounded() uses "round half away from zero": 4.5 -> 5
        XCTAssertEqual(result, 5)
    }
    
    // MARK: - Strokes Allocation Tests
    
    func testStrokesAllocation_ZeroHandicap() {
        let holeHandicaps = [1, 3, 5, 7, 9, 11, 13, 15, 17, 2, 4, 6, 8, 10, 12, 14, 16, 18]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 0,
            holeHandicaps: holeHandicaps
        )
        
        // Should get 0 strokes on all holes
        XCTAssertEqual(result, Array(repeating: 0, count: 18))
    }
    
    func testStrokesAllocation_18Handicap() {
        let holeHandicaps = [1, 3, 5, 7, 9, 11, 13, 15, 17, 2, 4, 6, 8, 10, 12, 14, 16, 18]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 18,
            holeHandicaps: holeHandicaps
        )
        
        // Should get exactly 1 stroke on every hole
        XCTAssertEqual(result, Array(repeating: 1, count: 18))
    }
    
    func testStrokesAllocation_36Handicap() {
        let holeHandicaps = [1, 3, 5, 7, 9, 11, 13, 15, 17, 2, 4, 6, 8, 10, 12, 14, 16, 18]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 36,
            holeHandicaps: holeHandicaps
        )
        
        // Should get exactly 2 strokes on every hole
        XCTAssertEqual(result, Array(repeating: 2, count: 18))
    }
    
    func testStrokesAllocation_10Handicap() {
        // Standard sequential hole handicaps
        let holeHandicaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 10,
            holeHandicaps: holeHandicaps
        )
        
        // 10 / 18 = 0 base strokes
        // 10 % 18 = 10 extra strokes on hardest holes (handicap 1-10)
        let expected = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
        XCTAssertEqual(result, expected)
    }
    
    func testStrokesAllocation_5Handicap_MixedOrder() {
        // Mixed hole handicaps (typical golf course layout)
        let holeHandicaps = [7, 15, 1, 11, 3, 17, 5, 13, 9, 8, 16, 2, 12, 4, 18, 6, 14, 10]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 5,
            holeHandicaps: holeHandicaps
        )
        
        // 5 strokes go on the 5 hardest holes (handicap 1-5)
        // Hole handicaps 1, 2, 3, 4, 5 are at indices: 2, 11, 4, 13, 6
        var expected = Array(repeating: 0, count: 18)
        expected[2] = 1   // Hole 3 has handicap 1
        expected[11] = 1  // Hole 12 has handicap 2
        expected[4] = 1   // Hole 5 has handicap 3
        expected[13] = 1  // Hole 14 has handicap 4
        expected[6] = 1   // Hole 7 has handicap 5
        
        XCTAssertEqual(result, expected)
    }
    
    func testStrokesAllocation_22Handicap() {
        let holeHandicaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 22,
            holeHandicaps: holeHandicaps
        )
        
        // 22 / 18 = 1 base stroke on all holes
        // 22 % 18 = 4 extra strokes on hardest holes (handicap 1-4)
        let expected = [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        XCTAssertEqual(result, expected)
    }
    
    func testStrokesAllocation_NegativeHandicap() {
        let holeHandicaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: -3,
            holeHandicaps: holeHandicaps
        )
        
        // -3 handicap: subtract strokes on 3 hardest holes
        var expected = Array(repeating: 0, count: 18)
        expected[0] = -1  // Hole 1 has handicap 1
        expected[1] = -1  // Hole 2 has handicap 2
        expected[2] = -1  // Hole 3 has handicap 3
        
        XCTAssertEqual(result, expected)
    }
    
    func testStrokesAllocation_InvalidHoleHandicaps() {
        let invalidHoleHandicaps = [1, 2, 3] // Only 3 holes
        
        let result = HandicapCalculator.allocateStrokes(
            courseHandicap: 10,
            holeHandicaps: invalidHoleHandicaps
        )
        
        // Should return 18 zeros for invalid input
        XCTAssertEqual(result, Array(repeating: 0, count: 18))
    }
    
    // MARK: - Stableford Points Tests
    
    func testStablefordPoints_NetPar() {
        // Gross 5 on a par 4 with 1 stroke received = net 4 = par = 2 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 5,
            par: 4,
            strokesReceived: 1
        )
        XCTAssertEqual(points, 2)
    }
    
    func testStablefordPoints_NetBirdie() {
        // Gross 4 on a par 4 with 1 stroke received = net 3 = birdie = 3 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 4,
            par: 4,
            strokesReceived: 1
        )
        XCTAssertEqual(points, 3)
    }
    
    func testStablefordPoints_NetEagle() {
        // Gross 4 on a par 5 with 1 stroke received = net 3 = eagle = 4 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 4,
            par: 5,
            strokesReceived: 1
        )
        XCTAssertEqual(points, 4)
    }
    
    func testStablefordPoints_NetAlbatross() {
        // Gross 3 on a par 5 with 1 stroke received = net 2 = albatross = 5 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 3,
            par: 5,
            strokesReceived: 1
        )
        XCTAssertEqual(points, 5)
    }
    
    func testStablefordPoints_NetBogey() {
        // Gross 5 on a par 4 with 0 strokes received = net 5 = bogey = 1 point
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 5,
            par: 4,
            strokesReceived: 0
        )
        XCTAssertEqual(points, 1)
    }
    
    func testStablefordPoints_NetDoubleBogey() {
        // Gross 6 on a par 4 with 0 strokes received = net 6 = double bogey = 0 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 6,
            par: 4,
            strokesReceived: 0
        )
        XCTAssertEqual(points, 0)
    }
    
    func testStablefordPoints_TripleBogey() {
        // Gross 7 on a par 4 with 0 strokes received = net 7 = triple = 0 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 7,
            par: 4,
            strokesReceived: 0
        )
        XCTAssertEqual(points, 0)
    }
    
    func testStablefordPoints_WithTwoStrokes() {
        // Gross 6 on a par 4 with 2 strokes received = net 4 = par = 2 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 6,
            par: 4,
            strokesReceived: 2
        )
        XCTAssertEqual(points, 2)
    }
    
    func testStablefordPoints_ParThree() {
        // Gross 3 on a par 3 with 0 strokes received = net 3 = par = 2 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 3,
            par: 3,
            strokesReceived: 0
        )
        XCTAssertEqual(points, 2)
    }
    
    func testStablefordPoints_HoleInOne() {
        // Gross 1 on a par 3 with 0 strokes received = net 1 = eagle = 4 points
        let points = HandicapCalculator.stablefordPoints(
            grossScore: 1,
            par: 3,
            strokesReceived: 0
        )
        XCTAssertEqual(points, 4)
    }
    
    // MARK: - Best Ball Tests
    
    func testBestBallNetScore_TwoPlayers() {
        let scores = [5, 4] // Player 1 got 5, Player 2 got 4
        let strokes = [1, 0] // Player 1 gets 1 stroke, Player 2 gets 0
        
        let result = HandicapCalculator.bestBallNetScore(
            scores: scores,
            strokesAllocations: strokes
        )
        
        // Player 1: net 4, Player 2: net 4 -> best is 4
        XCTAssertEqual(result, 4)
    }
    
    func testBestBallNetScore_DifferentStrokes() {
        let scores = [6, 5]
        let strokes = [2, 0]
        
        let result = HandicapCalculator.bestBallNetScore(
            scores: scores,
            strokesAllocations: strokes
        )
        
        // Player 1: net 4, Player 2: net 5 -> best is 4
        XCTAssertEqual(result, 4)
    }
    
    func testBestBallStablefordPoints_TwoPlayers() {
        let scores = [5, 6] // On a par 4
        let strokes = [1, 1]
        
        let result = HandicapCalculator.bestBallStablefordPoints(
            scores: scores,
            par: 4,
            strokesAllocations: strokes
        )
        
        // Player 1: net 4 = par = 2 points
        // Player 2: net 5 = bogey = 1 point
        // Best is 2 points
        XCTAssertEqual(result, 2)
    }
    
    // MARK: - Scoring Breakdown Tests
    
    func testScoringBreakdown_Complete() {
        // Simple case: all pars (4) with 1 stroke per hole
        let holeScores = Array(repeating: 5, count: 18)
        let strokesAllocation = Array(repeating: 1, count: 18)
        
        let result = HandicapCalculator.scoringBreakdown(
            holeScores: holeScores,
            strokesAllocation: strokesAllocation
        )
        
        // Net scores are all 4
        // Front 9: 4 * 9 = 36
        // Back 9: 4 * 9 = 36
        // Last 6: 4 * 6 = 24
        // Last 3: 4 * 3 = 12
        // Last 1: 4
        // Total: 72
        XCTAssertEqual(result.front9, 36)
        XCTAssertEqual(result.back9, 36)
        XCTAssertEqual(result.last6, 24)
        XCTAssertEqual(result.last3, 12)
        XCTAssertEqual(result.last1, 4)
        XCTAssertEqual(result.total, 72)
    }
    
    func testScoringBreakdown_InvalidInput() {
        let holeScores = [4, 5, 4] // Only 3 scores
        let strokesAllocation = [1, 1, 1]
        
        let result = HandicapCalculator.scoringBreakdown(
            holeScores: holeScores,
            strokesAllocation: strokesAllocation
        )
        
        // Should return all zeros for invalid input
        XCTAssertEqual(result.front9, 0)
        XCTAssertEqual(result.back9, 0)
        XCTAssertEqual(result.total, 0)
    }
    
    // MARK: - Integration Tests
    
    func testFullRoundScoring() {
        // Simulate a complete round
        let handicapIndex = 15.0
        let slope = 130
        let rating = 72.5
        let par = 72
        
        // Calculate course handicap
        let courseHandicap = HandicapCalculator.calculateCourseHandicap(
            handicapIndex: handicapIndex,
            slopeRating: slope,
            courseRating: rating,
            par: par
        )
        
        // Expected: 15.0 * (130/113) + (72.5 - 72) = 17.26 + 0.5 = 17.76 -> 18
        XCTAssertEqual(courseHandicap, 18)
        
        // Standard hole handicaps
        let holeHandicaps = Array(1...18)
        
        // Allocate strokes
        let strokes = HandicapCalculator.allocateStrokes(
            courseHandicap: courseHandicap,
            holeHandicaps: holeHandicaps
        )
        
        // With 18 handicap, should get 1 stroke on every hole
        XCTAssertEqual(strokes, Array(repeating: 1, count: 18))
        
        // If player shoots all bogeys (5 on par 4s)
        // Net score would be par (4) on each hole
        // Stableford would be 2 points per hole = 36 total
        var totalStableford = 0
        let holePars = Array(repeating: 4, count: 18)
        for i in 0..<18 {
            let points = HandicapCalculator.stablefordPoints(
                grossScore: 5,
                par: holePars[i],
                strokesReceived: strokes[i]
            )
            totalStableford += points
        }
        XCTAssertEqual(totalStableford, 36)
    }
}
