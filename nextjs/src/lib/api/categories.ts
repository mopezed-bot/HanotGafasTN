// =============================================================================
// CATEGORIES API
// =============================================================================
// API functions for fetching and managing categories

import { supabase } from '@/lib/supabase/client';
import type { Category, CategoryWithChildren } from '@/types';

/**
 * Fetch all active categories
 * 
 * @returns Array of categories
 * 
 * @example
 * const categories = await getCategories();
 */
export async function getCategories(): Promise<{ data: Category[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return { data: [], error: error as Error };
    }

    return { data: (data as Category[]) || [], error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Fetch categories as hierarchical tree
 * 
 * @returns Array of categories with nested children
 */
export async function getCategoriesTree(): Promise<{ data: CategoryWithChildren[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return { data: [], error: error as Error };
    }

    const categories = data as Category[];
    
    // Build hierarchy
    const categoryMap = new Map<number, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create all category objects
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return { data: rootCategories, error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Fetch a single category by ID
 * 
 * @param id - Category ID
 * @returns Category data
 */
export async function getCategoryById(
  id: number
): Promise<{ data: Category | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as Category, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Fetch a category by slug
 * 
 * @param slug - Category slug
 * @returns Category data
 */
export async function getCategoryBySlug(
  slug: string
): Promise<{ data: Category | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data as Category, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get all subcategory IDs for a parent category
 * 
 * @param parentId - Parent category ID
 * @returns Array of all descendant category IDs
 */
export async function getSubcategoryIds(
  parentId: number
): Promise<{ data: number[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('is_active', true);

    if (error) {
      return { data: [], error: error as Error };
    }

    const categories = data as Category[];
    const result: number[] = [parentId];
    
    // Recursively find all children
    const findChildren = (parent: number) => {
      categories
        .filter(c => c.parent_id === parent)
        .forEach(c => {
          result.push(c.id);
          findChildren(c.id);
        });
    };

    findChildren(parentId);

    return { data: result, error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}
