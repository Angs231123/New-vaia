// Minimal signed-cookie session helper for Cloudflare Pages Functions.
// No external dependencies — uses the Web Crypto API available in Workers.

const COOKIE_NAME = "vaia_session";

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// payload: plain object, e.g. { cid: "1234567", exp: 1234567890 }
export async function createSession(payload, secret) {
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const sig = await hmac(secret, body);
  return `${body}.${sig}`;
}

export async function verifySession(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = await hmac(secret, body);
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookieHeader(token, { maxAge = 60 * 60 * 12, clear = false } = {}) {
  if (clear) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  }
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function getSessionFromRequest(request, env) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;
  return verifySession(token, env.SESSION_SECRET);
}

export function isAdminCid(cid, env) {
  const list = (env.ADMIN_CIDS || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  return list.includes(String(cid));
}
