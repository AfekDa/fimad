/**
 * Rebuild the stand-in images under `public/cms-fixes/`.
 *
 * The 1 Sep 2026 audit of the CMS payload found imagery published into the
 * wrong slots — the Ravens' desktop prediction crop in the mobile slot, Lions
 * artwork across the Cowboys page, the design's Buffalo placeholder as four
 * teams' mobile Favorite Future, and so on. The wrong files live in the Base44
 * content hub, which this repo cannot write to, so `IMAGE_FIXES` in
 * src/data/cms.ts substitutes the files this script builds, keyed by the exact
 * bad url. Re-uploading a slot in the CMS changes its url and retires the fix;
 * this script only exists to regenerate the stand-ins until that happens.
 *
 * Every output is composed from imagery already in the payload — a team's own
 * crest, card or Favorite Future export — recropped to the slot it stands in
 * for. Sources are read from the synced snapshot in public/cms/, so run
 * `npm run sync:cms` first if that folder is empty.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const cms = (name) => path.join(root, 'public', 'cms', name)
const OUT = path.join(root, 'public', 'cms-fixes')
await mkdir(OUT, { recursive: true })

const WEBP = { quality: 82 }

/**
 * A feathered-edge alpha mask, so a pasted crop melts into the black canvas.
 * Horizontal and vertical fades are multiplied as rasters — sharp's SVG
 * renderer ignores mix-blend-mode, so the corners cannot be built in one SVG.
 * An edge of 0 leaves that axis unfaded.
 */
async function feather(width, height, edgeX, edgeY) {
  const ramp = (id, x2, y2, edge, span) =>
    `<svg width="${width}" height="${height}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">
        <stop offset="0" stop-color="#000"/><stop offset="${edge / span}" stop-color="#fff"/>
        <stop offset="${1 - edge / span}" stop-color="#fff"/><stop offset="1" stop-color="#000"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#${id})"/>
    </svg>`
  const horizontal = edgeX > 0 ? Buffer.from(ramp('h', 1, 0, edgeX, width)) : null
  const vertical = edgeY > 0 ? Buffer.from(ramp('v', 0, 1, edgeY, height)) : null
  const base = horizontal ?? vertical
  let mask = sharp(base).resize(width, height).greyscale()
  if (horizontal && vertical) {
    mask = sharp(await mask.toBuffer()).composite([{ input: vertical, blend: 'multiply' }]).greyscale()
  }
  return mask.toBuffer()
}

/** Paste a crop onto a black canvas with feathered edges, as webp. */
async function onBlack(canvasW, canvasH, crop, cropW, cropH, left, top, out, edgeX = 90, edgeY = 90) {
  const mask = await feather(cropW, cropH, edgeX, edgeY)
  const faded = await sharp(crop)
    .resize(cropW, cropH)
    .joinChannel(mask)
    .png()
    .toBuffer()
  await sharp({ create: { width: canvasW, height: canvasH, channels: 3, background: '#000' } })
    .composite([{ input: faded, left, top }])
    .webp(WEBP)
    .toFile(path.join(OUT, out))
  console.log('wrote', out)
}

/**
 * A mobile Favorite Future portrait (1290x2640) from a landscape export: the
 * subject crop sits in the lower half, edges faded into the black scrim the
 * section lays over the top of the picture anyway.
 */
async function favoriteMobile(srcName, out) {
  const W = 1290
  const H = 1560
  const FADE = 420
  const crop = await sharp(cms(srcName)).resize(W, H, { fit: 'cover', position: 'attention' }).toBuffer()
  // Bottom-flush, so only the top edge needs to melt into the black above.
  const mask = await sharp(
    Buffer.from(
      `<svg width="${W}" height="${H}">
        <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000"/><stop offset="${FADE / H}" stop-color="#fff"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#t)"/>
      </svg>`,
    ),
  )
    .resize(W, H)
    .greyscale()
    .toBuffer()
  const faded = await sharp(crop).resize(W, H).joinChannel(mask).png().toBuffer()
  await sharp({ create: { width: W, height: 2640, channels: 3, background: '#000' } })
    .composite([{ input: faded, left: 0, top: 2640 - H }])
    .webp(WEBP)
    .toFile(path.join(OUT, out))
  console.log('wrote', out)
}

/** A desktop Favorite Future band (1600x796) recropped from a landscape export. */
async function favoriteDesktop(srcName, out) {
  await sharp(cms(srcName))
    .resize(1600, 796, { fit: 'cover', position: 'attention' })
    .webp(WEBP)
    .toFile(path.join(OUT, out))
  console.log('wrote', out)
}

/*
 * Ravens mobile prediction (1290x1950): the CMS slot holds the desktop
 * 1600x664 crop, whose crest the 100%-wide mobile band blows up and cuts off.
 * Recrop that crest into the portrait framing the other 30 teams use — crest
 * in the bottom third, black above.
 */
{
  const crest = await sharp(cms('8f741c155e7963b1.webp'))
    .extract({ left: 500, top: 0, width: 1100, height: 664 })
    .resize(1160, 700)
    .toBuffer()
  await onBlack(1290, 1950, crest, 1160, 700, 65, 1950 - 700 - 180, 'ravens-prediction-mobile.webp')
}

/*
 * Cowboys predictions (both crops): the slots hold the Lions crest. Set the
 * team's own star crest — the only Cowboys crest the payload has — over the
 * same black-steel gradient the other crests carry, dimmed to sit with them.
 */
{
  const star = (size) =>
    sharp(cms('3b898feaca918bd3.webp')).resize(size).modulate({ brightness: 0.62, saturation: 0.85 }).toBuffer()
  const glow = (w, h, cx, cy, r) =>
    Buffer.from(
      `<svg width="${w}" height="${h}">
        <defs><radialGradient id="g" cx="${cx}" cy="${cy}" r="${r}">
          <stop offset="0" stop-color="#2b2b2b"/><stop offset="0.55" stop-color="#141414"/><stop offset="1" stop-color="#000"/>
        </radialGradient></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>`,
    )
  await sharp(glow(1600, 664, 0.62, 0.55, 0.5))
    .composite([{ input: await star(520), left: 740, top: 80 }])
    .webp(WEBP)
    .toFile(path.join(OUT, 'cowboys-prediction.webp'))
  console.log('wrote cowboys-prediction.webp')
  await sharp(glow(1290, 1950, 0.5, 0.72, 0.55))
    .composite([{ input: await star(940), left: 175, top: 960 }])
    .webp(WEBP)
    .toFile(path.join(OUT, 'cowboys-prediction-mobile.webp'))
  console.log('wrote cowboys-prediction-mobile.webp')
}

/*
 * Cowboys Favorite Future (the copy names Dak Prescott, the slots hold Lions
 * artwork): recrop Dak's own card photo. Panthers Favorite Future (a Falcons
 * export and the Buffalo placeholder): recrop their hero photography.
 * Patriots, Packers and Buccaneers mobile Favorite Future (the Buffalo
 * placeholder): recrop each team's own desktop Favorite Future export.
 */
await favoriteDesktop('9dcedd2ca8ce6a46.webp', 'cowboys-future.webp')
await favoriteMobile('9dcedd2ca8ce6a46.webp', 'cowboys-future-mobile.webp')
await favoriteDesktop('7abc222b9092bacd.webp', 'panthers-future.webp')
await favoriteMobile('4e844de3b8a007f9.webp', 'panthers-future-mobile.webp')
await favoriteMobile('76435dfb571fb683.webp', 'patriots-future-mobile.webp')
await favoriteMobile('a3e5009973f7ffdb.webp', 'packers-future-mobile.webp')
await favoriteMobile('70456b2da0130b7f.webp', 'buccaneers-future-mobile.webp')
