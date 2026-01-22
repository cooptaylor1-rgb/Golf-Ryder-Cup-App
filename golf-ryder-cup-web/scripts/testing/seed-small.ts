/**
 * Seed Small Dataset Script
 *
 * Seeds the app with a small deterministic dataset for quick testing.
 * Creates: 1 trip, 12 players, 2 sessions with matches
 *
 * Usage: npx playwright test --project=setup --grep "seed:small"
 *
 * Or run directly: npx tsx scripts/testing/seed-small.ts
 */

import { generateTestData, SeedSize, toIndexedDBFormat, getDataStats } from '../tests/e2e/utils/seeder';

const SEED_STRING = process.env.SEED || 'golf-ryder-cup-small';

async function seedSmallDataset() {
    console.log('🌱 Seeding small dataset...');
    console.log(`   Seed: ${SEED_STRING}`);

    const data = generateTestData(SEED_STRING, 'small');
    const stats = getDataStats(data);

    console.log('\n📊 Dataset Statistics:');
    console.log(`   Trips: ${stats.tripCount}`);
    console.log(`   Players: ${stats.playerCount}`);
    console.log(`   Sessions: ${stats.sessionCount}`);
    console.log(`   Matches: ${stats.matchCount}`);
    console.log(`   Hole Results: ${stats.holeResultCount}`);

    // Output for piping to Playwright test
    const output = {
        seed: SEED_STRING,
        size: 'small' as SeedSize,
        data: toIndexedDBFormat(data),
        stats,
        timestamp: new Date().toISOString(),
    };

    // Write to stdout for capture
    console.log('\n📦 Seed data generated successfully.');
    console.log('   Use with test fixtures or inject directly into IndexedDB.');

    // Return for programmatic use
    return output;
}

// Export for use as module
export { seedSmallDataset };

// Run if executed directly
if (require.main === module) {
    seedSmallDataset()
        .then((result) => {
            console.log('\n✅ Seeding complete.');
            // Optionally output JSON to stdout for automation
            if (process.env.JSON_OUTPUT) {
                console.log(JSON.stringify(result, null, 2));
            }
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}
