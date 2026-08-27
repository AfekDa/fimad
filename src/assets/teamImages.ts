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
 *   all-32-teams-team-<n>.png
 *                         1024 x  683    this team on the All 32 Teams page
 *   hero.png              1024 x  701    full-bleed photo behind the team name
 *   hero-desktop.png      1155 x  885    the same, above 768px
 *   prediction.png         992 x  682    photo under the PREDICTIONS block
 *   prediction-desktop.png 992 x  682    the same, above 768px
 *   favorite.png          1108 x 1763    photo behind FAVORITE FUTURE
 *   favorite-desktop.png   814 x 1024    the same, above 768px
 *   explore.png           1024 x  701    this team in other teams' Explore All
 *                                        Teams carousel
 *   explore-desktop.png   1024 x  701    the same, above 768px
 *   logo.png              1920 x 1920    team lockup above the team name
 *   logo-desktop.png      1920 x 1920    the same, above 768px
 *
 * The All 32 Teams file spells its own team out so it stays recognisable away
 * from the folder — `all-32-teams.png` fills the same slot if you would rather
 * not repeat it, but the number in a spelled-out name has to be the folder's.
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
import { readImageFolders } from './imageFolders'
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
  readonly predictionDesktop: string
  readonly favorite: string
  readonly favoriteDesktop: string
  readonly explore: string
  readonly exploreDesktop: string
  readonly logo: string
  readonly logoDesktop: string
}

/** What a team shows until it is given pictures of its own. */
const DESIGN_IMAGES: TeamImages = {
  card: undefined,
  hero: ASSETS.teamBuffaloHero,
  heroDesktop: ASSETS.teamBuffaloHeroDesktop,
  prediction: ASSETS.teamBuffaloPrediction,
  /*
   * The design has no second export for these three: it reframes one picture
   * with a different box above 768px. So the desktop default is the same file,
   * and the slot exists to let a team supply a wider crop of its own.
   */
  predictionDesktop: ASSETS.teamBuffaloPrediction,
  favorite: ASSETS.teamBuffaloFuture,
  favoriteDesktop: ASSETS.teamBuffaloFutureDesktop,
  explore: ASSETS.teamExploreCard,
  exploreDesktop: ASSETS.teamExploreCard,
  logo: ASSETS.teamsLogoBuffalo,
  logoDesktop: ASSETS.teamsLogoBuffalo,
}

/** The file name a team's folder uses for each slot, without its extension. */
const SLOT_BY_FILE_NAME: Readonly<Record<string, keyof TeamImages>> = {
  'all-32-teams': 'card',
  hero: 'hero',
  'hero-desktop': 'heroDesktop',
  prediction: 'prediction',
  'prediction-desktop': 'predictionDesktop',
  favorite: 'favorite',
  'favorite-desktop': 'favoriteDesktop',
  explore: 'explore',
  'explore-desktop': 'exploreDesktop',
  logo: 'logo',
  'logo-desktop': 'logoDesktop',
}

/**
 * What each team's folder holds, keyed by team number. A team with an empty
 * folder has no entry.
 *
 * This is derived, not authored: to change a team's picture, replace the file
 * in `src/assets/teams/team-<n>/` rather than editing anything here.
 *
 * `?url` for the same reason as the imports in assets.ts: the file is emitted
 * and hashed by the build rather than resolved at runtime.
 */
export const TEAM_IMAGES: Readonly<Record<number, Partial<TeamImages>>> = readImageFolders({
  files: import.meta.glob<string>('./teams/team-*/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  root: 'teams',
  prefix: 'team',
  count: TEAM_COUNT,
  slots: SLOT_BY_FILE_NAME,
})

/** Every picture team `number` uses, with the design's own filling any gaps. */
export function imagesForTeam(number: number): TeamImages {
  return { ...DESIGN_IMAGES, ...TEAM_IMAGES[number] }
}
