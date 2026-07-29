import type { CSSProperties } from 'react'
import styles from './Icon.module.css'

import iconHome from '../../assets/icon-home.png'
import iconAwards from '../../assets/icon-awards.png'
import iconBets from '../../assets/icon-bets.png'
import iconFanduel from '../../assets/icon-fanduel.png'
import iconTeams from '../../assets/icon-teams.png'

/** Icon variants defined in Figma frame "Icons" (1:43). */
export type IconName = 'home' | 'awards' | 'bets' | 'fanduel' | 'teams'

const SOURCES: Record<IconName, string> = {
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
const OUTER_SIZE: Record<IconName, { width: number; height: number }> = {
  home: { width: 32, height: 32 },
  awards: { width: 32, height: 32 },
  bets: { width: 32, height: 32 },
  fanduel: { width: 32, height: 32 },
  teams: { width: 40, height: 32 },
}

export interface IconProps {
  readonly name: IconName
  /** Overrides the design's default outer box. Both dimensions are explicit. */
  readonly width?: number | undefined
  readonly height?: number | undefined
  readonly className?: string | undefined
}

export function Icon({ name, width, height, className }: IconProps) {
  const fallback = OUTER_SIZE[name]
  const style: CSSProperties = {
    width: `${width ?? fallback.width}px`,
    height: `${height ?? fallback.height}px`,
  }

  return (
    <span className={className ? `${styles.icon} ${className}` : styles.icon} style={style}>
      <img className={`${styles.leaf} ${styles[name]}`} src={SOURCES[name]} alt="" aria-hidden="true" />
    </span>
  )
}
