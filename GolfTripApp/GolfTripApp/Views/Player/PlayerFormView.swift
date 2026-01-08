import SwiftUI
import SwiftData
import PhotosUI

enum PlayerFormMode {
    case add
    case edit(Player)
    
    var title: String {
        switch self {
        case .add: return "Add Player"
        case .edit: return "Edit Player"
        }
    }
}

struct PlayerFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let mode: PlayerFormMode
    
    @State private var name: String = ""
    @State private var handicapIndex: Double = 0.0
    @State private var ghin: String = ""
    @State private var teePreference: String = ""
    @State private var avatarData: Data?
    @State private var selectedPhoto: PhotosPickerItem?
    
    @State private var showingError = false
    @State private var errorMessage = ""
    
    private let teeOptions = ["", "Black", "Blue", "White", "Gold", "Silver", "Red"]
    
    init(mode: PlayerFormMode) {
        self.mode = mode
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Profile Photo") {
                    HStack {
                        Spacer()
                        PhotosPicker(selection: $selectedPhoto, matching: .images) {
                            if let avatarData = avatarData,
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
                                        Image(systemName: "camera")
                                            .font(.title)
                                            .foregroundStyle(.gray)
                                    }
                            }
                        }
                        Spacer()
                    }
                    .padding(.vertical, 8)
                    
                    if avatarData != nil {
                        Button("Remove Photo", role: .destructive) {
                            avatarData = nil
                            selectedPhoto = nil
                        }
                    }
                }
                
                Section("Basic Info") {
                    TextField("Full Name", text: $name)
                        .textContentType(.name)
                        .autocorrectionDisabled()
                    
                    HStack {
                        Text("Handicap Index")
                        Spacer()
                        TextField("0.0", value: $handicapIndex, format: .number.precision(.fractionLength(1)))
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                    }
                }
                
                Section("Optional") {
                    TextField("GHIN Number", text: $ghin)
                        .keyboardType(.numberPad)
                    
                    Picker("Tee Preference", selection: $teePreference) {
                        ForEach(teeOptions, id: \.self) { tee in
                            Text(tee.isEmpty ? "None" : tee).tag(tee)
                        }
                    }
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
            .onChange(of: selectedPhoto) { _, newValue in
                Task {
                    if let data = try? await newValue?.loadTransferable(type: Data.self) {
                        avatarData = data
                    }
                }
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                if case .edit(let player) = mode {
                    name = player.name
                    handicapIndex = player.handicapIndex
                    ghin = player.ghin ?? ""
                    teePreference = player.teePreference ?? ""
                    avatarData = player.avatarData
                }
            }
        }
    }
    
    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        
        guard !trimmedName.isEmpty else {
            errorMessage = "Name is required"
            showingError = true
            return
        }
        
        switch mode {
        case .add:
            let player = Player(
                name: trimmedName,
                handicapIndex: handicapIndex,
                ghin: ghin.isEmpty ? nil : ghin,
                teePreference: teePreference.isEmpty ? nil : teePreference,
                avatarData: avatarData
            )
            modelContext.insert(player)
            
        case .edit(let player):
            player.name = trimmedName
            player.handicapIndex = handicapIndex
            player.ghin = ghin.isEmpty ? nil : ghin
            player.teePreference = teePreference.isEmpty ? nil : teePreference
            player.avatarData = avatarData
            player.updatedAt = Date()
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

#Preview("Add") {
    PlayerFormView(mode: .add)
        .modelContainer(for: Player.self, inMemory: true)
}
