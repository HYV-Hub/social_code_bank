import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is the typical response time for support inquiries?',
      answer: 'Response times vary by plan: Standard Support (24-48 hours), Priority Support (4-12 hours), and Enterprise Support (less than 1 hour for critical issues). We aim to respond faster whenever possible.'
    },
    {
      question: 'Can I schedule a demo or consultation call?',
      answer: 'Absolutely! For sales inquiries and demo requests, please email sales@hyvhub.com or use the contact form selecting "Sales & Pricing" as your inquiry type. Our team will reach out within 12 hours to schedule a convenient time.'
    },
    {
      question: 'Do you offer phone support for all plans?',
      answer: 'Phone support is available for Enterprise plan customers. Pro plan users have access to live chat, while Free and Basic users can reach us via email and contact form. All users can upgrade to access additional support channels.'
    },
    {
      question: 'How do I report a security vulnerability?',
      answer: 'We take security seriously. Please report vulnerabilities to security@hyvhub.com with details. Do not disclose publicly until we\'ve had time to address the issue. We typically respond to security reports within 24 hours.'
    },
    {
      question: 'Can I request a feature or provide product feedback?',
      answer: 'Yes! We love hearing from our users. Use the contact form and select "Feedback & Suggestions" as your inquiry type, or email us at feedback@hyvhub.com. We review all suggestions and prioritize based on user demand.'
    },
    {
      question: 'What information should I include when contacting support?',
      answer: 'To help us assist you quickly, please include: your account email, a detailed description of the issue, steps to reproduce (if applicable), screenshots or error messages, and your browser/device information.'
    },
    {
      question: 'Do you provide support in languages other than English?',
      answer: 'Currently, our primary support language is English. However, our Singapore office can assist with Mandarin inquiries, and our London office can help with basic French and German queries. We\'re working on expanding our multilingual support.'
    },
    {
      question: 'How can I escalate an urgent issue?',
      answer: 'Enterprise customers can call our 24/7 emergency hotline for critical issues. Pro users can use live chat for urgent matters during business hours. All users can mark emails as "URGENT" in the subject line for priority handling.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs?.map((faq, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-lg border border-[var(--color-border)] overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="font-medium text-[var(--color-foreground)] pr-4">
              {faq?.question}
            </span>
            <Icon
              name={openIndex === index ? "ChevronUp" : "ChevronDown"}
              size={20}
              className="text-[var(--color-muted-foreground)] flex-shrink-0"
            />
          </button>
          
          {openIndex === index && (
            <div className="px-6 pb-4 text-sm text-[var(--color-muted-foreground)] leading-relaxed border-t border-[var(--color-border)] pt-4">
              {faq?.answer}
            </div>
          )}
        </div>
      ))}
      <div className="mt-8 text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
          Can't find what you're looking for?
        </p>
        <a
          href="/help-center"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Visit our Help Center
          <Icon name="ExternalLink" size={16} />
        </a>
      </div>
    </div>
  );
};

export default FAQSection;