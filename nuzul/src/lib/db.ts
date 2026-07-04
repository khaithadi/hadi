import { PrismaClient, Prisma } from '@prisma/client';

// Connection-acquisition failures that happen BEFORE the query reaches the database — safe to
// retry even for writes, because nothing was executed. Covers the classic Supabase "cold"
// blip: the serverless function wakes, the pooled connection isn't ready, the first attempt
// fails, and a moment later it succeeds.
//  P1001 = can't reach database server · P2024 = timed out getting a pooled connection
const RETRYABLE = new Set(['P1001', 'P2024']);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) return RETRYABLE.has(e.code);
  return false;
}

function createClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastErr: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            return await query(args);
          } catch (e) {
            lastErr = e;
            if (isRetryable(e) && attempt < 2) {
              await sleep(200 * (attempt + 1)); // 200ms, 400ms
              continue;
            }
            throw e;
          }
        }
        throw lastErr;
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
