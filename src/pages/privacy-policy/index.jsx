import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavigation from '../../components/PublicNavigation';
import Icon from '../../components/AppIcon';

const PrivacyPolicyPage = () => {
  const lastUpdated = "20 November 2024";

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {lastUpdated}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} />
              <span>GDPR & UK GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={16} />
              <span>Applicable to users in the United Kingdom and Ireland</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                HyvHub ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
              <p>
                This policy complies with the General Data Protection Regulation (GDPR), UK GDPR, Data Protection Act 2018 (UK), and Irish Data Protection Acts.
              </p>
              <p>
                <strong>Data Controller:</strong> HyvHub Ltd, London, United Kingdom
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>2.1 Information You Provide:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, username, email address, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Bio, location, website, social media links, skills, interests</li>
                <li><strong>Payment Information:</strong> Credit card details (processed by Stripe, we do not store full card numbers)</li>
                <li><strong>Code Content:</strong> Code snippets, comments, reviews, and related metadata</li>
                <li><strong>Communications:</strong> Messages, support requests, feedback</li>
              </ul>

              <p><strong>2.2 Information Collected Automatically:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, interactions</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                <li><strong>Log Data:</strong> Access times, error logs, performance metrics</li>
              </ul>

              <p><strong>2.3 Information from Third Parties:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>OAuth Providers:</strong> If you sign in with GitHub, Google, or other OAuth providers</li>
                <li><strong>Payment Processors:</strong> Transaction confirmations from Stripe</li>
                <li><strong>AI Services:</strong> Processing results from OpenAI GPT-4</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>3.1 Lawful Basis for Processing (GDPR Article 6):</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contractual Necessity:</strong> To provide the Service you requested</li>
                <li><strong>Legitimate Interest:</strong> To improve our Service, prevent fraud, ensure security</li>
                <li><strong>Consent:</strong> For marketing communications, optional features</li>
                <li><strong>Legal Obligation:</strong> To comply with legal requirements</li>
              </ul>

              <p><strong>3.2 Purposes of Processing:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Analyze code using AI (OpenAI GPT-4) for quality insights</li>
                <li>Personalize your experience and provide recommendations</li>
                <li>Send transactional emails and notifications</li>
                <li>Respond to support requests and communications</li>
                <li>Monitor usage, detect fraud, and ensure security</li>
                <li>Comply with legal obligations and enforce our Terms</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>
          </section>

          {/* AI Processing & Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. AI Processing & Third-Party Data Sharing</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>4.1 OpenAI GPT-4 Processing:</strong></p>
              <p>
                We use OpenAI's GPT-4 to analyze your code snippets for quality, security, and best practices. Your code is sent to OpenAI's servers for processing. OpenAI is GDPR-compliant and has appropriate data processing agreements.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>What We Send:</strong> Code content, programming language, context</li>
                <li><strong>What We Receive:</strong> Quality scores, tags, suggestions, security analysis</li>
                <li><strong>Retention:</strong> OpenAI does not retain your data for training (per our agreement)</li>
                <li><strong>Control:</strong> You can opt out of AI analysis by marking snippets as private</li>
              </ul>

              <p><strong>4.2 Supabase (Data Storage):</strong></p>
              <p>
                We use Supabase for database and file storage. Supabase is hosted on AWS with EU data centers, ensuring GDPR compliance.
              </p>

              <p><strong>4.3 Stripe (Payment Processing):</strong></p>
              <p>
                Payment information is processed by Stripe. We do not store your full credit card details. Stripe is PCI-DSS compliant and GDPR-certified.
              </p>

              <p><strong>4.4 Data Processing Agreements:</strong></p>
              <p>
                All third-party processors have signed Data Processing Agreements (DPAs) with us, ensuring GDPR compliance and appropriate security measures.
              </p>
            </div>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Storage & Security</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>5.1 Data Location:</strong></p>
              <p>
                Your data is primarily stored in EU data centers (Frankfurt, Germany) operated by Supabase/AWS. Some processing may occur in the US (OpenAI) with appropriate safeguards under GDPR Article 46.
              </p>

              <p><strong>5.2 Security Measures:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication</li>
                <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
                <li><strong>Incident Response:</strong> 72-hour breach notification protocol</li>
                <li><strong>Row Level Security:</strong> Database-level access controls</li>
                <li><strong>Backup & Recovery:</strong> Daily backups with 30-day retention</li>
              </ul>

              <p><strong>5.3 Data Retention:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Closed Accounts:</strong> Data deleted 30 days after account closure (unless legally required)</li>
                <li><strong>Backups:</strong> Backup data retained for 90 days for disaster recovery</li>
                <li><strong>Legal Holds:</strong> Data retained longer if required by law or legal proceedings</li>
              </ul>
            </div>
          </section>

          {/* Your GDPR Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights Under GDPR</h2>
            <div className="space-y-4 text-gray-700">
              <p>Under GDPR and UK GDPR, you have the following rights:</p>

              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="font-semibold text-blue-900">Right of Access (Article 15)</p>
                  <p className="text-blue-800 text-sm">Request a copy of your personal data</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Right to Rectification (Article 16)</p>
                  <p className="text-blue-800 text-sm">Correct inaccurate or incomplete data</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Right to Erasure (Article 17)</p>
                  <p className="text-blue-800 text-sm">Request deletion of your data ("right to be forgotten")</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Right to Restriction (Article 18)</p>
                  <p className="text-blue-800 text-sm">Limit how we use your data</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Right to Data Portability (Article 20)</p>
                  <p className="text-blue-800 text-sm">Receive your data in a machine-readable format</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Right to Object (Article 21)</p>
                  <p className="text-blue-800 text-sm">Object to processing based on legitimate interests</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Right to Withdraw Consent</p>
                  <p className="text-blue-800 text-sm">Withdraw consent for processing where consent is the legal basis</p>
                </div>
              </div>

              <p><strong>How to Exercise Your Rights:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email:</strong> privacy@hyvhub.com</li>
                <li><strong>Settings:</strong> Many rights can be exercised directly in your account settings</li>
                <li><strong>Response Time:</strong> We will respond within 30 days (extendable to 60 days for complex requests)</li>
                <li><strong>Verification:</strong> We may need to verify your identity before processing requests</li>
              </ul>

              <p><strong>Complaint Right:</strong></p>
              <p>
                You have the right to lodge a complaint with the Information Commissioner's Office (ICO) in the UK or the Data Protection Commission (DPC) in Ireland if you believe we have violated your rights.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies & Tracking Technologies</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>7.1 Types of Cookies We Use:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service</li>
                <li><strong>Marketing Cookies:</strong> Track conversion and ad effectiveness (with consent)</li>
              </ul>

              <p><strong>7.2 Cookie Management:</strong></p>
              <p>
                You can control cookies through your browser settings. Note that disabling essential cookies may affect functionality. We respect "Do Not Track" signals where technically feasible.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Our Service is not intended for children under 16 (18 in Ireland). We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Your data may be transferred to countries outside the EU/UK for AI processing (OpenAI in the US). These transfers are protected by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>OpenAI's GDPR-compliant data processing terms</li>
                <li>Additional security measures and safeguards</li>
              </ul>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We may update this Privacy Policy from time to time. Material changes will be notified via email or platform notification at least 30 days before taking effect. Continued use of the Service after changes constitutes acceptance.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Data Controller:</strong></p>
              <ul className="space-y-2">
                <li><strong>Company:</strong> HyvHub Ltd</li>
                <li><strong>Address:</strong> London, United Kingdom</li>
                <li><strong>Privacy Email:</strong> privacy@hyvhub.com</li>
                <li><strong>Support:</strong> <Link to="/contact" className="text-blue-600 hover:underline">Contact Page</Link></li>
              </ul>

              <p><strong>Supervisory Authorities:</strong></p>
              <ul className="space-y-2">
                <li><strong>UK:</strong> Information Commissioner's Office (ICO) - ico.org.uk</li>
                <li><strong>Ireland:</strong> Data Protection Commission (DPC) - dataprotection.ie</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Related Links */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Related Documents</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms-of-service" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Icon name="FileText" size={16} />
              Terms of Service
            </Link>
            <Link to="/help-center" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Icon name="HelpCircle" size={16} />
              Help Center
            </Link>
            <Link to="/contact" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Icon name="Mail" size={16} />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;