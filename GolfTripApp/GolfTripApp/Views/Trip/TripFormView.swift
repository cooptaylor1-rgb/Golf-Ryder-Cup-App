import SwiftUI
import SwiftData

enum TripFormMode {
    case add
    case edit(Trip)
    
    var title: String {
        switch self {
        case .add: return "New Trip"
        case .edit: return "Edit Trip"
        }
    }
}

struct TripFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let mode: TripFormMode
    var onSave: ((Trip) -> Void)?
    
    @State private var name: String = ""
    @State private var location: String = ""
    @State private var startDate: Date = Date()
    @State private var endDate: Date = Date().addingTimeInterval(86400 * 3)
    @State private var notes: String = ""
    
    @State private var showingError = false
    @State private var errorMessage = ""
    
    init(mode: TripFormMode, onSave: ((Trip) -> Void)? = nil) {
        self.mode = mode
        self.onSave = onSave
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Trip Details") {
                    TextField("Trip Name", text: $name)
                    
                    TextField("Location (optional)", text: $location)
                        .textContentType(.addressCity)
                }
                
                Section("Dates") {
                    DatePicker("Start Date", selection: $startDate, displayedComponents: .date)
                    
                    DatePicker("End Date", selection: $endDate, in: startDate..., displayedComponents: .date)
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
                if case .edit(let trip) = mode {
                    name = trip.name
                    location = trip.location ?? ""
                    startDate = trip.startDate
                    endDate = trip.endDate
                    notes = trip.notes ?? ""
                }
            }
        }
    }
    
    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        
        guard !trimmedName.isEmpty else {
            errorMessage = "Trip name is required"
            showingError = true
            return
        }
        
        switch mode {
        case .add:
            let trip = Trip(
                name: trimmedName,
                startDate: startDate,
                endDate: endDate,
                location: location.isEmpty ? nil : location,
                notes: notes.isEmpty ? nil : notes
            )
            modelContext.insert(trip)
            
            // Create schedule days for each day of the trip
            createScheduleDays(for: trip)
            
            do {
                try modelContext.save()
                onSave?(trip)
                dismiss()
            } catch {
                errorMessage = "Failed to save: \(error.localizedDescription)"
                showingError = true
            }
            
        case .edit(let trip):
            trip.name = trimmedName
            trip.location = location.isEmpty ? nil : location
            trip.startDate = startDate
            trip.endDate = endDate
            trip.notes = notes.isEmpty ? nil : notes
            trip.updatedAt = Date()
            
            do {
                try modelContext.save()
                dismiss()
            } catch {
                errorMessage = "Failed to save: \(error.localizedDescription)"
                showingError = true
            }
        }
    }
    
    private func createScheduleDays(for trip: Trip) {
        let calendar = Calendar.current
        var currentDate = startDate
        
        while currentDate <= endDate {
            let day = ScheduleDay(date: currentDate)
            day.trip = trip
            modelContext.insert(day)
            
            guard let nextDate = calendar.date(byAdding: .day, value: 1, to: currentDate) else { break }
            currentDate = nextDate
        }
    }
}

#Preview {
    TripFormView(mode: .add)
        .modelContainer(for: Trip.self, inMemory: true)
}
