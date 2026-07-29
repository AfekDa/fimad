import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Nav } from './Nav'
import { NAV_ITEMS } from './navItems'

describe('Nav', () => {
  it('renders every item from the Figma design in order', () => {
    render(<Nav selectedId="home" onSelect={() => {}} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Home',
      'Teams',
      'Awards',
      'All Bets',
      'Fanduel',
    ])
    expect(NAV_ITEMS).toHaveLength(5)
  })

  it('marks only the selected item as current', () => {
    render(<Nav selectedId="awards" onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: 'Awards' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('reports the chosen item on click', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<Nav selectedId="home" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'All Bets' }))

    expect(onSelect).toHaveBeenCalledWith('all-bets')
  })

  it('is keyboard operable', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<Nav selectedId="home" onSelect={onSelect} />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Home' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Teams' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('teams')
  })

  it('exposes an accessible landmark name', () => {
    render(<Nav selectedId="home" onSelect={() => {}} />)

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})
