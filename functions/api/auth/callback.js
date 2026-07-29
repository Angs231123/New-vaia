// Exchanges the OAuth code for a token, fetches the user's VATSIM CID,
// and — if that CID is on the ADMIN_CIDS allow-list — issues a signed
// admin session cookie. Non-admin VATSIM logins still succeed (so the
// "Login with VATSIM" button works for any visitor) but get a
// non-admin session, which the admin API/UI reject.
//
// Endpoint note: see login.js — auth.vatsim.net paths are unverified
// against current vatsim.dev docs, confirm before relying on this.

import { createSession, sessionCookieHeader, readCookie } from "../../_utils/session.js";

const VATSIM_AUTH_BASE = "https://auth.vatsim.net";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readCookie(request, "vaia_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return new Response("Login failed: invalid or expired state. Please try again.", { status: 400 });
  }

  if (!env.VATSIM_CLIENT_ID || !env.VATSIM_CLIENT_SECRET || !env.SESSION_SECRET) {
    return new Response(
      "VATSIM login isn't fully configured (missing VATSIM_CLIENT_ID / VATSIM_CLIENT_SECRET / SESSION_SECRET env vars).",
      { status: 501 }
    );
  }

  const redirectUri = `${url.origin}/api/auth/callback`;

  // Exchange the authorization code for an access token.
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
    return new Response(`Login failed: token exchange returned ${tokenRes.status}.`, { status: 502 });
  }
  const tokenData = await tokenRes.json();

  // Fetch the logged-in user's profile (contains their VATSIM CID).
  const userRes = await fetch(`${VATSIM_AUTH_BASE}/api/user`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/json",
    },
  });
  if (!userRes.ok) {
    return new Response(`Login failed: could not fetch VATSIM profile (${userRes.status}).`, { status: 502 });
  }
  const userData = await userRes.json();
  const cid = userData?.data?.cid || userData?.cid;
  const fullName =
    userData?.data?.personal?.name_full ||
    [userData?.data?.personal?.name_first, userData?.data?.personal?.name_last].filter(Boolean).join(" ") ||
    null;

  if (!cid) {
    return new Response("Login failed: VATSIM did not return a CID.", { status: 502 });
  }

  const adminList = (env.ADMIN_CIDS || "").split(",").map((c) => c.trim()).filter(Boolean);
  const isAdmin = adminList.includes(String(cid));

  const session = await createSession(
    { cid: String(cid), name: fullName, admin: isAdmin, exp: Date.now() + 1000 * 60 * 60 * 12 },
    env.SESSION_SECRET
  );

  return new Response(null, {
    status: 302,
    headers: {
      Location: isAdmin ? "/admin.html" : "/",
      "Set-Cookie": sessionCookieHeader(session),
    },
  });
}
