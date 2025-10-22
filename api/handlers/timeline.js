// CONSOLIDATED Timeline API for College Climb
// Handles timeline data management AND AI-powered recommendations
// CONSOLIDATES: timeline-data.js + timeline-recommendations.js

// Rate limiting
const rateLimitMap = new Map();

function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= limit) {
    return { allowed: false, retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000) };
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return { allowed: true };
}

// Mock recommendations data
const mockRecommendations = {
  urgentTasks: [
    {
      icon: 'exclamation-triangle',
      title: 'Overdue Tasks Need Attention',
      description: 'You have overdue tasks that require immediate action to stay on track with your applications.'
    },
    {
      icon: 'clock',
      title: 'Urgent Deadlines Approaching',
      description: 'Several tasks are due within the next week. Prioritize these to avoid missing important deadlines.'
    }
  ],
  essays: [
    {
      icon: 'pen',
      title: 'Essay Writing Strategy',
      description: 'Start with brainstorming sessions for each prompt. Focus on unique experiences that showcase your personality.'
    },
    {
      icon: 'lightbulb',
      title: 'Use Essay Coach',
      description: 'Our AI Essay Coach can provide real-time feedback on your drafts and help improve your writing.'
    }
  ],
  recommendations: [
    {
      icon: 'user-friends',
      title: 'Request Recommendation Letters Early',
      description: 'Give your recommenders at least 4-6 weeks notice. Provide them with your resume and activity list.'
    }
  ],
  general: [
    {
      icon: 'star',
      title: 'Stay Organized',
      description: 'Create a dedicated folder for each college application. Keep track of passwords and login information.'
    },
    {
      icon: 'calendar',
      title: 'Set Weekly Goals',
      description: 'Break down large tasks into smaller, manageable weekly goals to maintain steady progress.'
    }
  ]
};

// ============================================
// TIMELINE DATA HANDLERS
// ============================================

async function getTimelineData(req, res) {
  try {
    const { userId } = req.query;
    
    // Mock data - in production, would fetch from Firebase
    const mockUserData = {
      userId: userId || 'demo-user',
      colleges: [
        {
          key: 'harvard',
          name: 'Harvard University',
          addedDate: new Date().toISOString(),
          applicationType: 'RD'
        }
      ],
      tasks: {},
      preferences: {
        graduationYear: 2026,
        applicationTypes: ['RD', 'EA']
      },
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: mockUserData
    });

  } catch (error) {
    console.error('Get timeline data error:', error);
    res.status(500).json({
      error: 'Failed to get timeline data',
      details: error.message
    });
  }
}

async function saveTimelineData(req, res) {
  try {
    const { userId, colleges, tasks, preferences } = req.body;

    // Mock save operation - in production, would save to Firebase
    const savedData = {
      userId,
      colleges,
      tasks,
      preferences,
      lastUpdated: new Date().toISOString()
    };

    console.log('Saving timeline data:', JSON.stringify(savedData, null, 2));

    res.status(200).json({
      success: true,
      message: 'Timeline data saved successfully',
      data: savedData
    });

  } catch (error) {
    console.error('Save timeline data error:', error);
    res.status(500).json({
      error: 'Failed to save timeline data',
      details: error.message
    });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { userId, taskId, status, notes } = req.body;

    // Validate status
    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Mock update operation
    const updatedTask = {
      taskId,
      status,
      notes: notes || '',
      updatedAt: new Date().toISOString(),
      userId
    };

    console.log('Updating task status:', updatedTask);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      error: 'Failed to update task status',
      details: error.message
    });
  }
}

// ============================================
// TIMELINE RECOMMENDATIONS HANDLERS
// ============================================

async function getRecommendations(req, res) {
  try {
    const { colleges, tasks, userProfile, timelineData } = req.body;

    // Generate AI-powered recommendations
    const recommendations = await generateTimelineRecommendations({
      colleges,
      tasks,
      userProfile,
      timelineData
    });

    res.status(200).json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Timeline recommendations error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      details: error.message
    });
  }
}

async function generateTimelineRecommendations(data) {
  const { colleges, tasks, userProfile, timelineData } = data;
  
  // Analyze user's current status
  const analysis = analyzeUserProgress(tasks, timelineData);
  const recommendations = [];

  // Generate recommendations based on analysis
  if (analysis.overdueTasks > 0) {
    recommendations.push({
      ...mockRecommendations.urgentTasks[0],
      description: `You have ${analysis.overdueTasks} overdue tasks. Focus on these immediately to stay on track.`
    });
  }

  if (analysis.urgentTasks > 0) {
    recommendations.push({
      ...mockRecommendations.urgentTasks[1],
      description: `${analysis.urgentTasks} tasks are due within the next week. Plan your time accordingly.`
    });
  }

  // Essay-specific recommendations
  if (analysis.incompleteEssays > 0) {
    recommendations.push(mockRecommendations.essays[0]);
    recommendations.push(mockRecommendations.essays[1]);
  }

  // Recommendation letter advice
  if (analysis.pendingRecommendations > 0) {
    recommendations.push(mockRecommendations.recommendations[0]);
  }

  // Add general recommendations if no urgent items
  if (recommendations.length === 0) {
    recommendations.push(...mockRecommendations.general);
  }

  // Personalize based on college types
  if (colleges && colleges.some(c => c.type === 'Ivy League')) {
    recommendations.push({
      icon: 'trophy',
      title: 'Highly Competitive Schools',
      description: 'For Ivy League applications, ensure your essays showcase unique perspectives and exceptional achievements.'
    });
  }

  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

function analyzeUserProgress(tasks, timelineData) {
  const now = new Date();
  let overdueTasks = 0;
  let urgentTasks = 0;
  let incompleteEssays = 0;
  let pendingRecommendations = 0;

  // Mock analysis - in real implementation, would analyze actual task data
  if (tasks) {
    Object.entries(tasks).forEach(([taskId, status]) => {
      if (status !== 'done') {
        // Mock logic for demonstration
        if (Math.random() > 0.8) overdueTasks++;
        if (Math.random() > 0.7) urgentTasks++;
        if (taskId.includes('essay')) incompleteEssays++;
        if (taskId.includes('recommendation')) pendingRecommendations++;
      }
    });
  }

  return {
    overdueTasks,
    urgentTasks,
    incompleteEssays,
    pendingRecommendations,
    totalTasks: tasks ? Object.keys(tasks).length : 0,
    completionRate: tasks ? 
      Object.values(tasks).filter(status => status === 'done').length / Object.keys(tasks).length : 0
  };
}

// Timeline generation utilities
function generatePersonalizedTimeline(userProfile, colleges) {
  const timeline = {
    schools: [],
    milestones: [],
    recommendations: []
  };

  colleges.forEach(college => {
    const schoolTimeline = generateSchoolTimeline(college, userProfile);
    timeline.schools.push(schoolTimeline);
  });

  // Generate major milestones
  timeline.milestones = generateMilestones(userProfile, colleges);
  
  return timeline;
}

function generateSchoolTimeline(college, userProfile) {
  const { graduationYear, applicationTypes } = userProfile;
  const applicationYear = graduationYear - 1;
  
  // Determine deadlines based on application type
  const deadlines = getApplicationDeadlines(college, applicationTypes, applicationYear);
  
  // Generate tasks based on school requirements
  const tasks = generateSchoolTasks(college, deadlines);
  
  return {
    college,
    deadlines,
    tasks,
    progress: 0
  };
}

function getApplicationDeadlines(college, applicationTypes, year) {
  const deadlines = {};
  
  // Mock deadline calculation
  if (applicationTypes.includes('ED') && college.deadlines?.ED) {
    deadlines.ED = new Date(`${year}-11-01`);
  }
  
  if (applicationTypes.includes('EA') && college.deadlines?.EA) {
    deadlines.EA = new Date(`${year}-11-15`);
  }
  
  if (applicationTypes.includes('RD') && college.deadlines?.RD) {
    deadlines.RD = new Date(`${year + 1}-01-01`);
  }
  
  deadlines.financialAid = new Date(`${year + 1}-02-01`);
  
  return deadlines;
}

function generateSchoolTasks(college, deadlines) {
  const tasks = [];
  
  // Common application tasks
  if (college.commonApp) {
    tasks.push({
      id: 'common-app-complete',
      title: 'Complete Common Application',
      category: 'Application',
      deadline: deadlines.RD || deadlines.EA || deadlines.ED,
      priority: 'high',
      estimatedTime: 240 // minutes
    });
  }
  
  // Supplemental essays
  if (college.supplementalEssays) {
    college.supplementalEssays.forEach((essay, index) => {
      tasks.push({
        id: `supplement-${index}`,
        title: essay.title || `Supplemental Essay ${index + 1}`,
        category: 'Essays',
        deadline: deadlines.RD || deadlines.EA || deadlines.ED,
        priority: 'high',
        estimatedTime: 180
      });
    });
  }
  
  // Recommendation letters
  if (college.recommendationLetters) {
    tasks.push({
      id: 'request-recommendations',
      title: 'Request Recommendation Letters',
      category: 'Recommendations',
      deadline: new Date((deadlines.RD || deadlines.EA || deadlines.ED).getTime() - 21 * 24 * 60 * 60 * 1000), // 3 weeks before
      priority: 'high',
      estimatedTime: 60
    });
  }
  
  return tasks;
}

function generateMilestones(userProfile, colleges) {
  const milestones = [];
  const { graduationYear } = userProfile;
  const seniorYear = graduationYear - 1;
  
  milestones.push({
    date: new Date(`${seniorYear}-09-01`),
    title: 'Senior Year Begins',
    description: 'Start of your final year - time to focus on applications!'
  });
  
  milestones.push({
    date: new Date(`${seniorYear}-10-01`),
    title: 'Application Season Peak',
    description: 'Most early applications are due this month'
  });
  
  milestones.push({
    date: new Date(`${seniorYear + 1}-01-01`),
    title: 'Regular Decision Deadlines',
    description: 'Final deadline for most college applications'
  });
  
  milestones.push({
    date: new Date(`${seniorYear + 1}-03-01`),
    title: 'Decision Notifications Begin',
    description: 'Start receiving admission decisions'
  });
  
  return milestones;
}

// ============================================
// MAIN HANDLER - Routes based on action
// ============================================

export default async function handler(req, res) {
  console.log('=== CONSOLIDATED TIMELINE API CALLED ===');
  console.log(`Method: ${req.method}, Action: ${req.query.action || req.body?.action}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limiting
  const identifier = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const limit = req.body?.action === 'recommendations' ? 10 : 100; // Stricter for AI
  const rateCheck = checkRateLimit(identifier, limit, 60000);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: rateCheck.retryAfter 
    });
  }

  try {
    const { method } = req;
    const action = req.query.action || req.body?.action;

    // Route to appropriate handler
    if (action === 'recommendations' && method === 'POST') {
      // AI-powered recommendations
      return await getRecommendations(req, res);
    } else if (method === 'GET') {
      // Get timeline data
      return await getTimelineData(req, res);
    } else if (method === 'POST') {
      // Save timeline data
      return await saveTimelineData(req, res);
    } else if (method === 'PUT') {
      // Update task status
      return await updateTaskStatus(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in consolidated timeline API:', error);
    return res.status(500).json({ 
      error: 'Failed to process timeline request',
      details: error.message
    });
  }
}
