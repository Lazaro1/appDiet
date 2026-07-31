/**
 * Feedback loop for clerkId unique-constraint race (layout + page SSR).
 *
 * Simulates two concurrent find-then-create callers against an in-memory store
 * with artificial latency (same pattern as UserRepository + getAuthenticatedUser).
 *
 * Run: node scripts/repro-clerkid-race.mjs
 *      node scripts/repro-clerkid-race.mjs safe
 */

function createStore() {
  let user = null
  return {
    async findByClerkId(clerkId) {
      await delay(5)
      return user?.clerkId === clerkId ? { ...user } : null
    },
    async create(data) {
      await delay(15)
      if (user && user.clerkId === data.clerkId) {
        const err = new Error('Unique constraint failed on the fields: ("clerkId")')
        err.code = "P2002"
        throw err
      }
      user = { id: "u1", ...data }
      return { ...user }
    },
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Buggy pattern currently in get-authenticated-user / onboarding / require-api-user */
async function buggyFindThenCreate(store, data) {
  const existing = await store.findByClerkId(data.clerkId)
  if (existing) return existing
  return store.create(data)
}

/** Fixed pattern: catch P2002 and re-fetch */
async function safeFindOrCreate(store, data) {
  const existing = await store.findByClerkId(data.clerkId)
  if (existing) return existing
  try {
    return await store.create(data)
  } catch (error) {
    if (error?.code === "P2002") {
      const again = await store.findByClerkId(data.clerkId)
      if (again) return again
    }
    throw error
  }
}

const mode = process.argv[2] === "safe" ? "safe" : "buggy"
const fn = mode === "safe" ? safeFindOrCreate : buggyFindThenCreate
const store = createStore()
const data = { clerkId: "clerk_abc", name: "Race", email: "race@example.com" }

try {
  const results = await Promise.all([fn(store, data), fn(store, data)])
  const ids = new Set(results.map((u) => u.id))
  if (ids.size !== 1) {
    console.error("UNEXPECTED: different ids", [...ids])
    process.exit(2)
  }
  if (mode === "buggy") {
    console.error("UNEXPECTED GREEN — race did not fire; retry")
    process.exit(4)
  }
  console.log("FIXED")
  process.exit(0)
} catch (error) {
  if (error?.code === "P2002") {
    console.error("BUG REPRODUCED: Unique constraint failed on clerkId")
    process.exit(1)
  }
  console.error(error)
  process.exit(3)
}
