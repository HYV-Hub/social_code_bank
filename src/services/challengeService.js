import { supabase } from '../lib/supabase';

export const challengeService = {
  async getChallenges(status = 'all') {
    try {
      let query = supabase
        .from('challenges')
        .select('*, creator:user_profiles!challenges_created_by_fkey(id, username, full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (status === 'active') {
        query = query.gte('deadline', new Date().toISOString());
      } else if (status === 'ended') {
        query = query.lt('deadline', new Date().toISOString());
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  },

  async getChallengeById(id) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, creator:user_profiles!challenges_created_by_fkey(id, username, full_name, avatar_url)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  },

  async getChallengeSubmissions(challengeId) {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
        .eq('challenge_id', challengeId)
        .eq('visibility', 'public')
        .order('likes_count', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  async createChallenge(challengeData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('challenges')
        .insert({
          title: challengeData.title,
          description: challengeData.description,
          deadline: challengeData.deadline,
          difficulty: challengeData.difficulty || 'medium',
          tags: challengeData.tags || [],
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  async submitToChallenge(challengeId, snippetId) {
    try {
      const { error } = await supabase
        .from('snippets')
        .update({ challenge_id: challengeId })
        .eq('id', snippetId);
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting to challenge:', error);
      throw error;
    }
  },
};

export default challengeService;
