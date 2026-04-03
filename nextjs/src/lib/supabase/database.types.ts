// =============================================================================
// SUPABASE DATABASE TYPES
// =============================================================================
// Auto-generated types from Supabase
// These mirror your database schema exactly

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          phone: string | null
          last_location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          last_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          last_location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          parent_id: number | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          parent_id?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          parent_id?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          category_id: number | null
          title: string
          description: string | null
          price: number
          currency: string
          condition: string | null
          images: string[] | null
          location: string | null
          address: string | null
          is_active: boolean
          is_sold: boolean
          view_count: number
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: number | null
          title: string
          description?: string | null
          price: number
          currency?: string
          condition?: string | null
          images?: string[] | null
          location?: string | null
          address?: string | null
          is_active?: boolean
          is_sold?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: number | null
          title?: string
          description?: string | null
          price?: number
          currency?: string
          condition?: string | null
          images?: string[] | null
          location?: string | null
          address?: string | null
          is_active?: boolean
          is_sold?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          category_id: number | null
          name: string
          description: string | null
          slug: string | null
          logo_url: string | null
          cover_image_url: string | null
          menu_json: Json | null
          operating_hours: Json | null
          cuisine_types: string[] | null
          price_range: string | null
          rating: number
          review_count: number
          location: string | null
          address: string | null
          phone: string | null
          website: string | null
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          category_id?: number | null
          name: string
          description?: string | null
          slug?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          menu_json?: Json | null
          operating_hours?: Json | null
          cuisine_types?: string[] | null
          price_range?: string | null
          rating?: number
          review_count?: number
          location?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          category_id?: number | null
          name?: string
          description?: string | null
          slug?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          menu_json?: Json | null
          operating_hours?: Json | null
          cuisine_types?: string[] | null
          price_range?: string | null
          rating?: number
          review_count?: number
          location?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string | null
          restaurant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id?: string | null
          restaurant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string | null
          restaurant_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      listings_with_seller: {
        Row: {
          id: string
          seller_id: string
          category_id: number | null
          title: string
          description: string | null
          price: number
          currency: string
          condition: string | null
          images: string[] | null
          location: string | null
          address: string | null
          is_active: boolean
          is_sold: boolean
          view_count: number
          created_at: string
          updated_at: string
          expires_at: string | null
          username: string | null
          seller_full_name: string | null
          seller_avatar: string | null
          category_name: string | null
          category_slug: string | null
          distance_meters: number | null
        }
      }
      restaurants_with_owner: {
        Row: {
          id: string
          owner_id: string
          category_id: number | null
          name: string
          description: string | null
          slug: string | null
          logo_url: string | null
          cover_image_url: string | null
          menu_json: Json | null
          operating_hours: Json | null
          cuisine_types: string[] | null
          price_range: string | null
          rating: number
          review_count: number
          location: string | null
          address: string | null
          phone: string | null
          website: string | null
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
          username: string | null
          owner_full_name: string | null
          owner_avatar: string | null
          category_name: string | null
          category_slug: string | null
        }
      }
    }
    Functions: {
      get_listings_nearby: {
        Args: {
          lat: number
          lng: number
          radius_meters?: number
          category_filter?: number
        }
        Returns: {
          id: string
          seller_id: string
          category_id: number | null
          title: string
          description: string | null
          price: number
          currency: string
          condition: string | null
          images: string[] | null
          location: string | null
          address: string | null
          is_active: boolean
          is_sold: boolean
          view_count: number
          created_at: string
          updated_at: string
          expires_at: string | null
        }[]
      }
      get_restaurants_nearby: {
        Args: {
          lat: number
          lng: number
          radius_meters?: number
          cuisine_filter?: string
        }
        Returns: {
          id: string
          owner_id: string
          category_id: number | null
          name: string
          description: string | null
          slug: string | null
          logo_url: string | null
          cover_image_url: string | null
          menu_json: Json | null
          operating_hours: Json | null
          cuisine_types: string[] | null
          price_range: string | null
          rating: number
          review_count: number
          location: string | null
          address: string | null
          phone: string | null
          website: string | null
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      listing_condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
      price_range: '$' | '$$' | '$$$' | '$$$$'
    }
  }
}
