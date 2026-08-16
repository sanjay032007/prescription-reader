/**
 * scripts/run-all-e2e-tests.mjs
 * Master 4-Tier E2E Test Suite Runner for 3D Prescription Hero Visual.
 * Executes all test tiers sequentially, aggregates metrics, and returns exit code 0 on success.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const startTime = Date.now();

console.log('\n======================================================================');
console.log('🚀 3D PRESCRIPTION HERO VISUAL — MASTER E2E TEST SUITE RUNNER');
console.log('======================================================================');
console.log(`📅 Execution Timestamp: ${new Date().toISOString()}`);
console.log(`📂 Working Directory:   ${projectRoot}`);
console.log('======================================================================\n');

const testSuites = [
  {
    tier: 'Tier 1 & Tier 2',
    name: 'Static AST & 3D Architectural Integrity Audit',
    script: 'scripts/verify-3d-integrity.mjs',
  },
  {
    tier: 'Tier 1 & Tier 4',
    name: 'Headless Three.js Scene Graph & Math Curvature Unit Tests',
    script: 'scripts/test-scene-graph.mjs',
  },
  {
    tier: 'Tier 2 & Tier 3',
    name: 'HeroSection Integration, Fallback, & TypeScript Verification',
    script: 'scripts/test-hero-integration.mjs',
  },
];

let totalPassedSuites = 0;
let failedSuites = [];

for (let i = 0; i < testSuites.length; i++) {
  const suite = testSuites[i];
  console.log(`\x1b[1m[Suite ${i + 1}/${testSuites.length}] ${suite.tier}: ${suite.name}\x1b[0m`);
  console.log(`Running: node ${suite.script}...`);
  
  try {
    const output = execSync(`node ${suite.script}`, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    console.log(output);
    totalPassedSuites++;
  } catch (error) {
    console.error(error.stdout || error.stderr || error.message);
    failedSuites.push({ suite, error });
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n======================================================================');
console.log('🏁 MASTER E2E TEST RUN SUMMARY');
console.log('======================================================================');
console.log(`⏱️  Total Duration:      ${duration}s`);
console.log(`📊 Suites Executed:     ${testSuites.length}`);
console.log(`✅ Suites Passed:       ${totalPassedSuites}`);
console.log(`❌ Suites Failed:       ${failedSuites.length}`);
console.log('======================================================================\n');

if (failedSuites.length > 0) {
  console.error('❌ E2E TEST RUN FAILED! The following suites reported errors:');
  failedSuites.forEach(f => {
    console.error(`  - ${f.suite.tier}: ${f.suite.name} (${f.suite.script})`);
  });
  console.error('\nPlease resolve the reported failures before release.\n');
  process.exit(1);
} else {
  console.log('🎉 ALL 4-TIER E2E TEST SUITES PASSED CLEANLY WITH ZERO ERRORS!\n');
  process.exit(0);
}
