/**
 * The 32-team roster — pure data, no component or asset imports.
 *
 * Names, slugs and conferences come from the CMS (src/data/cms-content.json)
 * when published, and fall back to the design's numbered placeholders. Both the
 * All Teams grid and the individual team pages read this module, which is what
 * keeps a card's label and its destination from drifting apart.
 *
 * `/teams/buffalo-bills` is deliberately not in here: it stays as the untouched
 * Figma reference route the pixel-fidelity specs compare against.
 */
import { cmsTeam, text } from './cms'

export type Conference = 'AFC' | 'NFC'

/**
 * The eight NFL divisions, in the order the roster files them: the CMS sorts
 * the league division by division, four teams each, so a team's division is a
 * function of its roster number.
 */
const DIVISIONS = [
  'AFC NORTH',
  'AFC EAST',
  'AFC SOUTH',
  'AFC WEST',
  'NFC NORTH',
  'NFC EAST',
  'NFC SOUTH',
  'NFC WEST',
] as const

export type Division = (typeof DIVISIONS)[number]

export interface Team {
  /** 1-based position in the roster; the number the placeholder is named for. */
  readonly number: number
  /** Display name, uppercase to match the design's team lockups. */
  readonly name: string
  readonly slug: string
  readonly href: string
  readonly conference: Conference
  readonly division: Division
  readonly logoScale: 1 | 1.15 | 1.3
}

export const TEAM_COUNT = 32

const TEAMS_PER_DIVISION = TEAM_COUNT / DIVISIONS.length

function divisionFor(number: number): Division {
  const division = DIVISIONS[Math.ceil(number / TEAMS_PER_DIVISION) - 1]

  if (division === undefined) {
    throw new Error(`No division for team ${number}; the roster holds 1-${TEAM_COUNT}`)
  }

  return division
}

/**
 * Marks called out as visually smaller than the rest of the published set.
 *
 * 29 Aug feedback: the Dolphins and Vikings marks still read small next to the
 * rest of the row at 1.15, so those two take a further step up; the others sit
 * right where they were.
 */
const ENLARGED_LOGO_SCALES = new Map<number, 1.15 | 1.3>([
  [6, 1.3], // Miami Dolphins
  [17, 1.15], // Detroit Lions
  [18, 1.3], // Minnesota Vikings
  [21, 1.15], // Dallas Cowboys
  [27, 1.15], // New Orleans Saints
])

function conferenceFor(published: string | undefined, number: number): Conference {
  if (published === 'AFC' || published === 'NFC') return published

  /** The first half of the roster files under the AFC, the second under the NFC. */
  return number <= TEAM_COUNT / 2 ? 'AFC' : 'NFC'
}

export const TEAMS: readonly Team[] = Array.from({ length: TEAM_COUNT }, (_, index) => {
  const number = index + 1
  const published = cmsTeam(number)
  const slug = text(published?.slug, `team-${number}`)

  return {
    number,
    name: text(published?.name, `TEAM ${number}`).toUpperCase(),
    slug,
    href: `/teams/${slug}`,
    conference: conferenceFor(published?.conference, number),
    division: divisionFor(number),
    logoScale: ENLARGED_LOGO_SCALES.get(number) ?? 1,
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
