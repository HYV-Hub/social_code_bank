import React from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import NavigationBar from '../public-homepage/components/NavigationBar';
import Footer from '../public-homepage/components/Footer';

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - HyvHub</title>
        <meta name="description" content="Get in touch with HyvHub. Contact us via email for support, inquiries, or partnerships." />
        <meta name="keywords" content="contact HyvHub, email, support" />
      </Helmet>

      <div className="min-h-screen bg-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <NavigationBar />

        {/* Minimal Contact Section */}
        <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/15 dark:bg-blue-900/30 rounded-full mb-8">
              <Icon name="Mail" size={40} className="text-primary dark:text-blue-400" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-foreground)] mb-6">
              Get in Touch
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--color-muted-foreground)] mb-12">
              Have a question or want to work together?
            </p>

            {/* Email Display */}
            <div className="bg-card dark:bg-slate-800 rounded-xl shadow-lg p-12 border border-border dark:border-slate-700">
              <a 
                href="mailto:contact@hyvhub.com" 
                className="group inline-flex items-center gap-4 text-2xl md:text-3xl font-semibold text-primary dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 transition-colors"
              >
                <Icon 
                  name="Mail" 
                  size={32} 
                  className="group-hover:scale-110 transition-transform" 
                />
                <span>contact@hyvhub.com</span>
              </a>
            </div>

            <p className="text-sm text-[var(--color-muted-foreground)] mt-8">
              We typically respond within 24 hours
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;