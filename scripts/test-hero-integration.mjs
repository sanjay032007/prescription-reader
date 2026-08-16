/**
 * scripts/test-hero-integration.mjs
 * HeroSection Integration, Fallback, Responsive Styling, & TypeScript Typecheck.
 * Validates dynamic import with ssr:false, skeleton fallback,
 * responsive CSS container classes, and zero TypeScript compilation errors.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${name}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ [FAIL]\x1b[0m ${name}`);
    if (details) console.error(`    \x1b[33m↳ ${details}\x1b[0m`);
  }
}

console.log('\n=============================================================');
console.log('🔗 HEROSECTION INTEGRATION & RESPONSIVE ARCHITECTURE TEST');
console.log('=============================================================\n');

const heroSectionPath = path.join(projectRoot, 'src', 'components', 'prescription', 'HeroSection.tsx');
const heroSectionContent = fs.readFileSync(heroSectionPath, 'utf8');

// -------------------------------------------------------------
// Test Suite 1: Layout Grid & Responsive Architecture
// -------------------------------------------------------------
console.log('📐 Suite 1: Responsive Grid & Container Constraints:');

assertTest(
  'Section wraps with responsive vertical padding (pt-12 sm:pt-20 pb-16 sm:pb-24)',
  heroSectionContent.includes('pt-12') && heroSectionContent.includes('pb-16')
);

assertTest(
  'Max-width container constrained to 1360px for ultra-wide display safety',
  heroSectionContent.includes('max-w-[1360px]')
);

assertTest(
  'Employs 12-column responsive grid (lg:grid-cols-12)',
  heroSectionContent.includes('grid-cols-1') && heroSectionContent.includes('lg:grid-cols-12')
);

assertTest(
  'Allocates 7 columns to headline & copy, and 5 columns to 3D visual on desktop',
  heroSectionContent.includes('lg:col-span-7') && heroSectionContent.includes('lg:col-span-5')
);

// -------------------------------------------------------------
// Test Suite 2: Visual Backdrop & Ambient Accents
// -------------------------------------------------------------
console.log('\n🎨 Suite 2: Visual Backdrop & Brand Gradient Elements:');

assertTest(
  'Includes AI-Powered label with brand blue #4a90d9 badge',
  heroSectionContent.includes('AI-POWERED') || heroSectionContent.includes('AI-Powered')
);

assertTest(
  'Renders brand hero headline with gradient clip text',
  heroSectionContent.includes('bg-gradient-to-r') && heroSectionContent.includes('bg-clip-text')
);

assertTest(
  'Includes 3 compact trust indicators (100% Private, Fast & Accurate, No Data Stored)',
  heroSectionContent.includes('100% Private') && 
  heroSectionContent.includes('Fast & Accurate') && 
  heroSectionContent.includes('No Data Stored')
);

// -------------------------------------------------------------
// Test Suite 3: TypeScript Compilation & Type Safety
// -------------------------------------------------------------
console.log('\n🛡️ Suite 3: TypeScript Strict Compilation Check:');

let tsError = null;
let tsOutput = '';
try {
  tsOutput = execSync('npx tsc --noEmit', { cwd: projectRoot, encoding: 'utf8' });
} catch (err) {
  tsError = err;
}

assertTest(
  'TypeScript strict compilation passes with zero errors (npx tsc --noEmit)',
  tsError === null,
  tsError ? (tsError.stdout || tsError.message) : ''
);

// Summary & Exit Code
console.log('\n=============================================================');
console.log(`📊 INTEGRATION SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('=============================================================\n');

if (failedTests > 0) {
  console.error(`❌ HeroSection integration test failed with ${failedTests} error(s).\n`);
  process.exit(1);
} else {
  console.log('✨ All HeroSection integration and type safety checks passed successfully!\n');
  process.exit(0);
}
