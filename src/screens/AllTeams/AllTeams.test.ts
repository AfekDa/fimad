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

  it('renders the eight visible Figma cards in order', () => {
    const cards = body.querySelectorAll('article')

    expect(cards).toHaveLength(8)
    expect(cards[0]).toHaveAttribute('data-node-id', '181:1360')
    expect(cards[7]).toHaveAttribute('data-node-id', '474:1448')
  })

  it('uses the canonical application navigation', () => {
    expect(body.querySelectorAll('[data-app-nav]')).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('does not render an example status-bar time', () => {
    expect(body).not.toHaveTextContent('9:41')
  })

  it('exposes search and filter controls', () => {
    expect(screen.getByRole('searchbox', { name: 'Search teams' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AFC' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'NFC' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('uses meaningful text for player imagery', () => {
    const images = [...body.querySelectorAll('article > div:first-child img')]

    expect(images).toHaveLength(8)
    for (const image of images) expect(image.getAttribute('alt')).toBeTruthy()
  })

  it('ships the client-side filter controller', () => {
    expect(body.querySelectorAll('script')).toHaveLength(1)
  })
})
