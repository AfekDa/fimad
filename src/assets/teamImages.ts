/**
 * Which pictures each team uses.
 *
 * ─── To swap a team's image ────────────────────────────────────────────────
 *   1. Put the file in `src/assets/`, at the same pixel size as the one it
 *      replaces (see the sizes below). The boxes these images sit in are
 *      measured from the design rather than fitted, so a different size
 *      reframes the shot instead of scaling it.
 *   2. Add an import for it beside the others at the top of this file.
 *   3. Name it on that team's row in `TEAM_IMAGES`.
 *
 * Nothing else in the app changes: every screen reads a team's pictures
 * through `imagesForTeam`.
 *
 * A team with no row uses the design's own pictures, and a row may name just
 * one picture and leave the rest — so this can be filled in a team at a time.
 *
 * ─── Sizes to match ────────────────────────────────────────────────────────
 *   card              1024 x 683     All Teams grid card
 *   hero              1024 x 701     full-bleed photo behind the team name
 *   heroDesktop       1155 x  885    the same, above 768px
 *   prediction         992 x 682     photo under the PREDICTIONS block
 *   favorite          1108 x 1763    photo behind FAVORITE FUTURE
 *   favoriteDesktop    814 x 1024    the same, above 768px
 *   explore           1024 x 701     card in the Explore All Teams carousel
 *   logo              1920 x 1920    team lockup above the team name
 */
import { ASSETS } from './assets'

/* Add per-team image imports here, e.g.:
 * import team2Card from './team-2-card.png?url'
 * import team2Hero from './team-2-hero.png?url'
 */

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

/**
 * Per-team overrides, keyed by team number. This table is the one to edit.
 *
 * Example:
 *   2: {
 *     card: team2Card,
 *     hero: team2Hero,
 *   },
 */
export const TEAM_IMAGES: Readonly<Record<number, Partial<TeamImages>>> = {}

/** Every picture team `number` uses, with the design's own filling any gaps. */
export function imagesForTeam(number: number): TeamImages {
  return { ...DESIGN_IMAGES, ...TEAM_IMAGES[number] }
}
