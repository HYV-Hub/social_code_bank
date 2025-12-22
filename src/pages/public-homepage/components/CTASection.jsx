import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CTASection = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Development Workflow?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who are already collaborating smarter with Social Code Bank. 
          Start your free trial today—no credit card required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            variant="secondary" 
            size="lg"
            iconName="Rocket"
            iconPosition="right"
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50"
          >
            Get Started Free
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            iconName="Calendar"
            iconPosition="left"
            className="w-full sm:w-auto border-white text-white hover:bg-white/10"
          >
            Schedule Demo
          </Button>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100">
          <div className="flex items-center gap-2">
            <Icon name="Check" size={20} />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Check" size={20} />
            <span>No credit card needed</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Check" size={20} />
            <span>Setup in 5 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;