/**
 * Which pictures each team uses.
 *
 * ─── To change a team's image ──────────────────────────────────────────────
 *   Replace the file in that team's folder under `src/assets/teams/`, keeping
 *   its name:
 *
 *       src/assets/teams/team-2/hero.png
 *
 *   That is the whole procedure — no import to add here, no table to edit. The
 *   folders are read at build time, and every screen resolves a team's
 *   pictures through `imagesForTeam`, so the All Teams grid card, the team's
 *   own page and its card in other teams' Explore carousels all follow.
 *
 * ─── The slots, and the size each one expects ──────────────────────────────
 *   card.png              1024 x  683    All Teams grid card
 *   hero.png              1024 x  701    full-bleed photo behind the team name
 *   hero-desktop.png      1155 x  885    the same, above 768px
 *   prediction.png         992 x  682    photo under the PREDICTIONS block
 *   favorite.png          1108 x 1763    photo behind FAVORITE FUTURE
 *   favorite-desktop.png   814 x 1024    the same, above 768px
 *   explore.png           1024 x  701    this team in other teams' Explore All
 *                                        Teams carousel
 *   logo.png              1920 x 1920    team lockup above the team name
 *
 * `.jpg`, `.jpeg`, `.webp` and `.avif` are read as well. Keep the pixel size:
 * these boxes are measured from the design rather than fitted, so a different
 * size reframes the shot instead of scaling it.
 *
 * The folders ship filled with placeholders — the design's own photography,
 * with the eight card treatments dealt out in the order the All Teams frame
 * draws them. A slot whose file is deleted falls back to the same picture
 * rather than breaking. See src/assets/teams/README.md.
 */
import { ASSETS } from './assets'
import { TEAM_COUNT } from '../data/teams'

export interface TeamImages {
  /**
   * All Teams grid card.
   *
   * `undefined` keeps the design's own eight card photographs, which the
   * roster cycles through — that is why this one is nullable and the rest are
   * not: there is no single default card photo to fall back to.
   */
  readonly card: string | undefined
  readonly hero: string
  readonly heroDesktop: string
  readonly prediction: string
  readonly favorite: string
  readonly favoriteDesktop: string
  readonly explore: string
  readonly logo: string
}

/** What a team shows until it is given pictures of its own. */
const DESIGN_IMAGES: TeamImages = {
  card: undefined,
  hero: ASSETS.teamBuffaloHero,
  heroDesktop: ASSETS.teamBuffaloHeroDesktop,
  prediction: ASSETS.teamBuffaloPrediction,
  favorite: ASSETS.teamBuffaloFuture,
  favoriteDesktop: ASSETS.teamBuffaloFutureDesktop,
  explore: ASSETS.teamExploreCard,
  logo: ASSETS.teamsLogoBuffalo,
}

/** The file name a team's folder uses for each slot, without its extension. */
const SLOT_BY_FILE_NAME: Readonly<Record<string, keyof TeamImages>> = {
  card: 'card',
  hero: 'hero',
  'hero-desktop': 'heroDesktop',
  prediction: 'prediction',
  favorite: 'favorite',
  'favorite-desktop': 'favoriteDesktop',
  explore: 'explore',
  logo: 'logo',
}

/**
 * Every picture in every team folder, as `./teams/team-2/hero.png` -> url.
 *
 * `?url` for the same reason as the imports in assets.ts: the file is emitted
 * and hashed by the build rather than resolved at runtime. Vite expands this
 * at build time, which is what lets a team be given a picture by dropping a
 * file in a folder instead of editing this module.
 */
const TEAM_FILES = import.meta.glob<string>('./teams/team-*/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** `Partial<TeamImages>` without the `readonly`, so the scan can fill it in. */
type TeamImageDraft = { -readonly [Slot in keyof TeamImages]?: TeamImages[Slot] }

const TEAM_FILE_PATH = /^\.\/teams\/team-(\d+)\/(.+)\.[^.]+$/

function readTeamFolders(): Readonly<Record<number, TeamImageDraft>> {
  const table: Record<number, TeamImageDraft> = {}

  for (const [path, url] of Object.entries(TEAM_FILES)) {
    const match = TEAM_FILE_PATH.exec(path)
    /* The glob only yields paths of this shape, so this is unreachable; it is
     * here to narrow the two capture groups rather than to catch anything. */
    if (match === null) throw new Error(`${path} is not a src/assets/teams file`)

    const number = Number(match[1])
    if (number < 1 || number > TEAM_COUNT) {
      throw new Error(`${path} is off the roster, which holds teams 1-${TEAM_COUNT}`)
    }

    const slot = SLOT_BY_FILE_NAME[match[2] ?? '']
    if (slot === undefined) {
      throw new Error(
        `${path} is not one of the team picture slots: ${Object.keys(SLOT_BY_FILE_NAME).join(', ')}`,
      )
    }

    const team = table[number] ?? {}
    if (team[slot] !== undefined) {
      throw new Error(`Team ${number} has more than one ${slot} picture; keep one file per slot`)
    }
    team[slot] = url
    table[number] = team
  }

  return table
}

/**
 * What each team's folder holds, keyed by team number. A team with an empty
 * folder has no entry.
 *
 * This is derived, not authored: to give a team a picture, add the file to
 * `src/assets/teams/team-<n>/` rather than editing anything here.
 */
export const TEAM_IMAGES: Readonly<Record<number, Partial<TeamImages>>> = readTeamFolders()

/** Every picture team `number` uses, with the design's own filling any gaps. */
export function imagesForTeam(number: number): TeamImages {
  return { ...DESIGN_IMAGES, ...TEAM_IMAGES[number] }
}
