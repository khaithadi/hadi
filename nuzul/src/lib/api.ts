import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '@/lib/auth/rbac';

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export function ok<T>(data: T, init?: number | ResponseInit) {
  const responseInit = typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, responseInit);
}

export function fail(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, details } }, { status });
}

/** Wrap a route handler with uniform error translation. */
export function handle(fn: () => Promise<Response>): Promise<Response> {
  return fn().catch((err: unknown) => {
    if (err instanceof AuthError) return fail('auth', err.message, err.status);
    if (err instanceof ZodError) return fail('validation', 'Invalid input', 422, err.flatten());
    console.error('[api] unhandled', err);
    return fail('internal', 'Something went wrong', 500);
  });
}

export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(data: T[], page: number, perPage: number, total: number): Paginated<T> {
  return { data, page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}
