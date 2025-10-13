/**
 * 🔍 SEO Manager
 * Dynamic meta tags, structured data, and SEO optimization
 * Part of the Billion-Dollar Platform Infrastructure
 */

class SEOManager {
    constructor() {
        this.siteName = 'College Climb';
        this.baseUrl = 'https://collegeclimb.vercel.app';
        this.defaultImage = '/images/whiteclearcc.png';
        this.twitterHandle = '@CollegeClimb';
        this.init();
    }

    init() {
        this.updateMetaTags();
        this.addStructuredData();
        this.setupCanonicalUrl();
    }

    /**
     * Update Meta Tags Based on Page
     */
    updateMetaTags(options = {}) {
        const page = this.getCurrentPage();
        const pageData = this.getPageData(page);
        
        const meta = {
            title: options.title || pageData.title,
            description: options.description || pageData.description,
            keywords: options.keywords || pageData.keywords,
            image: options.image || pageData.image || this.defaultImage,
            type: options.type || pageData.type || 'website',
            url: options.url || window.location.href
        };

        // Update title
        document.title = `${meta.title} | ${this.siteName}`;

        // Update or create meta tags
        this.setMetaTag('description', meta.description);
        this.setMetaTag('keywords', meta.keywords.join(', '));

        // Open Graph tags
        this.setMetaTag('og:title', meta.title, 'property');
        this.setMetaTag('og:description', meta.description, 'property');
        this.setMetaTag('og:image', this.baseUrl + meta.image, 'property');
        this.setMetaTag('og:url', meta.url, 'property');
        this.setMetaTag('og:type', meta.type, 'property');
        this.setMetaTag('og:site_name', this.siteName, 'property');

        // Twitter Card tags
        this.setMetaTag('twitter:card', 'summary_large_image', 'name');
        this.setMetaTag('twitter:title', meta.title, 'name');
        this.setMetaTag('twitter:description', meta.description, 'name');
        this.setMetaTag('twitter:image', this.baseUrl + meta.image, 'name');
        this.setMetaTag('twitter:site', this.twitterHandle, 'name');

        // Additional SEO tags
        this.setMetaTag('robots', 'index, follow');
        this.setMetaTag('googlebot', 'index, follow');
        this.setMetaTag('author', 'College Climb');
        this.setMetaTag('language', 'English');
    }

    setMetaTag(name, content, attribute = 'name') {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('essay')) return 'essay';
        if (path.includes('discovery')) return 'discovery';
        if (path.includes('testprep')) return 'testprep';
        if (path.includes('timeline')) return 'timeline';
        if (path.includes('scholarship')) return 'scholarship';
        
        return 'home';
    }

    getPageData(page) {
        const pages = {
            home: {
                title: 'AI-Powered College Application Platform',
                description: 'Transform your college application journey with AI-powered essay coaching, personalized college matching, adaptive test prep, and smart timeline management. Get into your dream school with College Climb.',
                keywords: ['college application', 'AI essay coach', 'college admissions', 'test prep', 'SAT prep', 'ACT prep', 'college search', 'scholarship finder'],
                image: '/images/whiteclearcc.png',
                type: 'website'
            },
            dashboard: {
                title: 'Your College Application Dashboard',
                description: 'Track your college applications, essay progress, test prep scores, and deadlines all in one personalized dashboard. Stay organized and on track to your dream school.',
                keywords: ['college dashboard', 'application tracker', 'college timeline', 'application management'],
                image: '/images/CollegeClimbKidWorking.png',
                type: 'website'
            },
            essay: {
                title: 'AI Essay Coach - Get Expert Feedback Instantly',
                description: 'Get instant, detailed feedback on your college essays with our AI Essay Coach. Improve clarity, impact, and authenticity. Stand out with a compelling personal statement.',
                keywords: ['essay coach', 'college essay', 'personal statement', 'AI writing assistant', 'essay feedback', 'common app essay'],
                image: '/images/EssayBot.png',
                type: 'article'
            },
            discovery: {
                title: 'College Discovery - Find Your Perfect Match',
                description: 'Discover colleges that match your profile, interests, and goals. Get AI-powered recommendations, detailed school information, and personalized fit scores.',
                keywords: ['college search', 'college finder', 'college matching', 'college recommendations', 'find colleges'],
                image: '/images/Computer.png',
                type: 'website'
            },
            testprep: {
                title: 'Adaptive Test Prep - SAT & ACT Practice',
                description: 'Master the SAT and ACT with adaptive practice questions that adjust to your skill level. Track your progress, identify weak areas, and improve your scores.',
                keywords: ['SAT prep', 'ACT prep', 'test preparation', 'practice questions', 'standardized tests', 'college entrance exams'],
                image: '/images/Computer.png',
                type: 'website'
            },
            timeline: {
                title: 'Application Timeline - Never Miss a Deadline',
                description: 'Stay on top of every college application deadline with smart reminders, milestone tracking, and personalized recommendations for what to do next.',
                keywords: ['application timeline', 'college deadlines', 'application tracker', 'deadline reminders'],
                image: '/images/Application.png',
                type: 'website'
            },
            scholarship: {
                title: 'Scholarship Finder - Discover Free Money for College',
                description: 'Find personalized scholarship opportunities worth thousands of dollars. Get matched with scholarships that fit your profile, interests, and achievements.',
                keywords: ['scholarship finder', 'college scholarships', 'financial aid', 'scholarship search', 'free money for college'],
                image: '/images/Computer.png',
                type: 'website'
            }
        };

        return pages[page] || pages.home;
    }

    /**
     * Add Structured Data (Schema.org)
     */
    addStructuredData() {
        const page = this.getCurrentPage();
        let structuredData = null;

        if (page === 'home') {
            structuredData = this.getOrganizationSchema();
        } else if (page === 'essay') {
            structuredData = this.getArticleSchema();
        } else if (page === 'dashboard') {
            structuredData = this.getWebApplicationSchema();
        }

        if (structuredData) {
            this.insertStructuredData(structuredData);
        }

        // Add breadcrumbs
        this.addBreadcrumbSchema();
    }

    getOrganizationSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'College Climb',
            'url': this.baseUrl,
            'logo': this.baseUrl + '/images/whiteclearcc.png',
            'description': 'AI-powered college application platform helping students get into their dream schools',
            'sameAs': [
                'https://twitter.com/collegeclimb',
                'https://facebook.com/collegeclimb',
                'https://instagram.com/collegeclimb'
            ],
            'contactPoint': {
                '@type': 'ContactPoint',
                'contactType': 'Customer Support',
                'email': 'support@collegeclimb.com'
            }
        };
    }

    getArticleSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': 'AI-Powered Essay Coaching',
            'description': 'Get instant feedback on your college essays with AI',
            'image': this.baseUrl + '/images/EssayBot.png',
            'author': {
                '@type': 'Organization',
                'name': 'College Climb'
            },
            'publisher': {
                '@type': 'Organization',
                'name': 'College Climb',
                'logo': {
                    '@type': 'ImageObject',
                    'url': this.baseUrl + '/images/whiteclearcc.png'
                }
            }
        };
    }

    getWebApplicationSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'College Climb Dashboard',
            'description': 'Comprehensive college application management platform',
            'applicationCategory': 'EducationalApplication',
            'operatingSystem': 'Any',
            'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD'
            }
        };
    }

    addBreadcrumbSchema() {
        const breadcrumbs = this.getBreadcrumbs();
        
        if (breadcrumbs.length > 1) {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': breadcrumbs.map((crumb, index) => ({
                    '@type': 'ListItem',
                    'position': index + 1,
                    'name': crumb.name,
                    'item': this.baseUrl + crumb.url
                }))
            };

            this.insertStructuredData(schema, 'breadcrumb');
        }
    }

    getBreadcrumbs() {
        const path = window.location.pathname;
        const breadcrumbs = [{ name: 'Home', url: '/' }];

        if (path.includes('dashboard')) {
            breadcrumbs.push({ name: 'Dashboard', url: '/dashboard' });
        } else if (path.includes('essay')) {
            breadcrumbs.push({ name: 'Essay Coach', url: '/essay-coach' });
        } else if (path.includes('discovery')) {
            breadcrumbs.push({ name: 'College Discovery', url: '/discovery' });
        } else if (path.includes('testprep')) {
            breadcrumbs.push({ name: 'Test Prep', url: '/testprep' });
        } else if (path.includes('timeline')) {
            breadcrumbs.push({ name: 'Timeline', url: '/timeline' });
        } else if (path.includes('scholarship')) {
            breadcrumbs.push({ name: 'Scholarships', url: '/scholarship' });
        }

        return breadcrumbs;
    }

    insertStructuredData(data, id = 'structured-data') {
        // Remove existing
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }

        // Add new
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    /**
     * Setup Canonical URL
     */
    setupCanonicalUrl() {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }

        // Remove query parameters and hash for canonical
        const cleanUrl = window.location.origin + window.location.pathname;
        canonical.href = cleanUrl;
    }

    /**
     * Track SEO Events (for analytics)
     */
    static trackSEOEvent(eventName, data = {}) {
        if (window.analytics) {
            window.analytics.track(`SEO: ${eventName}`, {
                page: window.location.pathname,
                ...data
            });
        }
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.seoManager = new SEOManager();
    });
} else {
    window.seoManager = new SEOManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOManager;
}
