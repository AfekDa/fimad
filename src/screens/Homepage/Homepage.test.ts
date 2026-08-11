import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import Homepage from './Homepage.astro'
import { renderToDom } from '../../test/render'

/*
 * The screen is static markup, so it is rendered once for the whole suite.
 * Tab switching is no longer component state — it is a native radio group, and
 * its behaviour is asserted in a real browser by tests/visual/responsive.spec.ts.
 */
let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(Homepage)
  screen = within(body)
})

describe('Homepage', () => {
  it('renders the headline from Figma node 1:97', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'WELCOME TO MY NFL BETTING GUIDE 2026',
    )
  })

  it('renders the four feature cards in design order', () => {
    const items = within(screen.getByRole('list')).getAllByRole('listitem')

    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('Parlays, Flyers andBest Bets for every game week')
    expect(items[1]).toHaveTextContent('Data Sheets to help you pick your own winners')
    expect(items[2]).toHaveTextContent('Algorithms to identify the best matchups')
    expect(items[3]).toHaveTextContent('Giveaways and competitions')
  })

  it('marks Home as the current tab, from the route rather than a prop', () => {
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    expect(nav.querySelector('[data-nav-id="home"]')).toHaveAttribute('aria-current', 'page')
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('labels the social controls', () => {
    for (const name of ['X', 'Facebook', 'Instagram']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('gives meaningful images alternative text and hides decorative ones', () => {
    const images = [...body.querySelectorAll('img')]
    expect(images.length).toBeGreaterThan(0)

    const meaningful = images.filter((img) => img.getAttribute('aria-hidden') !== 'true')
    for (const img of meaningful) {
      expect(img.getAttribute('alt')).toBeTruthy()
    }
    for (const img of images) {
      if (img.getAttribute('aria-hidden') === 'true') {
        expect(img).toHaveAttribute('alt', '')
      }
    }
  })

  it('uses the canonical application navigation', () => {
    const dock = body.querySelector('[data-app-nav-dock]')

    expect(dock).toBeInTheDocument()
    expect(dock).toHaveAttribute('data-node-id', '1:126')
    expect(dock).toContainElement(screen.getByRole('navigation', { name: 'Primary' }))
  })

  it('traces the frame back to its Figma node', () => {
    expect(body.querySelector('[data-node-id="1:90"]')).toBeInTheDocument()
  })

  it('ships no client-side script', () => {
    expect(body.querySelectorAll('script')).toHaveLength(0)
  })
})
