import React from 'react';
import { Calendar } from 'lucide-react';

const TimeFilterTabs = ({ timeWindows, activeWindow, onWindowChange }) => {
  return (
    <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-foreground">
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">Time Period:</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {timeWindows?.map((window) => (
            <button
              key={window?.id}
              onClick={() => onWindowChange(window?.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${activeWindow === window?.id
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-muted text-foreground hover:bg-muted'
                }
              `}
            >
              {window?.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeFilterTabs;