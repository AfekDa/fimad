/**
 * The 32-team roster — pure data, no component or asset imports.
 *
 * The Figma design names eight real AFC teams on the All Teams frame and one
 * real team (Buffalo) on the detail frame. The app ships 32 numbered
 * placeholders instead, so this module is the single source of truth for what a
 * team is called, where its page lives, and which conference it filters under.
 * Both the All Teams grid and the individual team pages read it, which is what
 * keeps a card's label and its destination from drifting apart.
 *
 * `/teams/buffalo-bills` is deliberately not in here: it stays as the untouched
 * Figma reference route the pixel-fidelity specs compare against.
 */
export type Conference = 'AFC' | 'NFC'

export interface Team {
  /** 1-based position in the roster; the number the placeholder is named for. */
  readonly number: number
  /** Display name, uppercase to match the design's team lockups. */
  readonly name: string
  readonly slug: string
  readonly href: string
  readonly conference: Conference
}

export const TEAM_COUNT = 32

/** The first half of the roster files under the AFC, the second under the NFC. */
export const TEAMS: readonly Team[] = Array.from({ length: TEAM_COUNT }, (_, index) => {
  const number = index + 1

  return {
    number,
    name: `TEAM ${number}`,
    slug: `team-${number}`,
    href: `/teams/team-${number}`,
    conference: number <= TEAM_COUNT / 2 ? 'AFC' : 'NFC',
  }
})

/**
 * Roster lookup that fails loudly.
 *
 * Every caller derives its number from the roster itself, so an out-of-range
 * number is a bug in the caller rather than missing data, and a thrown error at
 * build time beats a half-rendered page.
 */
export function teamByNumber(number: number): Team {
  const team = TEAMS[number - 1]

  if (team === undefined) {
    throw new Error(`No team numbered ${number}; the roster holds 1-${TEAM_COUNT}`)
  }

  return team
}
