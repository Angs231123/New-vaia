import { handleGet, handlePost } from "../_utils/store.js";

export async function onRequestGet(ctx) {
  return handleGet(ctx, "roster", "/data/roster.json");
}

export async function onRequestPost(ctx) {
  return handlePost(ctx, "roster");
}
