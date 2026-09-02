/**
 * One stamp per build, printed into every page's head.
 *
 * The site is on GitHub Pages, where each deploy replaces the hashed
 * /_astro/* files outright. A page that was opened before a deploy and then
 * navigates client-side pulls in HTML whose stylesheets no longer exist, and
 * the router swaps it in unstyled (2 Sep report: "moves to the HTML broken
 * text"). BaseLayout compares this stamp across a navigation and falls back to
 * a full page load when it changes. Evaluated once per build, so every page in
 * a deploy shares the value.
 */
export const BUILD_ID = process.env.GITHUB_SHA?.slice(0, 12) ?? `local-${Date.now().toString(36)}`
