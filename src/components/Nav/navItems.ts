import type { IconName } from '../Icon/Icon'

export interface NavItem {
  readonly id: string
  readonly label: string
  readonly icon: IconName
}

/** Items and order from the Nav instance on the Homepage (1:127). */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'teams', label: 'Teams', icon: 'teams' },
  { id: 'awards', label: 'Awards', icon: 'awards' },
  { id: 'all-bets', label: 'All Bets', icon: 'bets' },
  { id: 'fanduel', label: 'Fanduel', icon: 'fanduel' },
]
