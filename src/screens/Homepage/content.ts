/**
 * Everything the Homepage says and shows — mobile frame 1:90 and desktop
 * frame 311:4398.
 *
 * Copy and imagery live here so they can be changed without touching layout.
 * Homepage.astro owns structure and styling and reads every string and image
 * url from this file; it hardcodes none of its own.
 *
 * Each entry cites the Figma node it came from. Text is verbatim from the
 * design, typographic punctuation included — do not "fix" it here, change it in
 * Figma and re-read.
 */
import { ASSETS } from '../../assets/assets'

export interface Feature {
  readonly nodeId: string
  /** Rendered as separate lines when Figma sets an explicit break. */
  readonly lines: readonly string[]
}

export interface SocialLink {
  readonly nodeId: string
  readonly label: string
  readonly src: string
}

export interface HomepageContent {
  readonly brand: {
    readonly byline: string
    readonly title: string
  }
  readonly hero: {
    readonly poster: string
    readonly yearMark: string
    readonly yearMarkAlt: string
  }
  readonly headline: string
  /** Paragraphs of the intro block, separated by a blank line when rendered. */
  readonly intro: readonly string[]
  readonly features: readonly Feature[]
  readonly outro: string
  readonly author: {
    readonly name: string
    readonly avatar: string
    readonly signature: string
  }
  readonly social: readonly SocialLink[]
}

export const HOMEPAGE_CONTENT: HomepageContent = {
  brand: {
    byline: 'Cody Brown’s',
    title: 'NFL BETTING GUIDE',
  },

  /* 1:91 hero image, 1:95 year mark */
  hero: {
    poster: ASSETS.heroPoster,
    yearMark: ASSETS.yearMark,
    yearMarkAlt: 'Year 2026-27, sponsored by FanDuel',
  },

  /* 1:97 */
  headline: 'WELCOME TO MY NFL BETTING GUIDE 2026',

  /* 1:98 */
  intro: [
    'This is the third straight season I’ve written my guide and this version is by far the best yet. I’ve spent countless hours studying every team so I can give us the best chance of making money this season.',
    'If you’re just discovering me, the main thing you need to know is that absolutely everything I post is free. Here’s a glimpse at what I’ll be sharing with you throughout the NFL season…',
  ],

  /* 1:99 — card 1 (1:100) carries a designed line break. */
  features: [
    { nodeId: '1:100', lines: ['Parlays, Flyers and', 'Best Bets for every game week'] },
    { nodeId: '1:103', lines: ['Data Sheets to help you pick your own winners'] },
    { nodeId: '1:106', lines: ['Algorithms to identify the best matchups'] },
    { nodeId: '1:109', lines: ['Giveaways and competitions'] },
  ],

  /* 1:112 — "2025" is what the design says. */
  outro:
    'Whether you’re a bettor, a fantasy football player or simply an NFL fan, this guide will give you more knowledge than all your buddies going into the 2025 season. Hope you enjoy it.',

  /* 1:115 */
  author: {
    name: 'Cody Brown',
    avatar: ASSETS.authorAvatar,
    signature: ASSETS.authorSignature,
  },

  /* 1:118 — the design defines no destinations for these. */
  social: [
    { nodeId: '1:119', label: 'X', src: ASSETS.socialX },
    { nodeId: '1:122', label: 'Facebook', src: ASSETS.socialFacebook },
    { nodeId: '1:123', label: 'Instagram', src: ASSETS.socialInstagram },
  ],
}
