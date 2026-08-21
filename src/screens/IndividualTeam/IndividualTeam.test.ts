import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToDom } from '../../test/render'
import IndividualTeam from './IndividualTeam.astro'

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(IndividualTeam)
  screen = within(body)
})

describe('Individual Team', () => {
  it('renders the selected Figma frame without device status chrome', () => {
    expect(body.querySelector('[data-node-id="162:1586"]')).toBeInTheDocument()
    expect(body.querySelector('[data-node-id="188:2126"]')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BUFFALO BILLS')
  })

  it('renders all designed analysis and betting regions', () => {
    expect(body.querySelectorAll('details')).toHaveLength(5)
    expect(body.querySelector('details')).toHaveAttribute('open')
    expect(body.querySelectorAll('[data-node-id^="162:16"]')).not.toHaveLength(0)
    expect(body.querySelectorAll('[data-node-id="162:1606"], [data-node-id="162:1613"], [data-node-id="162:1620"], [data-node-id="162:1627"], [data-node-id="162:1634"], [data-node-id="162:1641"]')).toHaveLength(6)
    expect(screen.getByText('14-3')).toBeInTheDocument()
    expect(screen.getByText('FAVORITE FUTURE')).toBeInTheDocument()
  })

  it('renders the Figma schedule and its difficulty treatment', () => {
    const schedule = body.querySelector('[data-node-id="738:4484"]')
    const mobileSchedule = body.querySelector('[data-node-id="730:3141"]')

    expect(schedule).toBeInTheDocument()
    expect(within(schedule as HTMLElement).getByRole('heading', { name: 'SCHEDULE' })).toBeInTheDocument()
    expect(within(mobileSchedule as HTMLElement).getAllByRole('article')).toHaveLength(18)
    expect(within(mobileSchedule as HTMLElement).getByText('NO GAME')).toBeInTheDocument()
    expect(within(mobileSchedule as HTMLElement).getAllByText('Easy')).toHaveLength(9)
    expect(within(mobileSchedule as HTMLElement).getAllByText('Moderate')).toHaveLength(6)
    expect(within(mobileSchedule as HTMLElement).getAllByText('Difficult')).toHaveLength(2)
  })

  it('provides team navigation and actions', () => {
    expect(screen.getByRole('searchbox', { name: 'Search teams' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to all teams' })).toHaveAttribute('href', '/teams')
    expect(screen.getByRole('link', { name: 'Explore all teams' })).toHaveAttribute('href', '/teams')
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('uses meaningful text for editorial imagery', () => {
    expect(screen.getByAltText('Buffalo Bills player in helmet')).toBeInTheDocument()
    expect(screen.getByAltText('Josh Allen in a Buffalo Bills uniform')).toBeInTheDocument()
  })

  it('ships the fail-fast search controller', () => {
    expect(body.querySelectorAll('script')).toHaveLength(1)
  })
})
