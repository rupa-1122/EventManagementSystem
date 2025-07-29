// drizzle.config.ts

import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // ✅ load variables from .env file

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in .env — ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
