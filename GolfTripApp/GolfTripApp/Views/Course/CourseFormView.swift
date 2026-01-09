import SwiftUI
import SwiftData

enum CourseFormMode {
    case add
    case edit(Course)
    
    var title: String {
        switch self {
        case .add: return "Add Course"
        case .edit: return "Edit Course"
        }
    }
}

struct CourseFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let mode: CourseFormMode
    
    @State private var name: String = ""
    @State private var location: String = ""
    
    @State private var showingError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Course Information") {
                    TextField("Course Name", text: $name)
                        .autocorrectionDisabled()
                    
                    TextField("Location (optional)", text: $location)
                        .textContentType(.addressCity)
                }
                
                Section {
                    Text("After creating the course, you can add tee sets from the course detail screen.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
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
                if case .edit(let course) = mode {
                    name = course.name
                    location = course.location ?? ""
                }
            }
        }
    }
    
    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        
        guard !trimmedName.isEmpty else {
            errorMessage = "Course name is required"
            showingError = true
            return
        }
        
        switch mode {
        case .add:
            let course = Course(
                name: trimmedName,
                location: location.isEmpty ? nil : location
            )
            modelContext.insert(course)
            
        case .edit(let course):
            course.name = trimmedName
            course.location = location.isEmpty ? nil : location
            course.updatedAt = Date()
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
    CourseFormView(mode: .add)
        .modelContainer(for: Course.self, inMemory: true)
}
