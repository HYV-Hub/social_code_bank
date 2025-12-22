import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Activity, UserPlus, Search, Filter, MoreVertical, AlertCircle, Award, Code, MessageSquare, Eye, Heart } from 'lucide-react';
import AppNavigation from '../../components/AppNavigation';
import { companyDashboardService } from '../../services/companyDashboardService';
import { companyMemberService } from '../../services/companyMemberService';
import { supabase } from '../../lib/supabase';
import CompanySidebar from '../../components/CompanySidebar';
import { hiveService } from '../../services/hiveService';

export default function CompanyManagementDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Company data
  const [company, setCompany] = useState(null);
  const [metrics, setMetrics] = useState({ teamMembers: 0, snippets: 0, bugsResolved: 0 });
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [topCollaborators, setTopCollaborators] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [teamMetrics, setTeamMetrics] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberMenu, setShowMemberMenu] = useState(null);
  const [companyHives, setCompanyHives] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchCompanyData();
    loadDashboardData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return;
      
      const profile = await hiveService?.getUserProfile(user?.id);
      setCompanyInfo({
        id: profile?.company_id,
        name: profile?.company_name
      });
      
      setUserRole(profile?.role || '');

      const hives = await hiveService?.getCompanyHives(user?.id);
      setCompanyHives(hives || []);
    } catch (err) {
      console.error('Error fetching company data:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user's company
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase?.from('user_profiles')?.select('company_id, role')?.eq('id', user?.id)?.single();

      if (!profile?.company_id || profile?.role !== 'company_admin') {
        setError('You must be a company admin to access this page');
        return;
      }

      // Load company details
      const companyData = await companyDashboardService?.getCompanyDetails(profile?.company_id);
      setCompany(companyData);

      // Load metrics
      const metricsData = await companyDashboardService?.getCompanyMetrics(profile?.company_id);
      setMetrics(metricsData);

      // Load members
      const membersData = await companyMemberService?.getCompanyMembers(profile?.company_id);
      setMembers(membersData);

      // Load teams
      const teamsData = await companyDashboardService?.getCompanyTeams(profile?.company_id);
      setTeams(teamsData);

      // NEW: Load top collaborators
      const collaboratorsData = await companyDashboardService?.getTopCollaborators(profile?.company_id, 5);
      setTopCollaborators(collaboratorsData);

      // NEW: Load top posts
      const postsData = await companyDashboardService?.getTopPosts(profile?.company_id, 5);
      setTopPosts(postsData);

      // NEW: Load team collaboration metrics
      const teamMetricsData = await companyDashboardService?.getTeamCollaborationMetrics(profile?.company_id);
      setTeamMetrics(teamMetricsData);

    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the company?')) {
      return;
    }

    try {
      await companyMemberService?.removeMember(memberId, company?.id);
      setMembers(prev => prev?.filter(m => m?.id !== memberId));
      setShowMemberMenu(null);
    } catch (err) {
      console.error('Error removing member:', err);
      alert(err?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await companyMemberService?.updateMemberRole(memberId, company?.id, newRole);
      setMembers(prev => prev?.map(m => 
        m?.id === memberId ? { ...m, role: newRole } : m
      ));
      setShowMemberMenu(null);
    } catch (err) {
      console.error('Error updating role:', err);
      alert(err?.message || 'Failed to update role');
    }
  };

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                          member?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesFilter = filterRole === 'all' || member?.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const userLimitInfo = companyDashboardService?.getUserLimitInfo(company);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AppNavigation />
      
      <div className="flex">
        {/* Company Sidebar */}
        <CompanySidebar
          companyInfo={companyInfo}
          companyHives={companyHives}
          userRole={userRole}
          currentPage="management"
          onCreateHive={() => navigate('/company-teams-page')}
          onHiveClick={(hiveId) => navigate(`/hives/${hiveId}`)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{company?.name || 'Company'} Management</h1>
            <p className="text-gray-600 mt-2">Manage your organization, teams, and members</p>
          </div>

          {/* User Limit Alert */}
          {userLimitInfo && !userLimitInfo?.canAdd && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-900 font-medium">User limit reached</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    You have reached the maximum of {userLimitInfo?.limit} users. Contact support to increase your limit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Team Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.teamMembers}</p>
                  <p className="text-sm text-gray-500 mt-1">{userLimitInfo?.limit || 0} max</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Code Snippets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.snippets}</p>
                  <p className="text-sm text-green-600 mt-1">+12% this month</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugs Resolved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.bugsResolved}</p>
                  <p className="text-sm text-green-600 mt-1">+8% this month</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Top Collaborators Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Top Collaborators
              </h3>
            </div>
            <div className="space-y-4">
              {topCollaborators?.map((collaborator, index) => (
                <div key={collaborator?.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {collaborator?.avatar ? (
                        <img src={collaborator?.avatar} alt={collaborator?.name} className="h-12 w-12 rounded-full" />
                      ) : (
                        <span className="text-blue-600 font-medium text-lg">
                          {collaborator?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{collaborator?.name || 'Unnamed'}</div>
                      <div className="text-sm text-gray-500">@{collaborator?.username || 'unknown'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{collaborator?.snippetsCount}</div>
                      <div className="text-xs text-gray-500">Snippets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{collaborator?.bugsFixed}</div>
                      <div className="text-xs text-gray-500">Bugs Fixed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{collaborator?.totalContributions}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              ))}
              {topCollaborators?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No collaborators yet</p>
                </div>
              )}
            </div>
          </div>

          {/* NEW: Top Posts Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Top Posts
              </h3>
            </div>
            <div className="space-y-4">
              {topPosts?.map((post) => (
                <div
                  key={post?.id}
                  onClick={() => navigate(`/snippet-details?id=${post?.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {post?.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post?.description || 'No description'}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {post?.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        {post?.author?.avatar ? (
                          <img src={post?.author?.avatar} alt={post?.author?.name} className="h-6 w-6 rounded-full" />
                        ) : (
                          <span className="text-blue-600 text-xs font-medium">
                            {post?.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{post?.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post?.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post?.commentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post?.viewsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {topPosts?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          </div>

          {/* NEW: Team Collaboration Metrics */}
          {teamMetrics && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Team Collaboration Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{teamMetrics?.totalTeams}</div>
                  <div className="text-sm text-gray-600">Active Teams</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{teamMetrics?.totalMembers}</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{teamMetrics?.totalSnippets}</div>
                  <div className="text-sm text-gray-600">Total Snippets</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{teamMetrics?.avgSnippetsPerTeam}</div>
                  <div className="text-sm text-gray-600">Avg per Team</div>
                </div>
              </div>
              
              {/* Top Collaborating Teams */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Top Collaborating Teams</h4>
                <div className="space-y-3">
                  {teamMetrics?.topCollaboratingTeams?.map((team, index) => (
                    <div key={team?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{team?.name}</div>
                          <div className="text-xs text-gray-500">{team?.memberCount} members</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-blue-600">{team?.snippetCount}</span>
                        <span className="text-sm text-gray-500">snippets</span>
                      </div>
                    </div>
                  ))}
                  {teamMetrics?.topCollaboratingTeams?.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No team activity yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Member Management Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                <button
                  onClick={() => navigate('/member-invitation-system')}
                  disabled={!userLimitInfo?.canAdd}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite Members
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e?.target?.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="company_admin">Admin</option>
                    <option value="team_admin">Team Admin</option>
                    <option value="team_member">Member</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers?.map((member) => (
                    <tr key={member?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {member?.avatarUrl ? (
                              <img src={member?.avatarUrl} alt={member?.fullName} className="h-10 w-10 rounded-full" />
                            ) : (
                              <span className="text-blue-600 font-medium">
                                {member?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member?.fullName || 'Unnamed'}</div>
                            <div className="text-sm text-gray-500">{member?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member?.role === 'company_admin' ? 'bg-purple-100 text-purple-800' :
                          member?.role === 'team_admin'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member?.role?.replace('_', ' ') || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{member?.snippetsCount || 0} snippets</div>
                        <div>{member?.bugsFixed || 0} bugs fixed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member?.lastLoginAt ? new Date(member.lastLoginAt)?.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowMemberMenu(showMemberMenu === member?.id ? null : member?.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {showMemberMenu === member?.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleUpdateRole(member?.id, 'team_admin')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Make Team Admin
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(member?.id, 'team_member')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Make Member
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member?.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Remove from Company
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers?.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No members found</p>
              </div>
            )}
          </div>

          {/* Teams Overview */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams?.map((team) => (
                <div key={team?.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <h4 className="font-medium text-gray-900">{team?.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{team?.description || 'No description'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {members?.filter(m => m?.teamId === team?.id)?.length} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {teams?.length === 0 && (
              <p className="text-center text-gray-500 py-4">No teams created yet</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}