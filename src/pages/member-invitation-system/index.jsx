import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, X, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import PageShell from '../../components/PageShell';
import { companyMemberService } from '../../services/companyMemberService';
import { companyDashboardService } from '../../services/companyDashboardService';
import { supabase } from '../../lib/supabase';

export default function MemberInvitationSystem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Company & user data
  const [company, setCompany] = useState(null);
  const [teams, setTeams] = useState([]);
  const [invitationStats, setInvitationStats] = useState(null);
  
  // Invitation form
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('invite'); // invite, pending, history

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery?.trim()?.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const loadInitialData = async () => {
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

      // Load teams
      const teamsData = await companyDashboardService?.getCompanyTeams(profile?.company_id);
      setTeams(teamsData);

      // Load invitation stats
      const stats = await companyMemberService?.getInvitationStats(profile?.company_id);
      setInvitationStats(stats);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err?.message || 'Failed to load invitation system');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!company?.id) return;
    
    try {
      setSearching(true);
      const results = await companyMemberService?.searchUsersToInvite(company?.id, searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const exists = prev?.find(u => u?.id === user?.id);
      if (exists) {
        return prev?.filter(u => u?.id !== user?.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSendInvitations = async () => {
    if (selectedUsers?.length === 0) {
      alert('Please select at least one user to invite');
      return;
    }

    try {
      setSending(true);
      
      const userIds = selectedUsers?.map(u => u?.id);
      
      console.log('📤 Sending invitations to:', {
        companyId: company?.id,
        userCount: userIds?.length,
        teamId: selectedTeam || 'auto-assign',
        hasMessage: !!inviteMessage
      });

      const result = await companyMemberService?.bulkInviteToCompany(
        company?.id,
        userIds,
        selectedTeam || null,
        inviteMessage
      );

      console.log('📊 Invitation results:', result);

      // ENHANCED: Show detailed results with proper error information
      if (result?.successCount > 0 && result?.errorCount === 0) {
        alert(`✅ Success!\n\n${result?.successCount} invitation${result?.successCount !== 1 ? 's' : ''} sent successfully!`);
      } else if (result?.successCount > 0 && result?.errorCount > 0) {
        const errorDetails = result?.failed?.map(f => `• ${f?.error}`)?.join('\n');
        alert(
          `⚠️ Partial Success\n\n` +
          `Successful: ${result?.successCount}\n` +
          `Failed: ${result?.errorCount}\n\n` +
          `Errors:\n${errorDetails}`
        );
      } else {
        const errorDetails = result?.failed?.map(f => `• ${f?.error}`)?.join('\n');
        alert(
          `❌ All Invitations Failed\n\n` +
          `Failed: ${result?.errorCount}\n\n` +
          `Errors:\n${errorDetails}\n\n` +
          `Please check:\n` +
          `- Users aren't already in a company\n` + `- You haven't reached user limit\n` +
          `- Company has at least one team`
        );
      }

      // Only clear form if at least some succeeded
      if (result?.successCount > 0) {
        setSelectedUsers([]);
        setSearchQuery('');
        setSearchResults([]);
        setInviteMessage('');
      }
      
      // Always reload stats to reflect any changes
      try {
        const stats = await companyMemberService?.getInvitationStats(company?.id);
        setInvitationStats(stats);
        console.log('✅ Updated invitation stats:', stats);
      } catch (statsError) {
        console.error('⚠️ Failed to update stats:', statsError);
      }

    } catch (err) {
      console.error('❌ Error sending invitations:', err);
      alert(
        `❌ Failed to send invitations\n\n` +
        `Error: ${err?.message || 'Unknown error'}\n\n` +
        `Please try again or contact support if the problem persists.`
      );
    } finally {
      setSending(false);
    }
  };

  const userLimitInfo = companyDashboardService?.getUserLimitInfo(company);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading invitation system...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            <p className="text-error">{error}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/company-management-dashboard')}
            className="text-primary hover:text-primary mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">Member Invitation System</h1>
          <p className="text-muted-foreground mt-2">Invite new members to join {company?.name || 'your company'}</p>
        </div>

        {/* User Limit Warning */}
        {userLimitInfo && !userLimitInfo?.canAdd && (
          <div className="mb-6 bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-900 font-medium">User limit reached</p>
                <p className="text-warning text-sm mt-1">
                  You have reached the maximum of {userLimitInfo?.limit} users. Contact support to increase your limit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invitation Stats */}
        {invitationStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{invitationStats?.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold text-success">{invitationStats?.accepted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-error">{invitationStats?.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-error" />
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                  <p className="text-2xl font-bold text-primary">{invitationStats?.total}</p>
                </div>
                <Send className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        )}

        {/* Main Invitation Form */}
        <div className="bg-card rounded-lg shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Invite New Members</h2>
            <p className="text-sm text-muted-foreground mt-1">Search for users and send them invitations to join your company</p>
          </div>

          <div className="p-6 space-y-6">
            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  disabled={!userLimitInfo?.canAdd}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults?.length > 0 && (
                <div className="mt-4 border border-border rounded-lg max-h-64 overflow-y-auto">
                  {searchResults?.map((user) => {
                    const isSelected = selectedUsers?.some(u => u?.id === user?.id);
                    return (
                      <div
                        key={user?.id}
                        onClick={() => toggleUserSelection(user)}
                        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-background ${
                          isSelected ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                            {user?.avatarUrl ? (
                              <img src={user?.avatarUrl} alt={user?.fullName} className="h-10 w-10 rounded-full" />
                            ) : (
                              <span className="text-primary font-medium">
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user?.fullName || 'Unnamed'}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selected Users ({selectedUsers?.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers?.map((user) => (
                    <div
                      key={user?.id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary/15 text-foreground rounded-lg"
                    >
                      <span className="text-sm font-medium">{user?.fullName}</span>
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="text-primary hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assign to Team (Optional)
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e?.target?.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">No team (General)</option>
                {teams?.map((team) => (
                  <option key={team?.id} value={team?.id}>
                    {team?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Invitation Message (Optional)
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e?.target?.value)}
                placeholder="Add a personal message to the invitation..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendInvitations}
                disabled={selectedUsers?.length === 0 || sending || !userLimitInfo?.canAdd}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send {selectedUsers?.length} Invitation{selectedUsers?.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-2">How Invitations Work</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Search for users by name or email address</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Select multiple users for bulk invitations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Optionally assign invitees to a specific team</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Add a custom message to personalize invitations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Invited users receive a notification and can accept or reject</span>
            </li>
          </ul>
        </div>
    </PageShell>
  );
}