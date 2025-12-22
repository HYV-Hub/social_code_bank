import { supabase } from '../lib/supabase';

export const profileService = {
  // Get current user's profile
  async getCurrentProfile() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user?.id)?.single();

    if (error) throw error;

    // Convert snake_case to camelCase
    return {
      id: data?.id,
      email: data?.email,
      username: data?.username,
      fullName: data?.full_name,
      bio: data?.bio,
      avatarUrl: data?.avatar_url,
      role: data?.role,
      contributorLevel: data?.contributor_level,
      companyId: data?.company_id,
      teamId: data?.team_id,
      points: data?.points,
      snippetsCount: data?.snippets_count,
      followersCount: data?.followers_count,
      followingCount: data?.following_count,
      bugsFixedCount: data?.bugs_fixed_count,
      bugsReportedCount: data?.bugs_reported_count,
      createdAt: data?.created_at,
      updatedAt: data?.updated_at
    };
  },

  // Update user profile
  async updateProfile(profileData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Convert camelCase to snake_case for database
    const updateData = {};
    if (profileData?.username !== undefined) updateData.username = profileData?.username;
    if (profileData?.fullName !== undefined) updateData.full_name = profileData?.fullName;
    if (profileData?.bio !== undefined) updateData.bio = profileData?.bio;
    if (profileData?.avatarUrl !== undefined) updateData.avatar_url = profileData?.avatarUrl;

    const { data, error } = await supabase?.from('user_profiles')?.update(updateData)?.eq('id', user?.id)?.select()?.single();

    if (error) throw error;

    // Convert response back to camelCase
    return {
      id: data?.id,
      email: data?.email,
      username: data?.username,
      fullName: data?.full_name,
      bio: data?.bio,
      avatarUrl: data?.avatar_url,
      role: data?.role,
      updatedAt: data?.updated_at
    };
  },

  // Upload avatar to storage
  async uploadAvatar(file, userId) {
    if (!file) throw new Error('No file provided');

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes?.includes(file?.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
    }

    // Validate file size (2MB)
    if (file?.size > 2097152) {
      throw new Error('File size must be less than 2MB');
    }

    // Create unique filename with timestamp
    const fileExt = file?.name?.split('.')?.pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase?.storage?.from('avatars')?.upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    return filePath;
  },

  // Get signed URL for private avatar
  async getAvatarUrl(filePath) {
    if (!filePath) return null;

    const { data, error } = await supabase?.storage?.from('avatars')?.createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data?.signedUrl;
  },

  // Delete old avatar from storage
  async deleteAvatar(filePath) {
    if (!filePath) return;

    const { error } = await supabase?.storage?.from('avatars')?.remove([filePath]);

    if (error) console.error('Error deleting old avatar:', error);
  }
};
