import { supabase } from './supabaseClient';

class LeaderboardService {
  /**
   * Fetch top snippet creators
   * @param {number} limit - Number of results
   * @param {string} timeWindow - 'daily' | 'weekly' | 'monthly' | 'all-time'
   */
  async getTopSnippetCreators(limit = 10, timeWindow = 'all-time') {
    try {
      let query = supabase?.from('user_profiles')?.select('id, username, full_name, avatar_url, snippets_count, points, contributor_level')?.order('snippets_count', { ascending: false })?.limit(limit);

      // Filter by timeWindow if needed (for now using all-time, future enhancement)
      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching top snippet creators:', error);
      throw error;
    }
  }

  /**
   * Fetch bug fix champions
   */
  async getBugFixChampions(limit = 10, timeWindow = 'all-time') {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('id, username, full_name, avatar_url, bugs_fixed_count, points, contributor_level')?.order('bugs_fixed_count', { ascending: false })?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bug fix champions:', error);
      throw error;
    }
  }

  /**
   * Fetch most helpful contributors (based on points)
   */
  async getMostHelpfulContributors(limit = 10, timeWindow = 'all-time') {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('id, username, full_name, avatar_url, points, snippets_count, bugs_fixed_count, contributor_level')?.order('points', { ascending: false })?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching most helpful contributors:', error);
      throw error;
    }
  }

  /**
   * Fetch community mentors (users with high follower count and points)
   */
  async getCommunityMentors(limit = 10) {
    try {
      const { data, error } = await // Minimum followers to be considered mentor
      supabase?.from('user_profiles')?.select('id, username, full_name, avatar_url, followers_count, points, snippets_count, contributor_level')?.gte('followers_count', 5)?.order('followers_count', { ascending: false })?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching community mentors:', error);
      throw error;
    }
  }

  /**
   * Get user's leaderboard rank in specific category
   */
  async getUserRank(userId, category = 'snippets') {
    try {
      let orderColumn = 'snippets_count';
      if (category === 'bugs') orderColumn = 'bugs_fixed_count';
      if (category === 'points') orderColumn = 'points';
      if (category === 'mentors') orderColumn = 'followers_count';

      // Get user's score
      const { data: userData, error: userError } = await supabase?.from('user_profiles')?.select(orderColumn)?.eq('id', userId)?.single();

      if (userError) throw userError;

      const userScore = userData?.[orderColumn] || 0;

      // Count users with higher scores
      const { count, error: countError } = await supabase?.from('user_profiles')?.select('*', { count: 'exact', head: true })?.gt(orderColumn, userScore);

      if (countError) throw countError;

      return {
        rank: (count || 0) + 1,
        score: userScore,
        category
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      throw error;
    }
  }

  /**
   * Get achievement badges based on milestones
   */
  getAchievementBadges(user) {
    const badges = [];

    // Snippet milestones
    if (user?.snippets_count >= 100) badges?.push({ name: 'Code Master', icon: '🏆', color: 'bg-warning/100' });
    else if (user?.snippets_count >= 50) badges?.push({ name: 'Code Expert', icon: '🥇', color: 'bg-yellow-400' });
    else if (user?.snippets_count >= 10) badges?.push({ name: 'Code Creator', icon: '🥈', color: 'bg-gray-400' });

    // Bug fix milestones
    if (user?.bugs_fixed_count >= 50) badges?.push({ name: 'Bug Terminator', icon: '🐛', color: 'bg-error/100' });
    else if (user?.bugs_fixed_count >= 20) badges?.push({ name: 'Bug Hunter', icon: '🔍', color: 'bg-red-400' });

    // Points milestones
    if (user?.points >= 1000) badges?.push({ name: 'Legend', icon: '⭐', color: 'bg-primary/100' });
    else if (user?.points >= 500) badges?.push({ name: 'Expert', icon: '💎', color: 'bg-primary' });

    // Mentor milestones
    if (user?.followers_count >= 50) badges?.push({ name: 'Mentor Elite', icon: '👨‍🏫', color: 'bg-success/100' });
    else if (user?.followers_count >= 20) badges?.push({ name: 'Community Mentor', icon: '🎓', color: 'bg-green-400' });

    return badges;
  }

  /**
   * Calculate trending score (for 7-day trending contributors)
   */
  calculateTrendingScore(snippetsCount, bugsFixedCount, points, daysActive = 7) {
    // Weighted scoring: snippets * 3 + bugs * 5 + points / 10
    const score = (snippetsCount * 3) + (bugsFixedCount * 5) + (points / 10);
    return Math.round(score / daysActive * 100) / 100;
  }
}

export default new LeaderboardService();