/**
 * Icon data — Figma frame "Icons" (1:43).
 *
 * Kept in a .ts module rather than in Icon.astro's frontmatter because types
 * declared inside an .astro component cannot be imported from other files, and
 * navItems.ts needs `IconName`.
 *
 * Assets are imported with `?url` so a missing or renamed file fails the build
 * instead of 404ing at runtime.
 */
import iconHome from '../../assets/icon-home.png?url'
import iconAwards from '../../assets/icon-awards.png?url'
import iconBets from '../../assets/icon-bets.png?url'
import iconFanduel from '../../assets/icon-fanduel.png?url'
import iconTeams from '../../assets/icon-teams.png?url'

/** Icon variants defined in Figma frame "Icons" (1:43). */
export type IconName = 'home' | 'awards' | 'bets' | 'fanduel' | 'teams'

export const ICON_SOURCES: Readonly<Record<IconName, string>> = {
  home: iconHome,
  awards: iconAwards,
  bets: iconBets,
  fanduel: iconFanduel,
  teams: iconTeams,
}

/**
 * Outer box per icon, in CSS pixels, as used by the Nav component (1:127).
 * "teams" is wider than tall in the design; the others are square.
 */
export const ICON_OUTER_SIZE: Readonly<
  Record<IconName, { readonly width: number; readonly height: number }>
> = {
  home: { width: 32, height: 32 },
  awards: { width: 32, height: 32 },
  bets: { width: 32, height: 32 },
  fanduel: { width: 32, height: 32 },
  teams: { width: 40, height: 32 },
}
