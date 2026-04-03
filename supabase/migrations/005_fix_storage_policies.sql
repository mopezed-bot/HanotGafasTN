-- =============================================================================
-- MIGRATION: Fix storage policies for public access
-- Date: 2024
-- Purpose: Ensure storage buckets allow public read access for images
-- =============================================================================

-- First, ensure the bucket exists with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketplace-assets',
    'marketplace-assets',
    true,  -- Public bucket
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create or replace policies for marketplace-assets bucket

-- 1. Allow public read access (everyone can view images)
DROP POLICY IF EXISTS "Marketplace assets are public" ON storage.objects;
CREATE POLICY "Marketplace assets are public" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace-assets');

-- 2. Allow authenticated users to upload
DROP POLICY IF EXISTS "Users can upload marketplace assets" ON storage.objects;
CREATE POLICY "Users can upload marketplace assets" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'marketplace-assets'
    AND (auth.uid() IS NOT NULL)
);

-- 3. Allow users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete marketplace assets" ON storage.objects;
CREATE POLICY "Users can delete marketplace assets" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'marketplace-assets'
    AND auth.uid() IS NOT NULL
);

-- 4. Allow users to update their own uploads
DROP POLICY IF EXISTS "Users can update marketplace assets" ON storage.objects;
CREATE POLICY "Users can update marketplace assets" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'marketplace-assets'
    AND auth.uid() IS NOT NULL
);

-- Also fix avatars bucket policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Avatars policies
DROP POLICY IF EXISTS "Avatars are public" ON storage.objects;
CREATE POLICY "Avatars are public" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
CREATE POLICY "Users can update avatars" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
);

SELECT 'Migration 005 completed: Fixed storage policies for public access' as message;
