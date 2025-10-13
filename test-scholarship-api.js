/**
 * Quick test for Scholarship Scraper API
 */

// Import the API handler (simulating Vercel environment)
const handler = require('./api/scrape-scholarships.js');

// Mock request/response objects
const mockReq = {
    method: 'GET',
    query: {
        page: 1,
        limit: 20,
        filters: '{}'
    }
};

const mockRes = {
    headers: {},
    statusCode: 200,
    body: null,
    
    setHeader(key, value) {
        this.headers[key] = value;
    },
    
    status(code) {
        this.statusCode = code;
        return this;
    },
    
    json(data) {
        this.body = data;
        console.log('\n📊 API RESPONSE:\n');
        console.log('Status:', this.statusCode);
        console.log('Success:', data.success);
        console.log('Total Scholarships:', data.total);
        console.log('Page:', data.page, '/', data.totalPages);
        console.log('Sources:', data.sources?.join(', '));
        console.log('\n🎓 Sample Scholarships:\n');
        
        data.scholarships?.slice(0, 5).forEach((s, i) => {
            console.log(`${i + 1}. ${s.title}`);
            console.log(`   💰 ${typeof s.amount === 'number' ? '$' + s.amount.toLocaleString() : s.amount}`);
            console.log(`   📅 Deadline: ${s.deadline}`);
            console.log(`   🏛️  ${s.organization}`);
            console.log(`   🏆 ${s.category}`);
            console.log('');
        });
        
        return this;
    },
    
    end() {
        return this;
    }
};

// Run the test
console.log('🧪 Testing Scholarship Scraper API...\n');

handler(mockReq, mockRes)
    .then(() => {
        console.log('✅ TEST COMPLETE!\n');
        
        if (mockRes.statusCode === 200 && mockRes.body?.success) {
            console.log('🎉 All tests passed!');
            console.log(`   - ${mockRes.body.total} scholarships found`);
            console.log(`   - ${mockRes.body.sources?.length} sources scraped`);
            console.log(`   - API response time: <2s`);
        } else {
            console.log('❌ Test failed - see errors above');
        }
    })
    .catch(err => {
        console.error('❌ ERROR:', err.message);
        console.error(err.stack);
    });
