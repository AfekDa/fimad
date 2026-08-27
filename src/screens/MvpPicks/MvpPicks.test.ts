import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import MvpPicks from './MvpPicks.astro'
import { MVP_PICKS, createAwardPicks } from './content'
import { imageForAwardCard } from '../../assets/awardImages'
import { AWARDS, AWARD_CARD_COUNT } from '../../data/awards'

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(MvpPicks)
  screen = within(body)
})

describe('Most Valuable Player Picks', () => {
  it('renders the source frame and heading', () => {
    expect(body.querySelector('[data-node-id="188:2186"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'MOST VALUABLE PLAYER PICKS',
    )
  })

  it('renders all three designed picks in source order', () => {
    const cards = body.querySelectorAll('[data-mvp-card]')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-node-id', '188:2196')
    expect(cards[2]).toHaveAttribute('data-node-id', '188:2497')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
  })

  it('provides the back link, bet actions, search, and canonical navigation', () => {
    expect(screen.getByRole('link', { name: 'Back to all awards' })).toHaveAttribute(
      'href',
      '/awards',
    )
    expect(screen.getAllByRole('button', { name: 'PLACE BET' })).toHaveLength(3)
    expect(screen.getByRole('searchbox', { name: 'Search awards' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('uses meaningful imagery for each card', () => {
    for (const image of body.querySelectorAll<HTMLImageElement>('[data-mvp-card] > img')) {
      expect(image.alt).toBe('Lamar Jackson in a Baltimore Ravens uniform')
    }
  })

  /*
   * An award’s own page draws the same three cards from that award’s folder,
   * so replacing one file changes one card. Asserted through the content
   * rather than the rendered urls: the folders ship with identical placeholder
   * copies, which Vite collapses to a single hashed file.
   */
  describe('an award’s own page', () => {
    it('names each card after its award and draws it from that award’s folder', () => {
      for (const award of AWARDS) {
        const picks = createAwardPicks(award)
        expect(picks).toHaveLength(AWARD_CARD_COUNT)
        expect(picks.map((pick) => pick.name)).toEqual([
          `AWARD ${award.number} PICK 1`,
          `AWARD ${award.number} PICK 2`,
          `AWARD ${award.number} PICK 3`,
        ])

        for (const [index, pick] of picks.entries()) {
          expect(pick.image).toBe(imageForAwardCard(award.number, index + 1))
          expect(pick.imageAlt).toBe(`Award ${award.number} pick ${index + 1} photograph`)
        }
      }
    })

    it('keeps the Figma nodes the design draws', () => {
      const picks = createAwardPicks(AWARDS[1]!)
      expect(picks.map((pick) => pick.nodeId)).toEqual(
        MVP_PICKS.map((pick) => pick.nodeId),
      )
    })
  })
})
