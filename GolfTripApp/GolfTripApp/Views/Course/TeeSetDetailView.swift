import SwiftUI
import SwiftData

struct TeeSetDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @Bindable var teeSet: TeeSet
    
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    
    var body: some View {
        List {
            // Basic info
            Section("Tee Set Information") {
                LabeledContent("Name", value: teeSet.name)
                
                if let color = teeSet.color {
                    HStack {
                        Text("Color")
                        Spacer()
                        Circle()
                            .fill(teeColorFromString(color))
                            .frame(width: 20, height: 20)
                        Text(color)
                    }
                }
                
                LabeledContent("Rating", value: String(format: "%.1f", teeSet.rating))
                LabeledContent("Slope", value: "\(teeSet.slope)")
                LabeledContent("Par", value: "\(teeSet.par)")
                
                if let yardage = teeSet.totalYardage {
                    LabeledContent("Total Yardage", value: "\(yardage)")
                }
            }
            
            // Hole handicap table
            Section("Hole Handicaps") {
                Text("Lower number = harder hole. Players receive strokes on hardest holes first.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                
                // Front 9
                VStack(spacing: 0) {
                    // Header
                    HStack(spacing: 0) {
                        Text("Hole")
                            .frame(width: 50, alignment: .leading)
                            .font(.caption.bold())
                        ForEach(1...9, id: \.self) { hole in
                            Text("\(hole)")
                                .frame(maxWidth: .infinity)
                                .font(.caption.bold())
                        }
                    }
                    .padding(.vertical, 4)
                    .background(.gray.opacity(0.2))
                    
                    // Pars
                    if let pars = teeSet.holePars {
                        HStack(spacing: 0) {
                            Text("Par")
                                .frame(width: 50, alignment: .leading)
                                .font(.caption)
                            ForEach(0..<9, id: \.self) { i in
                                Text("\(pars[i])")
                                    .frame(maxWidth: .infinity)
                                    .font(.caption)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    
                    // Handicaps
                    HStack(spacing: 0) {
                        Text("HCP")
                            .frame(width: 50, alignment: .leading)
                            .font(.caption)
                            .foregroundStyle(.green)
                        ForEach(0..<9, id: \.self) { i in
                            Text("\(teeSet.holeHandicaps[i])")
                                .frame(maxWidth: .infinity)
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                    .padding(.vertical, 4)
                    .background(.green.opacity(0.1))
                }
                .cornerRadius(8)
                
                // Back 9
                VStack(spacing: 0) {
                    // Header
                    HStack(spacing: 0) {
                        Text("Hole")
                            .frame(width: 50, alignment: .leading)
                            .font(.caption.bold())
                        ForEach(10...18, id: \.self) { hole in
                            Text("\(hole)")
                                .frame(maxWidth: .infinity)
                                .font(.caption.bold())
                        }
                    }
                    .padding(.vertical, 4)
                    .background(.gray.opacity(0.2))
                    
                    // Pars
                    if let pars = teeSet.holePars {
                        HStack(spacing: 0) {
                            Text("Par")
                                .frame(width: 50, alignment: .leading)
                                .font(.caption)
                            ForEach(9..<18, id: \.self) { i in
                                Text("\(pars[i])")
                                    .frame(maxWidth: .infinity)
                                    .font(.caption)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    
                    // Handicaps
                    HStack(spacing: 0) {
                        Text("HCP")
                            .frame(width: 50, alignment: .leading)
                            .font(.caption)
                            .foregroundStyle(.green)
                        ForEach(9..<18, id: \.self) { i in
                            Text("\(teeSet.holeHandicaps[i])")
                                .frame(maxWidth: .infinity)
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                    .padding(.vertical, 4)
                    .background(.green.opacity(0.1))
                }
                .cornerRadius(8)
            }
            
            // Delete button
            Section {
                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Delete Tee Set")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle(teeSet.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            if let course = teeSet.course {
                TeeSetFormView(course: course, mode: .edit(teeSet))
            }
        }
        .alert("Delete Tee Set?", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deleteTeeSet()
            }
        } message: {
            Text("Are you sure you want to delete \(teeSet.displayName)?")
        }
    }
    
    private func deleteTeeSet() {
        modelContext.delete(teeSet)
        try? modelContext.save()
        dismiss()
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
        TeeSetDetailView(teeSet: TeeSet(
            name: "Blue",
            color: "Blue",
            rating: 72.5,
            slope: 130,
            par: 72
        ))
    }
    .modelContainer(for: TeeSet.self, inMemory: true)
}
