import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import AllBets from './AllBets.astro'
import { BET_SECTIONS } from './content'

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(AllBets)
  screen = within(body)
})

/* One card per published CMS bet, so the count follows the payload. */
const BET_CARD_COUNT = BET_SECTIONS.reduce((count, section) => count + section.bets.length, 0)

describe('All Bets', () => {
  it('renders the Figma frame without device status chrome', () => {
    expect(body.querySelector('[data-node-id="251:2889"]')).toBeInTheDocument()
    expect(body.querySelector('[data-node-id="251:2935"]')).not.toBeInTheDocument()
  })

  it('renders every category with one card per published bet', () => {
    expect(body.querySelectorAll('[data-bet-section]')).toHaveLength(5)
    expect(body.querySelectorAll('[data-bet-card]')).toHaveLength(BET_CARD_COUNT)
    expect(screen.getByText('MOST VALUABLE PLAYER PICKS')).toBeInTheDocument()
    expect(screen.getByText('FAVOURITE FUTURES')).toBeInTheDocument()
  })

  it('no longer draws the Exclusive category or its filter', () => {
    expect(body.querySelector('[data-bet-section="exclusive"]')).not.toBeInTheDocument()
    expect(body.querySelector('[data-filter-value="exclusive"]')).not.toBeInTheDocument()
    expect(screen.queryByText('EXCLUSIVE')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Exclusive' })).not.toBeInTheDocument()
  })

  it('starts with the All filter selected', () => {
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'MVP Picks' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('exposes search, bet actions, and canonical navigation', () => {
    expect(screen.getByRole('searchbox', { name: 'Search bets' })).toBeInTheDocument()
    // A bet with a published URL renders its CTA as a link, the rest as
    // buttons; together they cover every card.
    const actions = [
      ...screen.queryAllByRole('button', { name: /place bet on/i }),
      ...screen.queryAllByRole('link', { name: /place bet on/i }),
    ]
    expect(actions).toHaveLength(BET_CARD_COUNT)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('ships the fail-fast client controller', () => {
    // Two bundled scripts: this screen's filter controller and AppNav's.
    expect(body.querySelectorAll('script')).toHaveLength(2)
  })
})
