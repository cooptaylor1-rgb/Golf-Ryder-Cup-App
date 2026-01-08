import SwiftUI

// MARK: - Design Tokens

enum DesignTokens {
    // MARK: Spacing
    enum Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 24
        static let xxl: CGFloat = 32
        static let xxxl: CGFloat = 48
    }
    
    // MARK: Corner Radius
    enum CornerRadius {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 24
        static let full: CGFloat = 9999
    }
    
    // MARK: Animation
    enum Animation {
        static let instant: Double = 0.1
        static let fast: Double = 0.2
        static let normal: Double = 0.3
        static let slow: Double = 0.5
        static let celebration: Double = 1.0
    }
}

// MARK: - Colors

extension Color {
    // Brand Colors
    static let primaryGreen = Color("PrimaryGreen", bundle: nil)
    static let primaryGreenVariant = Color(hex: "#2E7D32")
    static let secondaryGold = Color(hex: "#FFD54F")
    static let secondaryGoldDark = Color(hex: "#B8860B")
    
    // Team Colors
    static let teamUSA = Color(hex: "#1565C0")
    static let teamUSALight = Color(hex: "#42A5F5")
    static let teamEurope = Color(hex: "#C62828")
    static let teamEuropeLight = Color(hex: "#EF5350")
    
    // Semantic Colors
    static let success = Color(hex: "#66BB6A")
    static let warning = Color(hex: "#FFB74D")
    static let error = Color(hex: "#EF5350")
    static let info = Color(hex: "#64B5F6")
    
    // Golf Colors
    static let fairway = Color(hex: "#4CAF50")
    static let bunker = Color(hex: "#D7CCC8")
    static let water = Color(hex: "#29B6F6")
    static let rough = Color(hex: "#8BC34A")
    static let greenColor = Color(hex: "#2E7D32")
    
    // Surface Colors (Dark Mode First)
    static let surfaceBackground = Color(hex: "#121212")
    static let surface = Color(hex: "#1E1E1E")
    static let surfaceVariant = Color(hex: "#2C2C2C")
    static let surfaceElevated = Color(hex: "#333333")
}

// MARK: - Typography

extension Font {
    // Score Fonts (Monospace)
    static let scoreHero = Font.system(size: 72, weight: .bold, design: .monospaced)
    static let scoreLarge = Font.system(size: 48, weight: .bold, design: .monospaced)
    static let scoreMedium = Font.system(size: 32, weight: .semibold, design: .monospaced)
    static let scoreSmall = Font.system(size: 24, weight: .medium, design: .monospaced)
}

// MARK: - Haptics

struct HapticManager {
    static func buttonTap() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
    
    static func scoreEntered() {
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }
    
    static func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
    
    static func error() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }
    
    static func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
    
    static func heavyImpact() {
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.impactOccurred()
    }
}

// MARK: - View Modifiers

extension View {
    /// Apply card styling
    func cardStyle(elevation: Int = 1) -> some View {
        self
            .background(Color.surface)
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.lg))
            .shadow(
                color: Color.black.opacity(elevation == 0 ? 0 : 0.1 + Double(elevation) * 0.05),
                radius: CGFloat(elevation * 4),
                y: CGFloat(elevation * 2)
            )
    }
    
    /// Apply primary button styling
    func primaryButtonStyle() -> some View {
        self
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(Color.accentColor)
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.md))
    }
    
    /// Apply secondary button styling
    func secondaryButtonStyle() -> some View {
        self
            .font(.headline)
            .foregroundColor(.accentColor)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .overlay(
                RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.md)
                    .stroke(Color.accentColor, lineWidth: 1.5)
            )
    }
    
    /// Apply scoring button styling
    func scoringButtonStyle(teamColor: Color) -> some View {
        self
            .font(.headline)
            .foregroundColor(.white)
            .frame(height: 60)
            .frame(maxWidth: .infinity)
            .background(teamColor)
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.lg))
    }
    
    /// Apply badge styling
    func badgeStyle(color: Color) -> some View {
        self
            .font(.subheadline.weight(.semibold))
            .foregroundColor(color)
            .padding(.horizontal, DesignTokens.Spacing.sm)
            .padding(.vertical, DesignTokens.Spacing.xs)
            .background(color.opacity(0.15))
            .clipShape(Capsule())
    }
}

// MARK: - Custom Animations

extension SwiftUI.Animation {
    static let buttonPress = SwiftUI.Animation.spring(response: 0.2, dampingFraction: 0.6)
    static let scoreChange = SwiftUI.Animation.spring(response: 0.3, dampingFraction: 0.7)
    static let cardAppear = SwiftUI.Animation.easeOut(duration: 0.3)
    static let celebration = SwiftUI.Animation.easeInOut(duration: 1.0)
}

// MARK: - Custom Components

/// Match status badge
struct MatchStatusBadge: View {
    let status: String
    let teamColor: Color?
    
    var body: some View {
        Text(status)
            .font(.subheadline.weight(.semibold))
            .foregroundColor(teamColor ?? .primary)
            .padding(.horizontal, DesignTokens.Spacing.md)
            .padding(.vertical, DesignTokens.Spacing.sm)
            .background((teamColor ?? Color.gray).opacity(0.15))
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.sm))
    }
}

/// Big score display
struct BigScoreDisplay: View {
    let teamAScore: Double
    let teamBScore: Double
    let teamAName: String
    let teamBName: String
    let teamAColor: Color
    let teamBColor: Color
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.md) {
            HStack(spacing: DesignTokens.Spacing.xl) {
                VStack {
                    Text(teamAName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(formatScore(teamAScore))
                        .font(.scoreLarge)
                        .foregroundColor(teamAColor)
                }
                
                Text("—")
                    .font(.title2)
                    .foregroundColor(.secondary)
                
                VStack {
                    Text(teamBName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(formatScore(teamBScore))
                        .font(.scoreLarge)
                        .foregroundColor(teamBColor)
                }
            }
            
            // Progress bar
            GeometryReader { geometry in
                let total = max(teamAScore + teamBScore, 1)
                let teamAWidth = (teamAScore / total) * geometry.size.width
                
                HStack(spacing: 0) {
                    Rectangle()
                        .fill(teamAColor)
                        .frame(width: teamAWidth)
                    Rectangle()
                        .fill(teamBColor)
                }
            }
            .frame(height: 8)
            .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
    
    private func formatScore(_ score: Double) -> String {
        if score == floor(score) {
            return String(format: "%.0f", score)
        }
        return String(format: "%.1f", score)
    }
}

/// Hole indicator dots
struct HoleIndicatorDots: View {
    let holeResults: [HoleResult]
    let currentHole: Int
    let teamAColor: Color
    let teamBColor: Color
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DesignTokens.Spacing.xs) {
                ForEach(1...18, id: \.self) { hole in
                    holeDot(for: hole)
                }
            }
            .padding(.horizontal, DesignTokens.Spacing.sm)
        }
    }
    
    @ViewBuilder
    private func holeDot(for hole: Int) -> some View {
        let result = holeResults.first { $0.holeNumber == hole }
        let isCurrentHole = hole == currentHole
        let size: CGFloat = isCurrentHole ? 12 : 8
        
        ZStack {
            if let result = result {
                Circle()
                    .fill(colorFor(result.winner))
                    .frame(width: size, height: size)
            } else {
                Circle()
                    .stroke(Color.secondary, lineWidth: 1)
                    .frame(width: size, height: size)
            }
            
            if isCurrentHole {
                Circle()
                    .stroke(Color.primary, lineWidth: 2)
                    .frame(width: size + 4, height: size + 4)
            }
        }
    }
    
    private func colorFor(_ winner: HoleWinner) -> Color {
        switch winner {
        case .teamA: return teamAColor
        case .teamB: return teamBColor
        case .halved: return .gray
        }
    }
}

/// Empty state view
struct EmptyStateView: View {
    let icon: String
    let title: String
    let description: String
    let actionTitle: String?
    let action: (() -> Void)?
    
    init(icon: String, title: String, description: String, actionTitle: String? = nil, action: (() -> Void)? = nil) {
        self.icon = icon
        self.title = title
        self.description = description
        self.actionTitle = actionTitle
        self.action = action
    }
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.lg) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.title3.weight(.semibold))
            
            Text(description)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, DesignTokens.Spacing.xl)
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .primaryButtonStyle()
                }
                .padding(.top, DesignTokens.Spacing.md)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(DesignTokens.Spacing.xl)
    }
}

/// Avatar view
struct AvatarView: View {
    let name: String
    let imageData: Data?
    let size: CGFloat
    let teamColor: Color?
    
    init(name: String, imageData: Data? = nil, size: CGFloat = 32, teamColor: Color? = nil) {
        self.name = name
        self.imageData = imageData
        self.size = size
        self.teamColor = teamColor
    }
    
    var body: some View {
        ZStack {
            if let data = imageData, let uiImage = UIImage(data: data) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: size, height: size)
                    .clipShape(Circle())
            } else {
                Circle()
                    .fill(Color.surfaceVariant)
                    .frame(width: size, height: size)
                
                Text(initials)
                    .font(.system(size: size * 0.4, weight: .semibold))
                    .foregroundColor(.primary)
            }
            
            if let teamColor = teamColor {
                Circle()
                    .stroke(teamColor, lineWidth: 2)
                    .frame(width: size, height: size)
            }
        }
    }
    
    private var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))"
        } else if !parts.isEmpty {
            return String(parts[0].prefix(2))
        }
        return "?"
    }
}

// MARK: - Preview Provider

#Preview("Design System") {
    VStack(spacing: 24) {
        BigScoreDisplay(
            teamAScore: 8.5,
            teamBScore: 5.5,
            teamAName: "USA",
            teamBName: "EUR",
            teamAColor: .teamUSA,
            teamBColor: .teamEurope
        )
        .padding()
        
        MatchStatusBadge(status: "Team A 2 UP", teamColor: .teamUSA)
        
        HStack {
            AvatarView(name: "John Smith", size: 44, teamColor: .teamUSA)
            AvatarView(name: "Chris Brown", size: 44, teamColor: .teamEurope)
        }
        
        Button("Start Scoring") {
            HapticManager.buttonTap()
        }
        .primaryButtonStyle()
        .padding(.horizontal)
    }
    .preferredColorScheme(.dark)
}
