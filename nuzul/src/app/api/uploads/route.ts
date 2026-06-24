import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { requireUser } from '@/lib/auth/rbac';
import { ok, fail, handle } from '@/lib/api';

// Media upload. Dev driver writes to /public/uploads and returns a public URL.
// In production swap for a signed-URL flow to S3/R2 (MEDIA_DRIVER=s3). See
// docs/13-technical-architecture.md.
export async function POST(req: Request) {
  return handle(async () => {
    await requireUser();
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return fail('validation', 'No file provided', 422);
    if (file.size > 5 * 1024 * 1024) return fail('too_large', 'Max 5MB', 413);

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

    return ok({ url: `/uploads/${name}` }, 201);
  });
}
