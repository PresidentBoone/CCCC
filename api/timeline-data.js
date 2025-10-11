// API endpoint for timeline data management
async function handler(req, res) {
  if (req.method === 'GET') {
    return getTimelineData(req, res);
  } else if (req.method === 'POST') {
    return saveTimelineData(req, res);
  } else if (req.method === 'PUT') {
    return updateTaskStatus(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

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

module.exports = handler;
