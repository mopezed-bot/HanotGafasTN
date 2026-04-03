-- =============================================================================
-- MIGRATION: Add phone_number to listings and fix Storage/Delete RLS
-- =============================================================================

-- 1. Add phone_number column to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 2. Fix Storage RLS for marketplace-assets (Public View + Auth Upload)
-- Allow anyone to view images
DROP POLICY IF EXISTS "Marketplace assets are public" ON storage.objects;
CREATE POLICY "Marketplace assets are public" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace-assets');

-- Allow authenticated users to upload to any folder in marketplace-assets
DROP POLICY IF EXISTS "Users can upload marketplace assets" ON storage.objects;
CREATE POLICY "Users can upload marketplace assets" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'marketplace-assets' 
    AND auth.uid() IS NOT NULL
);

-- 3. Fix Deletion RLS for listings
DROP POLICY IF EXISTS "Owners can delete their listings" ON listings;
CREATE POLICY "Owners can delete their listings"
ON listings FOR DELETE
USING (auth.uid() = seller_id);

-- 4. Update the View to include phone_number and seller details
CREATE OR REPLACE VIEW listings_with_seller AS
SELECT 
    l.*,
    p.username as seller_username,
    p.full_name as seller_full_name,
    p.avatar_url as seller_avatar,
    p.phone as seller_profile_phone,
    p.created_at as seller_created_at,
    c.name as category_name,
    c.slug as category_slug
FROM listings l
JOIN profiles p ON l.seller_id = p.id
LEFT JOIN categories c ON l.category_id = c.id;

-- 5. Enable public read for the bucket itself just in case
UPDATE storage.buckets SET public = true WHERE id = 'marketplace-assets';

SELECT 'Migration 006 completed: Phone added, View updated, Storage/Delete RLS fixed' as message;
