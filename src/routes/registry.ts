import type { ComponentType } from 'react'
import { Homepage } from '../screens/Homepage/Homepage'
import { SCREENS, type ScreenMeta } from './screens'

/**
 * Typed route registry.
 *
 * Every screen in the app is one top-level Figma frame. Each entry records the
 * route path, the component that renders it, and the Figma node ID it was
 * derived from, so any rendered pixel is traceable back to the design.
 */
export interface ScreenRoute extends ScreenMeta {
  readonly component: ComponentType
}

/** Screen component per Figma node id. */
const COMPONENTS: Readonly<Record<string, ComponentType>> = {
  '1:90': Homepage,
}

/**
 * A frame listed in the manifest with no component wired up is an
 * implementation-time error, not a blank route.
 */
export const routes: readonly ScreenRoute[] = SCREENS.map((screen) => {
  const component = COMPONENTS[screen.nodeId]
  if (!component) {
    throw new Error(
      `No component is registered for Figma frame "${screen.frameName}" (${screen.nodeId}).`,
    )
  }
  return { ...screen, component }
})

const startRoute: ScreenRoute = (() => {
  const route = routes.find((candidate) => candidate.path === '/')
  if (!route) {
    throw new Error('No start route is registered. One screen must use the "/" path.')
  }
  return route
})()

/** The route that the Figma prototype designates as its starting frame. */
export function getStartRoute(): ScreenRoute {
  return startRoute
}
