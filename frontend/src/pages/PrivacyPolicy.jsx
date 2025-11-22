import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Privacy Policy</h1>
            <p><strong>Last updated:</strong> November 22, 2025</p>

            <h2>Information We Collect</h2>
            <p>
                Email Agent collects and processes the following information when you use our service:
            </p>
            <ul>
                <li><strong>Account Information:</strong> Your name and email address when you register</li>
                <li><strong>Gmail Data:</strong> When you connect your Gmail account, we access your emails to provide categorization and response generation services</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
                <li>Provide email categorization and AI-powered response suggestions</li>
                <li>Store your email data securely in our database</li>
                <li>Improve our service</li>
            </ul>

            <h2>Data Storage</h2>
            <p>
                Your data is stored securely in MongoDB Atlas with industry-standard encryption.
                We do not share your data with third parties except as required to provide our service (e.g., AI processing via Groq API).
            </p>

            <h2>Gmail API Usage</h2>
            <p>
                Email Agent's use of information received from Gmail APIs adheres to{' '}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
                    Google API Services User Data Policy
                </a>, including the Limited Use requirements.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
                <li>Access your data</li>
                <li>Delete your account and all associated data</li>
                <li>Revoke Gmail access at any time through your Google Account settings</li>
            </ul>

            <h2>Contact</h2>
            <p>
                For privacy concerns, please contact us at: <strong>chakri.thotakura@vitstudent.ac.in</strong>
            </p>
        </div>
    );
}
