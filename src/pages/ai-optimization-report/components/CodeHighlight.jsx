import React from 'react';
import { ArrowRight } from 'lucide-react';

const CodeHighlight = ({ before, after }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {/* Before Code */}
      <div className="bg-error/10 border border-error/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xs font-medium text-error">BEFORE</span>
        </div>
        <pre className="text-sm text-foreground overflow-x-auto">
          <code>{before}</code>
        </pre>
      </div>

      {/* Arrow (hidden on mobile) */}
      <div className="hidden md:flex items-center justify-center -ml-6 -mr-6 z-10">
        <div className="bg-card rounded-full p-2 shadow-md">
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* After Code */}
      <div className="bg-success/10 border border-success/20 rounded-lg p-4 md:-ml-10">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xs font-medium text-success">AFTER</span>
        </div>
        <pre className="text-sm text-foreground overflow-x-auto">
          <code>{after}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeHighlight;