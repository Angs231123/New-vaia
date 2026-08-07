import { getSessionFromRequest } from "./session.js";

// GET: public. Reads the array from KV; if KV has never been written to,
// falls back to the bundled static JSON file in /data so the site works
// before an admin has ever saved anything.
export async function handleGet({ request, env }, kvKey, staticPath) {
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

// POST: admin-only. Body is the full replacement array for this resource.
export async function handlePost({ request, env }, kvKey) {
  const session = await getSessionFromRequest(request, env);
  if (!session || !session.admin) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!env.VAIA_KV) {
    return Response.json(
      { error: "No VAIA_KV namespace bound to this Pages project — create one and bind it in Cloudflare's dashboard." },
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
