import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavigation from '../../components/PublicNavigation';
import Icon from '../../components/AppIcon';

const TermsOfServicePage = () => {
  const lastUpdated = "20 November 2024";

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {lastUpdated}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Icon name="MapPin" size={16} />
            <span>Applicable to users in the United Kingdom and Ireland</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Welcome to HyvHub ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the HyvHub platform, website, and services (collectively, the "Service").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Service.
              </p>
              <p>
                These Terms comply with UK and Irish law, including the Consumer Rights Act 2015 (UK), Consumer Rights Directive (Ireland), and General Data Protection Regulation (GDPR).
              </p>
            </div>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>2.1 Eligibility:</strong> You must be at least 16 years old to use our Service (18 in Ireland). By using the Service, you represent and warrant that you meet this age requirement.</p>
              <p><strong>2.2 Account Security:</strong> You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
              <p><strong>2.3 Account Information:</strong> You must provide accurate, complete, and up-to-date information when creating an account. Failure to do so constitutes a breach of these Terms.</p>
              <p><strong>2.4 One Account:</strong> You may not create multiple accounts to circumvent service limitations or restrictions.</p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Acceptable Use Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload or share malicious code, viruses, or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Scrape or data mine content without permission</li>
              </ul>
            </div>
          </section>

          {/* Code Ownership & Licensing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Code Ownership & Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>4.1 Your Content:</strong> You retain all rights to code snippets and content you upload ("Your Content"). By uploading content, you grant us a license to store, display, and process it to provide the Service.</p>
              <p><strong>4.2 Public Snippets:</strong> When you mark snippets as "Public," you grant other users a non-exclusive license to view, copy, and use your code for educational and development purposes.</p>
              <p><strong>4.3 Private Snippets:</strong> Private snippets remain confidential and are only accessible to you and team members you explicitly authorize.</p>
              <p><strong>4.4 AI Processing:</strong> By using our Service, you consent to Your Content being processed by our AI systems (OpenAI GPT-4) for analysis, tagging, and quality assessment. AI processing is subject to our Privacy Policy.</p>
              <p><strong>4.5 Our Intellectual Property:</strong> The HyvHub platform, including its design, features, and technology, is our property and is protected by copyright, trademark, and other intellectual property laws.</p>
            </div>
          </section>

          {/* Payments & Subscriptions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payments & Subscriptions</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>5.1 Pricing:</strong> Subscription fees are stated in GBP (£) or EUR (€) and exclude applicable VAT, which will be added at checkout.</p>
              <p><strong>5.2 Payment Processing:</strong> Payments are processed through Stripe. By providing payment information, you authorize us to charge your payment method.</p>
              <p><strong>5.3 Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date. You will be charged the then-current rate.</p>
              <p><strong>5.4 Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.</p>
              <p><strong>5.5 Refunds:</strong> We offer a 30-day money-back guarantee on all paid plans. Contact support for refund requests. Refunds comply with UK Consumer Rights Act 2015 and Irish Consumer Rights.</p>
              <p><strong>5.6 Price Changes:</strong> We may change subscription prices with 30 days' notice. Continued use after the notice period constitutes acceptance.</p>
            </div>
          </section>

          {/* Data Processing & AI */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Processing & AI Services</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>6.1 AI Analysis:</strong> Our AI features use OpenAI's GPT-4 to analyze code quality, security, and best practices. Your code is processed in accordance with our Privacy Policy.</p>
              <p><strong>6.2 Third-Party Processing:</strong> We use Supabase for data storage and OpenAI for AI processing. These services comply with GDPR and have appropriate data processing agreements.</p>
              <p><strong>6.3 Data Retention:</strong> We retain your data as described in our Privacy Policy. You may request data deletion at any time.</p>
              <p><strong>6.4 Data Security:</strong> We implement industry-standard security measures including encryption, access controls, and regular security audits.</p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>7.1 Your Rights:</strong> You may terminate your account at any time through Settings. Upon termination, your right to use the Service ceases immediately.</p>
              <p><strong>7.2 Our Rights:</strong> We may suspend or terminate your access if you breach these Terms or for any other reason with reasonable notice, except in cases of serious breach where immediate termination may apply.</p>
              <p><strong>7.3 Effect of Termination:</strong> Upon termination, you may export your data for 30 days. After 30 days, your data will be deleted in accordance with our data retention policy.</p>
            </div>
          </section>

          {/* Warranties & Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Warranties & Disclaimers</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>8.1 Service Availability:</strong> We strive for 99.9% uptime but do not guarantee uninterrupted service. Maintenance and updates may cause temporary unavailability.</p>
              <p><strong>8.2 AI Accuracy:</strong> AI-generated insights are recommendations only. We do not warrant the accuracy, completeness, or reliability of AI analysis. Always review AI suggestions.</p>
              <p><strong>8.3 User Content:</strong> We are not responsible for user-generated content. Users are solely responsible for code they upload and share.</p>
              <p><strong>8.4 Consumer Rights:</strong> Nothing in these Terms affects your statutory rights under UK or Irish consumer protection laws.</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>9.1 UK/Ireland Compliance:</strong> We do not exclude or limit liability for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Death or personal injury caused by negligence</li>
                <li>Fraud or fraudulent misrepresentation</li>
                <li>Any other liability that cannot be excluded under UK or Irish law</li>
              </ul>
              <p><strong>9.2 Service Liability:</strong> Subject to 9.1, our total liability for any claims arising from the Service is limited to the amount you paid in the 12 months before the claim arose.</p>
              <p><strong>9.3 Indirect Damages:</strong> We are not liable for indirect, consequential, or special damages, loss of profits, or loss of data, except where prohibited by law.</p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law & Dispute Resolution</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>10.1 UK Users:</strong> These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of English courts.</p>
              <p><strong>10.2 Irish Users:</strong> These Terms are governed by Irish law. Disputes will be subject to the exclusive jurisdiction of Irish courts.</p>
              <p><strong>10.3 Alternative Dispute Resolution:</strong> We encourage users to contact our support team first to resolve disputes amicably before pursuing legal action.</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We may update these Terms from time to time. We will notify you of material changes via email or platform notification at least 30 days before they take effect. Continued use of the Service after changes constitutes acceptance.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>For questions about these Terms, please contact us:</p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> legal@hyvhub.com</li>
                <li><strong>Address:</strong> HyvHub Ltd, London, United Kingdom</li>
                <li><strong>Support:</strong> <Link to="/contact" className="text-blue-600 hover:underline">Contact Page</Link></li>
              </ul>
            </div>
          </section>
        </div>

        {/* Related Links */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Related Documents</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy-policy" className="flex items-center gap-2 text-blue-600 hover:underline">
              <Icon name="Shield" size={16} />
              Privacy Policy
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

export default TermsOfServicePage;