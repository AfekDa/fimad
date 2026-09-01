/**
 * Convert Figma frame exports into the stand-in images under
 * `public/cms-fixes/`.
 *
 * The 1 Sep 2026 audit of the CMS payload found imagery published into the
 * wrong slots — the Ravens' desktop prediction crop in the mobile slot, Lions
 * artwork across the Cowboys page, the design's Buffalo placeholder as four
 * teams' mobile Favorite Future, and so on. The wrong files live in the Base44
 * content hub, which this repo cannot write to, so `IMAGE_FIXES` in
 * src/data/cms.ts substitutes the files in public/cms-fixes/, keyed by the
 * exact bad url. Re-uploading a slot in the CMS changes its url and retires
 * the fix.
 *
 * The committed webps are not recreations: they are the design's own frames,
 * exported from the Figma file (CFI1dNjCaOerGO7TrgRlLP) via the Figma MCP —
 * mobile frames at 3x, desktop frames at 1.25x, matching how the CMS's own
 * uploads were exported. These are the frames, keyed by output name:
 *
 *   ravens-prediction-mobile    823:5988   Mb_BaltimoreRavens_BlackSteel
 *   cowboys-prediction-mobile   823:6067   Mb_DallasCowboys_BlackSteel
 *   cowboys-prediction          911:4452   Dt_DallasCowboys_BlackSteel
 *   cowboys-future-mobile       852:2858   Mb_FF_DallasCowboys_DakPrescott
 *   cowboys-future              911:4460   Dt_FF_DallasCowboys_DakPrescott
 *   panthers-future-mobile      850:2752   Mb_FF_CarolinaPanthers_TetairoaMcmillan
 *   panthers-future             927:6022   Dt_FF_CarolinaPanthers_TetairoaMcmillan
 *   patriots-future-mobile      874:1287   Mb_FF_NewEnglandPatriots_TreveyonHenderson
 *   packers-future-mobile       852:2874   Mb_FF_GreenBayPackers_ChristianWatson
 *   buccaneers-future-mobile    908:5762   Mb_FF_TampaBayBuccaneers_EmekaEgbuka
 *
 * To refresh one: export its frame from Figma as a PNG at the scale above,
 * drop the file (named `<output-name>.png`) into a directory, and run
 *
 *   node scripts/build-image-fixes.mjs <directory>
 *
 * which re-encodes every PNG it finds there to webp at the slot's pixel size.
 */
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT = path.join(root, 'public', 'cms-fixes')

/** The pixel size each slot's upload carries; exports are normalized to it. */
const SLOT_SIZES = {
  'ravens-prediction-mobile': [1290, 1950],
  'cowboys-prediction-mobile': [1290, 1950],
  'cowboys-prediction': [1600, 664],
  'cowboys-future-mobile': [1290, 2640],
  'cowboys-future': [1600, 796],
  'panthers-future-mobile': [1290, 2640],
  'panthers-future': [1600, 796],
  'patriots-future-mobile': [1290, 2640],
  'packers-future-mobile': [1290, 2640],
  'buccaneers-future-mobile': [1290, 2640],
}

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node scripts/build-image-fixes.mjs <directory of exported PNGs>')
  process.exit(1)
}

for (const file of await readdir(dir)) {
  if (!file.endsWith('.png')) continue
  const name = file.replace(/\.png$/, '')
  const size = SLOT_SIZES[name]
  if (!size) {
    console.warn('skipping', file, '- not a known fix slot')
    continue
  }
  const out = path.join(OUT, name + '.webp')
  await sharp(path.join(dir, file))
    .resize(size[0], size[1], { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(out)
  console.log('wrote', out)
}
