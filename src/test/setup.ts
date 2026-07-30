/*
 * Astro components render to an HTML string, not into a live document, so there
 * is nothing to unmount between tests — see src/test/render.ts. Only the
 * jest-dom matchers need registering.
 */
import '@testing-library/jest-dom/vitest'
