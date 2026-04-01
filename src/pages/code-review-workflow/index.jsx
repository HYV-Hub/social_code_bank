import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppNavigation from '../../components/AppNavigation';

export default function CodeReviewWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Add authentication check
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // State - NO MOCK DATA
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: Fetch reviews from Supabase
  useEffect(() => {
    if (user) {
      setLoading(true);
      // Will be implemented with Supabase integration
      // fetchReviews();
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      {/* ... keep existing UI structure ... */}
    </div>
  );
}