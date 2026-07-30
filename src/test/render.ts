import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
import { JSDOM } from 'jsdom'

/**
 * Renders an .astro component the way the build does — through Astro's
 * container API — and parses the result into a DOM node that Testing Library
 * can query.
 *
 * Astro components have no client runtime, so there is no mounting, no state
 * and nothing to clean up: what a test asserts against is exactly the markup
 * that ships.
 *
 * The suite runs in Vitest's `node` environment, not `jsdom`, and builds a DOM
 * per render instead. A global jsdom environment replaces `TextEncoder` with
 * one whose `Uint8Array` comes from a different realm, which trips the
 * invariant check in esbuild — a module Astro loads to render components — and
 * makes every container test fail on import.
 */
export async function renderToDom(
  Component: AstroComponentFactory,
  props: Record<string, unknown> = {},
): Promise<HTMLElement> {
  const container = await AstroContainer.create()
  const html = await container.renderToString(Component, { props })

  return new JSDOM(html).window.document.body
}
