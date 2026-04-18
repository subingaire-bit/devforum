// Licensed under MIT - Limbel Project
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Auth
    AUTH_SECRET: z.string().min(32),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_GITLAB_ID: z.string().optional(),
    AUTH_GITLAB_SECRET: z.string().optional(),
    
    // Database
    DATABASE_URL: z.string().url(),
    
    // Redis
    REDIS_URL: z.string().url().optional(),
    
    // Email
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    
    // Security
    RATE_LIMIT_REQUESTS: z.coerce.number().default(100),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    
    // Feature flags
    ENABLE_EMAIL_AUTH: z.enum(["true", "false"]).default("true"),
    ENABLE_OAUTH: z.enum(["true", "false"]).default("true"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    // Server - ✅ Fixed: bracket notation for index signature
    AUTH_SECRET: process.env['AUTH_SECRET'],
    AUTH_GITHUB_ID: process.env['AUTH_GITHUB_ID'],
    AUTH_GITHUB_SECRET: process.env['AUTH_GITHUB_SECRET'],
    AUTH_GITLAB_ID: process.env['AUTH_GITLAB_ID'],
    AUTH_GITLAB_SECRET: process.env['AUTH_GITLAB_SECRET'],
    DATABASE_URL: process.env['DATABASE_URL'],
    REDIS_URL: process.env['REDIS_URL'],
    RESEND_API_KEY: process.env['RESEND_API_KEY'],
    SMTP_HOST: process.env['SMTP_HOST'],
    SMTP_PORT: process.env['SMTP_PORT'],
    SMTP_USER: process.env['SMTP_USER'],
    SMTP_PASS: process.env['SMTP_PASS'],
    RATE_LIMIT_REQUESTS: process.env['RATE_LIMIT_REQUESTS'],
    RATE_LIMIT_WINDOW_MS: process.env['RATE_LIMIT_WINDOW_MS'],
    ENABLE_EMAIL_AUTH: process.env['ENABLE_EMAIL_AUTH'],
    ENABLE_OAUTH: process.env['ENABLE_OAUTH'],
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
  },
  // ✅ Also fix SKIP_ENV_VALIDATION access (used below but not in schema)
  skipValidation: !!process.env['SKIP_ENV_VALIDATION'],
  emptyStringAsUndefined: true,
});