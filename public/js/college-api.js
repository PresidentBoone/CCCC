// College Search API Helper
// This module provides functions to search and fetch college data using the College Scorecard API

/**
 * Search for colleges by name
 * @param {string} searchTerm - The college name to search for
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Results per page (default: 20)
 * @returns {Promise<Object>} - Search results with college data
 */
export async function searchCollegesByName(searchTerm, page = 1, perPage = 20) {
    try {
        const response = await fetch(`/api/college-search?name=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching colleges:', error);
        throw error;
    }
}

/**
 * Search for colleges by state
 * @param {string} state - Two-letter state code (e.g., 'CA', 'NY')
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Results per page (default: 20)
 * @returns {Promise<Object>} - Search results with college data
 */
export async function searchCollegesByState(state, page = 1, perPage = 20) {
    try {
        const response = await fetch(`/api/college-search?state=${state.toUpperCase()}&page=${page}&per_page=${perPage}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching colleges by state:', error);
        throw error;
    }
}

/**
 * Format admission rate as percentage
 * @param {number} rate - Admission rate (0-1)
 * @returns {string} - Formatted percentage
 */
export function formatAdmissionRate(rate) {
    if (!rate) return 'N/A';
    return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Format currency
 * @param {number} amount - Dollar amount
 * @returns {string} - Formatted currency
 */
export function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A';
    return `$${amount.toLocaleString()}`;
}

/**
 * Format student size
 * @param {number} size - Number of students
 * @returns {string} - Formatted size
 */
export function formatStudentSize(size) {
    if (!size) return 'N/A';
    if (size < 1000) return 'Small (<1,000)';
    if (size < 5000) return 'Medium (1,000-5,000)';
    if (size < 15000) return 'Large (5,000-15,000)';
    return 'Very Large (15,000+)';
}

/**
 * Get selectivity category based on admission rate
 * @param {number} rate - Admission rate (0-1)
 * @returns {string} - Selectivity category
 */
export function getSelectivityCategory(rate) {
    if (!rate) return 'Unknown';
    const percentage = rate * 100;

    if (percentage < 10) return 'Most Competitive';
    if (percentage < 25) return 'Highly Competitive';
    if (percentage < 50) return 'Very Competitive';
    if (percentage < 75) return 'Competitive';
    return 'Less Competitive';
}

/**
 * Create college card HTML
 * @param {Object} college - College data object
 * @returns {string} - HTML string for college card
 */
export function createCollegeCard(college) {
    const admissionRate = formatAdmissionRate(college.admissionRate);
    const inStateTuition = formatCurrency(college.inStateTuition);
    const outOfStateTuition = formatCurrency(college.outOfStateTuition);
    const selectivity = getSelectivityCategory(college.admissionRate);
    const studentSize = formatStudentSize(college.studentSize);

    return `
        <div class="college-card" data-college-id="${college.id}">
            <div class="college-card-header">
                <h3>${college.name}</h3>
                <div class="college-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${college.city}, ${college.state}
                </div>
            </div>

            <div class="college-stats">
                <div class="stat-item">
                    <span class="stat-label">Acceptance Rate</span>
                    <span class="stat-value">${admissionRate}</span>
                    <span class="stat-badge">${selectivity}</span>
                </div>

                ${college.avgSAT ? `
                <div class="stat-item">
                    <span class="stat-label">Average SAT</span>
                    <span class="stat-value">${college.avgSAT}</span>
                </div>
                ` : ''}

                ${college.avgACT ? `
                <div class="stat-item">
                    <span class="stat-label">Average ACT</span>
                    <span class="stat-value">${college.avgACT}</span>
                </div>
                ` : ''}

                <div class="stat-item">
                    <span class="stat-label">Student Size</span>
                    <span class="stat-value">${college.studentSize ? college.studentSize.toLocaleString() : 'N/A'}</span>
                    <span class="stat-badge">${studentSize}</span>
                </div>

                <div class="stat-item">
                    <span class="stat-label">In-State Tuition</span>
                    <span class="stat-value">${inStateTuition}</span>
                </div>

                <div class="stat-item">
                    <span class="stat-label">Out-of-State Tuition</span>
                    <span class="stat-value">${outOfStateTuition}</span>
                </div>
            </div>

            <div class="college-card-footer">
                ${college.website ? `
                <a href="${college.website}" target="_blank" class="btn-secondary">
                    <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
                ` : ''}
                <button onclick="addToMyList('${college.id}', '${college.name.replace(/'/g, "\\'")}')" class="btn-primary">
                    <i class="fas fa-plus"></i> Add to My List
                </button>
            </div>
        </div>
    `;
}

/**
 * Display loading state
 * @param {HTMLElement} container - Container element
 */
export function showLoading(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="width: 60px; height: 60px; border: 4px solid rgba(160, 123, 204, 0.3); border-top-color: #a07bcc; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p style="color: #666;">Searching colleges...</p>
        </div>
    `;
}

/**
 * Display error state
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message
 */
export function showError(container, message) {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <h3 style="color: #ef4444; margin-bottom: 0.5rem;">Search Failed</h3>
            <p style="color: #666;">${message}</p>
        </div>
    `;
}

/**
 * Display no results state
 * @param {HTMLElement} container - Container element
 */
export function showNoResults(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h3 style="color: #666; margin-bottom: 0.5rem;">No Colleges Found</h3>
            <p style="color: #999;">Try adjusting your search terms</p>
        </div>
    `;
}
