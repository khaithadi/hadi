import { requireUser } from '@/lib/auth/rbac';
import { ok, fail, handle } from '@/lib/api';
import { storageConfigured, uploadImage } from '@/lib/storage';

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Media upload → Supabase Storage (public bucket). Uses the server-only service-role key,
// so it works with the app's own JWT auth without Supabase Auth/RLS.
export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    if (!storageConfigured) return fail('not_configured', 'Image uploads are not configured yet', 501);

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return fail('validation', 'No file provided', 422);
    if (file.size > 6 * 1024 * 1024) return fail('too_large', 'Max 6MB', 413);

    const ext = ALLOWED[file.type] ?? 'jpg';
    try {
      const url = await uploadImage(Buffer.from(await file.arrayBuffer()), {
        ext,
        contentType: file.type || 'image/jpeg',
        userId: session.sub,
      });
      return ok({ url }, 201);
    } catch (err) {
      // Surface the real Supabase Storage reason (e.g. "Bucket not found", invalid key)
      // so the client can show it — these messages are diagnostic, not sensitive.
      const message = err instanceof Error ? err.message : 'Upload failed';
      console.error('[uploads] storage error', err);
      return fail('storage_error', message, 502);
    }
  });
}
