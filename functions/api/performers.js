import { handleGet, handlePost } from "../_utils/store.js";

export async function onRequestGet(ctx) {
  return handleGet(ctx, "performers", "/data/performers.json");
}

export async function onRequestPost(ctx) {
  return handlePost(ctx, "performers");
}
