import SwiftUI
import SwiftData

struct ContentView: View {
    @State private var selectedTab = 0
    @Query private var trips: [Trip]
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeTabView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            MatchupsTabView()
                .tabItem {
                    Label("Matchups", systemImage: "rectangle.grid.2x2.fill")
                }
                .tag(1)
            
            ScoreTabView()
                .tabItem {
                    Label("Score", systemImage: "plus.circle.fill")
                }
                .tag(2)
            
            StandingsTabView()
                .tabItem {
                    Label("Standings", systemImage: "trophy.fill")
                }
                .tag(3)
            
            TeamsTabView()
                .tabItem {
                    Label("Teams", systemImage: "person.2.fill")
                }
                .tag(4)
            
            MoreTabView()
                .tabItem {
                    Label("More", systemImage: "ellipsis.circle.fill")
                }
                .tag(5)
        }
        .tint(.green)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [Player.self, Course.self, Trip.self], inMemory: true)
}
