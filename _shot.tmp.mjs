import { chromium } from '@playwright/test'

const outDir = 'C:/Users/GIGABYTE/AppData/Local/Temp/claude/C--Users-GIGABYTE-Documents-fimad/07cb2d87-77e1-466a-ab00-81f6b2dd52c3/scratchpad'
const browser = await chromium.launch()

// Mobile 430x932
const mobile = await browser.newPage({ viewport: { width: 430, height: 932 } })
await mobile.goto('http://127.0.0.1:4321/all-bets', { waitUntil: 'networkidle' })
await mobile.evaluate(() => document.fonts.ready)
const m = await mobile.evaluate(() => ({
  pageHeight: document.querySelector('[data-node-id="251:2889"]').getBoundingClientRect().height,
  cards: document.querySelectorAll('[data-bet-card]').length,
  sections: [...document.querySelectorAll('[data-bet-section]')].map((s) => ({
    id: s.dataset.betSection,
    cards: s.querySelectorAll('[data-bet-card]').length,
  })),
}))
console.log('MOBILE', JSON.stringify(m, null, 1))
await mobile.close()

// Desktop 1280x782
const desk = await browser.newPage({ viewport: { width: 1280, height: 782 } })
await desk.goto('http://127.0.0.1:4321/all-bets', { waitUntil: 'networkidle' })
await desk.evaluate(async () => {
  await document.fonts.ready
  await Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {})))
})
const d = await desk.evaluate(() => {
  const rect = (el) => {
    const b = el.getBoundingClientRect()
    return { x: b.x, y: b.y + window.scrollY, w: b.width, h: b.height }
  }
  const firstMvp = document.querySelector('[data-bet-section="mvp"] [data-bet-card]')
  const futures = document.querySelector('[data-bet-section="favourite-futures"]')
  const firstFuture = futures.querySelector('[data-bet-card]')
  return {
    pageHeight: document.querySelector('[data-all-bets-page]').getBoundingClientRect().height,
    firstMvp: rect(firstMvp),
    mvpCta: rect(firstMvp.querySelector('a,button')),
    mvpCtaLabel: firstMvp.querySelector('a,button').getAttribute('aria-label'),
    futuresCards: futures.querySelectorAll('[data-bet-card]').length,
    firstFuture: rect(firstFuture),
    exclusiveCards: document.querySelectorAll('[data-bet-section="exclusive"] [data-bet-card]').length,
    nav: rect(document.querySelector('[data-app-nav]')),
  }
})
console.log('DESKTOP', JSON.stringify(d, null, 1))
// clearance at scroll bottom
await desk.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await desk.waitForTimeout(200)
const gap = await desk.evaluate(() => {
  const nav = document.querySelector('[data-app-nav]').getBoundingClientRect()
  const cards = [...document.querySelectorAll('[data-bet-card]')]
  return nav.top - Math.max(...cards.map((c) => c.getBoundingClientRect().bottom))
})
console.log('DESKTOP gapToNav at bottom:', gap)
await desk.screenshot({ path: `${outDir}/after-bottom-1280.png` })
await desk.close()

await browser.close()
