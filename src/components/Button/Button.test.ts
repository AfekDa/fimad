import { within } from '@testing-library/dom'
import { describe, expect, it } from 'vitest'
import Button from './Button.astro'
import { renderToDom } from '../../test/render'

/*
 * Interaction (click, Enter/Space) is no longer asserted here: an .astro
 * component renders to markup with no client runtime, so there is nothing to
 * drive in a unit test. Native <button> behaviour and focus order are covered
 * in the browser by tests/visual/responsive.spec.ts.
 */

const TYPES = ['secondary', 'button', 'filter', 'fanduel'] as const
const STATES = ['default', 'active'] as const

async function renderButton(props: Record<string, unknown>) {
  const body = await renderToDom(Button, props)
  return { body, screen: within(body) }
}

describe('Button', () => {
  it('renders every Figma type/state combination with its source node id', async () => {
    for (const variant of TYPES) {
      for (const state of STATES) {
        const { screen } = await renderButton({ variant, state, label: 'Button' })
        const el = screen.getByRole('button')

        expect(el).toHaveAttribute('data-state', state)
        expect(el.getAttribute('data-node-id')).toMatch(/^1:\d+$/)
      }
    }
  })

  it('defaults to the Default state', async () => {
    const { screen } = await renderButton({ variant: 'button', label: 'Button' })

    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'default')
  })

  it('exposes filter selection through aria-pressed', async () => {
    const off = await renderButton({ variant: 'filter', state: 'default', label: 'Filter' })
    expect(off.screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    const on = await renderButton({ variant: 'filter', state: 'active', label: 'Filter' })
    expect(on.screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('omits aria-pressed for non-toggle types', async () => {
    const { screen } = await renderButton({ variant: 'button', label: 'Button' })

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed')
  })

  it('hides the functional icon when the Figma boolean property is off', async () => {
    const shown = await renderButton({ variant: 'button', label: 'Button', showIcon: true })
    expect(shown.body.querySelectorAll('img')).toHaveLength(1)

    const hidden = await renderButton({ variant: 'button', label: 'Button', showIcon: false })
    expect(hidden.body.querySelectorAll('img')).toHaveLength(0)
  })

  it('shows the clear control only on Filter/Active', async () => {
    const off = await renderButton({ variant: 'filter', state: 'default', label: 'F' })
    expect(off.body.querySelectorAll('img')).toHaveLength(0)

    const on = await renderButton({ variant: 'filter', state: 'active', label: 'F' })
    // Ring + cross.
    expect(on.body.querySelectorAll('img')).toHaveLength(2)
  })

  it('renders the label text', async () => {
    const { screen } = await renderButton({ variant: 'fanduel', label: 'PLACE BET' })

    expect(screen.getByRole('button')).toHaveTextContent('PLACE BET')
  })

  it('hides decorative icons from assistive technology', async () => {
    const { body } = await renderButton({ variant: 'fanduel', label: 'PLACE BET' })

    for (const img of body.querySelectorAll('img')) {
      expect(img).toHaveAttribute('aria-hidden', 'true')
      expect(img).toHaveAttribute('alt', '')
    }
  })
})
