/**
 * The awards the All Awards frame draws, as pure data.
 *
 * Kept out of `src/screens/Awards/content.ts` so `src/assets/awardImages.ts`
 * can know how many there are without importing a screen — the same split the
 * roster in ./teams.ts makes.
 *
 * All four are the design's own placeholder card, which draws one title four
 * times. Give an award a real title by editing its row; give it a picture by
 * replacing `src/assets/awards/award-<n>/all-awards-award-<n>.png`, and give
 * its own page different cards by replacing the pictures in
 * `src/assets/awards/award-<n>/cards/`.
 */
import { cmsAward, text } from './cms'

export interface Award {
  /** 1-based, and the number of the folder its pictures live in. */
  readonly number: number
  readonly title: string
  /** That award’s own page, built from src/pages/awards/[award].astro. */
  readonly href: string
}

/**
 * The four awards, titled by the CMS.
 *
 * The routes stay `/awards/award-<n>`: the picture folders are numbered, so the
 * number is what ties a page to its assets even after an editor retitles it.
 */
export const AWARDS: readonly Award[] = [1, 2, 3, 4].map((number) => ({
  number,
  title: text(cmsAward(number)?.title, 'MOST VALUABLE PLAYER PICKS').toUpperCase(),
  href: `/awards/award-${number}`,
}))

export const AWARD_COUNT = AWARDS.length

/**
 * Cards on an award’s own page — the three the Most Valuable Player Picks
 * frame (188:2186) draws, and so the three pictures each award’s `cards`
 * folder holds.
 */
export const AWARD_CARD_COUNT = 3
