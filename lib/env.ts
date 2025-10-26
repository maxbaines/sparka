import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Centralized environment parsing and feature flags using t3-oss/t3-env

export const env = createEnv({
  server: {
    // Required core
    POSTGRES_URL: z.string().min(1),
    AI_GATEWAY_API_KEY: z.string().min(1),
    CRON_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),

    // Blob: on Vercel, the SDK is auto-configured; locally we require a token
    BLOB_READ_WRITE_TOKEN: z.string().min(1),

    // Optional features
    REDIS_URL: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    TAVILY_API_KEY: z.string().optional(),
    EXA_API_KEY: z.string().optional(),
    FIRECRAWL_API_KEY: z.string().optional(),
    SANDBOX_TEMPLATE_ID: z.string().optional(),

    // Misc / platform
    LOG_LEVEL: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    CONTEXT_SIZE: z.string().optional(),
    UNLIMITED_EMAILS: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SANDBOX_AVAILABLE: z.boolean().optional(),
    NEXT_PUBLIC_TAVILY_AVAILABLE: z.boolean().optional(),
    NEXT_PUBLIC_OPENAI_AVAILABLE: z.boolean().optional(),
    NEXT_PUBLIC_EXA_AVAILABLE: z.boolean().optional(),
    NEXT_PUBLIC_FIRECRAWL_AVAILABLE: z.boolean().optional(),
    NEXT_PUBLIC_NODE_ENV: z.string().optional(),
  },
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    REDIS_URL: process.env.REDIS_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    EXA_API_KEY: process.env.EXA_API_KEY,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    SANDBOX_TEMPLATE_ID: process.env.SANDBOX_TEMPLATE_ID,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    CONTEXT_SIZE: process.env.CONTEXT_SIZE,
    UNLIMITED_EMAILS: process.env.UNLIMITED_EMAILS,
    // Enable / disable features based on environment variables
    NEXT_PUBLIC_SANDBOX_AVAILABLE: Boolean(process.env.SANDBOX_TEMPLATE_ID),
    NEXT_PUBLIC_TAVILY_AVAILABLE: Boolean(process.env.TAVILY_API_KEY),
    NEXT_PUBLIC_OPENAI_AVAILABLE: Boolean(process.env.OPENAI_API_KEY),
    NEXT_PUBLIC_EXA_AVAILABLE: Boolean(process.env.EXA_API_KEY),
    NEXT_PUBLIC_FIRECRAWL_AVAILABLE: Boolean(process.env.FIRECRAWL_API_KEY),
  },
});
