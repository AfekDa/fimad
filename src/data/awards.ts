/**
 * The awards the All Awards frame draws, as pure data.
 *
 * Kept out of `src/screens/Awards/content.ts` so `src/assets/awardImages.ts`
 * can know how many there are without importing a screen — the same split the
 * roster in ./teams.ts makes.
 *
 * All four are the design's own placeholder card, which draws one title four
 * times. Give an award a real title and destination by editing its row; give
 * it a picture by replacing `src/assets/awards/award-<n>/card.png`.
 */
export interface Award {
  /** 1-based, and the number of the folder its pictures live in. */
  readonly number: number
  readonly title: string
  readonly href: string
}

export const AWARDS: readonly Award[] = [
  { number: 1, title: 'MOST VALUABLE PLAYER PICKS', href: '/awards/mvp' },
  { number: 2, title: 'MOST VALUABLE PLAYER PICKS', href: '/awards/mvp' },
  { number: 3, title: 'MOST VALUABLE PLAYER PICKS', href: '/awards/mvp' },
  { number: 4, title: 'MOST VALUABLE PLAYER PICKS', href: '/awards/mvp' },
]

export const AWARD_COUNT = AWARDS.length
