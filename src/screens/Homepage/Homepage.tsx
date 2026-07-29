import { useState } from 'react'
import { Nav } from '../../components/Nav/Nav'
import styles from './Homepage.module.css'

import heroPoster from '../../assets/hero-poster.png'
import year2026 from '../../assets/year-2026.png'
import featureBadge from '../../assets/feature-badge.png'
import divider from '../../assets/divider.svg'
import avatarCody from '../../assets/avatar-cody.png'
import signature from '../../assets/signature.png'
import socialX from '../../assets/social-x.svg'
import socialFacebook from '../../assets/social-facebook.png'
import socialInstagram from '../../assets/social-instagram.svg'

interface Feature {
  readonly nodeId: string
  /** Rendered as separate lines when Figma sets an explicit break. */
  readonly lines: readonly string[]
}

/** Feature list from 1:99. Card 1 (1:102) carries a designed line break. */
const FEATURES: readonly Feature[] = [
  { nodeId: '1:100', lines: ['Parlays, Flyers and', 'Best Bets for every game week'] },
  { nodeId: '1:103', lines: ['Data Sheets to help you pick your own winners'] },
  { nodeId: '1:106', lines: ['Algorithms to identify the best matchups'] },
  { nodeId: '1:109', lines: ['Giveaways and competitions'] },
]

const SOCIAL_LINKS = [
  { nodeId: '1:119', label: 'X', src: socialX },
  { nodeId: '1:122', label: 'Facebook', src: socialFacebook },
  { nodeId: '1:123', label: 'Instagram', src: socialInstagram },
] as const

export function Homepage() {
  // The Figma page has no second full-screen frame, so tab selection is local
  // state rather than navigation.
  const [selectedTab, setSelectedTab] = useState('home')

  return (
    <div className={styles.page} data-node-id="1:90">
      <div className={styles.hero}>
        <div className={styles.heroImage} data-node-id="1:91">
          <img className={styles.heroImageLeaf} src={heroPoster} alt="" aria-hidden="true" />
        </div>
        <div className={styles.heroScrim} data-node-id="1:92" />
        <div className={styles.heroTitle} data-node-id="1:93">
          <div className={styles.yearMark} data-node-id="1:95">
            <img
              className={styles.yearMarkLeaf}
              src={year2026}
              alt="Year 2026-27, sponsored by FanDuel"
            />
          </div>
        </div>
      </div>

      <div className={styles.content} data-node-id="1:96">
        <h1 className={styles.title} data-node-id="1:97">
          WELCOME TO MY NFL BETTING GUIDE 2026
        </h1>

        <p className={styles.body} data-node-id="1:98">
          This is the third straight season I’ve written my guide and this version is by far the
          best yet. I’ve spent countless hours studying every team so I can give us the best chance
          of making money this season.
          <br aria-hidden="true" />
          <br aria-hidden="true" />
          If you’re just discovering me, the main thing you need to know is that absolutely
          everything I post is free. Here’s a glimpse at what I’ll be sharing with you throughout the
          NFL season…
        </p>

        <ul className={styles.features} data-node-id="1:99">
          {FEATURES.map((feature) => (
            <li key={feature.nodeId} className={styles.featureCard} data-node-id={feature.nodeId}>
              <span className={styles.featureBadge}>
                <img
                  className={styles.featureBadgeLeaf}
                  src={featureBadge}
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <p className={styles.featureText}>
                {feature.lines.map((line, index) => (
                  <span key={line}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>

        <p className={styles.body} data-node-id="1:112">
          Whether you’re a bettor, a fantasy football player or simply an NFL fan, this guide will
          give you more knowledge than all your buddies going into the 2025 season. Hope you enjoy
          it.
        </p>

        <div className={styles.divider} data-node-id="1:113">
          <img className={styles.dividerLeaf} src={divider} alt="" aria-hidden="true" />
        </div>

        <div className={styles.footer} data-node-id="1:114">
          <div className={styles.identity} data-node-id="1:115">
            <span className={styles.avatar} data-node-id="1:116">
              <img className={styles.avatarLeaf} src={avatarCody} alt="" aria-hidden="true" />
            </span>
            <img className={styles.signature} src={signature} alt="Cody Brown" />
          </div>

          <div className={styles.social} data-node-id="1:118">
            {SOCIAL_LINKS.map((link) => (
              <button
                key={link.nodeId}
                type="button"
                className={styles.socialLink}
                data-node-id={link.nodeId}
                aria-label={link.label}
              >
                <img className={styles.socialIcon} src={link.src} alt="" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.navDock} data-node-id="1:126">
        <Nav className={styles.nav} selectedId={selectedTab} onSelect={setSelectedTab} />
      </div>
    </div>
  )
}
