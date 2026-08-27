import { ASSETS } from '../../assets/assets'
import { imagesForTeam } from '../../assets/teamImages'
import { TEAMS, TEAM_COUNT, teamByNumber } from '../../data/teams'
import type { Conference, Team } from '../../data/teams'

/**
 * Everything the Individual Team screen renders that differs from one team to
 * the next.
 *
 * The Figma frame (162:1586) is drawn for the Buffalo Bills, so `BUFFALO_BILLS`
 * below holds the design's copy verbatim and is what `/teams/buffalo-bills`
 * still renders — that route is the pixel-fidelity reference and must not move.
 * Every roster team gets the same layout filled with obvious placeholders via
 * `createPlaceholderTeam`.
 *
 * Figma node ids are part of the layout rather than the content, so they are
 * identical across teams: the fidelity specs and the CSS both key off them.
 */

export type TeamOddCrop =
  | 'winTotal'
  | 'makePlayoffs'
  | 'missPlayoffs'
  | 'superbowl'
  | 'winConference'
  | 'division'

export type ScheduleDifficulty = 'easy' | 'moderate' | 'difficult'
export type ScheduleLocation = 'Home' | 'Away'

export interface TeamStaffMember {
  readonly role: string
  readonly name: string
  readonly nodeId: string
}

export interface TeamAccordionSection {
  readonly title: string
  readonly nodeId: string
  readonly paragraphs: readonly string[]
}

export interface TeamOdd {
  readonly label: string
  readonly value: string
  readonly image: string
  readonly nodeId: string
  readonly crop: TeamOddCrop
}

export interface TeamScheduleGame {
  readonly opponent: string
  readonly week: number
  /** `null` on the bye week, which the design draws without a location or tag. */
  readonly location: ScheduleLocation | null
  readonly difficulty: ScheduleDifficulty | null
  readonly nodeId: string
}

export interface TeamDesktopScheduleGame {
  readonly opponent: string
  readonly week: number
  readonly nodeId: string
}

export interface TeamExploreCard {
  readonly nodeId: string
  readonly name: string
  readonly conference: Conference
  readonly href: string
  readonly image: string
  readonly imageDesktop: string
  readonly logo: string
  readonly logoDesktop: string
}

export interface TeamPageContent {
  readonly name: string
  readonly conference: Conference
  readonly heroImage: string
  readonly heroImageDesktop: string
  readonly heroAlt: string
  readonly logo: string
  readonly logoDesktop: string
  readonly overviewParagraphs: readonly string[]
  readonly staff: readonly TeamStaffMember[]
  readonly accordionSections: readonly TeamAccordionSection[]
  readonly predictionImage: string
  readonly predictionImageDesktop: string
  readonly predictionRecord: string
  readonly predictionCopy: string
  readonly favoriteImage: string
  readonly favoriteImageDesktop: string
  readonly favoriteAlt: string
  readonly favoritePlayer: string
  readonly favoriteBet: string
  /**
   * Frame 1310 repeats the prediction paragraph verbatim under the bet lines
   * (823:5900 against 162:2212). Both teams below alias the two rather than
   * duplicating them, so they cannot drift apart by accident. Split them if the
   * design ever diverges.
   *
   * Mobile only — the desktop frame 397:2207 carries the bet lines with no
   * supporting copy.
   */
  readonly favoriteCopy: string
  readonly odds: readonly TeamOdd[]
  readonly schedule: readonly TeamScheduleGame[]
  readonly desktopSchedule: readonly TeamDesktopScheduleGame[]
  readonly exploreCards: readonly TeamExploreCard[]
}

/** Odds card node ids, images and crops, in the order frame 162:1605 draws them. */
const ODDS_LAYOUT = [
  { label: 'Win Total', image: ASSETS.teamOddsWinTotal, nodeId: '162:1606', crop: 'winTotal' },
  { label: 'Make Playoffs', image: ASSETS.teamOddsMakePlayoffs, nodeId: '162:1613', crop: 'makePlayoffs' },
  { label: 'Miss Playoffs', image: ASSETS.teamOddsMissPlayoffs, nodeId: '162:1620', crop: 'missPlayoffs' },
  { label: 'Win Superbowl', image: ASSETS.teamOddsSuperbowl, nodeId: '162:1627', crop: 'superbowl' },
  { label: 'Win Conference', image: ASSETS.teamOddsConference, nodeId: '162:1634', crop: 'winConference' },
  { label: 'Win Division', image: ASSETS.teamOddsDivision, nodeId: '162:1641', crop: 'division' },
] as const satisfies readonly Omit<TeamOdd, 'value'>[]

/** The six FanDuel lines as drawn, reused as placeholder markets for every team. */
const ODDS_VALUES = ['12.5', '-850', '+540', '+750', '+360', '-270'] as const

const ODDS: readonly TeamOdd[] = ODDS_LAYOUT.map((odd, index) => ({
  ...odd,
  value: ODDS_VALUES[index] ?? '—',
}))

/**
 * The three staff cards frame 162:1595 draws, with the abbreviation each one's
 * placeholder name is built from. The card is a fixed 64px tall, so the short
 * form is what keeps a placeholder name on one line on a 320px phone.
 */
const STAFF_LAYOUT = [
  { role: 'Head Coach', abbreviation: 'HEAD COACH', nodeId: '162:1596' },
  { role: 'Offensive Coordinator', abbreviation: 'OFF COORD', nodeId: '162:1599' },
  { role: 'Defensive Coordinator', abbreviation: 'DEF COORD', nodeId: '162:1602' },
] as const

/**
 * The mobile schedule as frame 730:3141 lays it out: two columns interleaved,
 * so the visual order runs week 1, 10, 2, 11 … rather than 1-18.
 */
const SCHEDULE_LAYOUT = [
  { week: 1, location: 'Away', difficulty: 'easy', nodeId: '730:3130' },
  { week: 10, location: 'Home', difficulty: 'easy', nodeId: '730:3131' },
  { week: 2, location: 'Away', difficulty: 'moderate', nodeId: '730:3142' },
  { week: 11, location: 'Home', difficulty: 'easy', nodeId: '730:3153' },
  { week: 3, location: 'Away', difficulty: 'easy', nodeId: '730:3164' },
  { week: 12, location: 'Away', difficulty: 'easy', nodeId: '730:3175' },
  { week: 4, location: 'Home', difficulty: 'moderate', nodeId: '730:3186' },
  { week: 13, location: 'Away', difficulty: 'difficult', nodeId: '730:3197' },
  { week: 5, location: 'Home', difficulty: 'moderate', nodeId: '730:3208' },
  { week: 14, location: 'Home', difficulty: 'difficult', nodeId: '730:3219' },
  { week: 6, location: 'Away', difficulty: 'easy', nodeId: '730:3230' },
  { week: 15, location: 'Away', difficulty: 'moderate', nodeId: '730:3241' },
  { week: 7, location: null, difficulty: null, nodeId: '730:3252' },
  { week: 16, location: 'Away', difficulty: 'moderate', nodeId: '730:3263' },
  { week: 8, location: 'Away', difficulty: 'easy', nodeId: '730:3274' },
  { week: 17, location: 'Home', difficulty: 'easy', nodeId: '730:3285' },
  { week: 9, location: 'Away', difficulty: 'easy', nodeId: '730:3296' },
  { week: 18, location: 'Home', difficulty: 'moderate', nodeId: '730:3307' },
] as const satisfies readonly Omit<TeamScheduleGame, 'opponent'>[]

const BUFFALO_OPPONENTS = [
  'IND', 'NO', 'DAL', 'TEN', 'ATL', 'CLE', 'CIN', 'BUF', 'JAX',
  'LAC', 'CAR', 'HOU', 'NO GAME', 'TB', 'PIT', 'CLE', 'CIN', 'PIT',
] as const

const DESKTOP_SCHEDULE_WEEKS = [1, 7, 13, 2, 8, 14, 3, 9, 15, 4, 10, 16, 5, 11, 17, 6, 12, 18] as const
const DESKTOP_SCHEDULE_NODE_IDS = ['791:2111', '791:2470', '791:2480', '791:2523', '791:2534', '791:2545', '791:2556', '791:2567', '791:2578', '791:2589', '791:2600', '791:2611', '791:2622', '791:2633', '791:2644', '791:2655', '791:2666', '791:2677'] as const

/** Node ids of the five cards in the Explore All Teams carousel (181:1431). */
const EXPLORE_NODE_IDS = ['181:1405', '181:1418', '181:1432', '397:2369', '397:2383'] as const

function buildDesktopSchedule(
  opponentFor: (week: number) => string,
): readonly TeamDesktopScheduleGame[] {
  return DESKTOP_SCHEDULE_WEEKS.map((week, index) => ({
    opponent: opponentFor(week),
    week,
    nodeId: DESKTOP_SCHEDULE_NODE_IDS[index] ?? '',
  }))
}

const BUFFALO_PREDICTION_COPY =
  'The Bills’ biggest transaction was extending QB Josh Allen for the next six years. Aside from that it was a solid, without being an exceptional offseason in Buffalo. I’m unconvinced on the signing of former Chargers’ WR Josh Palmer who went under 2 yards per route run with the elite arm of Justin Herbert.'

/** The design's own copy, rendered by the `/teams/buffalo-bills` reference route. */
export const BUFFALO_BILLS: TeamPageContent = {
  name: 'BUFFALO BILLS',
  conference: 'AFC',
  heroImage: ASSETS.teamBuffaloHero,
  heroImageDesktop: ASSETS.teamBuffaloHeroDesktop,
  heroAlt: 'Buffalo Bills player in helmet',
  logo: ASSETS.teamsLogoBuffalo,
  logoDesktop: ASSETS.teamsLogoBuffalo,
  overviewParagraphs: [
    'The Buffalo Bills just fell short of the Super Bowl once again, but there is plenty to be optimistic about as they search for that elusive ring. Josh Allen claimed MVP ahead of Lamar Jackson and they won every single game at home, including a playoff win againstthe Ravens.',
    'However, they fell short once again to their AFC nemesis the Kansas City Chiefs at Arrowhead. The 32-29 scoreline suggests they’re just a few small improvements from joining the big dance for the first time since 1994. They are a well-rounded team, scoring the 2nd most points in the NFL and conceding the 11th-fewest.',
    'This season brings a huge opportunity: the Bills have the fifth‑easiest projected strength of schedule, so there are really no excuses for them. I’m a big Josh Allen fan and I’m sure he will lead them to playoff football once again.',
  ],
  staff: [
    { role: 'Head Coach', name: 'SEAN MCDERMOOT', nodeId: '162:1596' },
    { role: 'Offensive Coordinator', name: 'JOE BRADY', nodeId: '162:1599' },
    { role: 'Defensive Coordinator', name: 'BABY BABICH', nodeId: '162:1602' },
  ],
  accordionSections: [
    {
      title: 'OFF SEASON CHANGES',
      nodeId: '162:1669',
      paragraphs: [
        'The Bills’ biggest transaction was extending QB Josh Allen for the next six years. Aside from that it was a solid, without being an exceptional offseason in Buffalo. I’m unconvinced on the signing of former Chargers’ WR Josh Palmer who went under 2 yards per route run with the elite arm of Justin Herbert throwing to him.',
        'In the first round of the draft they selected cornerback Maxwell Hairston, and further added to the defense with pass rush Joey Bosa, plus veterans Michael Hoecht and Larry Ogunjobi. Von Miller was moved on after taking limited snaps. Not the most exciting off-season, but they’ve kept their core.',
      ],
    },
    { title: 'QUATERBACKS', nodeId: '162:1670', paragraphs: [] },
    { title: 'RUNNING BACKS', nodeId: '162:1671', paragraphs: [] },
    { title: 'RECEIVERS', nodeId: '162:1672', paragraphs: [] },
    { title: 'DEFENCE', nodeId: '162:1673', paragraphs: [] },
  ],
  predictionImage: ASSETS.teamBuffaloPrediction,
  predictionImageDesktop: ASSETS.teamBuffaloPrediction,
  predictionRecord: '14-3',
  predictionCopy: BUFFALO_PREDICTION_COPY,
  favoriteImage: ASSETS.teamBuffaloFuture,
  favoriteImageDesktop: ASSETS.teamBuffaloFutureDesktop,
  favoriteAlt: 'Josh Allen in a Buffalo Bills uniform',
  favoritePlayer: 'JOSH ALLEN',
  favoriteBet: '10+ RUSHING TOUCHDOWNS',
  favoriteCopy: BUFFALO_PREDICTION_COPY,
  odds: ODDS,
  schedule: SCHEDULE_LAYOUT.map((game, index) => ({
    ...game,
    opponent: BUFFALO_OPPONENTS[index] ?? '',
  })),
  desktopSchedule: buildDesktopSchedule(() => 'IND'),
  exploreCards: EXPLORE_NODE_IDS.map((nodeId) => ({
    nodeId,
    name: 'BUFFALO BILLS',
    conference: 'AFC',
    href: '/teams/buffalo-bills',
    image: ASSETS.teamExploreCard,
    imageDesktop: ASSETS.teamExploreCard,
    logo: ASSETS.teamsLogoBuffalo,
    logoDesktop: ASSETS.teamsLogoBuffalo,
  })),
}

/**
 * Placeholder opponent for a given week, as a short code that fits the same slot
 * the design's three-letter codes do.
 *
 * Walking the roster from the team's own number keeps a team off its own
 * schedule and gives each team a different-looking season.
 */
function placeholderOpponent(teamNumber: number, week: number): string {
  return `T${((teamNumber + week - 1) % TEAM_COUNT) + 1}`
}

/**
 * The same screen filled with obviously-fake copy for one roster team.
 *
 * Names stay short on purpose: the staff cards are a fixed 64px tall, so a name
 * long enough to wrap would overflow them on a narrow phone.
 */
export function createPlaceholderTeam(team: Team): TeamPageContent {
  const { name, number } = team
  const images = imagesForTeam(number)

  return {
    name,
    conference: team.conference,
    heroImage: images.hero,
    heroImageDesktop: images.heroDesktop,
    heroAlt: `${name} player in helmet`,
    logo: images.logo,
    logoDesktop: images.logoDesktop,
    overviewParagraphs: [
      `${name} is a placeholder franchise. Every word on this page stands in for editorial copy that has not been written yet, and it runs to roughly the length the finished article will so the layout can be reviewed at full height rather than against three short lines.`,
      `The season preview for ${name} will cover the roster, the coaching changes and the numbers behind last season's finish. Until that copy arrives this paragraph holds its place, and nothing below it will shift when the real words replace it.`,
      `Treat every figure further down as placeholder data too. The betting lines, the projected record and the favourite future are carried over from the reference layout and are not ${name}'s actual markets.`,
    ],
    staff: STAFF_LAYOUT.map((member) => ({
      role: member.role,
      name: `${member.abbreviation} ${name}`,
      nodeId: member.nodeId,
    })),
    accordionSections: [
      {
        title: 'OFF SEASON CHANGES',
        nodeId: '162:1669',
        paragraphs: [
          `${name} has no off-season write-up yet. This block is placeholder prose sized to match the one the design ships, so the expanded accordion keeps the height the Figma frame draws for it instead of collapsing to a single line.`,
          `Signings, draft picks and departures will be listed here once the real content lands. Until then the second paragraph exists only to hold the spacing between the copy and the bottom of the panel.`,
        ],
      },
      { title: 'QUATERBACKS', nodeId: '162:1670', paragraphs: [] },
      { title: 'RUNNING BACKS', nodeId: '162:1671', paragraphs: [] },
      { title: 'RECEIVERS', nodeId: '162:1672', paragraphs: [] },
      { title: 'DEFENCE', nodeId: '162:1673', paragraphs: [] },
    ],
    predictionImage: images.prediction,
    predictionImageDesktop: images.predictionDesktop,
    predictionRecord: '14-3',
    predictionCopy: `Placeholder prediction for ${name}. The projected record above and the reasoning here are filler, kept to about the length of the design's own paragraph so the section holds the height the Figma frame gives it.`,
    favoriteImage: images.favorite,
    favoriteImageDesktop: images.favoriteDesktop,
    favoriteAlt: `${name} star player in uniform`,
    favoritePlayer: `STAR PLAYER ${name}`,
    favoriteBet: '10+ RUSHING TOUCHDOWNS',
    favoriteCopy: `Placeholder favourite future for ${name}. The player, the market and the reasoning are all filler, and none of it reflects a line FanDuel is actually offering on this team.`,
    odds: ODDS,
    schedule: SCHEDULE_LAYOUT.map((game) => ({
      ...game,
      opponent: game.location === null ? 'NO GAME' : placeholderOpponent(number, game.week),
    })),
    desktopSchedule: buildDesktopSchedule((week) => placeholderOpponent(number, week)),
    /* The five cards after this one in the roster, wrapping at the end. */
    exploreCards: EXPLORE_NODE_IDS.map((nodeId, index) => {
      const neighbour = teamByNumber(((number + index) % TEAM_COUNT) + 1)
      const neighbourImages = imagesForTeam(neighbour.number)

      return {
        nodeId,
        name: neighbour.name,
        conference: neighbour.conference,
        href: neighbour.href,
        image: neighbourImages.explore,
        imageDesktop: neighbourImages.exploreDesktop,
        logo: neighbourImages.logo,
        logoDesktop: neighbourImages.logoDesktop,
      }
    }),
  }
}

/** One page's content per roster team, in roster order. */
export const TEAM_PAGES: readonly TeamPageContent[] = TEAMS.map(createPlaceholderTeam)
