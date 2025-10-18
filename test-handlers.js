const handlers = [
  'chat',
  'essay-analyze', 
  'testprep-generate',
  'college-search',
  'timeline',
  'essay-storage'
];

console.log('Testing handler imports...\n');

let passed = 0;
let failed = 0;

for (const handler of handlers) {
  try {
    const h = require(`./api/handlers/${handler}`);
    if (typeof h === 'function') {
      console.log(`✅ ${handler}.js`);
      passed++;
    } else {
      console.log(`❌ ${handler}.js - exported ${typeof h} instead of function`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${handler}.js - ${error.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
