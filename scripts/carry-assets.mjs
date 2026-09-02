/**
 * Carry the previous deploys' hashed assets into this one.
 *
 * GitHub Pages replaces the whole site on every deploy, so the last build's
 * `/_astro/*` files are gone the moment a new one lands. Every page still open
 * in a tab -- and every copy of a page the CDN keeps serving for up to ten
 * minutes -- refers to those files by name. When such a page swaps in the next
 * screen, the ClientRouter finds a stylesheet or script missing and the deploy
 * guard in BaseLayout hands the navigation to the browser: a flash and a lost
 * nav-line slide. With CMS publishes landing every few minutes, and the CMS
 * payload bundled into the nav search's script, that was most tab changes
 * (2 Sep report: "random pages each time").
 *
 * A hashed file's content never changes, so old ones can stay published. The
 * deploy workflow runs this after `astro build`: the assets kept from earlier
 * deploys (restored from the Actions cache) are merged into `dist/_astro`,
 * anything no build has shipped for RETENTION_DAYS is dropped, and the merged
 * set is written back to the cache directory for the next run. The guard in
 * BaseLayout stays as the fallback for a tab older than the retention window.
 */
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const DIST_ASSETS = path.join(root, 'dist', '_astro')
const CARRY_DIR = path.join(root, '.cache', 'carried-assets')
const MANIFEST = path.join(CARRY_DIR, 'manifest.json')

/**
 * A stale CDN copy lives ten minutes; a tab left open over a weekend is the
 * realistic upper bound. Three days keeps the carried set small -- every CMS
 * publish adds another copy of the ~300 KB search chunk.
 */
const RETENTION_DAYS = 3
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000

/** `{ [fileName]: ISO date of the last build that shipped it }` */
async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'))
  } catch {
    // First run, or an evicted cache: nothing to carry.
    return {}
  }
}

async function fileNames(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name))
  } catch {
    return new Set()
  }
}

const now = Date.now()
const built = await fileNames(DIST_ASSETS)
if (built.size === 0) {
  throw new Error(`No built assets in ${DIST_ASSETS}; run this after \`astro build\``)
}

const previous = await readManifest()
const kept = await fileNames(CARRY_DIR)

const next = {}
for (const name of built) next[name] = new Date(now).toISOString()

let carried = 0
let dropped = 0
for (const [name, lastBuilt] of Object.entries(previous)) {
  if (built.has(name)) continue
  const age = now - Date.parse(lastBuilt)
  if (!(age <= RETENTION_MS) || !kept.has(name)) {
    dropped += 1
    continue
  }
  await copyFile(path.join(CARRY_DIR, name), path.join(DIST_ASSETS, name))
  next[name] = lastBuilt
  carried += 1
}

// The cache directory holds exactly what this deploy publishes, plus the manifest.
await rm(CARRY_DIR, { recursive: true, force: true })
await mkdir(CARRY_DIR, { recursive: true })
await Promise.all(
  Object.keys(next).map((name) => copyFile(path.join(DIST_ASSETS, name), path.join(CARRY_DIR, name))),
)
await writeFile(MANIFEST, `${JSON.stringify(next, null, 2)}\n`)

console.log(
  `carry-assets: ${built.size} built, ${carried} carried from earlier deploys, ${dropped} dropped (older than ${RETENTION_DAYS} days or not cached); ${Object.keys(next).length} published`,
)
