/**
 * Which picture each award uses.
 *
 * ─── To change an award's image ────────────────────────────────────────────
 *   Replace the file in that award's folder under `src/assets/awards/`,
 *   keeping its name:
 *
 *       src/assets/awards/award-3/card.png
 *
 *   That is the whole procedure — no import to add here, no table to edit,
 *   exactly like the team folders next door.
 *
 * ─── The slots ─────────────────────────────────────────────────────────────
 *   card.png    1146 x 900    the photograph filling the All Awards card
 *
 * `.jpg`, `.jpeg`, `.webp` and `.avif` are read as well. Unlike the team
 * pictures the size here is not pinned: the award card scales its photograph
 * with `object-fit: cover`, so a replacement only has to be roughly this shape
 * to be framed the same way.
 *
 * The sentence describing the picture for screen readers is *not* here — it
 * lives beside the award in `src/screens/Awards/content.ts`, so it can be
 * updated in the same breath as the photograph it describes.
 *
 * The folders ship filled with the design's own card photograph. A folder
 * whose file is deleted falls back to the same picture rather than breaking.
 * See src/assets/awards/README.md.
 */
import { ASSETS } from './assets'
import { readImageFolders } from './imageFolders'
import { AWARD_COUNT } from '../data/awards'

export interface AwardImages {
  /** The photograph filling the card, behind the scrim and the title. */
  readonly card: string
}

/** What an award shows until it is given a picture of its own. */
const DESIGN_IMAGES: AwardImages = {
  card: ASSETS.awardCardMvp,
}

/** The file name an award's folder uses for each slot, without its extension. */
const SLOT_BY_FILE_NAME: Readonly<Record<string, keyof AwardImages>> = {
  card: 'card',
}

/**
 * What each award's folder holds, keyed by award number. An award with an
 * empty folder has no entry.
 *
 * This is derived, not authored: to change an award's picture, replace the
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

/** Every picture award `number` uses, with the design's own filling any gaps. */
export function imagesForAward(number: number): AwardImages {
  return { ...DESIGN_IMAGES, ...AWARD_IMAGES[number] }
}
