// =============================================================================
// LISTINGS API
// =============================================================================
// API functions for fetching, creating, updating, and deleting listings
// Includes proximity-based search using PostGIS

import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import type { 
  Listing, 
  ListingWithSeller, 
  ListingInsert, 
  ListingUpdate,
  ListingFilters,
  GeoPoint
} from '@/types';
import { uploadMultipleImages } from '@/lib/supabase/storage';

/**
 * Parse PostGIS point string to extract lat/lng
 * Handles formats: "POINT(lng lat)" or { lat, lng } object
 */
function parsePostGISPoint(location: string): { lat: number; lng: number } {
  // If it's already an object
  if (typeof location === 'object') {
    return location as { lat: number; lng: number };
  }
  
  // Parse POINT(lng lat) format
  const match = location.match(/POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/i);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }
  
  // Default to Gafsa, Tunisia if parsing fails
  return { lat: 34.4251, lng: 9.4697 };
}

/**
 * Fetch all active listings with optional filters
 * 
 * @param filters - Optional filters for the listings
 * @param page - Page number for pagination
 * @param pageSize - Number of items per page
 * @returns Array of listings with seller information
 * 
 * @example
 * const listings = await getListings({ categoryId: 1, minPrice: 10 });
 */
export async function getListings(
  filters?: ListingFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: ListingWithSeller[]; error: Error | null; count: number }> {
  try {
    let query = supabase
      .from('listings_with_seller')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    // Apply filters
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.condition && filters.condition.length > 0) {
      query = query.in('condition', filters.condition);
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: [], error: error as Error, count: 0 };
    }

    return { 
      data: (data as ListingWithSeller[]) || [], 
      error: null, 
      count: count || 0 
    };
  } catch (error) {
    return { data: [], error: error as Error, count: 0 };
  }
}

/**
 * Fetch listings within a specific distance using PostGIS
 * 
 * @param userLocation - User's current coordinates
 * @param radiusMeters - Search radius in meters (default: 10000 = 10km)
 * @param categoryId - Optional category filter
 * @returns Array of listings sorted by distance
 * 
 * @example
 * const nearby = await getListingsNearby(
 *   { lat: 40.7128, lng: -74.0060 },
 *   5000, // 5km
 *   1 // Electronics category
 * );
 */
export async function getListingsNearby(
  userLocation: GeoPoint,
  radiusMeters: number = 10000,
  categoryId?: number
): Promise<{ data: ListingWithSeller[]; error: Error | null }> {
  try {
    // Call the database function
    const { data, error } = await supabase.rpc('get_listings_nearby', {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius_meters: radiusMeters,
      category_filter: categoryId || null,
    });

    if (error) {
      console.error('Error fetching nearby listings:', error);
      return { data: [], error: error as Error };
    }

    return { data: (data as ListingWithSeller[]) || [], error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Fetch a single listing by ID
 * 
 * @param id - Listing ID
 * @returns Listing with seller information
 * 
 * @example
 * const listing = await getListingById('abc-123');
 */
export async function getListingById(
  id: string
): Promise<{ data: ListingWithSeller | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('listings_with_seller')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as ListingWithSeller, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Fetch listings by seller ID
 * 
 * @param sellerId - Seller's user ID
 * @returns Array of listings by the seller
 * 
 * @example
 * const myListings = await getListingsBySeller(userId);
 */
export async function getListingsBySeller(
  sellerId: string
): Promise<{ data: Listing[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    return { data: (data as Listing[]) || [], error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Create a new listing
 * 
 * @param listing - Listing data
 * @param images - Optional array of image files
 * @returns Created listing
 * 
 * @example
 * const newListing = await createListing({
 *   title: 'iPhone 14 Pro',
 *   price: 999,
 *   seller_id: userId,
 *   category_id: 1
 * }, imageFiles);
 */
export async function createListing(
  listing: ListingInsert,
  images?: File[]
): Promise<{ data: Listing | null; error: Error | null }> {
  try {
    let imageUrls: string[] = [];

    // Upload images if provided
    if (images && images.length > 0) {
      const { urls, errors } = await uploadMultipleImages(images, 'listings');
      imageUrls = urls;
      
      if (errors.length > 0) {
        console.error('Image upload errors:', errors);
      }
    }

    // Convert GeoPoint to PostGIS geography
    // The location should be stored as GeoJSON Point in WKT format
    let locationWkt = null;
    if (listing.location) {
      const location = listing.location as string;
      const { lat, lng } = parsePostGISPoint(location);
      locationWkt = `SRID=4326;POINT(${lng} ${lat})`;
    }

    const listingData = {
      ...listing,
      images: imageUrls.length > 0 ? imageUrls : null,
      location: locationWkt,
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as Listing, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Update an existing listing
 * 
 * @param id - Listing ID
 * @param updates - Updated listing data
 * @returns Updated listing
 * 
 * @example
 * const updated = await updateListing('abc-123', { price: 899 });
 */
export async function updateListing(
  id: string,
  updates: ListingUpdate
): Promise<{ data: Listing | null; error: Error | null }> {
  try {
    // Handle location update
    let locationWkt = undefined;
    if (updates.location) {
      const { lat, lng } = updates.location;
      locationWkt = `SRID=4326;POINT(${lng} ${lat})`;
    }

    const updateData = {
      ...updates,
      location: locationWkt,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as Listing, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Mark a listing as sold
 * 
 * @param id - Listing ID
 * @returns Updated listing
 * 
 * @example
 * await markListingAsSold('abc-123');
 */
export async function markListingAsSold(
  id: string
): Promise<{ data: Listing | null; error: Error | null }> {
  return updateListing(id, { is_sold: true });
}

/**
 * Delete a listing
 * 
 * @param id - Listing ID
 * @returns Success status
 * 
 * @example
 * await deleteListing('abc-123');
 */
export async function deleteListing(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error as Error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Increment view count for a listing
 * 
 * @param id - Listing ID
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    await supabase.rpc('increment_listing_views', { listing_id: id });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Server-side functions (for use in Server Components)
export async function getListingsServer(
  filters?: ListingFilters,
  page: number = 1,
  pageSize: number = 20
) {
  const { createClient } = await import('@supabase/ssr');
  const cookieStore = await import('next/headers').then(m => m.cookies());
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
  
  let query = supabase
    .from('listings_with_seller')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  return query;
}
