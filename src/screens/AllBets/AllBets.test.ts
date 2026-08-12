import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import AllBets from './AllBets.astro'
import { renderToDom } from '../../test/render'

let screen: ReturnType<typeof within>

beforeAll(async () => {
  screen = within(await renderToDom(AllBets))
})

describe('All Bets screen', () => {
  it('renders the page heading and four editorial picks', () => {
    expect(screen.getByRole('heading', { name: 'ALL BETS' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('starts with the all-bets filter selected', () => {
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Best Bets' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('renders shared primary navigation with All Bets as the current destination', () => {
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All Bets' })).toHaveAttribute('href', '/bets')
  })
})
