import { Icon } from '../Icon/Icon'
import { NAV_ITEMS } from './navItems'
import styles from './Nav.module.css'

export interface NavProps {
  readonly selectedId: string
  readonly onSelect: (id: string) => void
  readonly className?: string | undefined
}

/**
 * Bottom navigation — Figma component "Nav", variant Type=Mobile (1:129), as
 * instanced on the Homepage (1:127).
 *
 * The selected tab is local state, not a route: the Figma page contains only
 * one full-screen frame, so no prototype destination exists for the other tabs.
 */
export function Nav({ selectedId, onSelect, className }: NavProps) {
  return (
    <nav
      className={className ? `${styles.nav} ${className}` : styles.nav}
      aria-label="Primary"
      data-node-id="1:127"
    >
      {NAV_ITEMS.map((item) => {
        const selected = item.id === selectedId
        return (
          <button
            key={item.id}
            type="button"
            className={selected ? `${styles.item} ${styles.itemSelected}` : styles.item}
            aria-current={selected ? 'page' : undefined}
            onClick={() => {
              onSelect(item.id)
            }}
          >
            <Icon name={item.icon} />
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
