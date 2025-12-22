-- Profile Avatars Storage Bucket Setup
-- Create bucket for user profile avatars (private bucket for security)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars', 
    false,  -- Private bucket for security
    2097152, -- 2MB limit for avatar images
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- RLS Policy: Users can manage only their own avatars
CREATE POLICY "users_manage_own_avatars" ON storage.objects
FOR ALL TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own avatars
CREATE POLICY "users_view_own_avatars" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);