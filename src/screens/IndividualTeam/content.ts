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

export const PREDICTION_COPY =
  'The Bills’ biggest transaction was extending QB Josh Allen for the next six years. Aside from that it was a solid, without being an exceptional offseason in Buffalo. I’m unconvinced on the signing of former Chargers’ WR Josh Palmer who went under 2 yards per route run with the elite arm of Justin Herbert.'
