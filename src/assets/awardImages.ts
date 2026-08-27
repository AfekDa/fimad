/**
 * Which pictures each award uses.
 *
 * ─── To change an award’s image ──────────────────────────────────
 *   Replace the file in that award’s folder under `src/assets/awards/`, keeping
 *   its name:
 *
 *       src/assets/awards/award-3/all-awards-award-3.png   <- the All Awards card
 *       src/assets/awards/award-3/cards/award-3-card-2.png <- card 2 on its page
 *
 *   That is the whole procedure — no import to add here, no table to edit,
 *   exactly like the team folders next door.
 *
 * ─── The slots ─────────────────────────────────────────────────
 *   all-awards-award-<n>.png   1146 x 900    this award on the All Awards page
 *   cards/award-<n>-card-<k>.png
 *                             1024 x  683    card k on this award’s own page
 *
 * A card file may drop the spelled-out owner — `cards/card-2.png` fills the
 * same slot as `cards/award-3-card-2.png` — but a spelled-out name has to
 * carry its own folder’s number.
 *
 * `.jpg`, `.jpeg`, `.webp` and `.avif` are read as well. Neither size is
 * pinned: the All Awards card scales its photograph with `object-fit: cover`,
 * and a pick card stretches its own to a fixed 316 x 505 box, so a replacement
 * only has to be roughly the same shape to be framed the same way.
 *
 * The sentence describing a picture for screen readers is *not* here — it lives
 * beside the card, in `src/screens/Awards/content.ts` for the All Awards page
 * and `src/screens/MvpPicks/content.ts` for an award’s own page, so it can be
 * updated in the same breath as the photograph it describes.
 *
 * The folders ship filled with the design’s own photography. A file that is
 * deleted falls back to the same picture rather than breaking. See
 * src/assets/awards/README.md.
 */
import { ASSETS } from './assets'
import { readImageFolders, readNestedImageFolders } from './imageFolders'
import { AWARD_CARD_COUNT, AWARD_COUNT } from '../data/awards'

export interface AwardImages {
  /** The photograph filling the card on the All Awards page. */
  readonly card: string
}

/** What an award shows until it is given a picture of its own. */
const DESIGN_IMAGES: AwardImages = {
  card: ASSETS.awardCardMvp,
}

/** The file name an award’s folder uses for each slot, without its extension. */
const SLOT_BY_FILE_NAME: Readonly<Record<string, keyof AwardImages>> = {
  'all-awards': 'card',
}

/**
 * What each award’s folder holds, keyed by award number. An award with an
 * empty folder has no entry.
 *
 * This is derived, not authored: to change an award’s picture, replace the
 * file in `src/assets/awards/award-<n>/` rather than editing anything here.
 */
export const AWARD_IMAGES: Readonly<Record<number, Partial<AwardImages>>> = readImageFolders({
  files: import.meta.glob<string>('./awards/award-*/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  root: 'awards',
  prefix: 'award',
  count: AWARD_COUNT,
  slots: SLOT_BY_FILE_NAME,
})

/**
 * The pictures for the cards on each award’s own page, as award -> card -> url.
 *
 * A separate glob from the one above because these sit one level down, in the
 * `cards` folder inside each award.
 */
export const AWARD_CARD_IMAGES = readNestedImageFolders({
  files: import.meta.glob<string>('./awards/award-*/cards/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  root: 'awards',
  prefix: 'award',
  count: AWARD_COUNT,
  subfolder: 'cards',
  itemPrefix: 'card',
  itemCount: AWARD_CARD_COUNT,
})

/** Every picture award `number` uses, with the design’s own filling any gaps. */
export function imagesForAward(number: number): AwardImages {
  return { ...DESIGN_IMAGES, ...AWARD_IMAGES[number] }
}

/**
 * The picture for card `card` on award `award`’s own page, falling back to the
 * design’s own pick photograph when that award has not been given one.
 */
export function imageForAwardCard(award: number, card: number): string {
  return AWARD_CARD_IMAGES[award]?.[card] ?? ASSETS.mvpCardLamar
}
