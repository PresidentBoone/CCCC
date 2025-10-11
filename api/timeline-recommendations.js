// Mock AI responses for timeline recommendations
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

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { colleges, tasks, userProfile, timelineData } = req.body;

    // In a real implementation, this would use AI to analyze the user's data
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

module.exports = handler;
