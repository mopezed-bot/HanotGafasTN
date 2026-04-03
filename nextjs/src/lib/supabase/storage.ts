// =============================================================================
// SUPABASE STORAGE UTILITIES
// =============================================================================
// Helper functions for uploading images to Supabase Storage
// 
// IMPORTANT: Create these storage buckets in Supabase Dashboard:
// 1. marketplace-assets - for listing images
// 2. restaurant-assets - for restaurant images  
// 3. avatars - for user profile pictures

import { supabase } from './client';
import { createAdminClient } from './server';

const BUCKET_NAME = 'marketplace-assets';
const AVATARS_BUCKET = 'avatars';
const RESTAURANT_BUCKET = 'restaurant-assets';

/**
 * Upload an image to Supabase Storage
 * 
 * @param file - The file to upload (File object from input)
 * @param folder - Optional folder name within the bucket
 * @returns Promise<{ url: string | null; error: Error | null }>
 * 
 * @example
 * const { = await uploadImage(file, 'list url, error }ings');
 * if (url) {
 *   console.log('Image uploaded:', url);
 * }
 */
export async function uploadImage(
  file: File,
  folder: string = ''
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log('Uploading image to bucket:', BUCKET_NAME);
    console.log('File path:', filePath);
    console.log('File type:', file.type);
    console.log('File size:', file.size);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error as Error };
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return { url: null, error: error as Error };
  }
}

/**
 * Upload multiple images to Supabase Storage
 * 
 * @param files - Array of files to upload
 * @param folder - Optional folder name within the bucket
 * @returns Promise<{ urls: string[]; errors: Error[] }>
 * 
 * @example
 * const { urls, errors } = await uploadMultipleImages(files, 'listings');
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = ''
): Promise<{ urls: string[]; errors: Error[] }> {
  const results = await Promise.all(
    files.map(file => uploadImage(file, folder))
  );

  const urls = results
    .filter(r => r.url !== null)
    .map(r => r.url as string);

  const errors = results
    .filter(r => r.error !== null)
    .map(r => r.error as Error);

  return { urls, errors };
}

/**
 * Upload avatar image for user profile
 * 
 * @param file - The avatar file to upload
 * @param userId - The user's ID for the file path
 * @returns Promise<{ url: string | null; error: Error | null }>
 * 
 * @example
 * const { url, error } = await uploadAvatar(file, userId);
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Allow updating existing avatar
      });

    if (error) {
      return { url: null, error: error as Error };
    }

    const { data: urlData } = supabase.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

/**
 * Upload restaurant images (logo or cover)
 * 
 * @param file - The image file to upload
 * @param restaurantId - The restaurant's ID
 * @param type - 'logo' or 'cover'
 * @returns Promise<{ url: string | null; error: Error | null }>
 */
export async function uploadRestaurantImage(
  file: File,
  restaurantId: string,
  type: 'logo' | 'cover'
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${type}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(RESTAURANT_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { url: null, error: error as Error };
    }

    const { data: urlData } = supabase.storage
      .from(RESTAURANT_BUCKET)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

/**
 * Delete an image from Supabase Storage
 * 
 * @param url - The full URL or path of the image to delete
 * @param bucket - The bucket name (defaults to marketplace-assets)
 * @returns Promise<{ success: boolean; error: Error | null }>
 * 
 * @example
 * await deleteImage('https://xxx.supabase.co/storage/xxx/image.jpg');
 */
export async function deleteImage(
  url: string,
  bucket: string = BUCKET_NAME
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Extract path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
    const filePath = urlParts[1];

    if (!filePath) {
      return { success: false, error: new Error('Invalid file URL') };
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error as Error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Server-side upload (for use in API routes)
 * Uses admin client to bypass RLS
 */
export async function uploadImageServer(
  file: File,
  folder: string = ''
): Promise<{ url: string | null; error: Error | null }> {
  const { createServerClient } = await import('@supabase/ssr');
  
  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { url: null, error: error as Error };
    }

    const { data: urlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}
