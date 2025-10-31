/**
 * Email Templates
 * Pre-configured email templates for transactional emails
 */

const EMAIL_TEMPLATES = {
    WELCOME: {
        id: 'welcome',
        subject: 'Welcome to College Climb! 🎓',
        getHtml: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 10px 0; padding-left: 30px; position: relative; }
        .feature-list li:before { content: '✓'; position: absolute; left: 0; color: #a07bcc; font-weight: bold; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to College Climb!</h1>
            <p>Your journey to college starts here 🚀</p>
        </div>
        <div class="content">
            <h2>Hi ${data.userName || 'there'}!</h2>
            <p>We're thrilled to have you join College Climb! You've just unlocked the most powerful AI-powered college admissions platform.</p>

            <p><strong>Here's what you can do right now:</strong></p>
            <ul class="feature-list">
                <li><strong>Take your diagnostic test</strong> - See where you stand with SAT/ACT prep</li>
                <li><strong>Start your first essay</strong> - Get AI-powered feedback instantly</li>
                <li><strong>Search colleges</strong> - Find your perfect match from thousands of schools</li>
                <li><strong>Earn coins</strong> - Complete tasks and spin the daily wheel!</li>
            </ul>

            <p style="text-align: center;">
                <a href="${data.dashboardUrl || 'https://collegeclimb.com/dashboard.html'}" class="button">Go to Dashboard</a>
            </p>

            <p><strong>Pro Tip:</strong> Set up your profile and complete a diagnostic test to unlock personalized recommendations!</p>

            <p>Need help? Just reply to this email - we're here for you.</p>

            <p>Let's climb together! 🎓<br>
            The College Climb Team</p>
        </div>
        <div class="footer">
            <p>College Climb | AI-Powered College Admissions</p>
            <p><a href="${data.unsubscribeUrl || '#'}" style="color: #666;">Unsubscribe</a> | <a href="https://collegeclimb.com" style="color: #666;">Visit Website</a></p>
        </div>
    </div>
</body>
</html>
        `
    },

    DEADLINE_REMINDER: {
        id: 'deadline_reminder',
        subject: (data) => `⏰ Reminder: ${data.deadlineTitle} due ${data.daysUntil} days`,
        getHtml: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #f59e0b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .deadline-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Deadline Reminder</h1>
        </div>
        <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>Don't forget - you have an upcoming deadline:</p>

            <div class="deadline-box">
                <h3 style="margin-top: 0;">${data.deadlineTitle}</h3>
                <p><strong>Due:</strong> ${data.deadlineDate}</p>
                <p><strong>Time remaining:</strong> ${data.daysUntil} days</p>
                ${data.deadlineDescription ? `<p>${data.deadlineDescription}</p>` : ''}
            </div>

            <p style="text-align: center;">
                <a href="${data.actionUrl}" class="button">View Details</a>
            </p>

            <p><strong>Stay on track!</strong> Log in to College Climb to manage your deadlines and stay organized.</p>

            <p>Good luck!<br>
            The College Climb Team</p>
        </div>
        <div class="footer">
            <p><a href="${data.unsubscribeUrl || '#'}" style="color: #666;">Unsubscribe from deadline reminders</a></p>
        </div>
    </div>
</body>
</html>
        `
    },

    PAYMENT_SUCCESS: {
        id: 'payment_success',
        subject: (data) => `Payment Confirmed - Welcome to ${data.tierName}! 🎉`,
        getHtml: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .receipt-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 6px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Payment Confirmed!</h1>
            <p>Welcome to ${data.tierName}</p>
        </div>
        <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>Your payment was successful. You now have full access to all ${data.tierName} features!</p>

            <div class="receipt-box">
                <h3 style="margin-top: 0;">Receipt</h3>
                <p><strong>Plan:</strong> College Climb ${data.tierName}</p>
                <p><strong>Amount:</strong> $${data.amount}</p>
                <p><strong>Billing Period:</strong> ${data.billingPeriod || 'Monthly'}</p>
                <p><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
                <p><strong>Invoice:</strong> <a href="${data.invoiceUrl}">View Invoice</a></p>
            </div>

            <p><strong>What's unlocked:</strong></p>
            <ul>
                ${(data.features || []).map(f => `<li>${f}</li>`).join('')}
            </ul>

            <p style="text-align: center;">
                <a href="${data.dashboardUrl || 'https://collegeclimb.com/dashboard.html'}" class="button">Start Using ${data.tierName}</a>
            </p>

            <p><strong>Manage Your Subscription:</strong> You can update your payment method or cancel anytime from your <a href="${data.billingPortalUrl}">account settings</a>.</p>

            <p>Thank you for choosing College Climb!<br>
            The College Climb Team</p>
        </div>
        <div class="footer">
            <p>Questions? Reply to this email or visit our <a href="https://collegeclimb.com/help" style="color: #666;">Help Center</a></p>
        </div>
    </div>
</body>
</html>
        `
    },

    PAYMENT_FAILED: {
        id: 'payment_failed',
        subject: '⚠️ Payment Failed - Action Required',
        getHtml: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #ef4444; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 15px 30px; background: #ef4444; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Payment Failed</h1>
        </div>
        <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>We tried to process your payment for College Climb ${data.tierName}, but it didn't go through.</p>

            <div class="warning-box">
                <h3 style="margin-top: 0;">Action Required</h3>
                <p><strong>Amount:</strong> $${data.amount}</p>
                <p><strong>Reason:</strong> ${data.failureReason || 'Your card was declined'}</p>
                <p><strong>Next Attempt:</strong> ${data.nextAttemptDate || 'In 3 days'}</p>
            </div>

            <p><strong>To avoid losing access to your ${data.tierName} features:</strong></p>
            <ol>
                <li>Update your payment method</li>
                <li>Ensure your card has sufficient funds</li>
                <li>Contact your bank if needed</li>
            </ol>

            <p style="text-align: center;">
                <a href="${data.updatePaymentUrl}" class="button">Update Payment Method</a>
            </p>

            <p>Need help? Reply to this email and we'll assist you.</p>

            <p>Best regards,<br>
            The College Climb Team</p>
        </div>
        <div class="footer">
            <p><a href="https://collegeclimb.com/help/billing" style="color: #666;">Billing FAQ</a></p>
        </div>
    </div>
</body>
</html>
        `
    },

    SUBSCRIPTION_CANCELED: {
        id: 'subscription_canceled',
        subject: 'Your subscription has been canceled',
        getHtml: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #6b7280; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .info-box { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscription Canceled</h1>
        </div>
        <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>We're sorry to see you go! Your College Climb ${data.tierName} subscription has been canceled.</p>

            <div class="info-box">
                <h3 style="margin-top: 0;">What This Means</h3>
                <p><strong>Access Until:</strong> ${data.accessUntilDate}</p>
                <p>You'll continue to have full ${data.tierName} access until the end of your billing period.</p>
                <p>After that, your account will revert to the Free tier.</p>
            </div>

            <p><strong>What You'll Keep:</strong></p>
            <ul>
                <li>All your essays and work (saved forever)</li>
                <li>Your casino progress and coins</li>
                <li>College lists and application tracking</li>
            </ul>

            <p><strong>What Changes:</strong></p>
            <ul>
                <li>AI essay reviews limited to 3 per month</li>
                <li>Practice questions limited to 50</li>
                <li>Premium features locked</li>
            </ul>

            <p><strong>Changed your mind?</strong> You can reactivate anytime!</p>

            <p style="text-align: center;">
                <a href="${data.reactivateUrl}" class="button">Reactivate Subscription</a>
            </p>

            <p>We'd love your feedback: <strong>Why did you cancel?</strong> Reply to this email and let us know how we can improve.</p>

            <p>Thank you for being part of College Climb!<br>
            The College Climb Team</p>
        </div>
        <div class="footer">
            <p><a href="https://collegeclimb.com/pricing" style="color: #666;">View Plans</a> | <a href="https://collegeclimb.com" style="color: #666;">Visit Website</a></p>
        </div>
    </div>
</body>
</html>
        `
    },

    ESSAY_FEEDBACK_READY: {
        id: 'essay_feedback_ready',
        subject: '✍️ Your essay feedback is ready!',
        getHtml: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✍️ Essay Feedback Ready!</h1>
        </div>
        <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>Great news! Your AI-powered essay feedback is ready for <strong>"${data.essayTitle}"</strong>.</p>

            <p><strong>Your Essay Score: ${data.score || 'N/A'}/100</strong></p>

            <p>We've analyzed:</p>
            <ul>
                <li>Grammar and clarity</li>
                <li>Structure and flow</li>
                <li>Tone and voice</li>
                <li>College-specific fit</li>
            </ul>

            <p style="text-align: center;">
                <a href="${data.essayUrl}" class="button">View Feedback</a>
            </p>

            <p><strong>Pro Tip:</strong> Use the feedback to revise your essay, then submit it again for another round of AI analysis!</p>

            <p>Keep climbing!<br>
            The College Climb Team</p>
        </div>
        <div class="footer">
            <p><a href="https://collegeclimb.com/essaycoach.html" style="color: #666;">Essay Coach</a></p>
        </div>
    </div>
</body>
</html>
        `
    }
};

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EMAIL_TEMPLATES;
} else {
    window.EMAIL_TEMPLATES = EMAIL_TEMPLATES;
}
