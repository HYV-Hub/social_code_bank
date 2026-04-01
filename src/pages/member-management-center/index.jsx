import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memberManagementService } from '../../services/memberManagementService';
import { companyDashboardService } from '../../services/companyDashboardService';
import MemberCard from './components/MemberCard';
import RoleUpdateModal from './components/RoleUpdateModal';
import BulkActionsBar from './components/BulkActionsBar';
import { Helmet } from 'react-helmet';
import { supabase } from '../../lib/supabase';
import PageShell from '../../components/PageShell';

export default function MemberManagementCenter() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activityStatus, setActivityStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortMembers();
  }, [searchTerm, selectedRole, activityStatus, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get user's profile to find company
      const { data: profile } = await supabase?.from('user_profiles')?.select('company_id, role')?.eq('id', user?.id)?.single();

      if (!profile?.company_id) {
        setError('You must be part of a company to access member management');
        setLoading(false);
        return;
      }

      if (profile?.role !== 'company_admin' && profile?.role !== 'super_admin') {
        setError('You do not have permission to access member management');
        setLoading(false);
        return;
      }

      // Load company details
      const companyData = await companyDashboardService?.getCompanyDetails(profile?.company_id);
      setCompany(companyData);

      // Load teams
      const teamsData = await companyDashboardService?.getCompanyTeams(profile?.company_id);
      setTeams(teamsData);

      // Load members
      const membersData = await memberManagementService?.getCompanyMembers(profile?.company_id);
      setMembers(membersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err?.message || 'Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMembers = async () => {
    try {
      let filtered = [...members];

      // Apply search filter
      if (searchTerm) {
        const searchData = await memberManagementService?.searchMembers(company?.id, searchTerm);
        filtered = searchData;
      }

      // Apply role filter
      if (selectedRole !== 'all') {
        filtered = filtered?.filter(m => m?.role === selectedRole);
      }

      // Apply activity status filter
      if (activityStatus !== 'all') {
        if (activityStatus === 'active') {
          filtered = filtered?.filter(m => m?.isActive);
        } else if (activityStatus === 'inactive') {
          filtered = filtered?.filter(m => !m?.isActive);
        }
      }

      // Apply sorting
      if (sortBy === 'recent') {
        filtered?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'name') {
        filtered?.sort((a, b) => (a?.fullName || '')?.localeCompare(b?.fullName || ''));
      } else if (sortBy === 'activity') {
        filtered?.sort((a, b) => new Date(b.lastLoginAt || 0) - new Date(a.lastLoginAt || 0));
      }

      setMembers(filtered);
    } catch (err) {
      console.error('Error filtering members:', err);
    }
  };

  const handleSelectMember = (memberId) => {
    setSelectedMembers(prev => {
      if (prev?.includes(memberId)) {
        return prev?.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMembers?.length === members?.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members?.map(m => m?.id));
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await memberManagementService?.updateMemberRole(memberId, newRole);
      await loadData();
      setShowRoleModal(false);
      setSelectedMember(null);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err?.message || 'Failed to update member role');
    }
  };

  const handleUpdateTeam = async (memberId, teamId) => {
    try {
      await memberManagementService?.updateMemberTeam(memberId, teamId);
      await loadData();
    } catch (err) {
      console.error('Error updating team:', err);
      setError(err?.message || 'Failed to update member team');
    }
  };

  const handleDeactivate = async (memberId) => {
    try {
      await memberManagementService?.deactivateMember(memberId);
      await loadData();
    } catch (err) {
      console.error('Error deactivating member:', err);
      setError(err?.message || 'Failed to deactivate member');
    }
  };

  const handleReactivate = async (memberId) => {
    try {
      await memberManagementService?.reactivateMember(memberId);
      await loadData();
    } catch (err) {
      console.error('Error reactivating member:', err);
      setError(err?.message || 'Failed to reactivate member');
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the company? This action cannot be undone.')) {
      return;
    }

    try {
      await memberManagementService?.removeMember(memberId);
      await loadData();
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err?.message || 'Failed to remove member');
    }
  };

  const handleBulkRoleUpdate = async (newRole) => {
    try {
      await memberManagementService?.bulkUpdateRoles(selectedMembers, newRole);
      setSelectedMembers([]);
      await loadData();
    } catch (err) {
      console.error('Error bulk updating roles:', err);
      setError(err?.message || 'Failed to update member roles');
    }
  };

  const handleBulkDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate ${selectedMembers?.length} members?`)) {
      return;
    }

    try {
      await memberManagementService?.bulkDeactivateMembers(selectedMembers);
      setSelectedMembers([]);
      await loadData();
    } catch (err) {
      console.error('Error bulk deactivating:', err);
      setError(err?.message || 'Failed to deactivate members');
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading member data...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error && !company) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full">
            <div className="text-error mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Access Denied</h2>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  const userLimitInfo = companyDashboardService?.getUserLimitInfo(company);

  return (
    <PageShell>
      <Helmet>
        <title>Member Management Center | Social Code Bank</title>
        <meta name="description" content="Manage team members, roles, and permissions with comprehensive administrative controls" />
      </Helmet>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Member Management Center</h1>
                <p className="text-muted-foreground">Manage team members, roles, and access permissions for {company?.name}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-card px-4 py-3 rounded-lg shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {userLimitInfo?.current} / {userLimitInfo?.limit}
                      </div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => window.location.href = '/company-dashboard'}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-card rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e?.target?.value)}
                  className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent bg-card"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Developer</option>
                  <option value="team_member">Team Member</option>
                  <option value="team_admin">Team Manager</option>
                  <option value="company_admin">Manager / Admin</option>
                </select>

                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e?.target?.value)}
                  className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent bg-card"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e?.target?.value)}
                  className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent bg-card"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="activity">Last Activity</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Select All Checkbox */}
            <div className="mt-4 pt-4 border-t border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers?.length === members?.length && members?.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-muted-foreground rounded focus:ring-slate-700"
                />
                <span className="text-sm font-medium text-foreground">
                  Select All ({members?.length} members)
                </span>
              </label>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedMembers?.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedMembers?.length}
              onRoleUpdate={handleBulkRoleUpdate}
              onDeactivate={handleBulkDeactivate}
              onCancel={() => setSelectedMembers([])}
            />
          )}

          {/* Error Message */}
          {error && company && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-error mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-error">Error</h3>
                <p className="text-sm text-error mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-error hover:text-error"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Members Grid */}
          {members?.length === 0 ? (
            <div className="bg-card rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Members Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedRole !== 'all' || activityStatus !== 'all' ?'Try adjusting your filters to see more results' :'Start by inviting team members to your company'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {members?.map(member => (
                <MemberCard
                  key={member?.id}
                  member={member}
                  teams={teams}
                  isSelected={selectedMembers?.includes(member?.id)}
                  onSelect={handleSelectMember}
                  onUpdateRole={(newRole) => {
                    setSelectedMember(member);
                    setShowRoleModal(true);
                  }}
                  onUpdateTeam={handleUpdateTeam}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                  onRemove={handleRemove}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
      {/* Role Update Modal */}
      {showRoleModal && selectedMember && (
        <RoleUpdateModal
          member={selectedMember}
          onUpdate={handleUpdateRole}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </PageShell>
  );
}