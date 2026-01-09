import SwiftUI
import SwiftData

struct TripTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Trip.startDate, order: .descending) private var trips: [Trip]
    
    @State private var showingTripSelector = false
    @State private var showingAddTrip = false
    @State private var selectedTrip: Trip?
    
    var body: some View {
        NavigationStack {
            Group {
                if trips.isEmpty {
                    ContentUnavailableView {
                        Label("No Trips", systemImage: "airplane")
                    } description: {
                        Text("Create a trip to start planning your golf adventure.")
                    } actions: {
                        Button("Create Trip") {
                            showingAddTrip = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                } else if let trip = selectedTrip ?? trips.first {
                    TripHomeView(trip: trip)
                } else {
                    ProgressView()
                }
            }
            .navigationTitle(selectedTrip?.name ?? "Trip")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if trips.count > 1 {
                        Menu {
                            ForEach(trips) { trip in
                                Button {
                                    selectedTrip = trip
                                } label: {
                                    HStack {
                                        Text(trip.name)
                                        if trip.id == (selectedTrip ?? trips.first)?.id {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                            
                            Divider()
                            
                            Button {
                                showingAddTrip = true
                            } label: {
                                Label("New Trip", systemImage: "plus")
                            }
                        } label: {
                            Image(systemName: "chevron.down.circle")
                        }
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddTrip = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddTrip) {
                TripFormView(mode: .add) { newTrip in
                    selectedTrip = newTrip
                }
            }
            .onAppear {
                if selectedTrip == nil && !trips.isEmpty {
                    selectedTrip = trips.first
                }
            }
        }
    }
}

struct TripHomeView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var trip: Trip
    
    @State private var showingEditTrip = false
    @State private var showingAddDay = false
    @State private var selectedDay: ScheduleDay?
    
    var todayItems: [ScheduleItem] {
        let calendar = Calendar.current
        let today = Date()
        
        return trip.sortedDays
            .filter { calendar.isDate($0.date, inSameDayAs: today) }
            .flatMap { $0.sortedItems }
    }
    
    var upcomingItem: ScheduleItem? {
        let now = Date()
        return trip.sortedDays
            .flatMap { $0.sortedItems }
            .filter { item in
                guard let time = item.startTime else { return false }
                return time > now
            }
            .first
    }
    
    var body: some View {
        List {
            // Trip overview
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    if let location = trip.location {
                        Label(location, systemImage: "location")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    
                    Label(trip.dateRangeFormatted, systemImage: "calendar")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    
                    Label("\(trip.durationDays) days", systemImage: "clock")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                if let notes = trip.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
            } header: {
                HStack {
                    Text("Overview")
                    Spacer()
                    Button("Edit") {
                        showingEditTrip = true
                    }
                    .font(.caption)
                }
            }
            
            // Next up
            if let next = upcomingItem {
                Section("Next Up") {
                    NavigationLink {
                        if let day = next.scheduleDay {
                            ScheduleDayDetailView(day: day)
                        }
                    } label: {
                        ScheduleItemRow(item: next)
                    }
                }
            }
            
            // Today's schedule
            if !todayItems.isEmpty {
                Section("Today") {
                    ForEach(todayItems) { item in
                        NavigationLink {
                            if let day = item.scheduleDay {
                                ScheduleDayDetailView(day: day)
                            }
                        } label: {
                            ScheduleItemRow(item: item)
                        }
                    }
                }
            }
            
            // Schedule days
            Section {
                if trip.sortedDays.isEmpty {
                    ContentUnavailableView {
                        Label("No Schedule", systemImage: "calendar.badge.plus")
                    } description: {
                        Text("Add days to your trip schedule.")
                    } actions: {
                        Button("Add Day") {
                            showingAddDay = true
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    ForEach(trip.sortedDays) { day in
                        NavigationLink {
                            ScheduleDayDetailView(day: day)
                        } label: {
                            ScheduleDayRow(day: day, trip: trip)
                        }
                    }
                }
            } header: {
                HStack {
                    Text("Schedule")
                    Spacer()
                    Button {
                        showingAddDay = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.green)
                    }
                }
            }
            
            // Quick stats
            Section("Quick Stats") {
                let teeTimeCount = trip.sortedDays.flatMap { $0.items ?? [] }.filter { $0.type == .teeTime }.count
                let eventCount = trip.sortedDays.flatMap { $0.items ?? [] }.filter { $0.type == .event }.count
                let teamCount = trip.teams?.count ?? 0
                
                LabeledContent("Tee Times", value: "\(teeTimeCount)")
                LabeledContent("Events", value: "\(eventCount)")
                LabeledContent("Teams", value: "\(teamCount)")
            }
        }
        .sheet(isPresented: $showingEditTrip) {
            TripFormView(mode: .edit(trip))
        }
        .sheet(isPresented: $showingAddDay) {
            ScheduleDayFormView(trip: trip, mode: .add)
        }
    }
}

struct ScheduleDayRow: View {
    let day: ScheduleDay
    let trip: Trip
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("Day \(day.dayNumber(in: trip))")
                    .font(.headline)
                Spacer()
                Text(day.formattedDate)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            let itemCount = day.items?.count ?? 0
            if itemCount > 0 {
                let teeTimes = (day.items ?? []).filter { $0.type == .teeTime }.count
                let events = (day.items ?? []).filter { $0.type == .event }.count
                
                HStack(spacing: 12) {
                    if teeTimes > 0 {
                        Label("\(teeTimes)", systemImage: "figure.golf")
                    }
                    if events > 0 {
                        Label("\(events)", systemImage: "calendar")
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct ScheduleItemRow: View {
    let item: ScheduleItem
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: item.type.iconName)
                .foregroundStyle(item.type == .teeTime ? .green : .blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(item.displayTitle)
                    .font(.headline)
                
                HStack {
                    if !item.formattedStartTime.isEmpty {
                        Text(item.formattedStartTime)
                    }
                    
                    if let course = item.courseName {
                        Text("• \(course)")
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    TripTabView()
        .modelContainer(for: [Trip.self, ScheduleDay.self], inMemory: true)
}
