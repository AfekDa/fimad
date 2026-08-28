import { describe, expect, it } from 'vitest'
import { TEAMS } from './teams'
import { TEAM_SEARCH_ALIASES, normalizeTeamQuery } from './teamSearchAliases'

function resolve(query: string) {
  const normalized = normalizeTeamQuery(query)
  const nickname = TEAM_SEARCH_ALIASES[normalized]
  if (nickname === undefined) return undefined
  return TEAMS.find((candidate) => normalizeTeamQuery(candidate.name).includes(nickname))
}

describe('team search aliases', () => {
  it('folds spacing, punctuation and case into one comparable form', () => {
    for (const query of ['Buffalo Bills', 'buffalo-bills', 'buffalo_bills', 'BUFFALOBILLS']) {
      expect(normalizeTeamQuery(query)).toBe('buffalobills')
    }
  })

  it('resolves every alias to exactly one team on the roster', () => {
    for (const nickname of Object.values(TEAM_SEARCH_ALIASES)) {
      const matches = TEAMS.filter((candidate) =>
        normalizeTeamQuery(candidate.name).includes(nickname),
      )
      expect(matches, `nickname "${nickname}"`).toHaveLength(1)
    }
  })

  it('covers all 32 teams', () => {
    const nicknames = new Set(Object.values(TEAM_SEARCH_ALIASES))
    expect(nicknames.size).toBe(TEAMS.length)
  })

  it('sends nicknames, slang, misspellings and former names to the right page', () => {
    expect(resolve('bills mafia')?.name).toBe('BUFFALO BILLS')
    expect(resolve('gang green')?.name).toBe('NEW YORK JETS')
    expect(resolve('bufalo bils')?.name).toBe('BUFFALO BILLS')
    expect(resolve('oakland raiders')?.name).toBe('LAS VEGAS RAIDERS')
    expect(resolve('washington redskins')?.name).toBe('WASHINGTON COMMANDERS')
    expect(resolve('san diego chargers')?.name).toBe('LOS ANGELES CHARGERS')
    expect(resolve('niners')?.name).toBe('SAN FRANCISCO 49ERS')
    expect(resolve('jax')?.name).toMatch(/JAGUARS$/)
  })

  it('routes shared former names to the franchise that carries them today', () => {
    expect(resolve('houston oilers')?.name).toBe('TENNESSEE TITANS')
    expect(resolve('baltimore colts')?.name).toBe('INDIANAPOLIS COLTS')
  })

  it('drops queries that are ambiguous between two current teams', () => {
    expect(TEAM_SEARCH_ALIASES[normalizeTeamQuery('los angeles football team')]).toBeUndefined()
  })
})
