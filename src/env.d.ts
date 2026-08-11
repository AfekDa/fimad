/**
 * TypeScript has no built-in understanding of `.astro` modules. Unit tests
 * import components directly; Vite loads them at runtime, and `astro check`
 * typechecks the `.astro` sources. This ambient module lets the TS language
 * service (and `tsc`) resolve those imports as Astro component factories.
 */
declare module '*.astro' {
  const Component: import('astro/runtime/server/index.js').AstroComponentFactory
  export default Component
}
