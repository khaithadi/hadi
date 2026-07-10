// Map an API error payload — `{ error: { code, message } }` from `src/lib/api.ts` — to a
// localized string, using a translator scoped to the `error.codes` namespace. Falls back to
// the server-provided message, then a generic localized fallback, so an unmapped code still
// shows something sensible.

type ErrorTranslator = {
  (key: string): string;
  has: (key: string) => boolean;
};

export function apiErrorMessage(t: ErrorTranslator, payload: unknown): string {
  const err = (payload as { error?: { code?: string; message?: string } } | null)?.error;
  const code = err?.code;
  if (code && t.has(code)) return t(code);
  return err?.message || t('fallback');
}
