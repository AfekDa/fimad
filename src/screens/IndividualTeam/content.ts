import { ASSETS } from '../../assets/assets'

export const OVERVIEW_PARAGRAPHS = [
  'The Buffalo Bills just fell short of the Super Bowl once again, but there is plenty to be optimistic about as they search for that elusive ring. Josh Allen claimed MVP ahead of Lamar Jackson and they won every single game at home, including a playoff win againstthe Ravens.',
  'However, they fell short once again to their AFC nemesis the Kansas City Chiefs at Arrowhead. The 32-29 scoreline suggests they’re just a few small improvements from joining the big dance for the first time since 1994. They are a well-rounded team, scoring the 2nd most points in the NFL and conceding the 11th-fewest.',
  'This season brings a huge opportunity: the Bills have the fifth‑easiest projected strength of schedule, so there are really no excuses for them. I’m a big Josh Allen fan and I’m sure he will lead them to playoff football once again.',
] as const

export const STAFF = [
  { role: 'Head Coach', name: 'SEAN MCDERMOOT', nodeId: '162:1596' },
  { role: 'Offensive Coordinator', name: 'JOE BRADY', nodeId: '162:1599' },
  { role: 'Defensive Coordinator', name: 'BABY BABICH', nodeId: '162:1602' },
] as const

export const ACCORDION_SECTIONS = [
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
] as const

export const ODDS = [
  {
    label: 'Win Total',
    value: '12.5',
    image: ASSETS.teamOddsWinTotal,
    nodeId: '162:1606',
    crop: 'winTotal',
  },
  {
    label: 'Make Playoffs',
    value: '-850',
    image: ASSETS.teamOddsMakePlayoffs,
    nodeId: '162:1613',
    crop: 'makePlayoffs',
  },
  {
    label: 'Miss Playoffs',
    value: '+540',
    image: ASSETS.teamOddsMissPlayoffs,
    nodeId: '162:1620',
    crop: 'missPlayoffs',
  },
  {
    label: 'Win Superbowl',
    value: '+750',
    image: ASSETS.teamOddsSuperbowl,
    nodeId: '162:1627',
    crop: 'superbowl',
  },
  {
    label: 'Win Conference',
    value: '+360',
    image: ASSETS.teamOddsConference,
    nodeId: '162:1634',
    crop: 'winConference',
  },
  {
    label: 'Win Division',
    value: '-270',
    image: ASSETS.teamOddsDivision,
    nodeId: '162:1641',
    crop: 'division',
  },
] as const

export const SCHEDULE = [
  { opponent: 'IND', week: 1, location: 'Away', difficulty: 'easy', nodeId: '730:3130' },
  { opponent: 'NO', week: 10, location: 'Home', difficulty: 'easy', nodeId: '730:3131' },
  { opponent: 'DAL', week: 2, location: 'Away', difficulty: 'moderate', nodeId: '730:3142' },
  { opponent: 'TEN', week: 11, location: 'Home', difficulty: 'easy', nodeId: '730:3153' },
  { opponent: 'ATL', week: 3, location: 'Away', difficulty: 'easy', nodeId: '730:3164' },
  { opponent: 'CLE', week: 12, location: 'Away', difficulty: 'easy', nodeId: '730:3175' },
  { opponent: 'CIN', week: 4, location: 'Home', difficulty: 'moderate', nodeId: '730:3186' },
  { opponent: 'BUF', week: 13, location: 'Away', difficulty: 'difficult', nodeId: '730:3197' },
  { opponent: 'JAX', week: 5, location: 'Home', difficulty: 'moderate', nodeId: '730:3208' },
  { opponent: 'LAC', week: 14, location: 'Home', difficulty: 'difficult', nodeId: '730:3219' },
  { opponent: 'CAR', week: 6, location: 'Away', difficulty: 'easy', nodeId: '730:3230' },
  { opponent: 'HOU', week: 15, location: 'Away', difficulty: 'moderate', nodeId: '730:3241' },
  { opponent: 'NO GAME', week: 7, location: null, difficulty: null, nodeId: '730:3252' },
  { opponent: 'TB', week: 16, location: 'Away', difficulty: 'moderate', nodeId: '730:3263' },
  { opponent: 'PIT', week: 8, location: 'Away', difficulty: 'easy', nodeId: '730:3274' },
  { opponent: 'CLE', week: 17, location: 'Home', difficulty: 'easy', nodeId: '730:3285' },
  { opponent: 'CIN', week: 9, location: 'Away', difficulty: 'easy', nodeId: '730:3296' },
  { opponent: 'PIT', week: 18, location: 'Home', difficulty: 'moderate', nodeId: '730:3307' },
] as const

const DESKTOP_SCHEDULE_WEEKS = [1, 7, 13, 2, 8, 14, 3, 9, 15, 4, 10, 16, 5, 11, 17, 6, 12, 18] as const
const DESKTOP_SCHEDULE_NODE_IDS = ['791:2111', '791:2470', '791:2480', '791:2523', '791:2534', '791:2545', '791:2556', '791:2567', '791:2578', '791:2589', '791:2600', '791:2611', '791:2622', '791:2633', '791:2644', '791:2655', '791:2666', '791:2677'] as const

export const DESKTOP_SCHEDULE = DESKTOP_SCHEDULE_WEEKS.map((week, index) => ({
  opponent: 'IND',
  week,
  nodeId: DESKTOP_SCHEDULE_NODE_IDS[index],
}))

export const PREDICTION_COPY =
  'The Bills’ biggest transaction was extending QB Josh Allen for the next six years. Aside from that it was a solid, without being an exceptional offseason in Buffalo. I’m unconvinced on the signing of former Chargers’ WR Josh Palmer who went under 2 yards per route run with the elite arm of Justin Herbert.'
