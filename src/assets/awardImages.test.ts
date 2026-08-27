import { describe, expect, it } from 'vitest'
import { ASSETS } from './assets'
import { AWARD_CARD_IMAGES, AWARD_IMAGES, imageForAwardCard, imagesForAward } from './awardImages'
import { AWARDS, AWARD_CARD_COUNT, AWARD_COUNT } from '../data/awards'

describe('award images', () => {
  it('gives every award a picture out of its own folder', () => {
    for (const award of AWARDS) {
      const folder = AWARD_IMAGES[award.number]
      expect(folder, `src/assets/awards/award-${award.number} is empty`).toBeDefined()
      expect(folder?.card, `award-${award.number} is missing its All Awards file`).toBeTruthy()
      expect(imagesForAward(award.number).card).toBe(folder?.card)
    }
  })

  it('gives every card on an award page a picture out of that award’s cards folder', () => {
    for (const award of AWARDS) {
      const cards = AWARD_CARD_IMAGES[award.number]
      expect(cards, `src/assets/awards/award-${award.number}/cards is empty`).toBeDefined()

      for (let card = 1; card <= AWARD_CARD_COUNT; card += 1) {
        expect(cards?.[card], `award-${award.number} is missing card ${card}`).toBeTruthy()
        expect(imageForAwardCard(award.number, card)).toBe(cards?.[card])
      }
    }
  })

  /*
   * The folders ship filled, so these are the safety net rather than the norm:
   * a file that is deleted keeps rendering the design’s own photograph. Award 0
   * is off the end and so has no folder, standing in for one.
   */
  it('falls back to the design pictures for a slot with no file', () => {
    expect(imagesForAward(0)).toEqual({ card: ASSETS.awardCardMvp })
    expect(imageForAwardCard(0, 1)).toBe(ASSETS.mvpCardLamar)
    expect(imageForAwardCard(1, AWARD_CARD_COUNT + 1)).toBe(ASSETS.mvpCardLamar)
  })

  /*
   * The folders are read by a build-time glob, so a stray file is caught while
   * the module initialises rather than here. What this can still check is that
   * nothing which did get through describes an award or a card the app lacks.
   */
  it('reads only listed awards and cards out of src/assets/awards', () => {
    for (const [number, folder] of Object.entries(AWARD_IMAGES)) {
      expect(Number(number)).toBeGreaterThanOrEqual(1)
      expect(Number(number)).toBeLessThanOrEqual(AWARD_COUNT)
      expect(Object.keys(folder)).toEqual(['card'])
    }

    for (const [number, cards] of Object.entries(AWARD_CARD_IMAGES)) {
      expect(Number(number)).toBeGreaterThanOrEqual(1)
      expect(Number(number)).toBeLessThanOrEqual(AWARD_COUNT)

      for (const card of Object.keys(cards)) {
        expect(Number(card)).toBeGreaterThanOrEqual(1)
        expect(Number(card)).toBeLessThanOrEqual(AWARD_CARD_COUNT)
      }
    }
  })
})
