// Simple Essay Storage API for testing (uses local storage simulation)
// In production, this would connect to a real database

let essayStorage = new Map(); // Temporary in-memory storage for testing

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    const { userId, essayId, action } = req.query;
    const { essay, title, prompt, colleges, analysis } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get or create user's essay storage
    const userKey = `user_${userId}`;
    if (!essayStorage.has(userKey)) {
      essayStorage.set(userKey, new Map());
    }
    const userEssays = essayStorage.get(userKey);

    switch (method) {
      case 'POST':
        if (action === 'save') {
          const essayData = {
            title: title || `Essay ${new Date().toLocaleDateString()}`,
            content: essay,
            prompt: prompt || '',
            targetColleges: colleges || [],
            analysis: analysis || null,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: essay ? essay.split(/\s+/).length : 0,
            version: 1
          };

          let docId;
          if (essayId && userEssays.has(essayId)) {
            // Update existing essay
            docId = essayId;
            const existingEssay = userEssays.get(essayId);
            essayData.createdAt = existingEssay.createdAt; // Keep original creation date
            userEssays.set(essayId, essayData);
          } else {
            // Create new essay
            docId = `essay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            userEssays.set(docId, essayData);
          }

          res.status(200).json({ 
            success: true, 
            essayId: docId,
            message: essayId ? 'Essay updated successfully' : 'Essay saved successfully'
          });
        } else if (action === 'version') {
          // For testing, just create a new essay with version info
          if (!essayId || !userEssays.has(essayId)) {
            return res.status(400).json({ error: 'Essay ID required for versioning' });
          }

          const originalEssay = userEssays.get(essayId);
          const versionData = {
            title: title || originalEssay.title,
            content: essay,
            prompt: prompt || originalEssay.prompt,
            targetColleges: colleges || originalEssay.targetColleges,
            analysis: analysis || null,
            userId: userId,
            parentEssayId: essayId,
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: essay ? essay.split(/\s+/).length : 0,
            version: (originalEssay.version || 1) + 1
          };

          const versionId = `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          userEssays.set(versionId, versionData);

          res.status(200).json({ 
            success: true, 
            versionId: versionId,
            version: versionData.version,
            message: 'New version created successfully'
          });
        }
        break;

      case 'GET':
        if (action === 'list') {
          // Get all main essays for user (not versions)
          const essays = Array.from(userEssays.entries())
            .map(([id, data]) => ({ id, ...data }))
            .filter(essay => !essay.parentEssayId)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          // Calculate version count for each essay
          essays.forEach(essay => {
            const versions = Array.from(userEssays.values())
              .filter(e => e.parentEssayId === essay.id);
            essay.versionCount = versions.length;
          });

          res.status(200).json({ essays });
        } else if (action === 'versions' && essayId) {
          // Get all versions of a specific essay
          const versions = Array.from(userEssays.entries())
            .map(([id, data]) => ({ id, ...data }))
            .filter(essay => essay.parentEssayId === essayId)
            .sort((a, b) => b.version - a.version);

          res.status(200).json({ versions });
        } else if (essayId) {
          // Get specific essay
          if (!userEssays.has(essayId)) {
            return res.status(404).json({ error: 'Essay not found' });
          }

          const essayData = { id: essayId, ...userEssays.get(essayId) };
          res.status(200).json({ essay: essayData });
        }
        break;

      case 'DELETE':
        if (essayId) {
          if (!userEssays.has(essayId)) {
            return res.status(404).json({ error: 'Essay not found' });
          }

          // Delete essay
          userEssays.delete(essayId);

          // Delete all versions
          const versionsToDelete = Array.from(userEssays.entries())
            .filter(([id, data]) => data.parentEssayId === essayId)
            .map(([id]) => id);

          versionsToDelete.forEach(id => userEssays.delete(id));

          res.status(200).json({ 
            success: true, 
            message: 'Essay and all versions deleted successfully' 
          });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in essay storage API:', error);
    res.status(500).json({ 
      error: 'Failed to process essay storage request',
      details: error.message
    });
  }
}
