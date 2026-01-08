import SwiftUI
import SwiftData

struct ScheduleItemDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @Bindable var item: ScheduleItem
    @Query(sort: \Player.name) private var allPlayers: [Player]
    
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    @State private var showingAddGroup = false
    @State private var showingPlayerPicker = false
    @State private var selectedGroup: Group?
    
    var body: some View {
        List {
            // Basic info
            Section("Details") {
                LabeledContent("Type", value: item.type.displayName)
                
                if !item.formattedStartTime.isEmpty {
                    LabeledContent("Time", value: item.formattedStartTime)
                }
                
                if let title = item.title, !title.isEmpty {
                    LabeledContent("Title", value: title)
                }
            }
            
            // Course info for tee times
            if item.type == .teeTime {
                Section("Course") {
                    if let teeSet = item.teeSet, let course = teeSet.course {
                        LabeledContent("Course", value: course.name)
                        LabeledContent("Tees", value: teeSet.displayName)
                        LabeledContent("Rating/Slope", value: "\(String(format: "%.1f", teeSet.rating))/\(teeSet.slope)")
                    } else {
                        Text("No course assigned")
                            .foregroundStyle(.secondary)
                    }
                }
                
                // Groups
                Section {
                    if item.sortedGroups.isEmpty {
                        ContentUnavailableView {
                            Label("No Groups", systemImage: "person.3")
                        } description: {
                            Text("Create groups to assign players to this tee time.")
                        } actions: {
                            Button("Add Group") {
                                showingAddGroup = true
                            }
                            .buttonStyle(.bordered)
                        }
                    } else {
                        ForEach(item.sortedGroups) { group in
                            GroupRow(group: group, onAddPlayer: {
                                selectedGroup = group
                                showingPlayerPicker = true
                            })
                        }
                        .onDelete(perform: deleteGroup)
                    }
                } header: {
                    HStack {
                        Text("Groups")
                        Spacer()
                        Button {
                            showingAddGroup = true
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(.green)
                        }
                    }
                }
            }
            
            // Notes
            if let notes = item.notes, !notes.isEmpty {
                Section("Notes") {
                    Text(notes)
                }
            }
            
            // Scoring shortcut
            if item.type == .teeTime {
                Section {
                    NavigationLink {
                        ScorecardSetupView(scheduleItem: item)
                    } label: {
                        Label("Start Scoring", systemImage: "list.number")
                    }
                }
            }
            
            // Delete
            Section {
                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Delete Item")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle(item.displayTitle)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            if let day = item.scheduleDay {
                ScheduleItemFormView(day: day, mode: .edit(item))
            }
        }
        .sheet(isPresented: $showingAddGroup) {
            GroupFormView(scheduleItem: item)
        }
        .sheet(isPresented: $showingPlayerPicker) {
            if let group = selectedGroup {
                PlayerPickerView(group: group, allPlayers: allPlayers)
            }
        }
        .alert("Delete Item?", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deleteItem()
            }
        } message: {
            Text("Are you sure you want to delete this item?")
        }
    }
    
    private func deleteGroup(at offsets: IndexSet) {
        for index in offsets {
            let group = item.sortedGroups[index]
            modelContext.delete(group)
        }
        try? modelContext.save()
    }
    
    private func deleteItem() {
        modelContext.delete(item)
        try? modelContext.save()
        dismiss()
    }
}

struct GroupRow: View {
    let group: Group
    let onAddPlayer: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(group.name)
                    .font(.headline)
                Spacer()
                Button {
                    onAddPlayer()
                } label: {
                    Image(systemName: "person.badge.plus")
                }
            }
            
            if group.sortedPlayers.isEmpty {
                Text("No players assigned")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(group.sortedPlayers) { player in
                    HStack(spacing: 8) {
                        Image(systemName: "person.fill")
                            .foregroundStyle(.secondary)
                            .frame(width: 16)
                        Text(player.name)
                        Spacer()
                        Text("HCP: \(player.formattedHandicap)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .font(.subheadline)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct GroupFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let scheduleItem: ScheduleItem
    
    @State private var name: String = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Group Name (e.g., Group A)", text: $name)
                }
            }
            .navigationTitle("Add Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let group = Group(name: name.isEmpty ? "Group \((scheduleItem.groups?.count ?? 0) + 1)" : name)
                        group.scheduleItem = scheduleItem
                        modelContext.insert(group)
                        try? modelContext.save()
                        dismiss()
                    }
                }
            }
            .onAppear {
                name = "Group \((scheduleItem.groups?.count ?? 0) + 1)"
            }
        }
    }
}

struct PlayerPickerView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let group: Group
    let allPlayers: [Player]
    
    @State private var selectedPlayerIds: Set<UUID> = []
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(allPlayers) { player in
                    Button {
                        if selectedPlayerIds.contains(player.id) {
                            selectedPlayerIds.remove(player.id)
                        } else {
                            selectedPlayerIds.insert(player.id)
                        }
                    } label: {
                        HStack {
                            Text(player.name)
                            Spacer()
                            Text("HCP: \(player.formattedHandicap)")
                                .foregroundStyle(.secondary)
                            if selectedPlayerIds.contains(player.id) {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(.green)
                            }
                        }
                    }
                    .foregroundStyle(.primary)
                }
            }
            .navigationTitle("Add Players")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        addSelectedPlayers()
                        dismiss()
                    }
                }
            }
            .onAppear {
                // Pre-select existing players
                selectedPlayerIds = Set((group.players ?? []).compactMap { $0.player?.id })
            }
        }
    }
    
    private func addSelectedPlayers() {
        // Remove existing assignments
        for groupPlayer in (group.players ?? []) {
            modelContext.delete(groupPlayer)
        }
        
        // Add new assignments
        var position = 0
        for player in allPlayers where selectedPlayerIds.contains(player.id) {
            let groupPlayer = GroupPlayer(position: position)
            groupPlayer.group = group
            groupPlayer.player = player
            modelContext.insert(groupPlayer)
            position += 1
        }
        
        try? modelContext.save()
    }
}

#Preview {
    NavigationStack {
        ScheduleItemDetailView(item: ScheduleItem(type: .teeTime, title: "Morning Round"))
    }
    .modelContainer(for: [ScheduleItem.self, Group.self, GroupPlayer.self, Player.self], inMemory: true)
}
