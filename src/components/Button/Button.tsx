import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

import arrowGrey from '../../assets/icon-arrow-grey.svg'
import arrowBlue from '../../assets/icon-arrow-blue.svg'
import arrowBlack from '../../assets/icon-arrow-black.svg'
import arrowWhite from '../../assets/icon-arrow-white.svg'
import fanduelMark from '../../assets/icon-fanduel-mark.png'
import clearRing from '../../assets/icon-clear-circle.svg'
import clearCross from '../../assets/icon-clear-cross.svg'

/** Figma variant property "Type" on component set 1:19. */
export type ButtonType = 'secondary' | 'button' | 'filter' | 'fanduel'
/** Figma variant property "State". */
export type ButtonState = 'default' | 'active'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  readonly variant: ButtonType
  readonly state?: ButtonState
  readonly label: string
  /** Figma boolean property "Functional Icon". */
  readonly showIcon?: boolean
}

const NODE_IDS: Record<ButtonType, Record<ButtonState, string>> = {
  secondary: { default: '1:20', active: '1:23' },
  button: { default: '1:26', active: '1:29' },
  filter: { default: '1:32', active: '1:34' },
  fanduel: { default: '1:37', active: '1:40' },
}

function Arrow({ src }: { readonly src: string }) {
  return (
    <span className={styles.arrow}>
      <img className={styles.arrowLeaf} src={src} alt="" aria-hidden="true" />
    </span>
  )
}

export function Button({
  variant,
  state = 'default',
  label,
  showIcon = true,
  className,
  ...rest
}: ButtonProps) {
  const active = state === 'active'

  const variantClass =
    variant === 'secondary'
      ? `${styles.secondary} ${active ? styles.secondaryActive : styles.secondaryDefault}`
      : variant === 'button'
        ? `${styles.button} ${active ? styles.buttonActive : styles.buttonDefault}`
        : variant === 'filter'
          ? `${styles.filter} ${active ? styles.filterActive : styles.filterDefault}`
          : `${styles.fanduel} ${active ? styles.fanduelActive : styles.fanduelDefault}`

  const classes = [styles.base, variantClass, className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      data-node-id={NODE_IDS[variant][state]}
      data-state={state}
      aria-pressed={variant === 'filter' ? active : undefined}
      {...rest}
    >
      {variant === 'secondary' && (
        <>
          {showIcon && <Arrow src={active ? arrowBlue : arrowGrey} />}
          <span className={styles.secondaryLabel}>{label}</span>
        </>
      )}

      {variant === 'button' && (
        <>
          <span className={styles.buttonLabel}>{label}</span>
          {showIcon && <Arrow src={active ? arrowWhite : arrowBlack} />}
        </>
      )}

      {variant === 'filter' && (
        <>
          <span className={styles.filterLabel}>{label}</span>
          {active && showIcon && (
            <span className={styles.clear}>
              <img className={styles.clearRing} src={clearRing} alt="" aria-hidden="true" />
              <img className={styles.clearCross} src={clearCross} alt="" aria-hidden="true" />
            </span>
          )}
        </>
      )}

      {variant === 'fanduel' && (
        <>
          {showIcon && (
            <span className={styles.fanduelMark}>
              <img
                className={styles.fanduelMarkLeaf}
                src={fanduelMark}
                alt=""
                aria-hidden="true"
              />
            </span>
          )}
          <span className={styles.fanduelLabel}>{label}</span>
        </>
      )}
    </button>
  )
}
