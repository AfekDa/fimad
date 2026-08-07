import { within } from '@testing-library/dom'
import { describe, expect, it } from 'vitest'
import Nav from './Nav.astro'
import { NAV_ITEMS } from './navItems'
import { renderToDom } from '../../test/render'

/**
 * `currentPath` is passed explicitly: a container render has no real request
 * behind it, so Astro.url would report the container's placeholder rather than
 * the route under test.
 */
async function renderNav(currentPath = '/') {
  return await renderToDom(Nav, { currentPath })
}

describe('Nav', () => {
  it('renders every item from the Figma design in order', async () => {
    const body = await renderNav()

    const ids = Array.from(body.querySelectorAll('[data-nav-id]')).map((item) =>
      item.getAttribute('data-nav-id'),
    )
    expect(ids).toEqual(['home', 'teams', 'awards', 'all-bets', 'fanduel'])
    expect(NAV_ITEMS).toHaveLength(5)
  })

  it('labels each item with its design text', async () => {
    const body = await renderNav()

    for (const label of ['Home', 'Teams', 'Awards', 'All Bets', 'Fanduel']) {
      expect(within(body).getByText(label)).toBeInTheDocument()
    }
  })

  it('renders items with a destination as links', async () => {
    const body = await renderNav()
    const home = body.querySelector('[data-nav-id="home"]')

    expect(home?.tagName).toBe('A')
    expect(home).toHaveAttribute('href', '/')
  })

  it('marks the item matching the current route, and only that one', async () => {
    const body = await renderNav('/')

    expect(body.querySelector('[data-nav-id="home"]')).toHaveAttribute('aria-current', 'page')
    expect(body.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('marks nothing when the current route is not in the nav', async () => {
    const body = await renderNav('/buttons')

    expect(body.querySelectorAll('[aria-current="page"]')).toHaveLength(0)
  })

  it('treats a trailing slash as the same route', async () => {
    const body = await renderNav('/')
    const rooted = await renderNav('//')

    expect(body.querySelector('[data-nav-id="home"]')).toHaveAttribute('aria-current', 'page')
    expect(rooted.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  /**
   * Four of the five tabs have no screen yet. They must render — the design
   * draws all five — without claiming to be a destination.
   */
  it('renders items without a destination as inert, not as links', async () => {
    const body = await renderNav()

    for (const id of ['teams', 'awards', 'all-bets', 'fanduel']) {
      const item = body.querySelector(`[data-nav-id="${id}"]`)
      expect(item?.tagName, `"${id}" should not be a link until it has a page`).toBe('SPAN')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    }
    expect(body.querySelectorAll('a')).toHaveLength(1)
  })

  it('exposes an accessible landmark name', async () => {
    const body = await renderNav()

    expect(within(body).getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})
