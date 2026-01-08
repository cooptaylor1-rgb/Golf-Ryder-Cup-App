// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "GolfTripApp",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "GolfTripAppCore",
            targets: ["GolfTripAppCore"]
        )
    ],
    targets: [
        .target(
            name: "GolfTripAppCore",
            dependencies: [],
            path: "GolfTripApp",
            exclude: ["Resources/Assets.xcassets"],
            sources: [
                "GolfTripApp.swift",
                "Models",
                "Services",
                "Views",
                "Extensions"
            ]
        ),
        .testTarget(
            name: "GolfTripAppTests",
            dependencies: ["GolfTripAppCore"],
            path: "Tests"
        )
    ]
)
