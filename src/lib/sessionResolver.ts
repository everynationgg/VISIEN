import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalizes input token or query string:
 * - Trims whitespace
 * - Strips any URL prefix like `http://localhost:3000/i/` or `/i/`
 * - Strips surrounding quotes
 */
export function cleanTokenString(rawToken: string): string {
  if (!rawToken) return '';
  let token = rawToken.trim();
  // Strip URL prefix if client pasted full link
  token = token.replace(/^https?:\/\/[^\/]+\/i\//i, '');
  token = token.replace(/^\/?i\//i, '');
  // Strip query params or hash if present
  token = token.split('?')[0].split('#')[0].trim();
  return token;
}

/**
 * Robustly finds a session in Supabase by:
 * 1. Exact token match (e.g. "929-909")
 * 2. Un-dashed 6-digit token (e.g. "929909" -> "929-909")
 * 3. Space-separated 6-digit token (e.g. "929 909" -> "929-909")
 * 4. Case-insensitive token match
 * 5. Client name match (e.g. "yog" or "yog test" -> matches session where client_name ILIKE "yog%")
 */
export async function findSessionByTokenOrQuery(
  supabase: SupabaseClient,
  rawToken: string
) {
  const clean = cleanTokenString(rawToken);
  if (!clean) return null;

  // 1. Exact match on token
  let { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', clean)
    .maybeSingle();

  if (session) return session;

  // 2. Normalize 6-digit variations (e.g. "929909", "929 909")
  const digitsOnly = clean.replace(/[\s-]/g, '');
  if (digitsOnly.length === 6 && /^\d{6}$/.test(digitsOnly)) {
    const withDash = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    const { data: dashMatch } = await supabase
      .from('sessions')
      .select('*')
      .or(`token.eq.${withDash},token.eq.${digitsOnly}`)
      .maybeSingle();

    if (dashMatch) return dashMatch;
  }

  // 3. Check with-dash or without-dash if input had dashes
  if (clean.includes('-')) {
    const noDash = clean.replace(/-/g, '');
    const { data: noDashMatch } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', noDash)
      .maybeSingle();

    if (noDashMatch) return noDashMatch;
  }

  // 4. Case-insensitive token search
  const { data: ilikeTokenMatch } = await supabase
    .from('sessions')
    .select('*')
    .ilike('token', clean)
    .maybeSingle();

  if (ilikeTokenMatch) return ilikeTokenMatch;

  return null;
}
