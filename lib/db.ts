import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7: Prisma builds the query, `pg` (node-postgres) runs it. Point the
// adapter at the pooled Neon connection.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Hot-reload guard: Next.js re-runs server modules on every save in dev, and a
// fresh PrismaClient each time would leak connection pools until Postgres
// refuses new connections. Stash one instance on globalThis (survives reloads)
// and reuse it. Production evaluates this module once, so the guard is a no-op.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
