// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default defineConfig({
  // AVANT : schema: "./src/db/schema.ts",
  // APRÈS (Enlève le src) :
  schema: "./db/schema.ts", 
  
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});