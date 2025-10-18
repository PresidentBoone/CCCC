// Simplified Essay Storage API for Testing (No Firebase)
import logger from '../utils/logger.js';

// In-memory storage for testing
const essayStorage = new Map();

// Rate limiting helper
const rateLimitMap = new Map();
function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}

export default async function handler(req, res) {
  logger.debug('=== ESSAY STORAGE API CALLED ===');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limiting
  const identifier = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(identifier, 50, 60000)) {
    logger.warn(`Rate limit exceeded for essay storage: ${identifier}`);
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again in a moment.' 
    });
  }

  try {
    if (req.method === 'POST') {
      const { action, userId, essayId, title, content, prompt, college } = req.body;
      
      // Handle action-based requests
      if (action === 'get') {
        // Get essays
        if (!userId) {
          return res.status(400).json({ error: 'Missing userId parameter' });
        }

        if (essayId) {
          // Get specific essay
          const key = `${userId}:${essayId}`;
          const essay = essayStorage.get(key);
          
          if (!essay) {
            return res.status(404).json({ error: 'Essay not found' });
          }

          return res.status(200).json({ essay });
        } else {
          // Get all essays for user
          const userEssays = [];
          for (const [key, essay] of essayStorage.entries()) {
            if (key.startsWith(`${userId}:`)) {
              userEssays.push(essay);
            }
          }

          return res.status(200).json({ 
            essays: userEssays,
            count: userEssays.length,
            message: 'Using in-memory storage'
          });
        }
      }
      
      // Save essay
      if (!userId || !essayId || !content) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, essayId, content' 
        });
      }

      const essay = {
        id: essayId,
        userId,
        title: title || 'Untitled Essay',
        content,
        prompt: prompt || '',
        college: college || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: content.split(' ').filter(word => word.length > 0).length
      };

      const key = `${userId}:${essayId}`;
      essayStorage.set(key, essay);

      logger.info(`Essay saved: ${essayId} for user ${userId}`);
      return res.status(200).json({ 
        success: true, 
        essayId,
        message: 'Essay saved successfully (in-memory storage)',
        wordCount: essay.wordCount
      });

    } else if (req.method === 'GET') {
      // Get essays
      const { userId, essayId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }

      if (essayId) {
        // Get specific essay
        const key = `${userId}:${essayId}`;
        const essay = essayStorage.get(key);
        
        if (!essay) {
          return res.status(404).json({ error: 'Essay not found' });
        }

        return res.status(200).json({ essay });
      } else {
        // Get all essays for user
        const userEssays = [];
        for (const [key, essay] of essayStorage.entries()) {
          if (key.startsWith(`${userId}:`)) {
            userEssays.push(essay);
          }
        }

        return res.status(200).json({ 
          essays: userEssays,
          count: userEssays.length,
          message: 'Using in-memory storage'
        });
      }

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    logger.error('Essay storage error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

export { handler };
