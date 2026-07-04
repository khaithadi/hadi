import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Lightweight liveness + keep-warm endpoint. Pinging it every few minutes (e.g. a free
// external cron) keeps the serverless function and the Supabase pooled connection warm, so
// real visitors don't hit a cold-start failure. Runs a trivial round-trip to the database.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: 'up', at: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
