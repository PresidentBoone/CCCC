/**
 * Unified API Handler for Vercel Deployment
 * Consolidates all API routes into a single serverless function
 * to stay within Vercel Hobby plan's 12 function limit
 */

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Parse URL path to determine which handler to use
    const path = req.url.split('?')[0];
    
    try {
        // Dynamically import handlers to avoid loading all at once
        
        // Route to appropriate handler based on path
        if (path === '/api' || path === '/api/') {
            return res.status(200).json({ 
                status: 'ok', 
                message: 'College Climb API v2.0',
                endpoints: [
                    '/api/chat',
                    '/api/essay-analyze',
                    '/api/essay-storage',
                    '/api/college-search',
                    '/api/testprep-generate',
                    '/api/timeline',
                    '/api/scrape-scholarships'
                ]
            });
        }
        
        if (path.startsWith('/api/chat')) {
            const chatHandler = require('./handlers/chat');
            return chatHandler(req, res);
        }
        
        if (path.startsWith('/api/essay-analyze')) {
            const essayAnalyzeHandler = require('./handlers/essay-analyze');
            return essayAnalyzeHandler(req, res);
        }
        
        if (path.startsWith('/api/essay-storage')) {
            const essayStorageHandler = require('./handlers/essay-storage');
            return essayStorageHandler(req, res);
        }
        
        if (path.startsWith('/api/college-search')) {
            const collegeSearchHandler = require('./handlers/college-search');
            return collegeSearchHandler(req, res);
        }
        
        if (path.startsWith('/api/testprep-generate')) {
            const testprepHandler = require('./handlers/testprep-generate');
            return testprepHandler(req, res);
        }
        
        if (path.startsWith('/api/timeline')) {
            const timelineHandler = require('./handlers/timeline');
            return timelineHandler(req, res);
        }
        
        if (path.startsWith('/api/scrape-scholarships')) {
            const scholarshipsHandler = require('./handlers/scrape-scholarships');
            return scholarshipsHandler(req, res);
        }
        
        // 404 for unknown routes
        return res.status(404).json({ 
            error: 'Not Found',
            message: `API endpoint ${path} not found`
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
};
