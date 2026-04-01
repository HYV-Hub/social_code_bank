import React from 'react';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';

const HistoricalTrends = () => {
  const trendData = [
    { month: 'Jan', score: 62, contributions: 45 },
    { month: 'Feb', score: 68, contributions: 52 },
    { month: 'Mar', score: 71, contributions: 48 },
    { month: 'Apr', score: 74, contributions: 61 },
    { month: 'May', score: 76, contributions: 58 },
    { month: 'Jun', score: 76, contributions: 63 }
  ];

  const milestones = [
    {
      date: '2025-06-15',
      title: 'Reached 75% Style Match',
      description: 'Consistent improvements in error handling and documentation',
      type: 'achievement'
    },
    {
      date: '2025-05-20',
      title: 'Team Average Exceeded',
      description: 'Style score surpassed team average of 72%',
      type: 'milestone'
    },
    {
      date: '2025-04-10',
      title: 'Documentation Sprint',
      description: 'Added comprehensive JSDoc comments to 50+ components',
      type: 'improvement'
    }
  ];

  const getMaxScore = () => Math.max(...trendData?.map((d) => d?.score));
  const getMinScore = () => Math.min(...trendData?.map((d) => d?.score));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold">+14%</div>
          <div className="text-green-100 text-sm mt-1">6-Month Improvement</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <Target className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold">76%</div>
          <div className="text-blue-100 text-sm mt-1">Current Score</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <Award className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold">327</div>
          <div className="text-purple-100 text-sm mt-1">Total Contributions</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold">6</div>
          <div className="text-amber-100 text-sm mt-1">Months Tracking</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-card rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Style Score Evolution
        </h3>
        
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative h-64 border-l-2 border-b-2 border-slate-200 pl-4 pb-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 -translate-x-8">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4]?.map((i) => (
                <div key={i} className="border-t border-slate-100" />
              ))}
            </div>

            {/* Data visualization */}
            <div className="relative h-full flex items-end justify-around gap-4 pt-4">
              {trendData?.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 cursor-pointer"
                      style={{ height: `${(data?.score / 100) * 180}px` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <div className="font-semibold">{data?.score}%</div>
                        <div className="text-slate-300">{data?.contributions} contributions</div>
                      </div>
                    </div>
                  </div>
                  {/* Month label */}
                  <span className="text-xs font-medium text-slate-600">{data?.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded" />
              <span className="text-sm text-slate-600">Style Match Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Key Statistics</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Highest Score</span>
              <span className="text-xl font-bold text-success">{getMaxScore()}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Lowest Score</span>
              <span className="text-xl font-bold text-slate-900">{getMinScore()}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Score</span>
              <span className="text-xl font-bold text-primary">
                {Math.round(
                  trendData?.reduce((sum, d) => sum + d?.score, 0) / trendData?.length
                )}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Contributions</span>
              <span className="text-xl font-bold text-primary">
                {trendData?.reduce((sum, d) => sum + d?.contributions, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-success/20 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Growth Insights
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-success/100 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                Consistent improvement over the past 6 months with <span className="font-semibold">14% growth</span>
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-success/100 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                Documentation quality increased by <span className="font-semibold">31%</span> since April
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-success/100 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                Error handling patterns improved by <span className="font-semibold">21%</span>
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-card rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Milestones & Achievements</h3>
        <div className="space-y-4">
          {milestones?.map((milestone, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone?.type === 'achievement' ?'bg-gradient-to-br from-yellow-400 to-amber-500'
                      : milestone?.type === 'milestone' ?'bg-gradient-to-br from-blue-500 to-indigo-600' :'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}
                >
                  {milestone?.type === 'achievement' ? (
                    <Award className="w-5 h-5 text-white" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-white" />
                  )}
                </div>
                {index < milestones?.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="text-sm text-slate-500 mb-1">{milestone?.date}</div>
                <h4 className="font-semibold text-slate-900 mb-1">{milestone?.title}</h4>
                <p className="text-slate-600 text-sm">{milestone?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrends;