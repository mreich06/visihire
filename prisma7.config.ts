import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // The CLI (migrate / studio / db pull) connects with this URL.
    // On Neon, prefer the *unpooled* (direct) connection for schema changes;
    // fall back to the normal URL for local Postgres where there's only one.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
