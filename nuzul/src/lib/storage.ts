import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'listings';
export const storageConfigured = Boolean(url && serviceKey);

function getStorageClient() {
  if (!url || !serviceKey) throw new Error('Supabase storage not configured');
  // Service-role client — server only. Works with the app's own JWT auth (no Supabase Auth).
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Upload an image buffer to the public bucket; returns its public URL. */
export async function uploadImage(
  buffer: Buffer,
  opts: { ext: string; contentType: string; userId: string },
): Promise<string> {
  const supabase = getStorageClient();
  const path = `${opts.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${opts.ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { contentType: opts.contentType, upsert: false });
  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
