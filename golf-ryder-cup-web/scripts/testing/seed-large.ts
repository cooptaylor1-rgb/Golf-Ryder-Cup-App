/**
 * Seed Large Dataset Script
 *
 * Seeds the app with a large deterministic dataset for stress testing.
 * Creates: 3 trips, 48 players, 6 sessions, 24 matches with complete hole results
 *
 * Usage: npx playwright test --project=setup --grep "seed:large"
 *
 * Or run directly: npx tsx scripts/testing/seed-large.ts
 */

import { generateTestData, SeedSize, toIndexedDBFormat, getDataStats } from '../tests/e2e/utils/seeder';

const SEED_STRING = process.env.SEED || 'golf-ryder-cup-large';

async function seedLargeDataset() {
    console.log('🌱 Seeding large dataset...');
    console.log(`   Seed: ${SEED_STRING}`);

    const startTime = Date.now();
    const data = generateTestData(SEED_STRING, 'large');
    const generationTime = Date.now() - startTime;

    const stats = getDataStats(data);

    console.log('\n📊 Dataset Statistics:');
    console.log(`   Trips: ${stats.tripCount}`);
    console.log(`   Players: ${stats.playerCount}`);
    console.log(`   Sessions: ${stats.sessionCount}`);
    console.log(`   Matches: ${stats.matchCount}`);
    console.log(`   Hole Results: ${stats.holeResultCount}`);
    console.log(`   Total Records: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
    console.log(`   Generation Time: ${generationTime}ms`);

    // Output for piping to Playwright test
    const output = {
        seed: SEED_STRING,
        size: 'large' as SeedSize,
        data: toIndexedDBFormat(data),
        stats,
        generationTime,
        timestamp: new Date().toISOString(),
    };

    console.log('\n📦 Seed data generated successfully.');
    console.log('   Use with test fixtures or inject directly into IndexedDB.');

    return output;
}

// Export for use as module
export { seedLargeDataset };

// Run if executed directly
if (require.main === module) {
    seedLargeDataset()
        .then((result) => {
            console.log('\n✅ Seeding complete.');
            if (process.env.JSON_OUTPUT) {
                console.log(JSON.stringify(result, null, 2));
            }
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}
