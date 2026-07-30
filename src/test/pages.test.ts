import { within } from '@testing-library/dom'
import { beforeAll, describe, expect, it } from 'vitest'
import Index from '../pages/index.astro'
import { renderToDom } from './render'

/*
 * Page tests live here rather than beside the pages: every file under
 * src/pages/ is a route, so a *.test.ts there would be built as an endpoint.
 */

let body: HTMLElement
let screen: ReturnType<typeof within>

beforeAll(async () => {
  body = await renderToDom(Index)
  screen = within(body)
})

describe('index page', () => {
  it('renders a skip link and a main landmark', () => {
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })

  it('points the skip link at the main landmark', () => {
    const target = screen.getByRole('link', { name: /skip to content/i }).getAttribute('href')

    expect(target).toBe('#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('renders the start screen', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /welcome to my nfl betting guide 2026/i,
    )
    expect(screen.getByRole('main')).not.toBeEmptyDOMElement()
  })

  it('ships no client-side script', () => {
    expect(body.querySelectorAll('script')).toHaveLength(0)
  })
})
