import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import Awards from './Awards.astro'
import { AWARD_CARDS } from './content'

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(Awards)
  screen = within(body)
})

describe('Awards', () => {
  it('renders the source frame without device status chrome', () => {
    expect(body.querySelector('[data-node-id="188:2037"]')).toBeInTheDocument()
    expect(body.querySelector('[data-node-id="188:2139"]')).not.toBeInTheDocument()
  })

  it('renders the four designed cards with meaningful imagery', () => {
    const cards = body.querySelectorAll('[data-award-card]')
    expect(cards).toHaveLength(4)
    expect(cards[0]).toHaveAttribute('data-node-id', '188:2047')
    expect(cards[3]).toHaveAttribute('data-node-id', '188:2056')

    for (const image of body.querySelectorAll<HTMLImageElement>('[data-award-card] > img')) {
      expect(image.alt).toBeTruthy()
    }
  })

  /*
   * Each card draws from src/assets/awards/award-<n>/, so replacing one file
   * changes one card. The four alt sentences say which is which; the emitted
   * urls cannot, because the folders ship with identical placeholder copies
   * and Vite collapses identical bytes to a single hashed file.
   */
  it('draws each card from its own award folder', () => {
    const images = [...body.querySelectorAll<HTMLImageElement>('[data-award-card] > img')]
    expect(images).toHaveLength(4)

    for (const [index, image] of images.entries()) {
      expect(image.getAttribute('src')).toBe(AWARD_CARDS[index]?.image)
    }
    expect(images.map((image) => image.alt)).toEqual([
      'Award 1 cover photograph',
      'Award 2 cover photograph',
      'Award 3 cover photograph',
      'Award 4 cover photograph',
    ])
  })

  it('exposes search, card actions, and canonical navigation', () => {
    expect(screen.getByRole('searchbox', { name: 'Search awards' })).toBeInTheDocument()
    const actions = screen.getAllByRole('link', { name: 'Learn More' })
    expect(actions).toHaveLength(4)
    expect(actions.map((action: HTMLElement) => action.getAttribute('href'))).toEqual([
      '/awards/award-1',
      '/awards/award-2',
      '/awards/award-3',
      '/awards/award-4',
    ])
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('ships the fail-fast search controller', () => {
    expect(body.querySelectorAll('script')).toHaveLength(1)
  })
})
