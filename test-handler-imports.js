#!/usr/bin/env node

/**
 * Handler Import Test - Find which handler is causing issues
 */

const handlers = [
  'chat.js',
  'essay-analyze.js', 
  'essay-storage.js',
  'college-search.js',
  'testprep-generate.js',
  'timeline.js',
  'scrape-scholarships.js',
  'intelligence.js',
  'rate-limiter.js'
];

async function testHandlers() {
  console.log('🧪 Testing individual handler imports...\n');
  
  for (const handlerFile of handlers) {
    try {
      console.log(`📦 Testing: ${handlerFile}...`);
      const start = Date.now();
      
      // Set timeout for each import
      const importPromise = import(`./api/handlers/${handlerFile}`);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Import timeout')), 5000)
      );
      
      await Promise.race([importPromise, timeoutPromise]);
      
      const duration = Date.now() - start;
      console.log(`   ✅ Success (${duration}ms)`);
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Testing main API handler...');
  try {
    const start = Date.now();
    await import('./api/index.js');
    const duration = Date.now() - start;
    console.log(`   ✅ API Handler Success (${duration}ms)`);
  } catch (error) {
    console.log(`   ❌ API Handler Failed: ${error.message}`);
  }
  
  console.log('\n✨ Handler import test completed!');
}

testHandlers();
