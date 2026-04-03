-- =============================================================================
-- HYPER-LOCAL MARKETPLACE - SUPABASE MIGRATION FILE
-- =============================================================================
-- This migration creates all required tables, extensions, and security policies
-- for the Hyper-Local Marketplace application
--
-- Run this in Supabase SQL Editor to set up your database
-- =============================================================================

-- =============================================================================
-- 1. ENABLE POSTGIS EXTENSION
-- =============================================================================
-- PostGIS enables geographic features and proximity searches
-- This allows queries like "Find items within 10km of my location"

CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS is enabled
SELECT postgis_full_version();

-- =============================================================================
-- 2. CREATE PROFILES TABLE
-- =============================================================================
-- Stores additional user information linked to auth.users
-- Includes location for proximity-based searches

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    last_location GEOGRAPHY(POINT, 4326), -- PostGIS geography type for lat/lng
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for location-based queries
CREATE INDEX idx_profiles_location ON profiles USING GIST(last_location);

-- =============================================================================
-- 3. CREATE CATEGORIES TABLE
-- =============================================================================
-- Hierarchical categories with parent-child relationships
-- Examples: Electronics > Phones, Home > Furniture

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- Lucide icon name
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for hierarchical queries
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Insert default categories
INSERT INTO categories (name, slug, icon, parent_id, sort_order) VALUES
-- Main categories
('Electronics', 'electronics', 'smartphone', NULL, 1),
('Home & Garden', 'home-garden', 'home', NULL, 2),
('Food & Dining', 'food-dining', 'utensils', NULL, 3),
('Fashion', 'fashion', 'shirt', NULL, 4),
('Vehicles', 'vehicles', 'car', NULL, 5),
('Sports', 'sports', 'dumbbell', NULL, 6),
('Services', 'services', 'briefcase', NULL, 7),
('Free Items', 'free', 'gift', NULL, 8),

-- Electronics subcategories
('Phones & Tablets', 'phones-tablets', 'smartphone', (SELECT id FROM categories WHERE slug = 'electronics'), 1),
('Computers', 'computers', 'laptop', (SELECT id FROM categories WHERE slug = 'electronics'), 2),
('TVs & Audio', 'tvs-audio', 'tv', (SELECT id FROM categories WHERE slug = 'electronics'), 3),
('Gaming', 'gaming', 'gamepad-2', (SELECT id FROM categories WHERE slug = 'electronics'), 4),

-- Home subcategories
('Furniture', 'furniture', 'armchair', (SELECT id FROM categories WHERE slug = 'home-garden'), 1),
('Appliances', 'appliances', 'refrigerator', (SELECT id FROM categories WHERE slug = 'home-garden'), 2),
('Decor', 'decor', 'lamp', (SELECT id FROM categories WHERE slug = 'home-garden'), 3),

-- Food subcategories
('Restaurants', 'restaurants', 'utensils', (SELECT id FROM categories WHERE slug = 'food-dining'), 1),
('Fast Food', 'fast-food', 'hamburger', (SELECT id FROM categories WHERE slug = 'food-dining'), 2),
('Coffee & Drinks', 'coffee-drinks', 'coffee', (SELECT id FROM categories WHERE slug = 'food-dining'), 3),
('Grocery', 'grocery', 'shopping-cart', (SELECT id FROM categories WHERE slug = 'food-dining'), 4),

-- Fashion subcategories
('Clothing', 'clothing', 'shirt', (SELECT id FROM categories WHERE slug = 'fashion'), 1),
('Shoes', 'shoes', 'footprints', (SELECT id FROM categories WHERE slug = 'fashion'), 2),
('Accessories', 'accessories', 'watch', (SELECT id FROM categories WHERE slug = 'fashion'), 3)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 4. CREATE LISTINGS TABLE
-- =============================================================================
-- Products/items for sale by users

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
    images TEXT[], -- Array of image URLs
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for location
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    is_sold BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- For auto-expiring listings
);

-- Indexes for listings
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_location ON listings USING GIST(location);
CREATE INDEX idx_listings_active ON listings(is_active, is_sold);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- =============================================================================
-- 5. CREATE RESTAURANTS TABLE
-- =============================================================================
-- Business listings for restaurants with menus and operating hours

CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    logo_url TEXT,
    cover_image_url TEXT,
    menu_json JSONB, -- Structured menu data
    operating_hours JSONB, -- { "monday": { "open": "09:00", "close": "22:00" }, ... }
    cuisine_types TEXT[],
    price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    phone TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for restaurants
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_location ON restaurants USING GIST(location);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);

-- =============================================================================
-- 6. CREATE FAVORITES TABLE
-- =============================================================================
-- Users can save listings and restaurants to favorites

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id),
    UNIQUE(user_id, restaurant_id)
);

-- =============================================================================
-- 7. CONFIGURE SUPABASE STORAGE
-- =============================================================================
-- Create storage buckets for marketplace assets

-- Create bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketplace-assets',
    'marketplace-assets',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for restaurant images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'restaurant-assets',
    'restaurant-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- Enable RLS on all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================

-- Everyone can read profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- =============================================================================
-- CATEGORIES POLICIES
-- =============================================================================

-- Everyone can read categories
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (is_active = true);

-- Only admins can modify categories (service role only)
CREATE POLICY "Service role can manage categories"
ON categories FOR ALL
USING (auth.role() = 'service_role');

-- =============================================================================
-- LISTINGS POLICIES
-- =============================================================================

-- Everyone can view active listings
CREATE POLICY "Active listings are viewable by everyone"
ON listings FOR SELECT
USING (is_active = true);

-- Authenticated users can create listings
CREATE POLICY "Users can create listings"
ON listings FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Only owners can update their listings
CREATE POLICY "Owners can update their listings"
ON listings FOR UPDATE
USING (auth.uid() = seller_id);

-- Only owners can delete their listings
CREATE POLICY "Owners can delete their listings"
ON listings FOR DELETE
USING (auth.uid() = seller_id);

-- =============================================================================
-- RESTAURANTS POLICIES
-- =============================================================================

-- Everyone can view active restaurants
CREATE POLICY "Active restaurants are viewable by everyone"
ON restaurants FOR SELECT
USING (is_active = true);

-- Restaurant owners can create their restaurants
CREATE POLICY "Users can create restaurants"
ON restaurants FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Only owners can update their restaurants
CREATE POLICY "Owners can update their restaurants"
ON restaurants FOR UPDATE
USING (auth.uid() = owner_id);

-- Only owners can delete their restaurants
CREATE POLICY "Owners can delete their restaurants"
ON restaurants FOR DELETE
USING (auth.uid() = owner_id);

-- =============================================================================
-- FAVORITES POLICIES
-- =============================================================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Anyone can view marketplace assets
CREATE POLICY "Marketplace assets are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-assets');

-- Users can upload marketplace assets
CREATE POLICY "Users can upload marketplace assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'marketplace-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own marketplace assets
CREATE POLICY "Users can delete marketplace assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'marketplace-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view avatars
CREATE POLICY "Avatars are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatars
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- 9. DATABASE FUNCTIONS
-- =============================================================================

-- Function to get listings within distance (in meters)
CREATE OR REPLACE FUNCTION get_listings_nearby(
    lat FLOAT,
    lng FLOAT,
    radius_meters FLOAT DEFAULT 10000,
    category_filter INTEGER DEFAULT NULL
)
RETURNS SETOF listings
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM listings
    WHERE is_active = true
      AND location IS NOT NULL
      AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          radius_meters
        )
      AND (category_filter IS NULL OR category_id = category_filter)
    ORDER BY ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    );
$$;

-- Function to get restaurants within distance
CREATE OR REPLACE FUNCTION get_restaurants_nearby(
    lat FLOAT,
    lng FLOAT,
    radius_meters FLOAT DEFAULT 10000,
    cuisine_filter TEXT DEFAULT NULL
)
RETURNS SETOF restaurants
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM restaurants
    WHERE is_active = true
      AND location IS NOT NULL
      AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          radius_meters
        )
      AND (cuisine_filter IS NULL OR cuisine_filter = ANY(cuisine_types))
    ORDER BY 
        rating DESC,
        ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        );
$$;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 10. ADDITIONAL HELPER VIEWS
-- =============================================================================

-- View for listings with seller info
CREATE OR REPLACE VIEW listings_with_seller AS
SELECT 
    l.*,
    p.username,
    p.full_name as seller_name,
    p.avatar_url as seller_avatar,
    c.name as category_name,
    c.slug as category_slug,
    ST_Distance(
        l.location::geography,
        ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography
    ) as distance_meters
FROM listings l
JOIN profiles p ON l.seller_id = p.id
LEFT JOIN categories c ON l.category_id = c.id;

-- View for restaurants with owner info
CREATE OR REPLACE VIEW restaurants_with_owner AS
SELECT 
    r.*,
    p.username,
    p.full_name as owner_name,
    p.avatar_url as owner_avatar,
    c.name as category_name,
    c.slug as category_slug
FROM restaurants r
JOIN profiles r_owner ON r.owner_id = r_owner.id
JOIN profiles p ON r.owner_id = p.id
LEFT JOIN categories c ON r.category_id = c.id;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================
SELECT 'Migration completed successfully!' as message;
