import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { Plus, Users, Globe, Search, Filter, TrendingUp, Grid, List, ArrowUpDown, ChevronRight } from 'lucide-react';
import { hiveService } from '../../services/hiveService';
import CreateCompanyHiveModal from './components/CreateCompanyHiveModal';
import CompanyHiveCard from './components/CompanyHiveCard';
import AppNavigation from '../../components/AppNavigation';
import CompanySidebar from '../../components/CompanySidebar';

const CompanyTeamsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companyHives, setCompanyHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrivacy, setFilterPrivacy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [userRole, setUserRole] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchCompanyHives();
    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const profile = await hiveService?.getUserProfile(user?.id);
      setUserRole(profile?.role);
      setCompanyInfo({
        id: profile?.company_id,
        name: profile?.company_name
      });
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  const fetchCompanyHives = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hives = await hiveService?.getCompanyHives(user?.id);
      setCompanyHives(hives || []);
      setTotalPages(Math.ceil((hives?.length || 0) / itemsPerPage));
    } catch (err) {
      console.error('Error fetching company hives:', err);
      setError('Failed to load company hives');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHive = async (hiveData) => {
    try {
      const newHive = await hiveService?.createCompanyHive({
        ...hiveData,
        company_id: companyInfo?.id,
        is_global: false
      });
      
      setCompanyHives([newHive, ...companyHives]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating company hive:', err);
      throw err;
    }
  };

  const handleHiveClick = (hiveId) => {
    navigate(`/hives/${hiveId}`);
  };

  const canCreateHive = userRole === 'company_admin' || userRole === 'team_admin';

  // Advanced filtering and sorting
  const filteredAndSortedHives = companyHives
    ?.filter(hive => {
      const matchesSearch = hive?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           hive?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesPrivacy = filterPrivacy === 'all' || hive?.privacy === filterPrivacy;
      const matchesCategory = selectedCategory === 'all' || hive?.category === selectedCategory;
      return matchesSearch && matchesPrivacy && matchesCategory;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b?.created_at) - new Date(a?.created_at);
        case 'oldest':
          return new Date(a?.created_at) - new Date(b?.created_at);
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'members':
          return (b?.member_count || 0) - (a?.member_count || 0);
        case 'activity':
          return (b?.snippet_count || 0) - (a?.snippet_count || 0);
        default:
          return 0;
      }
    });

  // Pagination
  const paginatedHives = filteredAndSortedHives?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const categories = ['all', 'frontend', 'backend', 'mobile', 'devops', 'data'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company hives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <AppNavigation />

      <div className="flex">
        {/* Reusable Company Sidebar */}
        <CompanySidebar
          companyInfo={companyInfo}
          companyHives={companyHives}
          userRole={userRole}
          currentPage="hives"
          onCreateHive={() => setShowCreateModal(true)}
          onHiveClick={handleHiveClick}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <button
                  onClick={() => navigate('/company-dashboard')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Company
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Hive Hub</span>
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Company Hive Hub</h1>
                  <p className="mt-2 text-gray-600">
                    {companyInfo?.name ? `${companyInfo?.name}'s collaborative workspace` : 'Manage and organize your company hives'}
                  </p>
                </div>
                {canCreateHive && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md lg:hidden"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Hive
                  </button>
                )}
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Hives</p>
                      <p className="text-2xl font-bold text-blue-900">{companyHives?.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Active Members</p>
                      <p className="text-2xl font-bold text-green-900">
                        {companyHives?.reduce((acc, hive) => acc + (hive?.member_count || 0), 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Snippets</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {companyHives?.reduce((acc, hive) => acc + (hive?.snippet_count || 0), 0)}
                      </p>
                    </div>
                    <Globe className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Search, Filter, and View Controls */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hives by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Privacy Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterPrivacy}
                    onChange={(e) => setFilterPrivacy(e?.target?.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Privacy</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e?.target?.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="members">Most Members</option>
                    <option value="activity">Most Active</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid' ?'bg-blue-600 text-white' :'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list' ?'bg-blue-600 text-white' :'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hives Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {filteredAndSortedHives?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterPrivacy !== 'all' || selectedCategory !== 'all' ?'No hives found' :'No company hives yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterPrivacy !== 'all' || selectedCategory !== 'all' ?'Try adjusting your search or filters'
                    : canCreateHive 
                      ? 'Create your first company hive to get started' :'Contact your admin or director to create hives'}
                </p>
                {canCreateHive && !searchTerm && filterPrivacy === 'all' && selectedCategory === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Hive
                  </button>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedHives?.map((hive) => (
                      <CompanyHiveCard
                        key={hive?.id}
                        hive={hive}
                        onClick={() => handleHiveClick(hive?.id)}
                        userRole={userRole}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedHives?.map((hive) => (
                      <div
                        key={hive?.id}
                        onClick={() => handleHiveClick(hive?.id)}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{hive?.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                hive?.privacy === 'public' ?'bg-green-100 text-green-700' :'bg-yellow-100 text-yellow-700'
                              }`}>
                                {hive?.privacy}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{hive?.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {hive?.member_count || 0} members
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {hive?.snippet_count || 0} snippets
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white' :'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Hive Modal */}
      {showCreateModal && (
        <CreateCompanyHiveModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHive}
          companyId={companyInfo?.id}
        />
      )}
    </div>
  );
};

export default CompanyTeamsPage;