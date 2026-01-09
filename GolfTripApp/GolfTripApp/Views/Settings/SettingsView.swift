import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var players: [Player]
    @Query private var courses: [Course]
    @Query private var trips: [Trip]
    
    @State private var showingResetAlert = false
    @State private var showingSeedAlert = false
    
    var body: some View {
        NavigationStack {
            List {
                // App info
                Section("About") {
                    LabeledContent("Version", value: "1.0.0")
                    LabeledContent("Build", value: "1")
                }
                
                // Statistics
                Section("Statistics") {
                    LabeledContent("Players", value: "\(players.count)")
                    LabeledContent("Courses", value: "\(courses.count)")
                    LabeledContent("Trips", value: "\(trips.count)")
                }
                
                // Data management
                Section("Data Management") {
                    Button {
                        showingSeedAlert = true
                    } label: {
                        Label("Load Sample Data", systemImage: "square.and.arrow.down")
                    }
                    
                    Button(role: .destructive) {
                        showingResetAlert = true
                    } label: {
                        Label("Reset All Data", systemImage: "trash")
                    }
                }
                
                // Future features
                Section("Coming Soon") {
                    FeatureRow(name: "iCloud Sync", description: "Sync data across devices", available: false)
                    FeatureRow(name: "Live Sharing", description: "Share scorecards in real-time", available: false)
                    FeatureRow(name: "GHIN Import", description: "Import handicaps from GHIN", available: false)
                    FeatureRow(name: "Match Play", description: "Team vs Team scoring", available: false)
                    FeatureRow(name: "Skins Game", description: "Track skins per hole", available: false)
                    FeatureRow(name: "Nassau", description: "Front/Back/Total bets", available: false)
                }
                
                // Credits
                Section("Handicap Calculation") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Formula")
                            .font(.headline)
                        
                        Text("Course Handicap = Handicap Index × (Slope ÷ 113) + (Course Rating - Par)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        
                        Text("Strokes are allocated to holes based on hole handicap, with the lowest handicap holes (hardest) receiving strokes first.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Settings")
            .alert("Load Sample Data?", isPresented: $showingSeedAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Load") {
                    SeedDataService.seedSampleData(context: modelContext)
                }
            } message: {
                Text("This will add sample players, courses, and a trip to help you get started.")
            }
            .alert("Reset All Data?", isPresented: $showingResetAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Reset", role: .destructive) {
                    resetAllData()
                }
            } message: {
                Text("This will delete all players, courses, trips, teams, and scores. This cannot be undone.")
            }
        }
    }
    
    private func resetAllData() {
        // Delete all data
        do {
            try modelContext.delete(model: HoleScore.self)
            try modelContext.delete(model: TeamScore.self)
            try modelContext.delete(model: Scorecard.self)
            try modelContext.delete(model: Format.self)
            try modelContext.delete(model: GroupPlayer.self)
            try modelContext.delete(model: Group.self)
            try modelContext.delete(model: ScheduleItem.self)
            try modelContext.delete(model: ScheduleDay.self)
            try modelContext.delete(model: TeamMember.self)
            try modelContext.delete(model: Team.self)
            try modelContext.delete(model: Trip.self)
            try modelContext.delete(model: TeeSet.self)
            try modelContext.delete(model: Course.self)
            try modelContext.delete(model: Player.self)
            try modelContext.save()
        } catch {
            print("Error resetting data: \(error)")
        }
    }
}

struct FeatureRow: View {
    let name: String
    let description: String
    let available: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(name)
                Text(description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            if available {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
            } else {
                Text("Soon")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.gray.opacity(0.2))
                    .cornerRadius(4)
            }
        }
    }
}

#Preview {
    SettingsView()
        .modelContainer(for: Player.self, inMemory: true)
}
