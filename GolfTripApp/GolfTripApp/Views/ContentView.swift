import SwiftUI
import SwiftData

struct ContentView: View {
    @State private var selectedTab = 0
    @Query private var trips: [Trip]
    
    var body: some View {
        TabView(selection: $selectedTab) {
            TripTabView()
                .tabItem {
                    Label("Trip", systemImage: "airplane")
                }
                .tag(0)
            
            PlayersListView()
                .tabItem {
                    Label("Players", systemImage: "person.3")
                }
                .tag(1)
            
            CoursesListView()
                .tabItem {
                    Label("Courses", systemImage: "flag")
                }
                .tag(2)
            
            TeamsListView()
                .tabItem {
                    Label("Teams", systemImage: "person.2.badge.gearshape")
                }
                .tag(3)
            
            ScoringTabView()
                .tabItem {
                    Label("Scoring", systemImage: "list.number")
                }
                .tag(4)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(5)
        }
        .tint(.green)
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [Player.self, Course.self, Trip.self], inMemory: true)
}
