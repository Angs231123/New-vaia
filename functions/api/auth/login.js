// Redirects the browser to VATSIM Connect to start the login flow.
//
// IMPORTANT: the endpoint below (auth.vatsim.net) and the OAuth paths are
// VATSIM Connect's well-known Laravel Passport-style routes, based on how
// existing VATSIM community tools integrate with it. This sandbox could
// not reach vatsim.dev to double-check the current, official values before
// shipping this — verify against https://vatsim.dev before relying on it
// in production, and update VATSIM_AUTH_BASE below if it's changed.

const VATSIM_AUTH_BASE = "https://auth.vatsim.net";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;

  if (!env.VATSIM_CLIENT_ID) {
    return new Response(
      "VATSIM login isn't configured yet — VATSIM_CLIENT_ID is missing. Register an app at https://vatsim.dev and set VATSIM_CLIENT_ID / VATSIM_CLIENT_SECRET in the Cloudflare Pages project's environment variables.",
      { status: 501 }
    );
  }

  // Random state value, stored in a short-lived cookie, checked on callback to prevent CSRF.
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
      "Set-Cookie": `vaia_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
