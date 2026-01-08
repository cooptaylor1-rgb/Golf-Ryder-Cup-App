import SwiftUI
import SwiftData

struct ScheduleDayDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @Bindable var day: ScheduleDay
    
    @State private var showingAddItem = false
    @State private var showingDeleteAlert = false
    @State private var itemToDelete: ScheduleItem?
    
    var body: some View {
        List {
            // Day info
            Section("Date") {
                Text(day.formattedDate)
                    .font(.headline)
                
                if let notes = day.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
            }
            
            // Schedule items
            Section {
                if day.sortedItems.isEmpty {
                    ContentUnavailableView {
                        Label("No Items", systemImage: "calendar.badge.plus")
                    } description: {
                        Text("Add tee times or events to this day.")
                    } actions: {
                        Button("Add Item") {
                            showingAddItem = true
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    ForEach(day.sortedItems) { item in
                        NavigationLink {
                            ScheduleItemDetailView(item: item)
                        } label: {
                            ScheduleItemRow(item: item)
                        }
                    }
                    .onDelete(perform: confirmDeleteItem)
                }
            } header: {
                HStack {
                    Text("Schedule")
                    Spacer()
                    Button {
                        showingAddItem = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.green)
                    }
                }
            }
        }
        .navigationTitle(day.formattedDate)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingAddItem) {
            ScheduleItemFormView(day: day, mode: .add)
        }
        .alert("Delete Item?", isPresented: .init(
            get: { itemToDelete != nil },
            set: { if !$0 { itemToDelete = nil } }
        )) {
            Button("Cancel", role: .cancel) { itemToDelete = nil }
            Button("Delete", role: .destructive) {
                if let item = itemToDelete {
                    deleteItem(item)
                }
            }
        } message: {
            if let item = itemToDelete {
                Text("Delete \(item.displayTitle)?")
            }
        }
    }
    
    private func confirmDeleteItem(at offsets: IndexSet) {
        if let index = offsets.first {
            itemToDelete = day.sortedItems[index]
        }
    }
    
    private func deleteItem(_ item: ScheduleItem) {
        modelContext.delete(item)
        try? modelContext.save()
        itemToDelete = nil
    }
}

#Preview {
    NavigationStack {
        ScheduleDayDetailView(day: ScheduleDay(date: Date()))
    }
    .modelContainer(for: [ScheduleDay.self, ScheduleItem.self], inMemory: true)
}
