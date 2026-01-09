import SwiftUI
import SwiftData

enum ScheduleDayFormMode {
    case add
    case edit(ScheduleDay)
}

struct ScheduleDayFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let trip: Trip
    let mode: ScheduleDayFormMode
    
    @State private var date: Date = Date()
    @State private var notes: String = ""
    
    @State private var showingError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Date") {
                    DatePicker("Date", selection: $date, in: trip.startDate...trip.endDate, displayedComponents: .date)
                }
                
                Section("Notes") {
                    TextField("Notes (optional)", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Schedule Day")
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
                }
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                if case .edit(let day) = mode {
                    date = day.date
                    notes = day.notes ?? ""
                }
            }
        }
    }
    
    private func save() {
        switch mode {
        case .add:
            let day = ScheduleDay(
                date: date,
                notes: notes.isEmpty ? nil : notes
            )
            day.trip = trip
            modelContext.insert(day)
            
        case .edit(let day):
            day.date = date
            day.notes = notes.isEmpty ? nil : notes
            day.updatedAt = Date()
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
    let trip = Trip(name: "Test", startDate: Date(), endDate: Date().addingTimeInterval(86400 * 3))
    return ScheduleDayFormView(trip: trip, mode: .add)
        .modelContainer(for: [Trip.self, ScheduleDay.self], inMemory: true)
}
