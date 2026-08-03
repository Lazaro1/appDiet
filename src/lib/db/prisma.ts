import { PrismaClient } from "@/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({ adapter } as any)
}

/** Detects Prisma singletons created before `prisma generate` added new models. */
function isStalePrismaClient(client: PrismaClient | undefined): boolean {
  if (!client) return false
  return !("recipe" in client) || !(client as { recipe?: unknown }).recipe
}

const cachedPrisma = globalForPrisma.prisma
export const prisma =
  cachedPrisma && !isStalePrismaClient(cachedPrisma)
    ? cachedPrisma
    : createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
