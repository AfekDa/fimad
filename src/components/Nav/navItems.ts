import type { IconName } from '../Icon/icons'

export interface NavItem {
  readonly id: string
  readonly label: string
  readonly icon: IconName
  /**
   * Route this tab navigates to.
   *
   * Omitted while the screen does not exist yet: a tab with no `href` renders
   * inert rather than linking to a 404. Adding a page is then two edits — create
   * `src/pages/<name>.astro`, and fill in the `href` here. The nav marks itself
   * current from the URL, so nothing else needs to change.
   */
  readonly href?: string
}

/** Items and order from the Nav instance on the Homepage (1:127). */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', href: '/' },
  { id: 'teams', label: 'Teams', icon: 'teams' },
  { id: 'awards', label: 'Awards', icon: 'awards' },
  { id: 'all-bets', label: 'All Bets', icon: 'bets' },
  { id: 'fanduel', label: 'Fanduel', icon: 'fanduel' },
]
