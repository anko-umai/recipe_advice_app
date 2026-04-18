import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL_PRIMARY: z.string().default("claude-haiku-4-5-20251001"),
  ANTHROPIC_MODEL_ADVANCED: z.string().default("claude-sonnet-4-6"),

  GOOGLE_CLOUD_VISION_KEY: z.string().min(1).optional(),

  RECEIPT_IMAGE_RETENTION_DAYS_DEFAULT: z.coerce.number().int().default(30),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Invalid environment variables: " + parsed.error.toString(),
    );
  }
  cached = parsed.data;
  return cached;
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = getEnv()[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required env: ${String(key)}`);
  }
  return value as NonNullable<Env[K]>;
}
