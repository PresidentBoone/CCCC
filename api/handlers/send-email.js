/**
 * SendGrid Email Handler
 * Sends transactional emails using SendGrid
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn('⚠️ SENDGRID_API_KEY not set - emails will not be sent');
}

// Load email templates
const EMAIL_TEMPLATES = require('../../public/data/email-templates');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            templateId,
            to,
            data = {},
            subject: customSubject,
            bcc
        } = req.body;

        // Validate required fields
        if (!templateId || !to) {
            return res.status(400).json({
                error: 'Missing required fields: templateId, to'
            });
        }

        // Check if SendGrid is configured
        if (!process.env.SENDGRID_API_KEY) {
            console.log(`📧 [DEV MODE] Would send email:
Template: ${templateId}
To: ${to}
Data:`, data);

            return res.status(200).json({
                success: true,
                message: 'Email queued (dev mode - not actually sent)',
                templateId,
                to
            });
        }

        // Get template
        const template = EMAIL_TEMPLATES[templateId];
        if (!template) {
            return res.status(400).json({
                error: `Invalid template ID: ${templateId}`,
                availableTemplates: Object.keys(EMAIL_TEMPLATES)
            });
        }

        // Generate email content
        const html = template.getHtml(data);
        const subject = customSubject ||
                       (typeof template.subject === 'function'
                           ? template.subject(data)
                           : template.subject);

        // Prepare email
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || 'noreply@collegeclimb.com',
                name: process.env.SENDGRID_FROM_NAME || 'College Climb'
            },
            subject,
            html,
            // Add text fallback (strip HTML tags)
            text: html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        };

        // Add BCC if provided
        if (bcc) {
            msg.bcc = bcc;
        }

        // Add tracking
        msg.trackingSettings = {
            clickTracking: { enable: true },
            openTracking: { enable: true }
        };

        // Send email
        await sgMail.send(msg);

        console.log(`✅ Email sent: ${templateId} to ${to}`);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            templateId,
            to
        });

    } catch (error) {
        console.error('Email send error:', error);

        // SendGrid-specific error handling
        if (error.response) {
            const { message, code, response } = error;
            return res.status(500).json({
                error: 'Failed to send email',
                message: message || 'SendGrid error',
                code,
                details: response?.body?.errors
            });
        }

        res.status(500).json({
            error: error.message || 'Failed to send email'
        });
    }
};

/**
 * Helper function to send welcome email
 * Can be imported and used by other handlers
 */
async function sendWelcomeEmail(userEmail, userName, userId) {
    const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            templateId: 'WELCOME',
            to: userEmail,
            data: {
                userName,
                dashboardUrl: `${process.env.APP_URL || 'https://collegeclimb.com'}/dashboard.html`,
                unsubscribeUrl: `${process.env.APP_URL || 'https://collegeclimb.com'}/unsubscribe?user=${userId}`
            }
        })
    });
    return response.json();
}

module.exports.sendWelcomeEmail = sendWelcomeEmail;
