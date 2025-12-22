import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, LayoutGrid, Settings, BarChart3, Plus } from 'lucide-react';
import Icon from './AppIcon';


const CompanySidebar = ({ 
  companyInfo, 
  companyHives = [], 
  userRole,
  currentPage = 'hives',
  onCreateHive,
  onHiveClick 
}) => {
  const navigate = useNavigate();

  const canCreateHive = userRole === 'company_admin' || userRole === 'team_admin';

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Company Dashboard',
      icon: Home,
      path: '/company-dashboard'
    },
    {
      id: 'hives',
      label: 'Company Hives',
      icon: LayoutGrid,
      path: '/company-teams-page'
    },
    {
      id: 'management',
      label: 'Management',
      icon: Settings,
      path: '/company-management-dashboard'
    },
    {
      id: 'feed',
      label: 'Company Feed',
      icon: BarChart3,
      path: '/company-feed'
    }
  ];

  return (
    <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 min-h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Company Overview */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{companyInfo?.name || 'Company'}</h3>
              <p className="text-sm text-gray-600">Company Workspace</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Hives</p>
              <p className="text-lg font-bold text-blue-900">{companyHives?.length || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium">Members</p>
              <p className="text-lg font-bold text-green-900">
                {companyHives?.reduce((acc, hive) => acc + (hive?.member_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Navigation</h3>
          <nav className="space-y-1">
            {navigationItems?.map((item) => {
              const Icon = item?.icon;
              const isActive = item?.id === currentPage;
              
              return (
                <button
                  key={item?.id}
                  onClick={() => navigate(item?.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium' :'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item?.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* My Company Hives */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">My Hives</h3>
          {companyHives?.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {companyHives?.slice(0, 5)?.map((hive) => (
                <button
                  key={hive?.id}
                  onClick={() => onHiveClick?.(hive?.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${
                      hive?.privacy === 'private' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 truncate">{hive?.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {hive?.member_count || 0}
                  </span>
                </button>
              ))}
              {companyHives?.length > 5 && (
                <button
                  onClick={() => navigate('/company-teams-page')}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  View all {companyHives?.length} hives
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-3">No hives yet</p>
              {canCreateHive && (
                <button
                  onClick={onCreateHive}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first hive
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {canCreateHive && (
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={onCreateHive}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create New Hive
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CompanySidebar;