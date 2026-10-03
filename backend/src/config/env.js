import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  FRONTEND_URL: z.string().min(1, "FRONTEND_URL is required"),

  // SMTP / Email configuration
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  FROM_EMAIL: z.string().email("FROM_EMAIL must be a valid email address"),

  // Optional / legacy variables (SendGrid & Arcjet)
  SEND_GRID_API: z.string().optional(),
  ARCJET_KEY: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("\n=======================================================");
  console.error("❌ FATAL: Missing or invalid environment variables:");
  console.error("=======================================================");
  const formattedErrors = result.error.format();
  for (const [key, value] of Object.entries(formattedErrors)) {
    if (key === "_errors") continue;
    const messages = value._errors?.join(", ") || "Invalid value";
    console.error(`  ✖ ${key}: ${messages}`);
  }
  console.error("=======================================================");
  console.error("Please configure your .env file using .env.example as a template.\n");
  process.exit(1);
}

export const env = result.data;
export default env;
