// College Search API - Uses College Scorecard API
const { applyRateLimit } = require('./rate-limiter');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apply rate limiting for data endpoints
  const canProceed = await applyRateLimit(req, res, 'data');
  if (!canProceed) return;

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'College Scorecard API key not configured',
      details: 'Server configuration error'
    });
  }

  try {
    // Get search parameters
    const searchTerm = req.method === 'GET'
      ? req.query.name
      : req.body.name;

    const state = req.method === 'GET'
      ? req.query.state
      : req.body.state;

    const page = req.method === 'GET'
      ? (req.query.page || 1)
      : (req.body.page || 1);

    const perPage = req.method === 'GET'
      ? (req.query.per_page || 20)
      : (req.body.per_page || 20);

    if (!searchTerm && !state) {
      return res.status(400).json({ error: 'Search term or state required' });
    }

    // Build API URL
    let apiUrl = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}`;

    // Add filters
    const fields = [
      'id',
      'school.name',
      'school.city',
      'school.state',
      'school.school_url',
      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.average.overall',
      'latest.admissions.act_scores.midpoint.cumulative',
      'latest.student.size',
      'latest.cost.tuition.in_state',
      'latest.cost.tuition.out_of_state',
      'latest.cost.avg_net_price.overall',
      'school.degrees_awarded.predominant',
      'school.carnegie_basic',
      'school.locale'
    ].join(',');

    apiUrl += `&fields=${fields}`;
    apiUrl += `&page=${page}`;
    apiUrl += `&per_page=${perPage}`;

    // Only include schools that are currently operating
    apiUrl += `&school.operating=1`;

    // Filter by name if provided
    if (searchTerm) {
      apiUrl += `&school.name=${encodeURIComponent(searchTerm)}`;
    }

    // Filter by state if provided
    if (state) {
      apiUrl += `&school.state=${state.toUpperCase()}`;
    }

    console.log('🏫 Searching colleges:', { searchTerm, state, page });

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('College Scorecard API error:', response.status);
      return res.status(response.status).json({
        error: 'Failed to fetch college data',
        details: `API returned status ${response.status}`
      });
    }

    const data = await response.json();

    // Format the response
    const colleges = data.results.map(college => ({
      id: college.id,
      name: college['school.name'],
      city: college['school.city'],
      state: college['school.state'],
      website: college['school.school_url'],
      admissionRate: college['latest.admissions.admission_rate.overall'],
      avgSAT: college['latest.admissions.sat_scores.average.overall'],
      avgACT: college['latest.admissions.act_scores.midpoint.cumulative'],
      studentSize: college['latest.student.size'],
      inStateTuition: college['latest.cost.tuition.in_state'],
      outOfStateTuition: college['latest.cost.tuition.out_of_state'],
      avgNetPrice: college['latest.cost.avg_net_price.overall'],
      degreeType: college['school.degrees_awarded.predominant'],
      carnegieClassification: college['school.carnegie_basic'],
      locale: college['school.locale']
    }));

    res.status(200).json({
      results: colleges,
      metadata: data.metadata,
      page: page,
      perPage: perPage,
      total: data.metadata.total
    });

  } catch (error) {
    console.error('Error in college search API:', error);
    res.status(500).json({
      error: 'Failed to search colleges',
      details: error.message
    });
  }
}
