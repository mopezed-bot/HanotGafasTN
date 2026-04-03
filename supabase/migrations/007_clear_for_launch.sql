-- Clear all listings and related data for a fresh start
-- Categories are preserved
TRUNCATE listings, restaurants, favorites, messages, orders, order_items, reviews RESTART IDENTITY CASCADE;

SELECT 'Marketplace cleared for fresh launch!' as message;
