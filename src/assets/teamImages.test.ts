import { describe, expect, it } from 'vitest'
import { ASSETS } from './assets'
import { TEAM_IMAGES, imagesForTeam } from './teamImages'
import { TEAM_COUNT, TEAMS } from '../data/teams'

const SLOTS = [
  'card',
  'hero',
  'heroDesktop',
  'prediction',
  'predictionDesktop',
  'favorite',
  'favoriteDesktop',
  'explore',
  'exploreDesktop',
  'logo',
  'logoDesktop',
] as const

describe('team images', () => {
  it('resolves a picture for every team', () => {
    for (const team of TEAMS) {
      const images = imagesForTeam(team.number)

      for (const slot of SLOTS) {
        expect(images[slot], `${team.name} has no ${slot} image`).toBeTruthy()
      }
    }
  })

  it('gives every team all eight pictures out of its own folder', () => {
    for (const team of TEAMS) {
      const folder = TEAM_IMAGES[team.number]
      expect(folder, `src/assets/teams/team-${team.number} is empty`).toBeDefined()

      for (const slot of SLOTS) {
        expect(folder?.[slot], `team-${team.number} is missing its ${slot} file`).toBeTruthy()
      }
    }
  })

  /*
   * The folders ship filled, so this is the safety net rather than the norm:
   * a slot whose file is deleted keeps rendering the design's own picture.
   * Team 0 is off the roster and so has no folder, which stands in for one.
   */
  it('falls back to the design pictures for a slot with no file', () => {
    expect(imagesForTeam(0)).toEqual({
      /* `card` alone has no single default: with no file the All Teams grid
       * goes back to cycling the design's eight card photographs. */
      card: undefined,
      hero: ASSETS.teamBuffaloHero,
      heroDesktop: ASSETS.teamBuffaloHeroDesktop,
      prediction: ASSETS.teamBuffaloPrediction,
      predictionDesktop: ASSETS.teamBuffaloPrediction,
      favorite: ASSETS.teamBuffaloFuture,
      favoriteDesktop: ASSETS.teamBuffaloFutureDesktop,
      explore: ASSETS.teamExploreCard,
      exploreDesktop: ASSETS.teamExploreCard,
      logo: ASSETS.teamsLogoBuffalo,
      logoDesktop: ASSETS.teamsLogoBuffalo,
    })
  })

  /*
   * The folders are read by a build-time glob, so a stray file is caught while
   * the module initialises rather than here. What this can still check is that
   * nothing which did get through describes a team or a slot the app has.
   */
  it('reads only roster teams and known slots out of src/assets/teams', () => {
    for (const [number, folder] of Object.entries(TEAM_IMAGES)) {
      expect(Number(number)).toBeGreaterThanOrEqual(1)
      expect(Number(number)).toBeLessThanOrEqual(TEAM_COUNT)

      for (const slot of Object.keys(folder)) {
        expect(SLOTS, `team ${number} has an unknown ${slot} picture`).toContain(slot)
      }
    }
  })
})
