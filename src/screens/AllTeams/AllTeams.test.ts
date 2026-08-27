import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import AllTeams from './AllTeams.astro'
import { renderToDom } from '../../test/render'

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(AllTeams)
  screen = within(body)
})

describe('All Teams', () => {
  it('renders the source frame and heading', () => {
    expect(body.querySelector('[data-node-id="162:1760"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ALL 32 TEAMS')
  })

  it('renders the 32 generic team cards in order', () => {
    const cards = body.querySelectorAll('article')

    expect(cards).toHaveLength(32)
    expect(cards[0]).toHaveAttribute('data-node-id', '181:1360')
    expect(cards[7]).toHaveAttribute('data-node-id', '474:1448')
    expect(cards[0]).toHaveAttribute('data-team', 'TEAM 1')
    expect(cards[31]).toHaveAttribute('data-team', 'TEAM 32')
  })

  it('uses the canonical application navigation', () => {
    expect(body.querySelectorAll('[data-app-nav]')).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('starts with page content instead of a device status bar', () => {
    expect(body.querySelector('[data-node-id="162:1824"]')).not.toBeInTheDocument()
  })

  it('exposes search and filter controls', () => {
    expect(screen.getByRole('searchbox', { name: 'Search teams' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AFC' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'NFC' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: 'All', exact: true })).not.toBeInTheDocument()
  })

  it('renders without a Clear All button until something is filtered', () => {
    const clearAll = body.querySelector('[data-clear-filters]')

    expect(clearAll).toBeInTheDocument()
    expect(clearAll).toHaveAttribute('hidden')
    expect(screen.queryByRole('button', { name: 'Clear All' })).not.toBeInTheDocument()
  })

  it('uses meaningful text for player imagery', () => {
    const images = [...body.querySelectorAll('article > div:first-child img')]

    expect(images).toHaveLength(32)
    for (const image of images) expect(image.getAttribute('alt')).toBeTruthy()
  })

  it('gives every card its own team page', () => {
    const links = [...body.querySelectorAll('article a')]

    expect(links).toHaveLength(32)
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      Array.from({ length: 32 }, (_, index) => `/teams/team-${index + 1}`),
    )
    expect(screen.getByRole('link', { name: 'Preview TEAM 1' })).toHaveAttribute(
      'href',
      '/teams/team-1',
    )
    expect(screen.getByRole('link', { name: 'Preview TEAM 32' })).toHaveAttribute(
      'href',
      '/teams/team-32',
    )
  })

  it('splits the roster across both conferences', () => {
    expect(body.querySelectorAll('[data-conference="AFC"]')).toHaveLength(16)
    expect(body.querySelectorAll('[data-conference="NFC"]')).toHaveLength(16)
  })

  it('ships the client-side filter controller', () => {
    expect(body.querySelectorAll('script')).toHaveLength(1)
  })
})
