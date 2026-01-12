import Testing
import SwiftData
@testable import GolfTripApp

/// Tests for CaptainModeService validation and audit logging
struct CaptainModeServiceTests {
    
    // MARK: - Session Validation Tests
    
    @Test("Can edit unlocked session")
    func canEditUnlockedSession() {
        let session = RyderCupSession(
            name: "Test Session",
            sessionType: .singles,
            scheduledDate: Date(),
            isLocked: false
        )
        
        let result = CaptainModeService.canEditSession(session)
        #expect(result.canEdit == true)
        #expect(result.reason == nil)
    }
    
    @Test("Cannot edit locked session")
    func cannotEditLockedSession() {
        let session = RyderCupSession(
            name: "Test Session",
            sessionType: .singles,
            scheduledDate: Date(),
            isLocked: true
        )
        
        let result = CaptainModeService.canEditSession(session)
        #expect(result.canEdit == false)
        #expect(result.reason != nil)
        #expect(result.reason?.contains("locked") == true)
    }
    
    // MARK: - Pairing Validation Tests
    
    @Test("Valid singles pairing passes validation")
    func validSinglesPairing() {
        let session = RyderCupSession(
            name: "Singles",
            sessionType: .singles,
            scheduledDate: Date()
        )
        
        let player1 = Player(name: "Player 1", handicapIndex: 10.0)
        let player2 = Player(name: "Player 2", handicapIndex: 12.0)
        
        let match = Match(
            teamAPlayerIds: player1.id.uuidString,
            teamBPlayerIds: player2.id.uuidString
        )
        
        let errors = CaptainModeService.validatePairing(
            match: match,
            session: session,
            allPlayers: [player1, player2]
        )
        
        #expect(errors.isEmpty)
    }
    
    @Test("Duplicate player in match fails validation")
    func duplicatePlayerInMatch() {
        let session = RyderCupSession(
            name: "Fourball",
            sessionType: .fourball,
            scheduledDate: Date()
        )
        
        let player1 = Player(name: "Player 1", handicapIndex: 10.0)
        let player2 = Player(name: "Player 2", handicapIndex: 12.0)
        
        // Same player on both teams
        let match = Match(
            teamAPlayerIds: "\(player1.id.uuidString),\(player2.id.uuidString)",
            teamBPlayerIds: "\(player1.id.uuidString),\(player2.id.uuidString)"
        )
        
        let errors = CaptainModeService.validatePairing(
            match: match,
            session: session,
            allPlayers: [player1, player2]
        )
        
        #expect(!errors.isEmpty)
        #expect(errors.contains { $0.contains("Duplicate") })
    }
    
    @Test("Wrong player count fails validation")
    func wrongPlayerCount() {
        let session = RyderCupSession(
            name: "Fourball",
            sessionType: .fourball,  // Expects 2 players per team
            scheduledDate: Date()
        )
        
        let player1 = Player(name: "Player 1", handicapIndex: 10.0)
        let player2 = Player(name: "Player 2", handicapIndex: 12.0)
        
        // Only 1 player per team instead of 2
        let match = Match(
            teamAPlayerIds: player1.id.uuidString,
            teamBPlayerIds: player2.id.uuidString
        )
        
        let errors = CaptainModeService.validatePairing(
            match: match,
            session: session,
            allPlayers: [player1, player2]
        )
        
        #expect(!errors.isEmpty)
        #expect(errors.contains { $0.contains("needs 2 player") })
    }
    
    // MARK: - Duplicate Detection Tests
    
    @Test("Finds duplicate players across session")
    func findDuplicates() {
        let session = RyderCupSession(
            name: "Test Session",
            sessionType: .singles,
            scheduledDate: Date()
        )
        
        let player1 = Player(name: "Player 1", handicapIndex: 10.0)
        let player2 = Player(name: "Player 2", handicapIndex: 12.0)
        
        // Create two matches with player1 in both
        let match1 = Match(
            matchOrder: 0,
            teamAPlayerIds: player1.id.uuidString,
            teamBPlayerIds: player2.id.uuidString
        )
        match1.session = session
        
        let match2 = Match(
            matchOrder: 1,
            teamAPlayerIds: player1.id.uuidString,  // Duplicate
            teamBPlayerIds: player2.id.uuidString
        )
        match2.session = session
        
        let duplicates = CaptainModeService.findDuplicatesInSession(session)
        
        #expect(duplicates[player1.id] == 2)
        #expect(duplicates[player2.id] == 2)
    }
    
    @Test("No duplicates in clean session")
    func noDuplicates() {
        let session = RyderCupSession(
            name: "Test Session",
            sessionType: .singles,
            scheduledDate: Date()
        )
        
        let player1 = Player(name: "Player 1", handicapIndex: 10.0)
        let player2 = Player(name: "Player 2", handicapIndex: 12.0)
        let player3 = Player(name: "Player 3", handicapIndex: 14.0)
        let player4 = Player(name: "Player 4", handicapIndex: 16.0)
        
        // Create two matches with different players
        let match1 = Match(
            matchOrder: 0,
            teamAPlayerIds: player1.id.uuidString,
            teamBPlayerIds: player2.id.uuidString
        )
        match1.session = session
        
        let match2 = Match(
            matchOrder: 1,
            teamAPlayerIds: player3.id.uuidString,
            teamBPlayerIds: player4.id.uuidString
        )
        match2.session = session
        
        let duplicates = CaptainModeService.findDuplicatesInSession(session)
        
        #expect(duplicates.isEmpty)
    }
    
    // MARK: - Course Validation Tests
    
    @Test("Validates missing course data")
    func validateMissingCourse() {
        let match = Match()
        
        let warnings = CaptainModeService.validateMatchCourse(match)
        
        #expect(!warnings.isEmpty)
        #expect(warnings.contains { $0.contains("No course") })
        #expect(warnings.contains { $0.contains("No tee set") })
    }
}
