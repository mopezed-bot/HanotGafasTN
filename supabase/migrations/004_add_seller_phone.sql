-- =============================================================================
-- MIGRATION: Add seller phone to listings view for WhatsApp contact
-- Date: 2024
-- Purpose: Allow buyers to see seller phone number for WhatsApp contact
-- =============================================================================

-- Update the listings_with_seller view to include seller phone number
CREATE OR REPLACE VIEW listings_with_seller AS
SELECT 
    l.*,
    p.username,
    p.full_name as seller_name,
    p.avatar_url as seller_avatar,
    p.phone as seller_phone,  -- NEW: Include seller phone
    c.name as category_name,
    c.slug as category_slug,
    ST_Distance(
        l.location::geography,
        ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography
    ) as distance_meters
FROM listings l
JOIN profiles p ON l.seller_id = p.id
LEFT JOIN categories c ON l.category_id = c.id;

-- Also update restaurants_with_owner view
CREATE OR REPLACE VIEW restaurants_with_owner AS
SELECT 
    r.*,
    p.username,
    p.full_name as owner_name,
    p.avatar_url as owner_avatar,
    p.phone as owner_phone,  -- NEW: Include owner phone
    c.name as category_name,
    c.slug as category_slug
FROM restaurants r
JOIN profiles p ON r.owner_id = p.id
LEFT JOIN categories c ON r.category_id = c.id;

-- Grant public read access to phone numbers (required for marketplace)
-- This is already covered by the "Public profiles are viewable by everyone" policy
-- but let's ensure it works correctly

SELECT 'Migration 004 completed: Added seller_phone to listings view' as message;
