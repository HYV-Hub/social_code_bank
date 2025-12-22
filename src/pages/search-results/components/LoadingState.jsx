import React from 'react';


const LoadingState = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5]?.map((item) => (
        <div
          key={item}
          className="bg-card border border-border rounded-lg p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;