// =============================================================================
// RESTAURANTS API
// =============================================================================
// API functions for fetching, creating, updating, and deleting restaurants
// Includes proximity-based search using PostGIS

import { supabase } from '@/lib/supabase/client';
import type { 
  Restaurant, 
  RestaurantWithOwner, 
  RestaurantInsert, 
  RestaurantUpdate,
  RestaurantFilters,
  GeoPoint
} from '@/types';
import { uploadRestaurantImage } from '@/lib/supabase/storage';

/**
 * Fetch all active restaurants with optional filters
 * 
 * @param filters - Optional filters for restaurants
 * @param page - Page number for pagination
 * @param pageSize - Number of items per page
 * @returns Array of restaurants with owner information
 */
export async function getRestaurants(
  filters?: RestaurantFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: RestaurantWithOwner[]; error: Error | null; count: number }> {
  try {
    let query = supabase
      .from('restaurants_with_owner')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.cuisineTypes && filters.cuisineTypes.length > 0) {
      query = query.overlaps('cuisine_types', filters.cuisineTypes);
    }

    if (filters?.priceRange && filters.priceRange.length > 0) {
      query = query.in('price_range', filters.priceRange);
    }

    if (filters?.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: [], error: error as Error, count: 0 };
    }

    return { 
      data: (data as RestaurantWithOwner[]) || [], 
      error: null, 
      count: count || 0 
    };
  } catch (error) {
    return { data: [], error: error as Error, count: 0 };
  }
}

/**
 * Fetch restaurants within a specific distance using PostGIS
 * 
 * @param userLocation - User's current coordinates
 * @param radiusMeters - Search radius in meters (default: 10000 = 10km)
 * @param cuisineFilter - Optional cuisine type filter
 * @returns Array of restaurants sorted by rating and distance
 */
export async function getRestaurantsNearby(
  userLocation: GeoPoint,
  radiusMeters: number = 10000,
  cuisineFilter?: string
): Promise<{ data: Restaurant[]; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_restaurants_nearby', {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius_meters: radiusMeters,
      cuisine_filter: cuisineFilter || null,
    });

    if (error) {
      console.error('Error fetching nearby restaurants:', error);
      return { data: [], error: error as Error };
    }

    return { data: (data as Restaurant[]) || [], error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Fetch a single restaurant by ID
 * 
 * @param id - Restaurant ID
 * @returns Restaurant with owner information
 */
export async function getRestaurantById(
  id: string
): Promise<{ data: RestaurantWithOwner | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('restaurants_with_owner')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as RestaurantWithOwner, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Fetch restaurants by owner ID
 * 
 * @param ownerId - Owner's user ID
 * @returns Array of restaurants owned by the user
 */
export async function getRestaurantsByOwner(
  ownerId: string
): Promise<{ data: Restaurant[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    return { data: (data as Restaurant[]) || [], error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Create a new restaurant
 * 
 * @param restaurant - Restaurant data
 * @param logo - Optional logo file
 * @param coverImage - Optional cover image file
 * @returns Created restaurant
 */
export async function createRestaurant(
  restaurant: RestaurantInsert,
  logo?: File,
  coverImage?: File
): Promise<{ data: Restaurant | null; error: Error | null }> {
  try {
    // Upload images if provided
    let logoUrl = restaurant.logo_url;
    let coverUrl = restaurant.cover_image_url;

    if (logo) {
      // First create the restaurant to get the ID
      const { data: tempRestaurant, error: tempError } = await supabase
        .from('restaurants')
        .insert({ ...restaurant, logo_url: null, cover_image_url: null })
        .select()
        .single();

      if (tempError || !tempRestaurant) {
        return { data: null, error: tempError as Error };
      }

      const { url: uploadedLogoUrl } = await uploadRestaurantImage(
        logo,
        tempRestaurant.id,
        'logo'
      );
      logoUrl = uploadedLogoUrl || undefined;

      if (coverImage) {
        const { url: uploadedCoverUrl } = await uploadRestaurantImage(
          coverImage,
          tempRestaurant.id,
          'cover'
        );
        coverUrl = uploadedCoverUrl || undefined;
      }

      // Update with image URLs
      const { data, error } = await supabase
        .from('restaurants')
        .update({ logo_url: logoUrl, cover_image_url: coverUrl })
        .eq('id', tempRestaurant.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error as Error };
      }

      return { data: data as Restaurant, error: null };
    }

    // Convert location to PostGIS geography
    let locationWkt = null;
    if (restaurant.location) {
      const { lat, lng } = restaurant.location;
      locationWkt = `SRID=4326;POINT(${lng} ${lat})`;
    }

    const restaurantData = {
      ...restaurant,
      location: locationWkt,
    };

    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as Restaurant, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Update an existing restaurant
 * 
 * @param id - Restaurant ID
 * @param updates - Updated restaurant data
 * @returns Updated restaurant
 */
export async function updateRestaurant(
  id: string,
  updates: RestaurantUpdate
): Promise<{ data: Restaurant | null; error: Error | null }> {
  try {
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
      .from('restaurants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as Restaurant, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a restaurant
 * 
 * @param id - Restaurant ID
 * @returns Success status
 */
export async function deleteRestaurant(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('restaurants')
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
 * Get unique cuisine types from all restaurants
 * 
 * @returns Array of unique cuisine types
 */
export async function getCuisineTypes(): Promise<{ data: string[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('cuisine_types')
      .eq('is_active', true);

    if (error) {
      return { data: [], error: error as Error };
    }

    // Extract and deduplicate cuisine types
    const cuisineSet = new Set<string>();
    data?.forEach(restaurant => {
      restaurant.cuisine_types?.forEach(cuisine => {
        cuisineSet.add(cuisine);
      });
    });

    return { data: Array.from(cuisineSet).sort(), error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}
