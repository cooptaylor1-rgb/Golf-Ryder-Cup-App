import SwiftUI
import SwiftData

enum TeamFormMode {
    case add
    case edit(Team)
    
    var title: String {
        switch self {
        case .add: return "New Team"
        case .edit: return "Edit Team"
        }
    }
}

struct TeamFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let trip: Trip
    let mode: TeamFormMode
    
    @State private var name: String = ""
    @State private var selectedColor: String = Team.availableColors[0].hex
    @State private var teamMode: TeamMode = .freeform
    @State private var notes: String = ""
    
    @State private var showingError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Team Info") {
                    TextField("Team Name", text: $name)
                    
                    Picker("Team Mode", selection: $teamMode) {
                        ForEach(TeamMode.allCases, id: \.self) { mode in
                            Text(mode.displayName).tag(mode)
                        }
                    }
                    
                    Text(teamMode.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Section("Team Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 16) {
                        ForEach(Team.availableColors, id: \.hex) { color in
                            Button {
                                selectedColor = color.hex
                            } label: {
                                Circle()
                                    .fill(Color(hex: color.hex))
                                    .frame(width: 44, height: 44)
                                    .overlay {
                                        if selectedColor == color.hex {
                                            Image(systemName: "checkmark")
                                                .foregroundStyle(.white)
                                                .fontWeight(.bold)
                                        }
                                    }
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                Section("Notes") {
                    TextField("Notes (optional)", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle(mode.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        save()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                if case .edit(let team) = mode {
                    name = team.name
                    selectedColor = team.colorHex ?? Team.availableColors[0].hex
                    teamMode = team.mode
                    notes = team.notes ?? ""
                }
            }
        }
    }
    
    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        
        guard !trimmedName.isEmpty else {
            errorMessage = "Team name is required"
            showingError = true
            return
        }
        
        switch mode {
        case .add:
            let team = Team(
                name: trimmedName,
                colorHex: selectedColor,
                notes: notes.isEmpty ? nil : notes,
                mode: teamMode
            )
            team.trip = trip
            modelContext.insert(team)
            
        case .edit(let team):
            team.name = trimmedName
            team.colorHex = selectedColor
            team.notes = notes.isEmpty ? nil : notes
            team.mode = teamMode
            team.updatedAt = Date()
        }
        
        do {
            try modelContext.save()
            dismiss()
        } catch {
            errorMessage = "Failed to save: \(error.localizedDescription)"
            showingError = true
        }
    }
}

#Preview {
    let trip = Trip(name: "Test Trip", startDate: Date(), endDate: Date())
    return TeamFormView(trip: trip, mode: .add)
        .modelContainer(for: [Trip.self, Team.self], inMemory: true)
}
