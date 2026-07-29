import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { routes } from './routes/registry'

function renderAt(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders a skip link and a main landmark', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })

  it('renders the start route at /', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /welcome to my nfl betting guide 2026/i,
    )
  })

  it('redirects an unknown path back to the start route', () => {
    renderAt('/does-not-exist')

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('registers every route from the registry', () => {
    for (const route of routes) {
      const { unmount } = renderAt(route.path)
      expect(screen.getByRole('main')).not.toBeEmptyDOMElement()
      unmount()
    }
  })
})
