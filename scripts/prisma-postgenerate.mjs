import { writeFileSync } from "node:fs"
import { join } from "node:path"

const indexPath = join(process.cwd(), "src/generated/prisma/index.ts")

writeFileSync(indexPath, 'export * from "./client"\n')
