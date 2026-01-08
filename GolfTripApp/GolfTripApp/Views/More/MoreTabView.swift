import SwiftUI
import SwiftData

/// More tab - Banter, Photos, Settings, and more
struct MoreTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var trips: [Trip]
    
    private var currentTrip: Trip? {
        trips.first
    }
    
    var body: some View {
        NavigationStack {
            List {
                // Banter section
                Section {
                    NavigationLink(destination: BanterFeedView()) {
                        Label("Banter Feed", systemImage: "bubble.left.and.bubble.right.fill")
                    }
                    
                    NavigationLink(destination: PhotosView()) {
                        Label("Photos", systemImage: "photo.on.rectangle.angled")
                    }
                }
                
                // Directory section
                Section("Directory") {
                    NavigationLink(destination: PlayersListView()) {
                        Label("Players", systemImage: "person.3.fill")
                    }
                    
                    NavigationLink(destination: CoursesListView()) {
                        Label("Courses", systemImage: "flag.fill")
                    }
                }
                
                // Trip section
                Section("Trip") {
                    NavigationLink(destination: TripTabView()) {
                        Label("Schedule", systemImage: "calendar")
                    }
                    
                    NavigationLink(destination: TripSettingsView()) {
                        Label("Trip Settings", systemImage: "slider.horizontal.3")
                    }
                }
                
                // Export section
                Section("Export") {
                    Button(action: shareResults) {
                        Label("Share Results", systemImage: "square.and.arrow.up")
                    }
                    
                    Button(action: exportPDF) {
                        Label("Export PDF (Coming Soon)", systemImage: "doc.fill")
                    }
                    .disabled(true)
                    .foregroundColor(.secondary)
                }
                
                // Settings section
                Section {
                    NavigationLink(destination: SettingsView()) {
                        Label("Settings", systemImage: "gear")
                    }
                }
                
                // About section
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("More")
        }
    }
    
    private func shareResults() {
        // Share results implementation
    }
    
    private func exportPDF() {
        // PDF export implementation (future)
    }
}

// MARK: - Banter Feed View

struct BanterFeedView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var trips: [Trip]
    @State private var newMessage = ""
    @State private var showPostSheet = false
    
    private var currentTrip: Trip? {
        trips.first
    }
    
    var body: some View {
        VStack(spacing: 0) {
            if let trip = currentTrip {
                let posts = trip.sortedBanterPosts
                
                if posts.isEmpty {
                    EmptyStateView(
                        icon: "bubble.left.and.bubble.right",
                        title: "No Posts Yet",
                        description: "Be the first to start the banter! Match results will also appear here automatically."
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: DesignTokens.Spacing.md) {
                            ForEach(posts, id: \.id) { post in
                                postCard(post)
                            }
                        }
                        .padding(DesignTokens.Spacing.lg)
                    }
                }
            } else {
                EmptyStateView(
                    icon: "bubble.left.and.bubble.right",
                    title: "No Trip",
                    description: "Create a trip to use the banter feed."
                )
            }
        }
        .navigationTitle("Banter")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showPostSheet = true }) {
                    Image(systemName: "square.and.pencil")
                }
            }
        }
        .sheet(isPresented: $showPostSheet) {
            NewPostSheet(trip: currentTrip)
        }
    }
    
    @ViewBuilder
    private func postCard(_ post: BanterPost) -> some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.sm) {
            HStack {
                Image(systemName: post.typeIcon)
                    .foregroundColor(post.isAutoGenerated ? .secondary : .accentColor)
                
                Text(post.authorName)
                    .font(.subheadline.weight(.semibold))
                
                Spacer()
                
                Text(post.timestamp, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(post.content)
                .font(.body)
            
            if let emoji = post.emoji {
                Text(emoji)
                    .font(.title)
            }
        }
        .padding(DesignTokens.Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.surfaceVariant)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.md))
    }
}

struct NewPostSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    let trip: Trip?
    @State private var message = ""
    @State private var selectedEmoji: String?
    
    private let emojis = ["🔥", "⛳️", "🏆", "😂", "💪", "🎉", "🍺", "👀"]
    
    var body: some View {
        NavigationStack {
            VStack(spacing: DesignTokens.Spacing.lg) {
                TextEditor(text: $message)
                    .frame(height: 120)
                    .padding(DesignTokens.Spacing.sm)
                    .background(Color.surfaceVariant)
                    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.md))
                
                // Emoji picker
                HStack(spacing: DesignTokens.Spacing.md) {
                    ForEach(emojis, id: \.self) { emoji in
                        Button(action: { selectedEmoji = emoji }) {
                            Text(emoji)
                                .font(.title2)
                                .padding(DesignTokens.Spacing.sm)
                                .background(selectedEmoji == emoji ? Color.accentColor.opacity(0.3) : Color.clear)
                                .clipShape(Circle())
                        }
                    }
                }
                
                Spacer()
            }
            .padding(DesignTokens.Spacing.lg)
            .navigationTitle("New Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Post") { postMessage() }
                        .disabled(message.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
    
    private func postMessage() {
        let post = BanterPost(
            content: message,
            authorName: "You",
            postType: "message",
            emoji: selectedEmoji
        )
        post.trip = trip
        modelContext.insert(post)
        dismiss()
    }
}

// MARK: - Photos View

struct PhotosView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var trips: [Trip]
    
    private var currentTrip: Trip? {
        trips.first
    }
    
    var body: some View {
        Group {
            if let trip = currentTrip {
                let photos = trip.sortedPhotos
                
                if photos.isEmpty {
                    EmptyStateView(
                        icon: "photo.on.rectangle.angled",
                        title: "No Photos Yet",
                        description: "Photos from your trip will appear here. Add photos to remember the best moments!"
                    )
                } else {
                    photoGrid(photos)
                }
            } else {
                EmptyStateView(
                    icon: "photo.on.rectangle.angled",
                    title: "No Trip",
                    description: "Create a trip to add photos."
                )
            }
        }
        .navigationTitle("Photos")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: addPhoto) {
                    Image(systemName: "plus")
                }
            }
        }
    }
    
    @ViewBuilder
    private func photoGrid(_ photos: [TripPhoto]) -> some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 4) {
                ForEach(photos, id: \.id) { photo in
                    photoCell(photo)
                }
            }
            .padding(4)
        }
    }
    
    @ViewBuilder
    private func photoCell(_ photo: TripPhoto) -> some View {
        if let data = photo.imageData, let uiImage = UIImage(data: data) {
            Image(uiImage: uiImage)
                .resizable()
                .aspectRatio(1, contentMode: .fill)
                .clipped()
        } else {
            Rectangle()
                .fill(Color.surfaceVariant)
                .aspectRatio(1, contentMode: .fill)
                .overlay(
                    Image(systemName: "photo")
                        .foregroundColor(.secondary)
                )
        }
    }
    
    private func addPhoto() {
        // Photo picker implementation (future)
    }
}

// MARK: - Trip Settings View

struct TripSettingsView: View {
    @Query private var trips: [Trip]
    
    private var currentTrip: Trip? {
        trips.first
    }
    
    var body: some View {
        Form {
            if let trip = currentTrip {
                Section("Trip Details") {
                    LabeledContent("Name", value: trip.name)
                    LabeledContent("Location", value: trip.location ?? "Not set")
                    LabeledContent("Dates", value: trip.dateRangeFormatted)
                }
                
                Section("Ryder Cup Settings") {
                    LabeledContent("Teams", value: "\(trip.teams?.filter { $0.mode == .ryderCup }.count ?? 0)")
                    LabeledContent("Sessions", value: "\(trip.sortedSessions.count)")
                    LabeledContent("Total Points", value: String(format: "%.0f", trip.totalPointsAvailable))
                    LabeledContent("Points to Win", value: String(format: "%.1f", trip.pointsToWin))
                }
                
                Section("Data") {
                    NavigationLink("Export Trip Data") {
                        Text("Coming Soon")
                    }
                    .disabled(true)
                }
            } else {
                Text("No active trip")
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Trip Settings")
    }
}

#Preview {
    MoreTabView()
        .modelContainer(for: [Trip.self, BanterPost.self, TripPhoto.self], inMemory: true)
}
