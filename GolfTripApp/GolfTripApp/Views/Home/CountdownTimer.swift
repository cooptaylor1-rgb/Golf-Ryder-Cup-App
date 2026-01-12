import SwiftUI

/// Countdown timer component for displaying time until an event
struct CountdownTimer: View {
    let targetDate: Date
    @State private var timeRemaining: TimeInterval = 0
    @State private var timer: Timer?
    
    var body: some View {
        Text(formattedTime)
            .font(.countdown)
            .fontWeight(.black)
            .foregroundStyle(gradientForTimeRemaining)
            .contentTransition(.numericText())
            .onAppear {
                updateTimeRemaining()
                startTimer()
            }
            .onDisappear {
                stopTimer()
            }
    }
    
    private var formattedTime: String {
        if timeRemaining <= 0 {
            return "00:00:00"
        }
        
        let hours = Int(timeRemaining) / 3600
        let minutes = (Int(timeRemaining) % 3600) / 60
        let seconds = Int(timeRemaining) % 60
        
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
    
    private var gradientForTimeRemaining: LinearGradient {
        if timeRemaining <= 0 {
            return LinearGradient(
                colors: [.secondary, .secondary.opacity(0.6)],
                startPoint: .top,
                endPoint: .bottom
            )
        } else if timeRemaining < 600 { // Less than 10 minutes - urgent
            return LinearGradient(
                colors: [.error, .warning],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        } else if timeRemaining < 3600 { // Less than 1 hour - attention
            return LinearGradient(
                colors: [.warning, .secondaryGold],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        } else {
            return LinearGradient(
                colors: [.accentColor, .accentColor.opacity(0.7)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
    
    private func updateTimeRemaining() {
        timeRemaining = max(0, targetDate.timeIntervalSinceNow)
    }
    
    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            withAnimation(.smooth) {
                updateTimeRemaining()
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}

#Preview {
    VStack(spacing: 40) {
        // 2 hours from now
        CountdownTimer(targetDate: Date().addingTimeInterval(7200))
        
        // 30 minutes from now
        CountdownTimer(targetDate: Date().addingTimeInterval(1800))
        
        // 5 minutes from now
        CountdownTimer(targetDate: Date().addingTimeInterval(300))
    }
    .padding()
    .background(Color.surfaceBackground)
}
