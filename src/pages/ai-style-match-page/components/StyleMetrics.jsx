import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StyleMetrics = ({ metrics, analysis }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-success/15';
    if (score >= 60) return 'bg-warning/15';
    return 'bg-error/15';
  };

  const getTrendIcon = (score) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5 text-success" />;
    if (score >= 60) return <Minus className="w-5 h-5 text-warning" />;
    return <TrendingDown className="w-5 h-5 text-error" />;
  };

  const categories = [
    { key: 'namingConventions', label: 'Naming Conventions', description: 'Variable, function, and class naming consistency' },
    { key: 'indentation', label: 'Indentation', description: 'Code formatting and indentation standards' },
    { key: 'commenting', label: 'Commenting', description: 'Documentation and inline comments quality' },
    { key: 'architecture', label: 'Architecture', description: 'Code structure and organizational patterns' },
    { key: 'errorHandling', label: 'Error Handling', description: 'Exception handling and error recovery' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-primary rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Overall Style Match</h2>
            <p className="text-primary-foreground/70">
              Aggregate score across all style categories
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">{metrics?.overall}%</div>
            <div className="text-primary-foreground/70 mt-2">Based on team guidelines</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Category Breakdown</h3>
        <div className="space-y-6">
          {categories?.map((category) => {
            const score = metrics?.[category?.key] || 0;
            return (
              <div key={category?.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-foreground">{category?.label}</h4>
                      {getTrendIcon(score)}
                    </div>
                    <p className="text-sm text-muted-foreground">{category?.description}</p>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(score)} ml-6`}>
                    {score}%
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80
                        ? 'bg-success'
                        : score >= 60
                        ? 'bg-warning' :'bg-error'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* Score Badge */}
                <div className="flex gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getScoreBgColor(
                      score
                    )} ${getScoreColor(score)}`}
                  >
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Score Comparison</h3>
        <div className="space-y-4">
          {categories?.map((category) => {
            const score = metrics?.[category?.key] || 0;
            const teamAverage = Math.floor(Math.random() * 20) + 70; // Mock team average
            
            return (
              <div key={category?.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{category?.label}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-primary">Your Score: {score}%</span>
                    <span className="text-muted-foreground">Team Avg: {teamAverage}%</span>
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  {/* Team Average Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground z-10"
                    style={{ left: `${teamAverage}%` }}
                  />
                  {/* Your Score Bar */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-r-lg transition-all duration-500 ${
                      score >= teamAverage
                        ? 'bg-success' :'bg-primary'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-warning/10 rounded-xl p-6 border border-warning/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Recommendations</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
            <p className="text-muted-foreground">
              <span className="font-medium">Improve commenting standards:</span> Add JSDoc comments to all public functions and components
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
            <p className="text-muted-foreground">
              <span className="font-medium">Enhance error handling:</span> Implement try-catch blocks for all async operations
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
            <p className="text-muted-foreground">
              <span className="font-medium">Naming conventions:</span> Use camelCase for variables and functions consistently
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StyleMetrics;