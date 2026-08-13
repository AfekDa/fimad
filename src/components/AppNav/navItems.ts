import type { IconName } from '../Icon/icons'

export interface AppNavItem {
  readonly id: string
  readonly label: string
  readonly icon: IconName
  /** Omitted until the destination exists, so unfinished tabs fail inert. */
  readonly href?: string
}

/** Items and order from the canonical Homepage Nav instance 1:127. */
export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', href: '/' },
  { id: 'teams', label: 'Teams', icon: 'teams', href: '/teams' },
  { id: 'awards', label: 'Awards', icon: 'awards', href: '/awards' },
  { id: 'all-bets', label: 'All Bets', icon: 'bets', href: '/all-bets' },
  { id: 'fanduel', label: 'Fanduel', icon: 'fanduel' },
]
