import { within } from '@testing-library/dom'
import { describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import AppNav from './AppNav.astro'
import { APP_NAV_ITEMS } from './navItems'

async function renderAppNav(currentPath = '/') {
  return await renderToDom(AppNav, { currentPath })
}

describe('AppNav', () => {
  it('owns one canonical dock and bar', async () => {
    const body = await renderAppNav()
    const dock = body.querySelector<HTMLElement>('[data-app-nav-dock]')
    const nav = body.querySelector<HTMLElement>('[data-app-nav]')

    expect(dock).toHaveAttribute('data-node-id', '1:126')
    expect(nav).toHaveAttribute('data-node-id', '1:127')
    expect(dock).toContainElement(nav)
  })

  it('renders every item in canonical order', async () => {
    const body = await renderAppNav()
    const ids = Array.from(body.querySelectorAll('[data-nav-id]')).map((item) =>
      item.getAttribute('data-nav-id'),
    )

    expect(ids).toEqual(['home', 'teams', 'awards', 'all-bets', 'fanduel'])
    expect(APP_NAV_ITEMS).toHaveLength(5)
  })

  it('labels every item', async () => {
    const body = await renderAppNav()

    for (const label of ['Home', 'Teams', 'Awards', 'All Bets', 'Fanduel']) {
      expect(within(body).getByText(label)).toBeInTheDocument()
    }
  })

  it('marks exactly the matching route, including trailing slashes', async () => {
    const body = await renderAppNav('/teams//')

    expect(body.querySelector('[data-nav-id="teams"]')).toHaveAttribute('aria-current', 'page')
    expect(body.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('marks nothing for a route outside the navigation', async () => {
    const body = await renderAppNav('/buttons')

    expect(body.querySelectorAll('[aria-current="page"]')).toHaveLength(0)
  })

  it('renders implemented destinations as links', async () => {
    const body = await renderAppNav()

    expect(body.querySelector('[data-nav-id="home"]')).toHaveAttribute('href', '/')
    expect(body.querySelector('[data-nav-id="teams"]')).toHaveAttribute('href', '/teams')
    expect(body.querySelector('[data-nav-id="awards"]')).toHaveAttribute('href', '/awards')
    expect(body.querySelector('[data-nav-id="all-bets"]')).toHaveAttribute('href', '/all-bets')
  })

  it('prefetches implemented destinations when the navigation enters the viewport', async () => {
    const body = await renderAppNav('/')

    for (const link of body.querySelectorAll('nav a')) {
      expect(link).toHaveAttribute('data-astro-prefetch', 'viewport')
    }
  })

  it('renders unfinished destinations as inert items', async () => {
    const body = await renderAppNav()

    for (const id of ['fanduel']) {
      const item = body.querySelector(`[data-nav-id="${id}"]`)
      expect(item?.tagName).toBe('SPAN')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    }
    expect(body.querySelectorAll('a')).toHaveLength(4)
  })

  it('exposes the primary navigation landmark', async () => {
    const body = await renderAppNav()

    expect(within(body).getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})
