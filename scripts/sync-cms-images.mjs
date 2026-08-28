/**
 * Snapshot the CMS's remote imagery into the site itself.
 *
 * `cms-content.json` hot-links every image from the Base44 content hub, so the
 * deployed site pulls hundreds of unoptimized PNGs from a third-party server at
 * view time. This script runs before `dev` and `build`: it downloads every
 * Base44 file url referenced by the payload into `public/cms/` (converted to
 * WebP where the source is a PNG/JPEG), and writes `src/data/cms-images.json`
 * mapping each remote url to its local path. `image()` in src/data/cms.ts
 * consults that manifest; any url the manifest misses simply stays remote, so a
 * failed download degrades to today's behavior rather than a broken image.
 *
 * Files are named by a hash of their source url, so re-runs only download what
 * a CMS publish actually changed. Local files no longer referenced are pruned.
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const CONTENT = path.join(root, 'src', 'data', 'cms-content.json')
const MANIFEST = path.join(root, 'src', 'data', 'cms-images.json')
const OUT_DIR = path.join(root, 'public', 'cms')

/** Base44 file urls only — social links and other absolute urls stay remote. */
const URL_PATTERN = /https:\/\/base44\.app\/api\/apps\/[^"]+?\/files\/[^"]+/g

/** Display never exceeds the 1280px desktop canvas at 2x. */
const MAX_WIDTH = 2560
const WEBP_QUALITY = 90
const CONCURRENCY = 8

const raw = await readFile(CONTENT, 'utf8')
const urls = [...new Set(raw.match(URL_PATTERN) ?? [])]
await mkdir(OUT_DIR, { recursive: true })

/** Formats sharp re-encodes; everything else (svg, gif, webp…) is kept as-is. */
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg'])

function localNameFor(url) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16)
  const ext = path.extname(new URL(url).pathname).toLowerCase() || '.bin'
  return hash + (CONVERTIBLE.has(ext) ? '.webp' : ext)
}

async function fetchBytes(url) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      if (attempt >= 2) throw error
    }
  }
}

const manifest = {}
const failures = []
let downloaded = 0

async function sync(url) {
  const name = localNameFor(url)
  const target = path.join(OUT_DIR, name)
  if (!existsSync(target)) {
    const bytes = await fetchBytes(url)
    if (name.endsWith('.webp') && !url.toLowerCase().endsWith('.webp')) {
      await sharp(bytes)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(target)
    } else {
      await writeFile(target, bytes)
    }
    downloaded += 1
  }
  manifest[url] = `/cms/${name}`
}

const queue = [...urls]
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      try {
        await sync(url)
      } catch (error) {
        failures.push(url)
        console.warn(`cms-images: ${url} failed (${error.message}) — staying remote`)
      }
    }
  }),
)

// Prune snapshots whose source url left the payload.
const keep = new Set(Object.values(manifest).map((entry) => path.basename(entry)))
for (const file of await readdir(OUT_DIR)) {
  if (!keep.has(file)) await rm(path.join(OUT_DIR, file))
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n')

console.log(
  `cms-images: ${urls.length} urls, ${downloaded} downloaded, ` +
    `${urls.length - failures.length} local, ${failures.length} left remote`,
)
