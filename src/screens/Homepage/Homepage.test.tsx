import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Homepage } from './Homepage'

describe('Homepage', () => {
  it('renders the headline from Figma node 1:97', () => {
    render(<Homepage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'WELCOME TO MY NFL BETTING GUIDE 2026',
    )
  })

  it('renders the four feature cards in design order', () => {
    render(<Homepage />)
    const items = within(screen.getByRole('list')).getAllByRole('listitem')

    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('Parlays, Flyers andBest Bets for every game week')
    expect(items[1]).toHaveTextContent('Data Sheets to help you pick your own winners')
    expect(items[2]).toHaveTextContent('Algorithms to identify the best matchups')
    expect(items[3]).toHaveTextContent('Giveaways and competitions')
  })

  it('selects Home by default and moves selection on click', async () => {
    const user = userEvent.setup()
    render(<Homepage />)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(within(nav).getByRole('button', { name: 'Fanduel' }))

    expect(within(nav).getByRole('button', { name: 'Fanduel' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('labels the social controls', () => {
    render(<Homepage />)
    for (const name of ['X', 'Facebook', 'Instagram']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('gives meaningful images alternative text and hides decorative ones', () => {
    const { container } = render(<Homepage />)
    const images = [...container.querySelectorAll('img')]
    expect(images.length).toBeGreaterThan(0)

    const meaningful = images.filter((img) => img.getAttribute('aria-hidden') !== 'true')
    for (const img of meaningful) {
      expect(img.getAttribute('alt')).toBeTruthy()
    }
    for (const img of images) {
      if (img.getAttribute('aria-hidden') === 'true') {
        expect(img).toHaveAttribute('alt', '')
      }
    }
  })

  it('docks the nav inside the scrim layer from Figma node 1:126', () => {
    const { container } = render(<Homepage />)
    const dock = container.querySelector('[data-node-id="1:126"]')

    expect(dock).toBeInTheDocument()
    expect(dock).toContainElement(screen.getByRole('navigation', { name: 'Primary' }))
  })

  it('traces the frame back to its Figma node', () => {
    const { container } = render(<Homepage />)
    expect(container.querySelector('[data-node-id="1:90"]')).toBeInTheDocument()
  })
})
