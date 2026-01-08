import XCTest
@testable import GolfTripApp

final class TournamentEngineTests: XCTestCase {
    
    // MARK: - Handicap Allowance Tests
    
    func testSinglesStrokes_PlayerAHigher() {
        let (playerA, playerB) = TournamentEngine.singlesStrokes(
            playerACourseHandicap: 18,
            playerBCourseHandicap: 10
        )
        
        XCTAssertEqual(playerA, 8)
        XCTAssertEqual(playerB, 0)
    }
    
    func testSinglesStrokes_PlayerBHigher() {
        let (playerA, playerB) = TournamentEngine.singlesStrokes(
            playerACourseHandicap: 5,
            playerBCourseHandicap: 15
        )
        
        XCTAssertEqual(playerA, 0)
        XCTAssertEqual(playerB, 10)
    }
    
    func testSinglesStrokes_Equal() {
        let (playerA, playerB) = TournamentEngine.singlesStrokes(
            playerACourseHandicap: 12,
            playerBCourseHandicap: 12
        )
        
        XCTAssertEqual(playerA, 0)
        XCTAssertEqual(playerB, 0)
    }
    
    func testSinglesStrokes_CustomAllowance() {
        // 80% allowance
        let (playerA, playerB) = TournamentEngine.singlesStrokes(
            playerACourseHandicap: 20,
            playerBCourseHandicap: 10,
            allowance: 0.8
        )
        
        XCTAssertEqual(playerA, 8)  // 80% of 10
        XCTAssertEqual(playerB, 0)
    }
    
    func testFourballStrokes() {
        let teamAHandicaps = [15, 10]  // Net: 5, 0 from lowest (10)
        let teamBHandicaps = [18, 12]  // Net: 8, 2 from lowest (10)
        
        let (teamAStrokes, teamBStrokes) = TournamentEngine.fourballStrokes(
            teamACourseHandicaps: teamAHandicaps,
            teamBCourseHandicaps: teamBHandicaps,
            allowance: 0.9
        )
        
        // Lowest is 10, so:
        // Team A: [4, 0] (90% of 5, 90% of 0)
        // Team B: [7, 1] (90% of 8, 90% of 2)
        XCTAssertEqual(teamAStrokes, [4, 0])
        XCTAssertEqual(teamBStrokes, [7, 1])
    }
    
    func testFoursomesStrokes() {
        let teamAHandicaps = [15, 10]  // Combined: 25, 50%: 12
        let teamBHandicaps = [18, 8]   // Combined: 26, 50%: 13
        
        let (teamA, teamB) = TournamentEngine.foursomesStrokes(
            teamACourseHandicaps: teamAHandicaps,
            teamBCourseHandicaps: teamBHandicaps,
            allowance: 0.5
        )
        
        // Team A combined: 12, Team B combined: 13
        // Difference: 1, Team A gives 1 stroke
        XCTAssertEqual(teamA, 0)
        XCTAssertEqual(teamB, 1)
    }
    
    // MARK: - Snake Draft Tests
    
    func testSnakeDraftOrder() {
        let order = TournamentEngine.snakeDraftOrder(totalPicks: 8, teams: 2)
        
        // Snake draft: 0, 1, 1, 0, 0, 1, 1, 0
        XCTAssertEqual(order.count, 8)
        XCTAssertEqual(order[0].team, 0)
        XCTAssertEqual(order[1].team, 1)
        XCTAssertEqual(order[2].team, 1)
        XCTAssertEqual(order[3].team, 0)
        XCTAssertEqual(order[4].team, 0)
        XCTAssertEqual(order[5].team, 1)
        XCTAssertEqual(order[6].team, 1)
        XCTAssertEqual(order[7].team, 0)
    }
    
    func testSnakeDraftPickNumbers() {
        let order = TournamentEngine.snakeDraftOrder(totalPicks: 4, teams: 2)
        
        XCTAssertEqual(order[0].pick, 1)
        XCTAssertEqual(order[1].pick, 2)
        XCTAssertEqual(order[2].pick, 3)
        XCTAssertEqual(order[3].pick, 4)
    }
    
    // MARK: - Fairness Score Tests
    
    func testFairnessScore_Perfect() {
        // Empty matches = perfect fairness
        let score = TournamentEngine.calculateFairnessScore(
            matches: [],
            teamAPlayers: [],
            teamBPlayers: []
        )
        
        XCTAssertEqual(score, 100)
    }
    
    // MARK: - Points Calculation (requires Match model)
    
    // Note: More comprehensive tests would require creating Mock Match objects
    // These test the basic logic of the helper functions
    
    func testHandicapAllowanceDescriptions() {
        let singles = TournamentEngine.HandicapAllowance.singles
        XCTAssertTrue(singles.description.contains("100%"))
        
        let fourball = TournamentEngine.HandicapAllowance.fourballDefault
        XCTAssertTrue(fourball.description.contains("90%"))
        
        let foursomes = TournamentEngine.HandicapAllowance.foursomesDefault
        XCTAssertTrue(foursomes.description.contains("50%"))
        
        let custom = TournamentEngine.HandicapAllowance.custom(0.75)
        XCTAssertTrue(custom.description.contains("75%"))
    }
}
