import SwiftUI
import SwiftData

struct CourseDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @Bindable var course: Course
    
    @State private var showingEditSheet = false
    @State private var showingAddTeeSet = false
    @State private var showingDeleteAlert = false
    @State private var teeSetToDelete: TeeSet?
    
    var body: some View {
        List {
            // Course info
            Section("Course Information") {
                LabeledContent("Name", value: course.name)
                
                if let location = course.location, !location.isEmpty {
                    LabeledContent("Location", value: location)
                }
            }
            
            // Tee sets
            Section {
                if let teeSets = course.teeSets, !teeSets.isEmpty {
                    ForEach(course.sortedTeeSets) { teeSet in
                        NavigationLink {
                            TeeSetDetailView(teeSet: teeSet)
                        } label: {
                            TeeSetRowView(teeSet: teeSet)
                        }
                    }
                    .onDelete(perform: confirmDeleteTeeSet)
                } else {
                    ContentUnavailableView {
                        Label("No Tee Sets", systemImage: "flag.slash")
                    } description: {
                        Text("Add tee sets to define ratings, slopes, and hole handicaps.")
                    } actions: {
                        Button("Add Tee Set") {
                            showingAddTeeSet = true
                        }
                        .buttonStyle(.bordered)
                    }
                }
            } header: {
                HStack {
                    Text("Tee Sets")
                    Spacer()
                    Button {
                        showingAddTeeSet = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.green)
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
                        Text("Delete Course")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle(course.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            CourseFormView(mode: .edit(course))
        }
        .sheet(isPresented: $showingAddTeeSet) {
            TeeSetFormView(course: course, mode: .add)
        }
        .alert("Delete Course?", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deleteCourse()
            }
        } message: {
            Text("Are you sure you want to delete \(course.name) and all its tee sets?")
        }
        .alert("Delete Tee Set?", isPresented: .init(
            get: { teeSetToDelete != nil },
            set: { if !$0 { teeSetToDelete = nil } }
        )) {
            Button("Cancel", role: .cancel) { teeSetToDelete = nil }
            Button("Delete", role: .destructive) {
                if let teeSet = teeSetToDelete {
                    deleteTeeSet(teeSet)
                }
            }
        } message: {
            if let teeSet = teeSetToDelete {
                Text("Delete \(teeSet.displayName)?")
            }
        }
    }
    
    private func confirmDeleteTeeSet(at offsets: IndexSet) {
        if let index = offsets.first {
            teeSetToDelete = course.sortedTeeSets[index]
        }
    }
    
    private func deleteTeeSet(_ teeSet: TeeSet) {
        modelContext.delete(teeSet)
        try? modelContext.save()
        teeSetToDelete = nil
    }
    
    private func deleteCourse() {
        modelContext.delete(course)
        try? modelContext.save()
        dismiss()
    }
}

struct TeeSetRowView: View {
    let teeSet: TeeSet
    
    var body: some View {
        HStack(spacing: 12) {
            // Color indicator
            if let color = teeSet.color {
                Circle()
                    .fill(teeColorFromString(color))
                    .frame(width: 16, height: 16)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(teeSet.name)
                    .font(.headline)
                
                HStack(spacing: 12) {
                    Text("Rating: \(String(format: "%.1f", teeSet.rating))")
                    Text("Slope: \(teeSet.slope)")
                    Text("Par: \(teeSet.par)")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
    
    func teeColorFromString(_ name: String) -> Color {
        switch name.lowercased() {
        case "black": return .black
        case "blue": return .blue
        case "white": return .white.opacity(0.8)
        case "gold", "yellow": return .yellow
        case "silver", "gray": return .gray
        case "red": return .red
        case "green": return .green
        default: return .gray
        }
    }
}

#Preview {
    NavigationStack {
        CourseDetailView(course: Course(name: "Test Course", location: "Test Location"))
    }
    .modelContainer(for: [Course.self, TeeSet.self], inMemory: true)
}
