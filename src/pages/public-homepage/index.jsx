import React from 'react';
import { Helmet } from 'react-helmet';

import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import TrendingSnippetsSection from './components/TrendingSnippetsSection';
import TestimonialsSection from './components/TestimonialsSection';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';

const PublicHomepage = () => {
  return (
    <>
      <Helmet>
        <title>HyvHub - Free Code Collaboration Platform for Developers | Share Snippets & Track Bugs</title>
        <meta name="description" content="Join HyvHub's free beta - the ultimate code collaboration platform. Share code snippets, track bugs, collaborate with teams, and leverage AI-powered code analysis. Perfect for developers and coding teams." />
        <meta name="keywords" content="free code collaboration, code snippets, snippet sharing, bug tracking, developer tools, team collaboration, AI code analysis, open source collaboration, programming collaboration, developer community, code review, version control, git collaboration, agile development, software development tools" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="HyvHub - Free Code Collaboration Platform for Developers" />
        <meta property="og:description" content="Join HyvHub's free beta. Share code snippets, track bugs, and collaborate with AI-powered analysis." />
        <meta property="og:image" content="/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1763987625259.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HyvHub - Free Code Collaboration Platform" />
        <meta name="twitter:description" content="Share code, track bugs, and collaborate - all free during beta launch" />
        <meta name="twitter:image" content="/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1763987625259.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="HyvHub" />
        <link rel="canonical" href="https://hyvhub.com" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <NavigationBar />

        {/* Main Content */}
        <main>
          <HeroSection />
          <FeaturesSection />
          <TrendingSnippetsSection />
          <TestimonialsSection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PublicHomepage;