import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import AllBets from './AllBets.astro'

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(AllBets)
  screen = within(body)
})

describe('All Bets', () => {
  it('renders the Figma frame without device status chrome', () => {
    expect(body.querySelector('[data-node-id="251:2889"]')).toBeInTheDocument()
    expect(body.querySelector('[data-node-id="251:2935"]')).not.toBeInTheDocument()
  })

  it('renders every designed category and pick card', () => {
    expect(body.querySelectorAll('[data-bet-section]')).toHaveLength(6)
    expect(body.querySelectorAll('[data-bet-card]')).toHaveLength(37)
    expect(screen.getByText('MOST VALUABLE PLAYER PICKS')).toBeInTheDocument()
    expect(screen.getByText('FAVOURITE FUTURES')).toBeInTheDocument()
    expect(screen.getByText('EXCLUSIVE')).toBeInTheDocument()
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
    expect(screen.getAllByRole('button', { name: /place bet on/i })).toHaveLength(37)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('ships the fail-fast client controller', () => {
    expect(body.querySelectorAll('script')).toHaveLength(1)
  })
})
