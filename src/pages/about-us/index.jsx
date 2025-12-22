import React from 'react';
import { Helmet } from 'react-helmet';
import NavigationBar from '../public-homepage/components/NavigationBar';
import Footer from '../public-homepage/components/Footer';

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us - HyvHub | Coming Soon</title>
        <meta name="description" content="Learn more about HyvHub. Page coming soon." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        <NavigationBar />

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-4">
              Coming Soon
            </h1>
            <p className="text-xl text-slate-600">
              We're working on something exciting. Check back later!
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;