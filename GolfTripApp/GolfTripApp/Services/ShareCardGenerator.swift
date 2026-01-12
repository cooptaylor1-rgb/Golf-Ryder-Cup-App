import SwiftUI
import UIKit

/// Service for generating shareable image cards
struct ShareCardGenerator {
    
    // MARK: - Standings Card
    
    /// Generate a shareable image of current standings
    /// - Parameter trip: The trip to generate standings for
    /// - Returns: UIImage if successful, nil otherwise
    @MainActor
    static func generateStandingsCard(trip: Trip) -> UIImage? {
        let view = StandingsShareCard(trip: trip)
        let renderer = ImageRenderer(content: view)
        renderer.scale = 3.0  // High resolution for sharing
        return renderer.uiImage
    }
    
    // MARK: - Session Result Card
    
    /// Generate a shareable image of session results
    /// - Parameter session: The session to generate results for
    /// - Returns: UIImage if successful, nil otherwise
    @MainActor
    static func generateSessionResultCard(session: RyderCupSession) -> UIImage? {
        let view = SessionResultCard(session: session)
        let renderer = ImageRenderer(content: view)
        renderer.scale = 3.0  // High resolution for sharing
        return renderer.uiImage
    }
}
