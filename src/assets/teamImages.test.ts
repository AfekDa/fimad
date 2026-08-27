import { describe, expect, it } from 'vitest'
import { ASSETS } from './assets'
import { TEAM_IMAGES, imagesForTeam } from './teamImages'
import { TEAMS } from '../data/teams'

describe('team images', () => {
  it('resolves a picture for every team', () => {
    for (const team of TEAMS) {
      const images = imagesForTeam(team.number)

      /*
       * `card` is the one field allowed to be absent: it falls back to the
       * design's eight card photographs, which the All Teams grid cycles.
       */
      const { card, ...required } = images
      expect(card === undefined || card.length > 0).toBe(true)
      for (const [name, source] of Object.entries(required)) {
        expect(source, `${team.name} has no ${name} image`).toBeTruthy()
      }
    }
  })

  it('falls back to the design pictures for a team with no row', () => {
    const unlisted = TEAMS.find((team) => TEAM_IMAGES[team.number] === undefined)
    if (unlisted === undefined) throw new Error('Every team has an override; nothing to test')

    expect(imagesForTeam(unlisted.number)).toEqual({
      card: undefined,
      hero: ASSETS.teamBuffaloHero,
      heroDesktop: ASSETS.teamBuffaloHeroDesktop,
      prediction: ASSETS.teamBuffaloPrediction,
      favorite: ASSETS.teamBuffaloFuture,
      favoriteDesktop: ASSETS.teamBuffaloFutureDesktop,
      explore: ASSETS.teamExploreCard,
      logo: ASSETS.teamsLogoBuffalo,
    })
  })

  it('keeps the design pictures a row does not name', () => {
    for (const [number, override] of Object.entries(TEAM_IMAGES)) {
      const resolved = imagesForTeam(Number(number))
      const untouched = Object.keys(resolved).filter((key) => !(key in override))

      for (const key of untouched) {
        expect(
          resolved[key as keyof typeof resolved],
          `Team ${number} lost its default ${key} image`,
        ).toBe(imagesForTeam(0)[key as keyof typeof resolved])
      }
    }
  })
})
