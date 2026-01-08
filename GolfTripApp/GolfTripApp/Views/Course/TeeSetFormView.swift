import SwiftUI
import SwiftData

enum TeeSetFormMode {
    case add
    case edit(TeeSet)
    
    var title: String {
        switch self {
        case .add: return "Add Tee Set"
        case .edit: return "Edit Tee Set"
        }
    }
}

struct TeeSetFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let course: Course
    let mode: TeeSetFormMode
    
    @State private var name: String = ""
    @State private var color: String = "Blue"
    @State private var rating: Double = 72.0
    @State private var slope: Int = 113
    @State private var par: Int = 72
    @State private var totalYardage: String = ""
    
    // Hole handicaps (1 = hardest)
    @State private var holeHandicaps: [Int] = Array(1...18)
    @State private var holePars: [Int] = TeeSet.defaultHolePars
    
    @State private var showingError = false
    @State private var errorMessage = ""
    
    private let colorOptions = ["Black", "Blue", "White", "Gold", "Silver", "Red", "Green"]
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Tee Information") {
                    TextField("Name (e.g., Championship)", text: $name)
                    
                    Picker("Color", selection: $color) {
                        ForEach(colorOptions, id: \.self) { c in
                            Text(c).tag(c)
                        }
                    }
                    
                    HStack {
                        Text("Rating")
                        Spacer()
                        TextField("72.0", value: $rating, format: .number.precision(.fractionLength(1)))
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                    }
                    
                    Stepper("Slope: \(slope)", value: $slope, in: 55...155)
                    
                    Stepper("Par: \(par)", value: $par, in: 60...80)
                    
                    HStack {
                        Text("Total Yardage (optional)")
                        Spacer()
                        TextField("6500", text: $totalYardage)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                    }
                }
                
                Section("Hole Handicaps (Required)") {
                    Text("Hole handicap indicates difficulty: 1 = hardest hole, 18 = easiest. This determines stroke allocation.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    // Front 9
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Front 9")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                            ForEach(0..<9, id: \.self) { index in
                                HoleHandicapInput(
                                    holeNumber: index + 1,
                                    handicap: $holeHandicaps[index]
                                )
                            }
                        }
                    }
                    .padding(.vertical, 4)
                    
                    // Back 9
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Back 9")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                            ForEach(9..<18, id: \.self) { index in
                                HoleHandicapInput(
                                    holeNumber: index + 1,
                                    handicap: $holeHandicaps[index]
                                )
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                Section("Hole Pars (Optional)") {
                    // Front 9 pars
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Front 9")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                            ForEach(0..<9, id: \.self) { index in
                                HoleParInput(
                                    holeNumber: index + 1,
                                    par: $holePars[index]
                                )
                            }
                        }
                    }
                    .padding(.vertical, 4)
                    
                    // Back 9 pars
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Back 9")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                            ForEach(9..<18, id: \.self) { index in
                                HoleParInput(
                                    holeNumber: index + 1,
                                    par: $holePars[index]
                                )
                            }
                        }
                    }
                    .padding(.vertical, 4)
                    
                    HStack {
                        Text("Total Par")
                        Spacer()
                        Text("\(holePars.reduce(0, +))")
                            .fontWeight(.semibold)
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
            .alert("Error", isPresented: $showingError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                if case .edit(let teeSet) = mode {
                    name = teeSet.name
                    color = teeSet.color ?? "Blue"
                    rating = teeSet.rating
                    slope = teeSet.slope
                    par = teeSet.par
                    holeHandicaps = teeSet.holeHandicaps
                    if let pars = teeSet.holePars {
                        holePars = pars
                    }
                    if let yardage = teeSet.totalYardage {
                        totalYardage = String(yardage)
                    }
                }
            }
        }
    }
    
    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        
        guard !trimmedName.isEmpty else {
            errorMessage = "Tee set name is required"
            showingError = true
            return
        }
        
        // Validate hole handicaps are unique 1-18
        let sortedHandicaps = holeHandicaps.sorted()
        if sortedHandicaps != Array(1...18) {
            errorMessage = "Hole handicaps must be unique values from 1 to 18"
            showingError = true
            return
        }
        
        let yardageValue = Int(totalYardage)
        
        switch mode {
        case .add:
            let teeSet = TeeSet(
                name: trimmedName,
                color: color,
                rating: rating,
                slope: slope,
                par: par,
                holeHandicaps: holeHandicaps,
                holePars: holePars,
                totalYardage: yardageValue
            )
            teeSet.course = course
            modelContext.insert(teeSet)
            
        case .edit(let teeSet):
            teeSet.name = trimmedName
            teeSet.color = color
            teeSet.rating = rating
            teeSet.slope = slope
            teeSet.par = par
            teeSet.holeHandicaps = holeHandicaps
            teeSet.holePars = holePars
            teeSet.totalYardage = yardageValue
            teeSet.updatedAt = Date()
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

struct HoleHandicapInput: View {
    let holeNumber: Int
    @Binding var handicap: Int
    
    var body: some View {
        VStack(spacing: 2) {
            Text("Hole \(holeNumber)")
                .font(.caption2)
                .foregroundStyle(.secondary)
            
            TextField("", value: $handicap, format: .number)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .frame(height: 36)
                .background(.gray.opacity(0.1))
                .cornerRadius(6)
        }
    }
}

struct HoleParInput: View {
    let holeNumber: Int
    @Binding var par: Int
    
    var body: some View {
        VStack(spacing: 2) {
            Text("Hole \(holeNumber)")
                .font(.caption2)
                .foregroundStyle(.secondary)
            
            Picker("", selection: $par) {
                Text("3").tag(3)
                Text("4").tag(4)
                Text("5").tag(5)
            }
            .pickerStyle(.segmented)
        }
    }
}

#Preview {
    TeeSetFormView(course: Course(name: "Test"), mode: .add)
        .modelContainer(for: [Course.self, TeeSet.self], inMemory: true)
}
