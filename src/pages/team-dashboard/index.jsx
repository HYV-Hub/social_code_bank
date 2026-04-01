import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

import AppShell from '../../components/AppShell';
import { useAuth } from "../../contexts/AuthContext";

import MetricCard from "../company-dashboard/components/MetricCard";
import TeamMemberRow from "../company-dashboard/components/TeamMemberRow";
import ActivityFeedItem from "../company-dashboard/components/ActivityFeedItem";

import { teamDashboardService } from "../../services/teamDashboardService";



const TeamDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const teamId = searchParams?.get('team');

  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("feed");
  const [showCreateSnippet, setShowCreateSnippet] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [showBugDetails, setShowBugDetails] = useState(false);
  
  // State for data
  const [team, setTeam] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamSnippetsFeed, setTeamSnippetsFeed] = useState([]);
  const [teamBugs, setTeamBugs] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [trendingSnippets, setTrendingSnippets] = useState([]);
  const [teamMessages, setTeamMessages] = useState([]);
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snippets, setSnippets] = useState([]);

  // CRITICAL FIX: Ensure snippets refresh when navigating to this page
  useEffect(() => {
    const loadTeamSnippets = async () => {
      if (!teamId) {
        console.warn('⚠️ No team ID available');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Loading team snippets for team:', teamId);
        
        // Fetch snippets specifically for this team
        let snippetsData = await teamDashboardService?.getTeamSnippetsFeed(teamId, 50, 0);
        
        console.log('✅ Loaded team snippets:', {
          count: snippetsData?.length,
          teamId: teamId,
          snippets: snippetsData?.map(s => ({
            id: s?.id,
            title: s?.title,
            team_id: s?.team_id,
            visibility: s?.visibility,
            user: s?.user_profiles?.full_name
          }))
        });
        
        setSnippets(snippetsData || []);
      } catch (err) {
        console.error('❌ Error loading team snippets:', err);
        setError(err?.message || 'Failed to load team snippets');
        setSnippets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeamSnippets();
  }, [teamId]); // Re-fetch whenever teamId changes

  useEffect(() => {
    if (!user) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    // CRITICAL FIX: Validate teamId is not "undefined" string
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      setError('No team selected. Please select a team from the teams page.');
      setLoading(false);
      return;
    }

    // CRITICAL FIX: Validate user ID is not "undefined" string
    if (!user?.id || user?.id === 'undefined' || user?.id === 'null') {
      setError('Invalid user session. Please log out and log in again.');
      setLoading(false);
      return;
    }

    loadTeamDashboardData();
  }, [user, teamId]);

  const loadTeamDashboardData = async () => {
    // CRITICAL FIX: Additional validation before any API calls
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      setError('Invalid team ID. Please select a valid team.');
      setLoading(false);
      return;
    }

    if (!user?.id || user?.id === 'undefined' || user?.id === 'null') {
      setError('Invalid user session. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 [ENHANCED] Loading dashboard data for team:', teamId);
      console.log('🔐 Current user ID:', user?.id);
      console.log('🔐 User email:', user?.email);
      
      // CRITICAL: Fetch snippets FIRST to diagnose immediately
      console.log('📦 Step 1: Fetching team snippets...');
      let snippetsData = [];
      
      try {
        snippetsData = await teamDashboardService?.getTeamSnippetsFeed(teamId, 20);
        console.log('📦 Snippets fetch complete:', snippetsData?.length, 'items');
        
        if (snippetsData && snippetsData?.length > 0) {
          console.log('✅ SUCCESS: Found', snippetsData?.length, 'team snippets');
          console.log('📋 First snippet:', {
            id: snippetsData?.[0]?.id,
            title: snippetsData?.[0]?.title,
            team_id: snippetsData?.[0]?.team_id,
            visibility: snippetsData?.[0]?.visibility,
            has_code: !!snippetsData?.[0]?.code,
            user_name: snippetsData?.[0]?.user_profiles?.full_name
          });
        } else {
          console.warn('⚠️ INFO: No snippets found for team:', teamId);
          console.warn('This is normal if the team hasn\'t created any snippets yet');
        }
      } catch (snippetError) {
        console.error('❌ Error fetching snippets:', snippetError);
        // Don't throw - allow other data to load
        console.warn('Continuing to load other team data despite snippet error...');
      }

      // Now fetch other data in parallel
      console.log('📦 Step 2: Fetching other team data...');
      const [
        teamData,
        metricsData,
        membersData,
        bugsData,
        activityData,
        trendingData,
        messagesData,
        redFlagsData
      ] = await Promise.all([
        teamDashboardService?.getTeamDetails(teamId)?.catch(err => {
          console.error('Error loading team details:', err);
          return null;
        }),
        teamDashboardService?.getTeamMetrics(teamId)?.catch(err => {
          console.error('Error loading metrics:', err);
          return { teamMembers: 0, snippets: 0, bugs: 0 };
        }),
        teamDashboardService?.getTeamMembers(teamId)?.catch(err => {
          console.error('Error loading members:', err);
          return [];
        }),
        teamDashboardService?.getTeamBugs(teamId, 50)?.catch(err => {
          console.error('Error loading bugs:', err);
          return [];
        }),
        teamDashboardService?.getTeamActivityFeed(teamId, 20)?.catch(err => {
          console.error('Error loading activity:', err);
          return [];
        }),
        teamDashboardService?.getTrendingSnippets(teamId, 4)?.catch(err => {
          console.error('Error loading trending:', err);
          return [];
        }),
        teamDashboardService?.getTeamMessages(teamId, 10)?.catch(err => {
          console.error('Error loading messages:', err);
          return [];
        }),
        teamDashboardService?.getRedFlags(teamId)?.catch(err => {
          console.error('Error loading red flags:', err);
          return [];
        })
      ]);

      if (!teamData) {
        throw new Error('Team not found or access denied');
      }

      // CRITICAL FIX: Set state with explicit logging
      console.log('📝 Setting team snippets state with', snippetsData?.length, 'items');
      
      // Set all state in correct order
      setTeam(teamData);
      setMetrics(metricsData || { teamMembers: 0, snippets: 0, bugs: 0 });
      setTeamMembers(membersData || []);
      setTeamSnippetsFeed(snippetsData || []); // CRITICAL: This sets the snippets
      setTeamBugs(bugsData || []);
      setActivityFeed(activityData || []);
      setTrendingSnippets(trendingData || []);
      setTeamMessages(messagesData || []);
      setRedFlags(redFlagsData || []);
      
      console.log('✅ Dashboard data loaded and state updated successfully');
      console.log('📊 Final counts:', {
        team: !!teamData,
        snippets: snippetsData?.length || 0,
        members: membersData?.length || 0,
        bugs: bugsData?.length || 0,
        activity: activityData?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Error loading team dashboard:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        hint: error?.hint,
        details: error?.details,
        stack: error?.stack?.substring(0, 300)
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to load team dashboard data.';
      
      if (error?.message?.includes('Authentication required')) {
        errorMessage = 'Please log in to view this team dashboard.';
      } else if (error?.message?.includes('Access denied')) {
        errorMessage = 'You do not have permission to view this team. Please join the team first.';
      } else if (error?.message?.includes('not a member')) {
        errorMessage = 'You must be a team member to view the team dashboard.';
      } else if (error?.message?.includes('Invalid team ID') || error?.message?.includes('Invalid user session')) {
        errorMessage = error?.message;
      } else if (error?.message?.includes('invalid input syntax for type uuid')) {
        errorMessage = 'Session error detected. Please refresh the page and try again.';
      } else {
        errorMessage = `${error?.message || errorMessage} Please try again or contact support.`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManageRole = (memberId, newRole) => {
    // Placeholder for role management functionality
    console.log(`Managing role for member ${memberId}: ${newRole}`);
    // Add actual role update logic here if needed
  };

  const metricsData = metrics ? [
    {
      title: "Team Members",
      value: metrics?.teamMembers?.toString(),
      icon: "Users",
      iconColor: "bg-primary"
    },
    {
      title: "Code Snippets",
      value: metrics?.snippets?.toString(),
      icon: "Code",
      iconColor: "bg-accent"
    },
    {
      title: "Bugs Resolved",
      value: `${metrics?.bugsResolved || 0}/${metrics?.bugs || 0}`,
      icon: "CheckCircle",
      iconColor: "bg-success"
    },
    {
      title: "Pending Reviews",
      value: metrics?.pendingReviews?.toString(),
      icon: "AlertCircle",
      iconColor: "bg-warning"
    }
  ] : [];

  const timeRangeOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" }
  ];

  const handleViewProfile = (memberId) => {
    navigate(`/user-profile/${memberId}`);
  };

  const handleViewSnippet = (snippetId) => {
    navigate(`/snippet-details?id=${snippetId}`);
  };

  const handleViewBug = (bugId) => {
    const bug = teamBugs?.find(b => b?.id === bugId) || redFlags?.find(b => b?.id === bugId);
    if (bug) {
      setSelectedBug(bug);
      setShowBugDetails(true);
    }
  };

  const handleBugStatusChange = async (newStatus) => {
    // Reload data to reflect changes
    await loadTeamDashboardData();
  };

  const handleResolveRedFlag = async (bugId) => {
    try {
      await teamDashboardService?.updateBugStatus(bugId, 'in_progress');
      loadTeamDashboardData();
    } catch (error) {
      console.error('Error resolving red flag:', error);
      alert('Failed to update bug status. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Team">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading team dashboard...</p>
            <p className="text-sm text-muted-foreground mt-2">Fetching team snippets and activity...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell pageTitle="Team">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md px-4">
            <Icon name="AlertCircle" size={48} color="var(--color-error)" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => navigate('/teams-landing-page')} variant="outline">
                Back to Teams
              </Button>
              <Button onClick={loadTeamDashboardData}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Team">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/company-dashboard')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{team?.name || 'Team Dashboard'}</h1>
                <p className="text-sm text-muted-foreground">Team Performance &amp; Activity</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                iconName="Plus"
                onClick={() => navigate(`/create-snippet?team=${teamId}&returnTo=team-dashboard`)}
              >
                Add Snippet
              </Button>
              <Button
                variant="outline"
                iconName="MessageSquare"
                onClick={() => navigate(`/team-chat?team=${teamId}`)}
              >
                Team Chat
              </Button>
              <Button
                variant="default"
                iconName="FileText"
                onClick={() => navigate(`/bug-board?team=${teamId}`)}
              >
                Bug Board
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-error/10 border border-error/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" size={20} className="text-error mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Failed to load team snippets</p>
                <p className="text-sm text-error mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team Snippets Feed Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Team Snippets</h2>
              <p className="text-muted-foreground mt-1">
                All snippets shared with this team
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading team snippets...</p>
              </div>
            </div>
          ) : snippets?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets?.map((snippet) => (
                <SnippetCard
                  key={snippet?.id}
                  snippet={snippet}
                  onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="flex flex-col items-center">
                <Icon name="Code2" size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Team Snippets Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share a code snippet with your team
                </p>
                <Button
                  onClick={() => navigate('/create-snippet')}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Create First Snippet
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Metrics Grid - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData?.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {activeTab === "feed" && (
          <>
            {/* Red Flags Section */}
            {redFlags?.length > 0 && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={24} className="text-error" />
                    <h2 className="text-xl font-bold text-red-900">Red Flags ({redFlags?.length})</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    onClick={() => setActiveTab("bugs")}
                    className="border-red-300 text-error hover:bg-error/15"
                  >
                    View All Bugs
                  </Button>
                </div>
                <div className="space-y-3">
                  {redFlags?.slice(0, 3)?.map((bug) => (
                    <div 
                      key={bug?.id}
                      className="bg-card rounded-lg p-4 border border-error/20 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewBug(bug?.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              bug?.priority === 'critical' ? 'bg-error/15 text-error' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {bug?.priority?.toUpperCase()}
                            </span>
                            <span className="text-sm text-muted-foreground">{bug?.bug_status}</span>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{bug?.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{bug?.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Two Column Layout - Activity & Members */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Activity Feed & Trending */}
              <div className="lg:col-span-2 space-y-8">
                {/* Team Activity Feed */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
                    <Icon name="Activity" size={20} color="var(--color-muted-foreground)" />
                  </div>
                  {activityFeed?.length > 0 ? (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {activityFeed?.map((activity) => (
                        <ActivityFeedItem key={activity?.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Right: Members & Messages */}
              <div className="lg:col-span-1 space-y-8">
                {/* Team Members */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Team Members</h2>
                    <span className="text-sm text-muted-foreground">{teamMembers?.length}</span>
                  </div>
                  {teamMembers?.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {teamMembers?.map((member) => (
                        <TeamMemberRow
                          key={member?.id}
                          member={member}
                          onViewProfile={handleViewProfile}
                          onManageRole={handleManageRole}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No team members found</p>
                  )}
                </div>

                {/* Team Messages */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Recent Messages</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="MessageSquare"
                      onClick={() => navigate(`/team-chat?team=${teamId}`)}
                    />
                  </div>
                  {teamMessages?.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {teamMessages?.map((message) => (
                        <div key={message?.id} className="flex gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex-shrink-0">
                            {message?.user_profiles?.avatar_url ? (
                              <img 
                                src={message?.user_profiles?.avatar_url} 
                                alt={message?.user_profiles?.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-foreground">
                                  {(message?.user_profiles?.full_name || 'U')?.[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {message?.user_profiles?.full_name || message?.user_profiles?.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message?.created_at)?.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{message?.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No messages yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "bugs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Team Bug Board</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  All bugs reported and tracked by your team ({teamBugs?.length})
                </p>
              </div>
              <Button
                iconName="Plus"
                onClick={() => navigate(`/bug-board?team=${teamId}`)}
              >
                Report Bug
              </Button>
            </div>

            {teamBugs?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamBugs?.map((bug) => (
                  <div
                    key={bug?.id}
                    className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewBug(bug?.id)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        bug?.priority === 'critical' ? 'bg-error/15 text-error' :
                        bug?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        bug?.priority === 'medium'? 'bg-warning/15 text-warning' : 'bg-primary/15 text-foreground'
                      }`}>
                        {bug?.priority?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        bug?.bug_status === 'resolved' ? 'bg-success/15 text-success' :
                        bug?.bug_status === 'in_progress'? 'bg-primary/15 text-foreground' : 'bg-muted text-foreground'
                      }`}>
                        {bug?.bug_status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{bug?.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{bug?.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By: {bug?.user_profiles?.full_name || 'Unknown'}</span>
                      <span>{new Date(bug?.created_at)?.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Bugs Reported</h3>
                <p className="text-muted-foreground mb-4">
                  Your team has a clean slate! Report bugs when they occur.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <Icon name="BarChart" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Team Analytics</h3>
              <p className="text-muted-foreground">
                Detailed team performance metrics and trends coming soon
              </p>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
};

// SnippetCard component
const SnippetCard = ({ snippet, onClick }) => {
  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                {snippet?.title || 'Untitled Snippet'}
              </h3>
              <span className="px-2 py-1 bg-purple-100 text-primary text-xs rounded-full font-medium">
                Team Snippet
              </span>
            </div>
            {snippet?.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {snippet?.description}
              </p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {snippet?.user_profiles?.avatar_url || snippet?.user_avatar_url ? (
                  <img 
                    src={snippet?.user_profiles?.avatar_url || snippet?.user_avatar_url} 
                    alt={snippet?.user_profiles?.full_name || snippet?.user_full_name || 'User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {((snippet?.user_profiles?.full_name || snippet?.user_full_name) || 'U')?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-foreground">
                  {snippet?.user_profiles?.full_name || snippet?.user_full_name || 
                   snippet?.user_profiles?.username || snippet?.user_username || 'Unknown User'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(snippet?.created_at)?.toLocaleDateString()}
              </span>
              {snippet?.language && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {snippet?.language}
                </span>
              )}
              {snippet?.snippet_type && (
                <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                  {snippet?.snippet_type}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {snippet?.code && (
          <div className="border-t border-border bg-background p-4">
            <div className="bg-card rounded-lg overflow-hidden border border-border">
              <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon name="Code2" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Code Preview</span>
                  <span className="text-xs text-muted-foreground">
                    ({snippet?.code?.split('\n')?.length || 0} lines)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleViewSnippet(snippet?.id);
                  }}
                  className="text-xs text-muted-foreground hover:text-muted-foreground transition-colors flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted"
                >
                  View Full Code
                  <Icon name="ExternalLink" size={12} />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <pre className="p-4 text-sm" style={{ maxHeight: '300px', minHeight: '150px' }}>
                  <code className="text-foreground font-mono leading-relaxed">
                    {snippet?.code?.split('\n')?.slice(0, 10)?.map((line, lineIndex) => (
                      <div key={lineIndex} className="flex hover:bg-card/50 transition-colors">
                        <span className="text-muted-foreground select-none pr-4 text-right min-w-[3rem]">
                          {lineIndex + 1}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
                      </div>
                    ))}
                    {snippet?.code?.split('\n')?.length > 10 && (
                      <div className="text-muted-foreground text-center py-2 italic">
                        ... {snippet?.code?.split('\n')?.length - 10} more lines ...
                      </div>
                    )}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground p-5 pt-3 border-t border-border bg-background/50">
          <div className="flex items-center gap-1">
            <Icon name="Heart" size={16} />
            <span>{snippet?.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Eye" size={16} />
            <span>{snippet?.views_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="MessageSquare" size={16} />
            <span>{snippet?.comments_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;