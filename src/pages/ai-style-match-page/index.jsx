import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Code, AlertTriangle, TrendingUp, Zap, FileText, Filter } from 'lucide-react';
import aiTaggingService from '../../services/aiTaggingService';
import CodeComparison from './components/CodeComparison';
import StyleMetrics from './components/StyleMetrics';
import ViolationsList from './components/ViolationsList';
import TeamStyleGuide from './components/TeamStyleGuide';
import HistoricalTrends from './components/HistoricalTrends';
import BatchProcessor from './components/BatchProcessor';
import AppShell from "../../components/AppShell";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AIStyleMatchPage = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('comparison');
  const [selectedCode, setSelectedCode] = useState('');

  // Check if user has company access
  useEffect(() => {
    if (!userProfile?.company_id) {
      // Redirect non-company users
      navigate('/user-dashboard', { 
        state: { 
          message: 'AI Style Match is only available for company members. Please join or create a company to access this feature.' 
        }
      });
    }
  }, [userProfile, navigate]);

  // Sample snippet for demonstration
  const sampleSnippet = {
    id: 1,
    code: `import { useState, useEffect } from 'react'
;\n\nconst UserProfile = ({ userId }) => {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch('/api/users/' + userId)\n      .then(response => response.json())\n      .then(data => {\n        setUser(data);\n        setLoading(false);\n      })\n      .catch(error => console.log(error));\n  }, [userId]);\n\n  if (loading) return <div>Loading...</div>;\n\n  return (\n    <div>\n      <h1>{user.name}</h1>\n      <p>{user.email}</p>\n    </div>\n  );\n};\n\nexport default UserProfile;`,
    language: 'jsx',
    title: 'User Profile Component'
  };

  const improvedCode = `import { useState, useEffect } from 'react'
;\nimport PropTypes from 'prop-types';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';


;\n\n/**\n * UserProfile Component\n * Displays user information fetched from the API\n * @param {string} userId - The ID of the user to display\n */\nconst UserProfile = ({ userId }) => {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const fetchUser = async () => {\n      try {\n        const response = await fetch(\`/api/users/\${userId}\`);\n        if (!response.ok) {\n          throw new Error('Failed to fetch user');\n        }\n        const data = await response.json();\n        setUser(data);\n      } catch (err) {\n        setError(err.message);\n        console.error('Error fetching user:', err);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchUser();\n  }, [userId]);\n\n  if (loading) {\n    return <div className="loading">Loading...</div>;\n  }\n\n  if (error) {\n    return <div className="error">Error: {error}</div>;\n  }\n\n  return (\n    <div className="user-profile">\n      <h1 className="user-name">{user?.name}</h1>\n      <p className="user-email">{user?.email}</p>\n    </div>\n  );\n};\n\nUserProfile.propTypes = {\n  userId: PropTypes.string.isRequired,\n};\n\nexport default UserProfile;`;

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load sample snippet on mount
    setSnippet(sampleSnippet);
    setSelectedCode(sampleSnippet?.code);
  }, []);

  const handleAnalyzeCode = async () => {
    if (!selectedCode?.trim()) {
      setError('Please provide code to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiTaggingService?.analyzeSnippet({
        code: selectedCode,
        language: snippet?.language || 'javascript',
        title: snippet?.title || 'Code Sample',
        description: ''
      });
      setAnalysis(result);
    } catch (err) {
      setError(err?.message || 'Failed to analyze code');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    setSelectedCode(e?.target?.value);
  };

  const styleMetrics = {
    overall: 76,
    namingConventions: 68,
    indentation: 85,
    commenting: 45,
    architecture: 82,
    errorHandling: 55
  };

  const violations = [
    {
      id: 1,
      severity: 'high',
      category: 'Error Handling',
      description: 'Missing error handling in fetch operation',
      line: 9,
      recommendation: 'Wrap fetch in try-catch and handle errors appropriately',
      autoFixAvailable: true
    },
    {
      id: 2,
      severity: 'medium',
      category: 'Code Style',
      description: 'String concatenation used instead of template literals',
      line: 9,
      recommendation: "Use template literals: `/api/users/${userId}`",
      autoFixAvailable: true
    },
    {
      id: 3,
      severity: 'medium',
      category: 'Documentation',
      description: 'Component missing JSDoc documentation',
      line: 3,
      recommendation: 'Add JSDoc comment describing component purpose and props',
      autoFixAvailable: true
    },
    {
      id: 4,
      severity: 'low',
      category: 'Best Practices',
      description: 'PropTypes validation not defined',
      line: 3,
      recommendation: 'Add PropTypes to validate userId prop',
      autoFixAvailable: true
    },
    {
      id: 5,
      severity: 'low',
      category: 'Code Style',
      description: 'console.log used for error logging',
      line: 14,
      recommendation: 'Use proper error handling or logging service',
      autoFixAvailable: false
    }
  ];

  const teamStyleRules = [
    { category: 'Naming Conventions', weight: 20, status: 'partial', score: 68 },
    { category: 'Indentation', weight: 15, status: 'pass', score: 85 },
    { category: 'Commenting Standards', weight: 25, status: 'fail', score: 45 },
    { category: 'Error Handling', weight: 25, status: 'partial', score: 55 },
    { category: 'Architectural Patterns', weight: 15, status: 'pass', score: 82 }
  ];

  // Show access denied if no company
  if (!userProfile?.company_id) {
    return (
      <AppShell pageTitle="Style Match">
        <Helmet>
          <title>Access Denied - AI Style Match</title>
        </Helmet>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="p-4 bg-warning/10 rounded-full inline-block mb-4">
              <Icon name="Lock" size={48} className="text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Company Feature</h2>
            <p className="text-muted-foreground mb-6">
              AI Style Match is available for company members only.
              Join or create a company to access this feature.
            </p>
            <Button onClick={() => navigate('/user-dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Style Match">
      <Helmet>
        <title>AI Style Match - HyvHub</title>
      </Helmet>
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  AI Style Match
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Analyze code against team style guidelines with AI-powered insights
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleAnalyzeCode}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5" />
                  {loading ? 'Analyzing...' : 'Analyze Code'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
            <div className="flex border-b border-border">
              {[
                { id: 'comparison', label: 'Code Comparison', icon: Code },
                { id: 'metrics', label: 'Style Metrics', icon: TrendingUp },
                { id: 'violations', label: 'Violations', icon: AlertTriangle },
                { id: 'guide', label: 'Team Guide', icon: FileText },
                { id: 'trends', label: 'Historical Trends', icon: TrendingUp },
                { id: 'batch', label: 'Batch Processing', icon: Filter }
              ]?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab?.id
                      ? 'text-primary border-b-2 border-blue-600 bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Analysis Error</h3>
                <p className="text-error text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'comparison' && (
              <CodeComparison 
                originalCode={selectedCode} 
                improvedCode={improvedCode}
                onCodeChange={handleCodeChange}
                analysis={analysis}
              />
            )}

            {activeTab === 'metrics' && (
              <StyleMetrics metrics={styleMetrics} analysis={analysis} />
            )}

            {activeTab === 'violations' && (
              <ViolationsList violations={violations} />
            )}

            {activeTab === 'guide' && (
              <TeamStyleGuide rules={teamStyleRules} />
            )}

            {activeTab === 'trends' && (
              <HistoricalTrends />
            )}

            {activeTab === 'batch' && (
              <BatchProcessor />
            )}
          </div>
        </div>
    </AppShell>
  );
};

export default AIStyleMatchPage;