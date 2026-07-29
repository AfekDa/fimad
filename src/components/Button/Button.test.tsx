import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button, type ButtonState, type ButtonType } from './Button'

const TYPES: readonly ButtonType[] = ['secondary', 'button', 'filter', 'fanduel']
const STATES: readonly ButtonState[] = ['default', 'active']

describe('Button', () => {
  it('renders every Figma type/state combination with its source node id', () => {
    for (const variant of TYPES) {
      for (const state of STATES) {
        const { unmount } = render(<Button variant={variant} state={state} label="Button" />)
        const el = screen.getByRole('button')
        expect(el).toHaveAttribute('data-state', state)
        expect(el.getAttribute('data-node-id')).toMatch(/^1:\d+$/)
        unmount()
      }
    }
  })

  it('defaults to the Default state', () => {
    render(<Button variant="button" label="Button" />)
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'default')
  })

  it('exposes filter selection through aria-pressed', () => {
    const { rerender } = render(<Button variant="filter" state="default" label="Filter" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<Button variant="filter" state="active" label="Filter" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('omits aria-pressed for non-toggle types', () => {
    render(<Button variant="button" label="Button" />)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed')
  })

  it('hides the functional icon when the Figma boolean property is off', () => {
    const { container, rerender } = render(
      <Button variant="button" label="Button" showIcon={true} />,
    )
    expect(container.querySelectorAll('img')).toHaveLength(1)

    rerender(<Button variant="button" label="Button" showIcon={false} />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('shows the clear control only on Filter/Active', () => {
    const { container, rerender } = render(<Button variant="filter" state="default" label="F" />)
    expect(container.querySelectorAll('img')).toHaveLength(0)

    rerender(<Button variant="filter" state="active" label="F" />)
    // Ring + cross.
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })

  it('is clickable and keyboard operable', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button variant="fanduel" label="PLACE BET" onClick={onClick} />)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('decorative icons are hidden from assistive technology', () => {
    const { container } = render(<Button variant="fanduel" label="PLACE BET" />)
    for (const img of container.querySelectorAll('img')) {
      expect(img).toHaveAttribute('aria-hidden', 'true')
      expect(img).toHaveAttribute('alt', '')
    }
  })
})
