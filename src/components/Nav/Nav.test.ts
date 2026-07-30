import { within } from '@testing-library/dom'
import { describe, expect, it } from 'vitest'
import Nav from './Nav.astro'
import { NAV_ITEMS } from './navItems'
import { renderToDom } from '../../test/render'

async function renderNav(selectedId = 'home') {
  return within(await renderToDom(Nav, { selectedId }))
}

describe('Nav', () => {
  it('renders every item from the Figma design in order', async () => {
    const screen = await renderNav()

    const items = screen.getAllByRole('radio')
    expect(items.map((item) => item.getAttribute('id'))).toEqual([
      'nav-tab-home',
      'nav-tab-teams',
      'nav-tab-awards',
      'nav-tab-all-bets',
      'nav-tab-fanduel',
    ])
    expect(NAV_ITEMS).toHaveLength(5)
  })

  it('labels each item with its design text', async () => {
    const screen = await renderNav()

    for (const label of ['Home', 'Teams', 'Awards', 'All Bets', 'Fanduel']) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })

  it('checks only the selected item', async () => {
    const screen = await renderNav('awards')

    expect(screen.getByRole('radio', { name: 'Awards' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Home' })).not.toBeChecked()
    expect(screen.getAllByRole('radio').filter((item) => item.hasAttribute('checked'))).toHaveLength(
      1,
    )
  })

  it('groups the items so only one can be selected at a time', async () => {
    const screen = await renderNav()

    const names = new Set(screen.getAllByRole('radio').map((item) => item.getAttribute('name')))
    expect(names.size).toBe(1)
  })

  it('exposes an accessible landmark name', async () => {
    const screen = await renderNav()

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('rejects a selected id that is not in the design', async () => {
    await expect(renderNav('does-not-exist')).rejects.toThrow(/not one of the design's items/)
  })
})
