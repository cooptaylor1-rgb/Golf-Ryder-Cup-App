import SwiftUI
import SwiftData

struct PlayerDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let player: Player
    
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    
    var body: some View {
        List {
            // Profile section
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 12) {
                        if let avatarData = player.avatarData,
                           let uiImage = UIImage(data: avatarData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } else {
                            Circle()
                                .fill(.gray.opacity(0.3))
                                .frame(width: 100, height: 100)
                                .overlay {
                                    Text(player.name.prefix(1).uppercased())
                                        .font(.largeTitle)
                                        .foregroundStyle(.gray)
                                }
                        }
                        
                        Text(player.name)
                            .font(.title2)
                            .fontWeight(.semibold)
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)
            }
            
            // Handicap info
            Section("Handicap Information") {
                LabeledContent("Handicap Index", value: player.formattedHandicap)
                
                if let ghin = player.ghin, !ghin.isEmpty {
                    LabeledContent("GHIN Number", value: ghin)
                }
            }
            
            // Preferences
            Section("Preferences") {
                if let tee = player.teePreference, !tee.isEmpty {
                    LabeledContent("Preferred Tees", value: tee)
                } else {
                    Text("No tee preference set")
                        .foregroundStyle(.secondary)
                }
            }
            
            // Course handicaps preview
            Section("Sample Course Handicaps") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Based on your handicap index:")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    HStack(spacing: 16) {
                        CourseHandicapPreview(
                            title: "Easy",
                            slope: 110,
                            rating: 69.5,
                            par: 72,
                            handicapIndex: player.handicapIndex
                        )
                        
                        CourseHandicapPreview(
                            title: "Medium",
                            slope: 125,
                            rating: 71.5,
                            par: 72,
                            handicapIndex: player.handicapIndex
                        )
                        
                        CourseHandicapPreview(
                            title: "Hard",
                            slope: 140,
                            rating: 74.0,
                            par: 72,
                            handicapIndex: player.handicapIndex
                        )
                    }
                }
                .padding(.vertical, 4)
            }
            
            // Teams membership
            if let memberships = player.teamMemberships, !memberships.isEmpty {
                Section("Team Memberships") {
                    ForEach(memberships) { membership in
                        if let team = membership.team {
                            HStack {
                                if let colorHex = team.colorHex {
                                    Circle()
                                        .fill(Color(hex: colorHex))
                                        .frame(width: 12, height: 12)
                                }
                                Text(team.name)
                                if membership.isCaptain {
                                    Text("(Captain)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            
            // Delete button
            Section {
                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Delete Player")
                        Spacer()
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            PlayerFormView(mode: .edit(player))
        }
        .alert("Delete Player?", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deletePlayer()
            }
        } message: {
            Text("Are you sure you want to delete \(player.name)? This cannot be undone.")
        }
    }
    
    private func deletePlayer() {
        modelContext.delete(player)
        try? modelContext.save()
        dismiss()
    }
}

struct CourseHandicapPreview: View {
    let title: String
    let slope: Int
    let rating: Double
    let par: Int
    let handicapIndex: Double
    
    var courseHandicap: Int {
        HandicapCalculator.calculateCourseHandicap(
            handicapIndex: handicapIndex,
            slopeRating: slope,
            courseRating: rating,
            par: par
        )
    }
    
    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text("\(courseHandicap)")
                .font(.title3)
                .fontWeight(.semibold)
            Text("\(slope)/\(String(format: "%.1f", rating))")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

#Preview {
    NavigationStack {
        PlayerDetailView(player: Player(name: "John Doe", handicapIndex: 12.5))
    }
    .modelContainer(for: Player.self, inMemory: true)
}
