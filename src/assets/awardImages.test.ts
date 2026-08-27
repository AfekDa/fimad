import { describe, expect, it } from 'vitest'
import { ASSETS } from './assets'
import { AWARD_IMAGES, imagesForAward } from './awardImages'
import { AWARDS, AWARD_COUNT } from '../data/awards'

describe('award images', () => {
  it('gives every award a picture out of its own folder', () => {
    for (const award of AWARDS) {
      const folder = AWARD_IMAGES[award.number]
      expect(folder, `src/assets/awards/award-${award.number} is empty`).toBeDefined()
      expect(folder?.card, `award-${award.number} is missing its card file`).toBeTruthy()
      expect(imagesForAward(award.number).card).toBe(folder?.card)
    }
  })

  /*
   * The folders ship filled, so this is the safety net rather than the norm:
   * an award whose file is deleted keeps rendering the design's own card
   * photograph. Award 0 is off the end and so has no folder, standing in for
   * one.
   */
  it('falls back to the design picture for a slot with no file', () => {
    expect(imagesForAward(0)).toEqual({ card: ASSETS.awardCardMvp })
  })

  /*
   * The folders are read by a build-time glob, so a stray file is caught while
   * the module initialises rather than here. What this can still check is that
   * nothing which did get through describes an award the app does not have.
   */
  it('reads only listed awards out of src/assets/awards', () => {
    for (const [number, folder] of Object.entries(AWARD_IMAGES)) {
      expect(Number(number)).toBeGreaterThanOrEqual(1)
      expect(Number(number)).toBeLessThanOrEqual(AWARD_COUNT)
      expect(Object.keys(folder)).toEqual(['card'])
    }
  })
})
