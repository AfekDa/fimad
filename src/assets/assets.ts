/**
 * Every image asset in the project, keyed by the role it plays rather than by
 * the file it happens to live in.
 *
 * This is the one place an asset is named. To swap an image — a new hero, a
 * different avatar, a re-exported icon — change the path on its import line
 * here and every component that uses it follows. Nothing else imports from
 * `src/assets/*` directly.
 *
 * Imports use `?url` so a missing or renamed file fails the build instead of
 * 404ing at runtime; `build.assetsInlineLimit` is 0 in astro.config.mjs to keep
 * that guarantee for small files too.
 *
 * Fonts are not here: they are referenced from `src/styles/fonts.css` by
 * `@font-face`, which never reaches the module graph.
 */

/* Homepage — Figma frame 1:90 */
import heroPoster from './hero-poster.png?url'
import yearMark from './year-2026.png?url'
import featureBadge from './feature-badge.png?url'
import divider from './divider.svg?url'
import authorAvatar from './avatar-cody.png?url'
import authorSignature from './signature.png?url'
import socialX from './social-x.svg?url'
import socialFacebook from './social-facebook.png?url'
import socialInstagram from './social-instagram.svg?url'

/* Nav icons — Figma frame "Icons" (1:43) */
import iconHome from './icon-home.png?url'
import iconTeams from './icon-teams.png?url'
import iconAwards from './icon-awards.png?url'
import iconBets from './icon-bets.png?url'
import iconFanduel from './icon-fanduel.png?url'

/* Button / Filter — Figma frame 1:19 */
import arrowBlack from './icon-arrow-black.svg?url'
import arrowBlue from './icon-arrow-blue.svg?url'
import arrowGrey from './icon-arrow-grey.svg?url'
import arrowWhite from './icon-arrow-white.svg?url'
import fanduelMark from './icon-fanduel-mark.png?url'
import clearRing from './icon-clear-circle.svg?url'
import clearCross from './icon-clear-cross.svg?url'

export const ASSETS = {
  heroPoster,
  yearMark,
  featureBadge,
  divider,
  authorAvatar,
  authorSignature,
  socialX,
  socialFacebook,
  socialInstagram,
  iconHome,
  iconTeams,
  iconAwards,
  iconBets,
  iconFanduel,
  arrowBlack,
  arrowBlue,
  arrowGrey,
  arrowWhite,
  fanduelMark,
  clearRing,
  clearCross,
} as const

export type AssetName = keyof typeof ASSETS
