import { getEnv } from "~/lib/env.server";

export function loader() {
  const env = getEnv();
  return Response.json({
    status: "ok",
    runtime: "node",
    version: "0.0.1",
    features: {
      supabase: Boolean(env.SUPABASE_URL),
      anthropic: Boolean(env.ANTHROPIC_API_KEY),
      googleVision: Boolean(env.GOOGLE_CLOUD_VISION_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
