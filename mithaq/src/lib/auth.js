// Session/auth layer — mock implementation on top of localStorage.
//
// Designed so the UI treats this as an async API (returns Promises) —
// swapping it for a real Supabase client later means changing this file only,
// not any view. Guest mode is a first-class session, not a hack.
//
// SESSION SHAPES
//   {mode: 'none'}                → first launch, needs onboarding
//   {mode: 'guest'}               → tapping "تصفّح بدون حساب" — demo data loaded, read-only
//   {mode: 'authed', account: {…}} → signed in with a real account
//
// ACCOUNT SHAPE (mock)
//   {id, name, phone, email?, createdAt}
//   Password is stored separately as a SHA-256 hash; kept OUT of the account
//   object so we never accidentally render it.

import { uid } from './format.js';

// Namespaced by VITE_APP_NAMESPACE so a preview build's accounts/sessions
// never mix with production. See lib/storage.js for the same pattern.
const NS = import.meta.env.VITE_APP_NAMESPACE || '';
const SESSION_KEY = NS + 'mithaq-session-v1';
const ACCOUNTS_KEY = NS + 'mithaq-accounts-v1';   // { [phone]: {account, passwordHash} }

// --- helpers ---------------------------------------------------------------
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Normalize a phone to a comparable form: strip spaces, dashes, leading +/0
// so "0550 12 34 56", "+213 550 12 34 56", "0550-12-34-56" all match.
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/[^\d]/g, '');
  return digits.replace(/^213/, '').replace(/^0+/, '');
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function looksLikeEmail(s) {
  return emailRe.test(String(s || '').trim());
}

// --- public API ------------------------------------------------------------

// Read the current session. Returns {mode:'none'} on first launch.
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { mode: 'none' };
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.mode) return { mode: 'none' };
    return parsed;
  } catch (e) {
    return { mode: 'none' };
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Create a new account and sign in. Phone-only for now — email can be added
// later from Settings once the backend exists.
export async function signUp({ name, phone, password }) {
  const cleanName = String(name || '').trim();
  const cleanPhone = normalizePhone(phone);
  if (!cleanName) return { ok: false, error: 'name_required' };
  if (cleanPhone.length < 8) return { ok: false, error: 'phone_invalid' };
  if (!password || password.length < 6) return { ok: false, error: 'password_short' };

  const accounts = readAccounts();
  if (accounts[cleanPhone]) return { ok: false, error: 'phone_taken' };

  const account = {
    id: uid(),
    name: cleanName,
    phone: cleanPhone,
    email: null,
    createdAt: new Date().toISOString(),
  };
  accounts[cleanPhone] = { account, passwordHash: await sha256(password) };
  writeAccounts(accounts);

  const session = { mode: 'authed', account };
  saveSession(session);
  return { ok: true, session };
}

// Sign in with phone OR email + password. Single field auto-detects.
export async function signIn({ identifier, password }) {
  if (!identifier || !password) return { ok: false, error: 'missing_fields' };
  const accounts = readAccounts();

  let entry = null;
  if (looksLikeEmail(identifier)) {
    entry = Object.values(accounts).find((e) => e.account.email === identifier.trim().toLowerCase());
  } else {
    const phone = normalizePhone(identifier);
    entry = accounts[phone];
  }
  if (!entry) return { ok: false, error: 'no_such_account' };

  const hash = await sha256(password);
  if (hash !== entry.passwordHash) return { ok: false, error: 'wrong_password' };

  const session = { mode: 'authed', account: entry.account };
  saveSession(session);
  return { ok: true, session };
}

export function signOut() {
  clearSession();
}

// Enter guest/browse mode — no account, view-only, demo data auto-loaded.
export function enterGuest() {
  const session = { mode: 'guest' };
  saveSession(session);
  return session;
}

// True while the current session may NOT write. Views use this to hide/
// disable every add/edit/delete control.
export function isReadOnly(session) {
  return session && session.mode === 'guest';
}
