import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import Awards from './Awards.astro'

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

  it('exposes search, card actions, and canonical navigation', () => {
    expect(screen.getByRole('searchbox', { name: 'Search awards' })).toBeInTheDocument()
    const actions = screen.getAllByRole('link', { name: 'Learn More' })
    expect(actions).toHaveLength(4)
    expect(actions[0]).toHaveAttribute('href', '/awards/mvp')
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('ships the fail-fast search controller', () => {
    expect(body.querySelectorAll('script')).toHaveLength(1)
  })
})
