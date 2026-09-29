export type UserRole = 'RESIDENT' | 'COMMITTEE';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  flatNumber?: string;
  exp: number; // Unix timestamp seconds
}

export const AUTH_COOKIE_NAME = 'society_auth_session';

export const DEMO_CREDENTIALS = {
  RESIDENT: {
    email: process.env.DEMO_RESIDENT_EMAIL || 'resident@greenvalley.demo',
    password: process.env.DEMO_RESIDENT_PASSWORD || 'Resident@123',
    role: 'RESIDENT' as UserRole,
    name: 'Sunita Kapoor',
    flatNumber: 'B-204',
  },
  COMMITTEE: {
    email: process.env.DEMO_COMMITTEE_EMAIL || 'committee@greenvalley.demo',
    password: process.env.DEMO_COMMITTEE_PASSWORD || 'Committee@123',
    role: 'COMMITTEE' as UserRole,
    name: 'Rajesh Mehta (Secretary)',
  },
};

function getSecret(): string {
  return process.env.AUTH_SECRET || 'society-complaint-triage-jwt-secret-key-32chars';
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createSessionToken(payload: Omit<AuthSession, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days valid
  const session: AuthSession = { ...payload, exp };
  const jsonStr = JSON.stringify(session);
  const dataBytes = new TextEncoder().encode(jsonStr);
  const dataB64 = base64UrlEncode(dataBytes);

  const key = await getHmacKey(getSecret());
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataB64));
  const sigB64 = base64UrlEncode(new Uint8Array(sigBuffer));

  return `${dataB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<AuthSession | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  try {
    const [dataB64, sigB64] = token.split('.');
    const key = await getHmacKey(getSecret());
    const sigBytes = base64UrlDecode(sigB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      new TextEncoder().encode(dataB64)
    );

    if (!valid) return null;

    const dataBytes = base64UrlDecode(dataB64);
    const jsonStr = new TextDecoder().decode(dataBytes);
    const session: AuthSession = JSON.parse(jsonStr);
    if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired session
    }

    return session;
  } catch (err) {
    return null;
  }
}

export async function getAuthSession(
  request: { cookies: { get: (name: string) => { value: string } | undefined } }
): Promise<AuthSession | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
