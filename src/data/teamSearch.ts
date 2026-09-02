import { TEAMS, type Team } from './teams'
import { TEAM_SEARCH_ALIASES, normalizeTeamQuery } from './teamSearchAliases'

/**
 * Resolve a search box value to the team it names.
 *
 * Shared by every search that navigates to a team page (the desktop nav, the
 * Individual Team page and FanDuel -- 2 Sep feedback). Keystrokes match only
 * the full team name, because short aliases like "ne" would fire mid-way
 * through typing "new york jets"; a submit also resolves nicknames,
 * abbreviations, former names, slang and misspellings through the alias table.
 */
export function teamForQuery(value: string, aliasesAllowed: boolean): Team | undefined {
  const query = normalizeTeamQuery(value)
  if (query.length === 0) return undefined

  const byName = TEAMS.find((candidate) => normalizeTeamQuery(candidate.name) === query)
  if (byName !== undefined || !aliasesAllowed) return byName

  const nickname = TEAM_SEARCH_ALIASES[query]
  if (nickname === undefined) return undefined
  return TEAMS.find((candidate) => normalizeTeamQuery(candidate.name).includes(nickname))
}
