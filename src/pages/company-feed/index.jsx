import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppNavigation from '../../components/AppNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CompanySidebar from '../../components/CompanySidebar';
import { hiveService } from '../../services/hiveService';

export default function CompanyFeed() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 12;
  const [companyHives, setCompanyHives] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    if (!user || !userProfile?.company_id) {
      setLoading(false);
      return;
    }
    loadCompanyFeed();
  }, [user, userProfile, sortBy, filterLanguage]);

  const fetchCompanyData = async () => {
    try {
      const profile = await hiveService?.getUserProfile(user?.id);
      setUserRole(profile?.role);
      setCompanyInfo({
        id: profile?.company_id,
        name: profile?.company_name
      });

      const hives = await hiveService?.getCompanyHives(user?.id);
      setCompanyHives(hives || []);
    } catch (err) {
      console.error('Error fetching company data:', err);
    }
  };

  const loadCompanyFeed = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase?.from('snippets')?.select(`
          *,
          user_profiles!snippets_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          ),
          teams!snippets_team_id_fkey(
            id,
            name
          )
        `)?.eq('company_id', userProfile?.company_id)?.in('visibility', ['company', 'public']);

      // Apply language filter
      if (filterLanguage && filterLanguage !== 'all') {
        query = query?.eq('language', filterLanguage);
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query?.order('likes_count', { ascending: false });
          break;
        case 'views':
          query = query?.order('views_count', { ascending: false });
          break;
        case 'recent':
        default:
          query = query?.order('created_at', { ascending: false });
          break;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setSnippets(data || []);
    } catch (err) {
      console.error('Error loading company feed:', err);
      setError(err?.message || 'Failed to load company feed');
    } finally {
      setLoading(false);
    }
  };

  const handleSnippetClick = (snippetId) => {
    navigate(`/snippet-details?id=${snippetId}`);
  };

  const totalPages = Math.ceil(snippets?.length / resultsPerPage);
  const paginatedSnippets = snippets?.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="Building" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view company feed</h2>
          <p className="text-muted-foreground mb-6">Access your company's code sharing activity</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (!userProfile?.company_id) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" className="text-warning flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Company Association</h3>
                <p className="text-yellow-800">You are not associated with any company. Please join or create a company first.</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/company-creation')}
                >
                  Create Company
                </Button>
              </div>
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
          currentPage="feed"
          onCreateHive={() => navigate('/company-teams-page')}
          onHiveClick={(hiveId) => navigate(`/hives/${hiveId}`)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-card border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Company Feed</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    All posts from company members across all teams
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/create-snippet')}
                  className="flex items-center gap-2"
                >
                  <Icon name="Plus" size={20} />
                  <span>Create Post</span>
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e?.target?.value)}
                    className="px-3 py-1 border border-border rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e?.target?.value)}
                    className="px-3 py-1 border border-border rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-blue-500"
                  >
                    <option value="all">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                  </select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  {snippets?.length} {snippets?.length === 1 ? 'post' : 'posts'}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error loading feed</p>
                  <p className="text-sm text-error mt-1">{error}</p>
                </div>
                <button
                  onClick={loadCompanyFeed}
                  className="text-sm font-medium text-error hover:text-error"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading company feed...</p>
                </div>
              </div>
            ) : snippets?.length === 0 ? (
              /* Empty State */
              (<div className="text-center py-16">
                <Icon name="Code" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No company posts yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share code with your company!
                </p>
                <Button onClick={() => navigate('/create-snippet')}>
                  Create First Post
                </Button>
              </div>)
            ) : (
              <>
                {/* Snippets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSnippets?.map((snippet) => (
                    <div
                      key={snippet?.id}
                      onClick={() => handleSnippetClick(snippet?.id)}
                      className="bg-card rounded-lg border border-border hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                            {snippet?.title}
                          </h3>
                          {snippet?.visibility === 'company' && (
                            <span className="ml-2 px-2 py-1 bg-primary/15 text-primary text-xs rounded-full flex-shrink-0">
                              Company
                            </span>
                          )}
                        </div>
                        {snippet?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {snippet?.description}
                          </p>
                        )}
                      </div>

                      {/* Code Preview */}
                      <div className="bg-card p-4 max-h-32 overflow-hidden">
                        <pre className="text-xs text-foreground font-mono line-clamp-4">
                          <code>{snippet?.code}</code>
                        </pre>
                      </div>

                      {/* Footer */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {snippet?.language}
                          </span>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Heart" size={14} />
                              {snippet?.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Eye" size={14} />
                              {snippet?.views_count || 0}
                            </span>
                          </div>
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-2">
                          {snippet?.user_profiles?.avatar_url ? (
                            <img
                              src={snippet?.user_profiles?.avatar_url}
                              alt={snippet?.user_profiles?.full_name || 'Author'}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <Icon name="User" size={14} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {snippet?.user_profiles?.full_name || snippet?.user_profiles?.username}
                            </p>
                            {snippet?.teams && (
                              <p className="text-xs text-muted-foreground truncate">
                                {snippet?.teams?.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* AI Tags */}
                        {snippet?.ai_tags && snippet?.ai_tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {snippet?.ai_tags?.slice(0, 3)?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-purple-100 text-primary rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {snippet?.ai_tags?.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-muted text-foreground rounded-full">
                                +{snippet?.ai_tags?.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <Icon name="ChevronLeft" size={16} />
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : 
                                      currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                      currentPage - 2 + i;
                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-primary text-white' :'bg-card text-foreground hover:bg-muted border border-border'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <Icon name="ChevronRight" size={16} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}