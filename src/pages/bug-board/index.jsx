import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import KanbanColumn from './components/KanbanColumn';
import FilterToolbar from './components/FilterToolbar';
import BugDetailsModal from './components/BugDetailsModal';
import CreateBugModal from './components/CreateBugModal';
import { useAuth } from '../../contexts/AuthContext';
import AppNavigation from '../../components/AppNavigation';
import { bugService } from '../../services/bugService';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet';

const BugBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const teamId = searchParams?.get('team');
  const companyId = searchParams?.get('company');

  // Determine current context based on URL path AND query parameters
  const getCurrentContext = () => {
    // CRITICAL: Check query params FIRST - they override path detection
    if (companyId) return 'company';
    if (teamId) return 'team';
    
    // CRITICAL: Path-based detection ONLY if no query params
    if (location?.pathname?.includes('/user-dashboard')) return 'global';
    if (location?.pathname?.includes('/company-dashboard')) return 'company';
    if (location?.pathname?.includes('/team-dashboard')) return 'team';
    
    // DEFAULT: Personal bug board for direct /bug-board access
    return 'user';
  };

  const [currentContext] = useState(getCurrentContext());

  // State - NO MOCK DATA
  const [bugs, setBugs] = useState([]);
  const [bugFixes, setBugFixes] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [filteredBugFixes, setFilteredBugFixes] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [showCreateBugModal, setShowCreateBugModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    assignee: 'all',
    priority: 'all',
    language: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Load user profile for company context
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          ?.from('user_profiles')
          ?.select('company_id, team_id')
          ?.eq('id', user?.id)
          ?.single();
        
        setUserProfile(data);
      } catch (err) {
        console.error('Error loading user profile:', err);
      }
    };

    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBugs();
    }
  }, [user, teamId, companyId, currentContext]);

  const loadBugs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // CRITICAL: Pass proper context and companyId for strict filtering
      const filterParams = {
        context: currentContext,
        teamId: teamId || undefined,
        companyId: companyId || userProfile?.company_id || undefined
      };

      console.log('🔍 Loading bugs with filters:', filterParams);

      const allBugs = await bugService?.getBugs(user?.id, null, filterParams);
      
      console.log(`✅ Loaded ${allBugs?.length} bugs for context: ${currentContext}`);
      
      // Separate ongoing bugs from bug fixes
      const ongoingBugs = allBugs?.filter(bug => !bug?.isBugFix) || [];
      const fixes = allBugs?.filter(bug => bug?.isBugFix) || [];
      
      // Transform bugs to component format
      const transformBug = (bug) => ({
        id: bug?.id,
        title: bug?.title,
        description: bug?.description,
        code: bug?.code || '',
        fixedCode: bug?.fixedCode || '',
        previousCode: bug?.previousCode || '',
        fixExplanation: bug?.fixExplanation || '',
        isBugFix: bug?.isBugFix || false,
        language: bug?.language,
        priority: bug?.priority,
        status: bug?.status,
        visibility: bug?.visibility,
        likes: bug?.likesCount || 0,
        views: bug?.viewsCount || 0,
        comments: bug?.commentsCount || 0,
        createdAt: new Date(bug?.createdAt),
        updatedAt: new Date(bug?.updatedAt),
        author: {
          id: bug?.user?.id,
          name: bug?.user?.name || 'Anonymous',
          username: bug?.user?.username || '',
          avatar: bug?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bug?.user?.name || 'User')}&background=random`,
          avatarAlt: `Profile picture of ${bug?.user?.name || 'User'}`
        }
      });

      const transformedBugs = ongoingBugs?.map(transformBug);
      const transformedFixes = fixes?.map(transformBug);

      setBugs(transformedBugs);
      setBugFixes(transformedFixes);
      setFilteredBugs(transformedBugs);
      setFilteredBugFixes(transformedFixes);
    } catch (err) {
      console.error('Error loading bugs:', err);
      setError('Failed to load bugs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      assignee: 'all',
      priority: 'all',
      language: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e?.preventDefault();
    const bugId = e?.dataTransfer?.getData('bugId');
    const isBugFix = e?.dataTransfer?.getData('isBugFix') === 'true';

    try {
      await bugService?.updateBugStatus(bugId, newStatus);
      
      // Update in appropriate list
      if (isBugFix) {
        setBugFixes((prevBugs) =>
          prevBugs?.map((bug) =>
            bug?.id === bugId ? { ...bug, status: newStatus } : bug
          )
        );
        setFilteredBugFixes((prevBugs) =>
          prevBugs?.map((bug) =>
            bug?.id === bugId ? { ...bug, status: newStatus } : bug
          )
        );
      } else {
        setBugs((prevBugs) =>
          prevBugs?.map((bug) =>
            bug?.id === bugId ? { ...bug, status: newStatus } : bug
          )
        );
        setFilteredBugs((prevBugs) =>
          prevBugs?.map((bug) =>
            bug?.id === bugId ? { ...bug, status: newStatus } : bug
          )
        );
      }
    } catch (err) {
      console.error('Error updating bug status:', err);
      alert('Failed to update bug status');
    }
  };

  const handleViewDetails = (bug) => {
    setSelectedBug(bug);
  };

  const handleAssign = (bug) => {
    console.log('Assign bug:', bug?.id);
  };

  const handlePriorityChange = (bug) => {
    console.log('Change priority for bug:', bug?.id);
  };

  const handleCreateBug = async (formData) => {
    try {
      setLoading(true);
      const newBug = await bugService?.createBug({
        ...formData,
        companyId: userProfile?.company_id,
        teamId: userProfile?.team_id
      });
      
      // Reload bugs to get fresh data
      const { data } = await supabase
        ?.from('bugs')
        ?.select(`
          *,
          user_profiles!bugs_user_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        ?.eq('id', newBug?.id)
        ?.single();

      if (data) {
        const transformedBug = {
          id: data?.id,
          title: data?.title,
          description: data?.description,
          code: data?.code || '',
          language: data?.language,
          priority: data?.priority,
          status: data?.bug_status,
          visibility: data?.visibility,
          likes: data?.likes_count || 0,
          views: data?.views_count || 0,
          comments: data?.comments_count || 0,
          createdAt: new Date(data?.created_at),
          updatedAt: new Date(data?.updated_at),
          author: {
            id: data?.user_profiles?.id,
            name: data?.user_profiles?.full_name || 'Anonymous',
            username: data?.user_profiles?.username || '',
            avatar: data?.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.user_profiles?.full_name || 'User')}&background=random`,
            avatarAlt: `Profile picture of ${data?.user_profiles?.full_name || 'User'}`
          }
        };
        
        setBugs([transformedBug, ...bugs]);
        setFilteredBugs([transformedBug, ...filteredBugs]);
      }
      
      setShowCreateBugModal(false);
    } catch (err) {
      console.error('Error creating bug:', err);
      alert(err?.message || 'Failed to create bug');
    } finally {
      setLoading(false);
    }
  };

  const getBugsByStatus = (status, isBugFix = false) => {
    const sourceList = isBugFix ? filteredBugFixes : filteredBugs;
    return sourceList?.filter((bug) => bug?.status === status);
  };

  const getContextTitle = () => {
    if (currentContext === 'company') return 'Company Bug Board';
    if (currentContext === 'global') return 'Global Bug Board';
    if (currentContext === 'team') return 'Team Bug Board';
    return 'My Bug Board';
  };

  const getContextDescription = () => {
    if (currentContext === 'company') return 'Company-wide bug tracking and resolution';
    if (currentContext === 'global') return 'Public bugs from the community';
    if (currentContext === 'team') return 'Team-specific bug management';
    return 'Your personal bug reports';
  };

  // Show loading state
  if (loading && bugs?.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading bugs...</p>
          </div>
        </div>
      </div>
    );
  }

  // Columns for ongoing bugs
  const ongoingColumns = [
    { status: 'open', title: 'Open', bugs: getBugsByStatus('open') },
    { status: 'in_progress', title: 'In Progress', bugs: getBugsByStatus('in_progress') },
    { status: 'resolved', title: 'Resolved', bugs: getBugsByStatus('resolved') },
    { status: 'closed', title: 'Closed', bugs: getBugsByStatus('closed') }
  ];

  // Columns for bug fixes
  const bugFixColumns = [
    { status: 'open', title: 'Pending Review', bugs: getBugsByStatus('open', true) },
    { status: 'in_progress', title: 'Under Review', bugs: getBugsByStatus('in_progress', true) },
    { status: 'resolved', title: 'Approved', bugs: getBugsByStatus('resolved', true) },
    { status: 'closed', title: 'Archived', bugs: getBugsByStatus('closed', true) }
  ];

  return (
    <>
      <Helmet>
        <title>{getContextTitle()} - HyvHub</title>
      </Helmet>
      <AppNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {(teamId || companyId) && (
                  <button
                    onClick={() => {
                      if (teamId) navigate(`/team-dashboard?team=${teamId}`);
                      else if (companyId) navigate(`/company-dashboard?company=${companyId}`);
                      else navigate('/user-dashboard');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="ArrowLeft" size={20} />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getContextTitle()}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {getContextDescription()}
                  </p>
                </div>
              </div>

              <Button
                variant="default"
                iconName="Plus"
                onClick={() => setShowCreateBugModal(true)}
              >
                Report Bug
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1920px] mx-auto px-6 py-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Error Loading Bugs</h3>
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={() => window.location?.reload()}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Bugs</span>
                <Icon name="Bug" size={20} className="text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{bugs?.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Open</span>
                <Icon name="AlertCircle" size={20} className="text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {getBugsByStatus('open')?.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">In Progress</span>
                <Icon name="Clock" size={20} className="text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {getBugsByStatus('in_progress')?.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Resolved</span>
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {getBugsByStatus('resolved')?.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Bug Fixes</span>
                <Icon name="Wrench" size={20} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {bugFixes?.length}
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <FilterToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            teamMembers={teamMembers}
            onCreateBug={() => setShowCreateBugModal(true)} 
          />

          {/* Ongoing Bugs Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Ongoing Bugs</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {ongoingColumns?.map((column) =>
                <KanbanColumn
                  key={column?.status}
                  status={column?.status}
                  title={column?.title}
                  bugs={column?.bugs}
                  onDrop={handleDrop}
                  onDragOver={(e) => e?.preventDefault()}
                  onViewDetails={setSelectedBug}
                  isBugFix={false}
                />
              )}
            </div>
          </div>

          {/* Bug Fixes Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">Bug Fixes</h2>
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {bugFixes?.length} fixes
                </div>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {bugFixColumns?.map((column) =>
                <KanbanColumn
                  key={`fix-${column?.status}`}
                  status={column?.status}
                  title={column?.title}
                  bugs={column?.bugs}
                  onDrop={handleDrop}
                  onDragOver={(e) => e?.preventDefault()}
                  onViewDetails={setSelectedBug}
                  isBugFix={true}
                />
              )}
            </div>
          </div>
        </main>

        {/* Modals */}
        {selectedBug &&
          <BugDetailsModal
            bug={selectedBug}
            onClose={() => setSelectedBug(null)}
            onStatusChange={(newStatus) => {
              const isBugFix = selectedBug?.isBugFix;
              
              if (isBugFix) {
                setBugFixes(prevBugs => 
                  prevBugs?.map(b => b?.id === selectedBug?.id ? { ...b, status: newStatus } : b)
                );
                setFilteredBugFixes(prevBugs => 
                  prevBugs?.map(b => b?.id === selectedBug?.id ? { ...b, status: newStatus } : b)
                );
              } else {
                setBugs(prevBugs => 
                  prevBugs?.map(b => b?.id === selectedBug?.id ? { ...b, status: newStatus } : b)
                );
                setFilteredBugs(prevBugs => 
                  prevBugs?.map(b => b?.id === selectedBug?.id ? { ...b, status: newStatus } : b)
                );
              }
            }}
          />
        }

        {showCreateBugModal &&
          <CreateBugModal
            isOpen={showCreateBugModal}
            onClose={() => setShowCreateBugModal(false)}
            onSuccess={loadBugs}
            teamId={teamId}
            companyId={companyId || userProfile?.company_id}
            context={currentContext}
          />
        }
      </div>
    </>
  );
};

export default BugBoardPage;