# Dev Container Setup

This repository includes dev container configurations for development.

## Available Configurations

### 1. Swift Dev Container (Linux)
**Location**: `.devcontainer/devcontainer.json`

A Linux-based container for Swift development. Good for:
- Editing Swift files with syntax highlighting
- Running Swift Package Manager builds
- Code review and documentation

**Limitations**: Cannot run Xcode or iOS Simulator

### 2. Xcode Dev Container (macOS)
**Location**: `.devcontainer/xcode-macos/devcontainer.json`

A macOS-based container for full Xcode development. Requires:
- GitHub Codespaces with macOS runners (beta)
- Or local macOS machine with Docker

**Capabilities**:
- Full Xcode build and test
- iOS Simulator support
- SwiftUI Previews

## Quick Start

### Using GitHub Codespaces
1. Click **Code** → **Codespaces** → **New codespace**
2. Select the Swift container for basic editing
3. Wait for container to build

### Using VS Code Locally
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [VS Code Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open this folder in VS Code
4. Click "Reopen in Container" when prompted

## Building the App

### In Container (SPM only)
```bash
cd GolfTripApp
swift build
swift test
```

### On macOS (Full Xcode)
```bash
cd GolfTripApp
xcodebuild -project GolfTripApp.xcodeproj \
  -scheme GolfTripApp \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build
```

## Installed Extensions

The dev container includes these VS Code extensions:
- **Swift Language** - Syntax highlighting and IntelliSense
- **Apple Swift Format** - Code formatting
- **GitHub Copilot** - AI pair programming
- **GitLens** - Git history visualization
- **Todo Tree** - Track TODOs in code

## Troubleshooting

### Container won't start
- Ensure Docker is running
- Try rebuilding: `Cmd+Shift+P` → "Remote-Containers: Rebuild Container"

### Swift not found
- The Linux container uses `/usr/bin/swift`
- Run `which swift` to verify installation

### Xcode build fails
- macOS container required for Xcode builds
- Verify Xcode CLI tools: `xcode-select --install`
