// =============================================================================
// DATABASE TYPES
// =============================================================================
// TypeScript types that mirror the Supabase database schema
// These types ensure type safety when working with Supabase data

import { PostgrestError } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// PROFILE TYPES
// -----------------------------------------------------------------------------

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  last_location: string | null; // PostGIS geography (GeoJSON)
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  last_location?: string;
}

export interface ProfileUpdate {
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  last_location?: string;
  updated_at?: string;
}

// -----------------------------------------------------------------------------
// CATEGORY TYPES
// -----------------------------------------------------------------------------

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

// -----------------------------------------------------------------------------
// LISTING TYPES
// -----------------------------------------------------------------------------

export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: string;
  seller_id: string;
  category_id: number | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: ListingCondition | null;
  images: string[] | null;
  location: string | null; // PostGIS geography (GeoJSON)
  address: string | null;
  is_active: boolean;
  is_sold: boolean;
  view_count: number;
  phone_number: string | null;  // NEW: Store seller phone number
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface ListingWithSeller extends Listing {
  seller_username: string | null;
  seller_full_name: string | null;
  seller_avatar: string | null;
  seller_phone: string | null;  // NEW: For WhatsApp contact
  seller_created_at: string | null; // NEW: For member tenure
  category_name: string | null;
  category_slug: string | null;
  distance_meters: number | null;
}

export interface ListingInsert {
  seller_id: string;
  category_id?: number;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  condition?: ListingCondition;
  images?: string[];
  location?: string;
  address?: string;
  phone_number?: string; // NEW: Mandatory seller contact
  is_active?: boolean;
  expires_at?: string;
}

export interface ListingUpdate {
  category_id?: number;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  condition?: ListingCondition;
  images?: string[];
  location?: string;
  address?: string;
  phone_number?: string;
  is_active?: boolean;
  is_sold?: boolean;
  updated_at?: string;
}

// -----------------------------------------------------------------------------
// RESTAURANT TYPES
// -----------------------------------------------------------------------------

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  owner_id: string;
  category_id: number | null;
  name: string;
  description: string | null;
  slug: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  menu_json: MenuCategory[] | null;
  operating_hours: OperatingHours | null;
  cuisine_types: string[] | null;
  price_range: PriceRange | null;
  rating: number;
  review_count: number;
  location: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantWithOwner extends Restaurant {
  owner_username: string | null;
  owner_full_name: string | null;
  owner_avatar: string | null;
  owner_phone: string | null;  // NEW: For WhatsApp contact
  category_name: string | null;
  category_slug: string | null;
  distance_meters: number | null;
}

export interface RestaurantInsert {
  owner_id: string;
  category_id?: number;
  name: string;
  description?: string;
  slug?: string;
  logo_url?: string;
  cover_image_url?: string;
  menu_json?: MenuCategory[];
  operating_hours?: OperatingHours;
  cuisine_types?: string[];
  price_range?: PriceRange;
  location?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface RestaurantUpdate {
  category_id?: number;
  name?: string;
  description?: string;
  slug?: string;
  logo_url?: string;
  cover_image_url?: string;
  menu_json?: MenuCategory[];
  operating_hours?: OperatingHours;
  cuisine_types?: string[];
  price_range?: PriceRange;
  location?: string;
  address?: string;
  phone?: string;
  website?: string;
  is_active?: boolean;
  is_verified?: boolean;
  updated_at?: string;
}

// -----------------------------------------------------------------------------
// FAVORITES TYPES
// -----------------------------------------------------------------------------

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string | null;
  restaurant_id: string | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// GEOLOCATION TYPES
// -----------------------------------------------------------------------------

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// -----------------------------------------------------------------------------
// API RESPONSE TYPES
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  error: PostgrestError | null;
  count: number | null;
  page: number;
  pageSize: number;
  totalPages: number;
}

// -----------------------------------------------------------------------------
// MARKETPLACE FILTER TYPES
// -----------------------------------------------------------------------------

export interface ListingFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition[];
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'distance';
}

export interface RestaurantFilters {
  categoryId?: number;
  cuisineTypes?: string[];
  priceRange?: PriceRange[];
  minRating?: number;
  searchQuery?: string;
  sortBy?: 'rating' | 'distance' | 'newest';
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// -----------------------------------------------------------------------------
// FORM TYPES
// -----------------------------------------------------------------------------

export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: ListingCondition;
  categoryId: number | null;
  images: File[];
  location: GeoPoint | null;
  address: string;
}

export interface RestaurantFormData {
  name: string;
  description: string;
  categoryId: number | null;
  cuisineTypes: string[];
  priceRange: PriceRange;
  menu: MenuCategory[];
  operatingHours: OperatingHours;
  location: GeoPoint | null;
  address: string;
  phone: string;
  website: string;
  logo: File | null;
  coverImage: File | null;
}

export interface ProfileFormData {
  username: string;
  fullName: string;
  bio: string;
  phone: string;
  avatar: File | null;
  location: GeoPoint | null;
}

// -----------------------------------------------------------------------------
// UI STATE TYPES
// -----------------------------------------------------------------------------

export interface MapMarker {
  id: string;
  type: 'listing' | 'restaurant';
  position: [number, number]; // [lat, lng]
  title: string;
  price?: number;
  imageUrl?: string;
}

export interface SearchState {
  query: string;
  category: number | null;
  filters: ListingFilters | RestaurantFilters;
  location: GeoPoint | null;
  radius: number; // in meters
  bounds: MapBounds | null;
}
