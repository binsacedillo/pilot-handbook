import "dotenv/config";
import { defineConfig } from "@prisma/config";
import path from "path";
import dotenv from "dotenv";

// Explicitly load .env.local
dotenv.config({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
