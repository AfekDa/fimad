import { describe, expect, it } from 'vitest'
import { TEAMS, TEAM_COUNT, teamByNumber } from './teams'

describe('team roster', () => {
  it('numbers every team from 1 to 32', () => {
    expect(TEAMS).toHaveLength(TEAM_COUNT)
    expect(TEAMS.map((team) => team.number)).toEqual(
      Array.from({ length: TEAM_COUNT }, (_, index) => index + 1),
    )
    expect(TEAMS.map((team) => team.name)).toEqual(
      Array.from({ length: TEAM_COUNT }, (_, index) => `TEAM ${index + 1}`),
    )
  })

  it('gives every team a distinct page under /teams', () => {
    const hrefs = TEAMS.map((team) => team.href)

    expect(new Set(hrefs).size).toBe(TEAM_COUNT)
    expect(hrefs.every((href) => href.startsWith('/teams/team-'))).toBe(true)
    expect(TEAMS.every((team) => team.href === `/teams/${team.slug}`)).toBe(true)
  })

  it('splits the roster evenly across the conferences', () => {
    expect(TEAMS.filter((team) => team.conference === 'AFC')).toHaveLength(TEAM_COUNT / 2)
    expect(TEAMS.filter((team) => team.conference === 'NFC')).toHaveLength(TEAM_COUNT / 2)
  })

  it('looks a team up by number and refuses one off the roster', () => {
    expect(teamByNumber(1).slug).toBe('team-1')
    expect(teamByNumber(TEAM_COUNT).slug).toBe(`team-${TEAM_COUNT}`)
    expect(() => teamByNumber(0)).toThrow(/roster holds/)
    expect(() => teamByNumber(TEAM_COUNT + 1)).toThrow(/roster holds/)
  })
})
