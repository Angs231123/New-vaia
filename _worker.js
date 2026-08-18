// The whole backend (admin login/logout/me, performers/roster/gallery CRUD)
// as a single Worker script, referenced via wrangler.jsonc's "main" field
// alongside the "assets" static-file serving config. One file, no imports —
// works the same regardless of which Cloudflare deploy path is used.

const COOKIE_NAME = "vaia_session";
const VATSIM_COOKIE_NAME = "vaia_vatsim";
const VATSIM_STATE_COOKIE = "vaia_vatsim_state";
const VATSIM_AUTH_BASE = "https://auth.vatsim.net";

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

async function createSession(payload, secret) {
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const sig = await hmac(secret, body);
  return `${body}.${sig}`;
}

function timingSafeEqual(a, b) {
  a = String(a == null ? "" : a);
  b = String(b == null ? "" : b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifySession(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = await hmac(secret, body);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function sessionCookieHeader(token, { name = COOKIE_NAME, maxAge = 60 * 60 * 12, clear = false } = {}) {
  if (clear) {
    return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  }
  return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

async function getSession(request, env) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;
  return verifySession(token, env.SESSION_SECRET);
}

async function getVatsimSession(request, env) {
  const token = readCookie(request, VATSIM_COOKIE_NAME);
  if (!token) return null;
  return verifySession(token, env.SESSION_SECRET);
}

async function handleLogin(request, env) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return Response.json(
      { error: "Admin login isn't configured yet — set ADMIN_USERNAME, ADMIN_PASSWORD and SESSION_SECRET in the Cloudflare Pages project's environment variables." },
      { status: 501 }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { username, password } = body || {};
  const usernameOk = timingSafeEqual(username, env.ADMIN_USERNAME);
  const passwordOk = timingSafeEqual(password, env.ADMIN_PASSWORD);
  if (!usernameOk || !passwordOk) {
    return Response.json({ error: "Incorrect username or password" }, { status: 401 });
  }
  const session = await createSession(
    { admin: true, username, exp: Date.now() + 1000 * 60 * 60 * 12 },
    env.SESSION_SECRET
  );
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": sessionCookieHeader(session) },
  });
}

function handleLogout() {
  return new Response(null, {
    status: 302,
    headers: { Location: "/", "Set-Cookie": sessionCookieHeader(null, { clear: true }) },
  });
}

async function handleMe(request, env) {
  const session = await getSession(request, env);
  if (!session) return Response.json({ loggedIn: false });
  return Response.json({ loggedIn: true, username: session.username || null, admin: !!session.admin });
}

// Public "Login with VATSIM" — separate from the admin username/password
// login above. Any VATSIM member can use this; it doesn't grant admin
// access, it just verifies who someone is via VATSIM Connect (OAuth2).
async function handleVatsimLogin(request, env) {
  if (!env.VATSIM_CLIENT_ID) {
    return new Response(
      "VATSIM login isn't configured yet — set VATSIM_CLIENT_ID and VATSIM_CLIENT_SECRET in this project's environment variables. See the README.",
      { status: 501 }
    );
  }
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/vatsim/callback`;
  const state = crypto.randomUUID();

  const authorizeUrl = new URL(`${VATSIM_AUTH_BASE}/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", env.VATSIM_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "full_name vatsim_details");
  authorizeUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": `${VATSIM_STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function handleVatsimCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readCookie(request, VATSIM_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return new Response("VATSIM login failed: invalid or expired state. Please try again.", { status: 400 });
  }
  if (!env.VATSIM_CLIENT_ID || !env.VATSIM_CLIENT_SECRET || !env.SESSION_SECRET) {
    return new Response("VATSIM login isn't fully configured (missing VATSIM_CLIENT_ID / VATSIM_CLIENT_SECRET / SESSION_SECRET).", { status: 501 });
  }

  const redirectUri = `${url.origin}/api/auth/vatsim/callback`;

  const tokenRes = await fetch(`${VATSIM_AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: env.VATSIM_CLIENT_ID,
      client_secret: env.VATSIM_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!tokenRes.ok) {
    return new Response(`VATSIM login failed: token exchange returned ${tokenRes.status}.`, { status: 502 });
  }
  const tokenData = await tokenRes.json();

  const userRes = await fetch(`${VATSIM_AUTH_BASE}/api/user`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/json" },
  });
  if (!userRes.ok) {
    return new Response(`VATSIM login failed: could not fetch profile (${userRes.status}).`, { status: 502 });
  }
  const userData = await userRes.json();
  const cid = userData?.data?.cid;
  const fullName = userData?.data?.personal?.name_full || null;
  if (!cid) {
    return new Response("VATSIM login failed: no CID returned.", { status: 502 });
  }

  const session = await createSession(
    { cid: String(cid), name: fullName, exp: Date.now() + 1000 * 60 * 60 * 12 },
    env.SESSION_SECRET
  );

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": sessionCookieHeader(session, { name: VATSIM_COOKIE_NAME }),
    },
  });
}

function handleVatsimLogout() {
  return new Response(null, {
    status: 302,
    headers: { Location: "/", "Set-Cookie": sessionCookieHeader(null, { name: VATSIM_COOKIE_NAME, clear: true }) },
  });
}

async function handleVatsimMe(request, env) {
  const session = await getVatsimSession(request, env);
  if (!session) return Response.json({ loggedIn: false });
  return Response.json({ loggedIn: true, cid: session.cid, name: session.name || null });
}

async function handleResourceGet(request, env, kvKey, staticPath) {
  if (env.VAIA_KV) {
    const stored = await env.VAIA_KV.get(kvKey);
    if (stored) return new Response(stored, { headers: { "Content-Type": "application/json" } });
  }
  if (env.ASSETS) {
    const assetRes = await env.ASSETS.fetch(new URL(staticPath, request.url));
    if (assetRes.ok) return assetRes;
  }
  return Response.json([]);
}

async function handleResourcePost(request, env, kvKey) {
  const session = await getSession(request, env);
  if (!session || !session.admin) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!env.VAIA_KV) {
    return Response.json(
      { error: "No VAIA_KV namespace bound to this Pages project — create one and bind it in Cloudflare's dashboard, or deploy with wrangler so wrangler.toml's binding applies." },
      { status: 501 }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!Array.isArray(body)) {
    return Response.json({ error: "Body must be a JSON array" }, { status: 400 });
  }
  await env.VAIA_KV.put(kvKey, JSON.stringify(body));
  return Response.json({ ok: true, count: body.length });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const { method } = request;

    if (pathname === "/api/auth/login" && method === "POST") return handleLogin(request, env);
    if (pathname === "/api/auth/logout") return handleLogout();
    if (pathname === "/api/auth/me") return handleMe(request, env);

    if (pathname === "/api/auth/vatsim/login") return handleVatsimLogin(request, env);
    if (pathname === "/api/auth/vatsim/callback") return handleVatsimCallback(request, env);
    if (pathname === "/api/auth/vatsim/logout") return handleVatsimLogout();
    if (pathname === "/api/auth/vatsim/me") return handleVatsimMe(request, env);

    if (pathname === "/api/performers") {
      if (method === "GET") return handleResourceGet(request, env, "performers", "/data/performers.json");
      if (method === "POST") return handleResourcePost(request, env, "performers");
    }

    if (pathname === "/api/roster") {
      if (method === "GET") return handleResourceGet(request, env, "roster", "/data/roster.json");
      if (method === "POST") return handleResourcePost(request, env, "roster");
    }

    if (pathname === "/api/gallery") {
      if (method === "GET") return handleResourceGet(request, env, "gallery", "/data/gallery.json");
      if (method === "POST") return handleResourcePost(request, env, "gallery");
    }

    return env.ASSETS.fetch(request);
  },
};
