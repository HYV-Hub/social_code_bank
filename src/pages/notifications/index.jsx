import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Bell, Settings, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { NotificationCard } from './components/NotificationCard';
import { FilterControls } from './components/FilterControls';
import { BulkActions } from './components/BulkActions';
import { PreferencesPanel } from './components/PreferencesPanel';
import { SearchPanel } from './components/SearchPanel';
import AppShell from '../../components/AppShell';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load notifications only after authentication is confirmed
  useEffect(() => {
    if (!authLoading && user) {
      loadNotifications();
      loadUnreadCount();

      // Subscribe to real-time updates
      const unsubscribe = notificationService?.subscribeToNotifications(user?.id, (payload) => {
        if (payload?.eventType === 'INSERT') {
          loadNotifications();
          loadUnreadCount();
        } else if (payload?.eventType === 'UPDATE' || payload?.eventType === 'DELETE') {
          loadNotifications();
          loadUnreadCount();
        }
      });

      return () => {
        if (unsubscribe) {
          notificationService?.unsubscribeFromNotifications(unsubscribe);
        }
      };
    }
  }, [user, authLoading]);

  useEffect(() => {
    applyFilters();
  }, [notifications, activeFilter, showUnreadOnly, searchTerm, dateRange]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await notificationService?.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService?.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered?.filter(n => n?.type === activeFilter);
    }

    // Apply unread filter
    if (showUnreadOnly) {
      filtered = filtered?.filter(n => !n?.isRead);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm?.toLowerCase();
      filtered = filtered?.filter(n =>
        n?.title?.toLowerCase()?.includes(term) ||
        n?.message?.toLowerCase()?.includes(term) ||
        n?.actorName?.toLowerCase()?.includes(term)
      );
    }

    // Apply date range
    if (dateRange?.start && dateRange?.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filtered = filtered?.filter(n => {
        const date = new Date(n.createdAt);
        return date >= start && date <= end;
      });
    }

    setFilteredNotifications(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleToggleUnreadOnly = (value) => {
    setShowUnreadOnly(value);
  };

  const handleUpdate = () => {
    loadNotifications();
    loadUnreadCount();
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
    setSelectedIds(prev => prev?.filter(selectedId => selectedId !== id));
  };

  const handleToggleSelection = (id) => {
    setSelectedIds(prev =>
      prev?.includes(id)
        ? prev?.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Show loading state during authentication check
  if (authLoading || loading) {
    return (
      <AppShell pageTitle="Notifications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <AppShell pageTitle="Notifications">
      <Helmet>
        <title>Notifications - HyvHub</title>
      </Helmet>
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                  <p className="text-muted-foreground mt-1">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreferences(true)}
                className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Preferences</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Added mt-6 to create space below sticky header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-6">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            {/* Search Panel */}
            <SearchPanel
              onSearch={handleSearch}
              onDateRangeChange={handleDateRangeChange}
            />

            {/* Filter Controls */}
            <FilterControls
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              notifications={notifications}
              showUnreadOnly={showUnreadOnly}
              onToggleUnreadOnly={handleToggleUnreadOnly}
            />

            {/* Bulk Actions */}
            <BulkActions
              selectedIds={selectedIds}
              onClearSelection={handleClearSelection}
              onUpdate={handleUpdate}
            />

            {/* Notifications List */}
            <div className="divide-y divide-border">
              {error ? (
                <div className="p-8 text-center">
                  <p className="text-error mb-4">{error}</p>
                  <button
                    onClick={loadNotifications}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredNotifications?.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || dateRange
                      ? 'No notifications match your search criteria'
                      : showUnreadOnly
                      ? "You're all caught up! No unread notifications."
                      : 'You have no notifications yet'}
                  </p>
                </div>
              ) : (
                filteredNotifications?.map((notification) => (
                  <div key={notification?.id} className="relative">
                    <label className="absolute left-4 top-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds?.includes(notification?.id)}
                        onChange={() => handleToggleSelection(notification?.id)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                    </label>
                    <div className="pl-12">
                      <NotificationCard
                        notification={notification}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Preferences Panel */}
        {/* Preferences Panel */}
        <PreferencesPanel
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
        />
    </AppShell>
  );
}