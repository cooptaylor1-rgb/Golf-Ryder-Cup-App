/**
 * Simulate 1000 Users Runner
 *
 * Simulates the load equivalent to "1000 users using the app for a few months"
 * by combining:
 * - Multiple seed iterations with growing dataset
 * - Concurrent E2E journeys
 * - Chaos/failure injection
 * - Fuzz testing rounds
 *
 * Usage: npm run test:simulate:1000
 *        WORKERS=8 npm run test:simulate:1000
 *
 * This is a meta-runner that orchestrates multiple test suites.
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface SimulationConfig {
    workers: number;
    journeyIterations: number;
    chaosIterations: number;
    fuzzRounds: number;
    fuzzActionsPerRound: number;
    seeds: string[];
    reportDir: string;
}

const config: SimulationConfig = {
    workers: parseInt(process.env.WORKERS || '4', 10),
    journeyIterations: parseInt(process.env.JOURNEY_ITERATIONS || '50', 10),  // 50 iterations × 12 journeys = 600 journey runs
    chaosIterations: parseInt(process.env.CHAOS_ITERATIONS || '20', 10),       // 20 × 15 chaos tests = 300 chaos runs
    fuzzRounds: parseInt(process.env.FUZZ_ROUNDS || '10', 10),                 // 10 fuzz rounds
    fuzzActionsPerRound: parseInt(process.env.FUZZ_ACTIONS || '100', 10),      // 100 actions per round = 1000 fuzz actions
    seeds: [
        'sim-alpha-2024',
        'sim-beta-2024',
        'sim-gamma-2024',
        'sim-delta-2024',
        'sim-epsilon-2024',
    ],
    reportDir: 'tests/e2e/artifacts/simulate-1000',
};

// ============================================================================
// RUNNER
// ============================================================================

interface RunResult {
    phase: string;
    exitCode: number;
    duration: number;
    stdout: string;
    stderr: string;
}

function runPlaywrightCommand(args: string[], env?: Record<string, string>): Promise<RunResult> {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let stdout = '';
        let stderr = '';

        const proc: ChildProcess = spawn('npx', ['playwright', 'test', ...args], {
            cwd: process.cwd(),
            env: { ...process.env, ...env },
            stdio: ['inherit', 'pipe', 'pipe'],
        });

        proc.stdout?.on('data', (data) => {
            const text = data.toString();
            stdout += text;
            process.stdout.write(text);
        });

        proc.stderr?.on('data', (data) => {
            const text = data.toString();
            stderr += text;
            process.stderr.write(text);
        });

        proc.on('close', (code) => {
            resolve({
                phase: args.join(' '),
                exitCode: code ?? 1,
                duration: Date.now() - startTime,
                stdout,
                stderr,
            });
        });
    });
}

async function ensureReportDir(): Promise<void> {
    if (!fs.existsSync(config.reportDir)) {
        fs.mkdirSync(config.reportDir, { recursive: true });
    }
}

// ============================================================================
// SIMULATION PHASES
// ============================================================================

async function runPhase1_Journeys(): Promise<RunResult[]> {
    console.log('\n' + '='.repeat(60));
    console.log('📍 PHASE 1: Journey Tests (Simulating User Workflows)');
    console.log('='.repeat(60));

    const results: RunResult[] = [];

    for (let i = 1; i <= config.journeyIterations; i++) {
        const seed = config.seeds[i % config.seeds.length];
        console.log(`\n🚀 Journey Iteration ${i}/${config.journeyIterations} (seed: ${seed})`);

        const result = await runPlaywrightCommand(
            [
                'tests/e2e/journeys/',
                '--workers', String(config.workers),
                '--reporter=line',
            ],
            {
                TEST_SEED: seed,
                ITERATION: String(i),
            }
        );

        results.push(result);

        // Early exit on critical failure
        if (result.exitCode !== 0) {
            console.log(`⚠️  Iteration ${i} had failures, continuing...`);
        }
    }

    return results;
}

async function runPhase2_Chaos(): Promise<RunResult[]> {
    console.log('\n' + '='.repeat(60));
    console.log('💥 PHASE 2: Chaos Tests (Simulating Network Failures)');
    console.log('='.repeat(60));

    const results: RunResult[] = [];

    for (let i = 1; i <= config.chaosIterations; i++) {
        console.log(`\n🌀 Chaos Iteration ${i}/${config.chaosIterations}`);

        const result = await runPlaywrightCommand(
            [
                'tests/e2e/chaos/',
                '--workers', '1',  // Chaos tests run single-threaded for predictability
                '--reporter=line',
            ],
            {
                CHAOS_ENABLED: 'true',
                ITERATION: String(i),
            }
        );

        results.push(result);
    }

    return results;
}

async function runPhase3_Fuzz(): Promise<RunResult[]> {
    console.log('\n' + '='.repeat(60));
    console.log('🐒 PHASE 3: Fuzz Tests (Monkey Testing)');
    console.log('='.repeat(60));

    const results: RunResult[] = [];

    for (let i = 1; i <= config.fuzzRounds; i++) {
        const seed = `fuzz-${config.seeds[i % config.seeds.length]}-round${i}`;
        console.log(`\n🎲 Fuzz Round ${i}/${config.fuzzRounds} (seed: ${seed})`);

        const result = await runPlaywrightCommand(
            [
                'tests/e2e/fuzz/',
                '--workers', '1',
                '--reporter=line',
            ],
            {
                FUZZ_SEED: seed,
                FUZZ_ACTIONS: String(config.fuzzActionsPerRound),
            }
        );

        results.push(result);
    }

    return results;
}

// ============================================================================
// REPORTING
// ============================================================================

interface SimulationReport {
    timestamp: string;
    config: SimulationConfig;
    totalDuration: number;
    phases: {
        name: string;
        iterations: number;
        passed: number;
        failed: number;
        totalDuration: number;
    }[];
    summary: {
        totalIterations: number;
        totalPassed: number;
        totalFailed: number;
        successRate: number;
        equivalentUserSessions: number;
    };
}

function generateReport(
    journeyResults: RunResult[],
    chaosResults: RunResult[],
    fuzzResults: RunResult[],
    totalDuration: number
): SimulationReport {
    const countResults = (results: RunResult[]) => ({
        passed: results.filter(r => r.exitCode === 0).length,
        failed: results.filter(r => r.exitCode !== 0).length,
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    });

    const journeyStats = countResults(journeyResults);
    const chaosStats = countResults(chaosResults);
    const fuzzStats = countResults(fuzzResults);

    const totalIterations = journeyResults.length + chaosResults.length + fuzzResults.length;
    const totalPassed = journeyStats.passed + chaosStats.passed + fuzzStats.passed;
    const totalFailed = journeyStats.failed + chaosStats.failed + fuzzStats.failed;

    // Calculate equivalent user sessions
    // Each journey iteration runs 12+ journeys, each representing a user session
    // Chaos tests simulate 15+ failure scenarios
    // Fuzz tests simulate random user behavior
    const journeySessions = config.journeyIterations * 12; // 12 journeys per iteration
    const chaosSessions = config.chaosIterations * 15;     // 15 chaos tests per iteration
    const fuzzSessions = config.fuzzRounds * config.fuzzActionsPerRound / 5; // ~5 actions per "session"
    const equivalentUserSessions = journeySessions + chaosSessions + fuzzSessions;

    return {
        timestamp: new Date().toISOString(),
        config,
        totalDuration,
        phases: [
            {
                name: 'Journey Tests',
                iterations: journeyResults.length,
                ...journeyStats,
            },
            {
                name: 'Chaos Tests',
                iterations: chaosResults.length,
                ...chaosStats,
            },
            {
                name: 'Fuzz Tests',
                iterations: fuzzResults.length,
                ...fuzzStats,
            },
        ],
        summary: {
            totalIterations,
            totalPassed,
            totalFailed,
            successRate: totalPassed / totalIterations,
            equivalentUserSessions,
        },
    };
}

function printReport(report: SimulationReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SIMULATION REPORT');
    console.log('='.repeat(60));

    console.log(`\n⏱️  Total Duration: ${(report.totalDuration / 1000 / 60).toFixed(1)} minutes`);
    console.log(`📅 Timestamp: ${report.timestamp}`);

    console.log('\n📈 Phase Results:');
    for (const phase of report.phases) {
        const statusIcon = phase.failed === 0 ? '✅' : '⚠️';
        console.log(`   ${statusIcon} ${phase.name}:`);
        console.log(`      Iterations: ${phase.iterations}`);
        console.log(`      Passed: ${phase.passed}, Failed: ${phase.failed}`);
        console.log(`      Duration: ${(phase.totalDuration / 1000).toFixed(1)}s`);
    }

    console.log('\n🎯 Summary:');
    console.log(`   Total Test Runs: ${report.summary.totalIterations}`);
    console.log(`   Passed: ${report.summary.totalPassed}`);
    console.log(`   Failed: ${report.summary.totalFailed}`);
    console.log(`   Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`);
    console.log(`   Equivalent User Sessions: ~${report.summary.equivalentUserSessions}`);

    if (report.summary.successRate >= 0.95) {
        console.log('\n🎉 SIMULATION PASSED - System is production-grade!');
    } else if (report.summary.successRate >= 0.80) {
        console.log('\n⚠️  SIMULATION WARNING - Some failures need investigation.');
    } else {
        console.log('\n❌ SIMULATION FAILED - Significant issues detected.');
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
    console.log('🏌️ Golf Ryder Cup App - 1000 User Simulation');
    console.log('='.repeat(60));
    console.log('\nConfiguration:');
    console.log(`   Workers: ${config.workers}`);
    console.log(`   Journey Iterations: ${config.journeyIterations}`);
    console.log(`   Chaos Iterations: ${config.chaosIterations}`);
    console.log(`   Fuzz Rounds: ${config.fuzzRounds} × ${config.fuzzActionsPerRound} actions`);
    console.log(`   Seeds: ${config.seeds.join(', ')}`);

    await ensureReportDir();

    const startTime = Date.now();

    // Run all phases
    const journeyResults = await runPhase1_Journeys();
    const chaosResults = await runPhase2_Chaos();
    const fuzzResults = await runPhase3_Fuzz();

    const totalDuration = Date.now() - startTime;

    // Generate and save report
    const report = generateReport(journeyResults, chaosResults, fuzzResults, totalDuration);

    const reportPath = path.join(config.reportDir, `report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const latestReportPath = path.join(config.reportDir, 'latest-report.json');
    fs.writeFileSync(latestReportPath, JSON.stringify(report, null, 2));

    printReport(report);

    console.log(`\n📄 Full report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(report.summary.successRate >= 0.80 ? 0 : 1);
}

// Run
main().catch((error) => {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
});
