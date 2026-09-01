import { withCmsBets } from './cmsBets'

export interface BetContent {
  readonly cardNodeId: string
  readonly textNodeId: string
  readonly name: string
  readonly odds: string
  /** Where "PLACE BET" goes; undefined leaves the design's inert button. */
  readonly betUrl?: string | undefined
}

export interface BetSectionContent {
  readonly id: string
  readonly title: string
  readonly frameNodeId: string
  readonly headingNodeId: string
  readonly bets: readonly BetContent[]
}

function bet(cardNodeId: string, textNodeId: string, name: string, odds: string): BetContent {
  return { cardNodeId, textNodeId, name, odds }
}

const standardPicks = (
  ids: readonly [
    readonly [string, string],
    readonly [string, string],
    readonly [string, string],
  ],
): readonly BetContent[] => [
  bet(ids[0][0], ids[0][1], 'Lamar Jackson', '+430'),
  bet(ids[1][0], ids[1][1], 'Joe Burrow', '+600'),
  bet(ids[2][0], ids[2][1], 'Jared Goff', '+430'),
]

const BASE_SECTIONS: readonly BetSectionContent[] = [
  {
    id: 'mvp',
    title: 'MOST VALUABLE PLAYER PICKS',
    frameNodeId: '251:3133',
    headingNodeId: '251:3066',
    bets: standardPicks([
      ['251:3114', '251:3069'],
      ['251:3116', '251:3117'],
      ['251:3124', '251:3125'],
    ]),
  },
  {
    id: 'offensive-poty',
    title: 'OFFENSIVE PLAYER OF THE YEAR PICKS',
    frameNodeId: '251:3135',
    headingNodeId: '251:3136',
    bets: standardPicks([
      ['251:3138', '251:3139'],
      ['251:3141', '251:3142'],
      ['251:3144', '251:3145'],
    ]),
  },
  {
    id: 'defensive-poty',
    title: 'DEFENSIVE PLAYER OF THE YEAR PICKS',
    frameNodeId: '251:3309',
    headingNodeId: '251:3195',
    bets: standardPicks([
      ['251:3197', '251:3198'],
      ['251:3200', '251:3201'],
      ['251:3203', '251:3204'],
    ]),
  },
  {
    id: 'offensive-roty',
    title: 'OFFENSIVE ROOKIE OF THE YEAR PICKS',
    frameNodeId: '251:3310',
    headingNodeId: '251:3224',
    bets: standardPicks([
      ['251:3226', '251:3227'],
      ['251:3229', '251:3230'],
      ['251:3232', '251:3233'],
    ]),
  },
  {
    id: 'favourite-futures',
    title: 'FAVOURITE FUTURES',
    frameNodeId: '251:3252',
    headingNodeId: '251:3253',
    bets: [
      bet('251:3255', '251:3256', 'Lamar Jackson', '+430'),
      bet('251:3258', '251:3259', 'Joe Burrow', '+600'),
      bet('251:3261', '251:3262', 'Jared Goff', '+430'),
      bet('251:3519', '251:3520', 'Jared Goff', '+430'),
      bet('251:3312', '251:3313', 'Jared Goff', '+430'),
      bet('251:3321', '251:3322', 'Jared Goff', '+430'),
      bet('251:3330', '251:3331', 'Jared Goff', '+430'),
      bet('251:3339', '251:3340', 'Jared Goff', '+430'),
      bet('251:3348', '251:3349', 'Jared Goff', '+430'),
      bet('251:3357', '251:3358', 'Jared Goff', '+430'),
      bet('251:3366', '251:3367', 'Jared Goff', '+430'),
      bet('251:3375', '251:3376', 'Jared Goff', '+430'),
      bet('251:3384', '251:3385', 'Jared Goff', '+430'),
      bet('251:3393', '251:3394', 'Jared Goff', '+430'),
      bet('251:3402', '251:3403', 'Jared Goff', '+430'),
      bet('251:3411', '251:3412', 'Jared Goff', '+430'),
      bet('251:3420', '251:3421', 'Jared Goff', '+430'),
      bet('251:3429', '251:3430', 'Jared Goff', '+430'),
      bet('251:3438', '251:3439', 'Jared Goff', '+430'),
      bet('251:3447', '251:3448', 'Jared Goff', '+430'),
      bet('251:3456', '251:3457', 'Jared Goff', '+430'),
      bet('251:3465', '251:3466', 'Jared Goff', '+430'),
      bet('251:3474', '251:3475', 'Jared Goff', '+430'),
    ],
  },
]

/** The design's sections with the CMS's players and odds in them. */
export const BET_SECTIONS: readonly BetSectionContent[] = withCmsBets(BASE_SECTIONS)

export const BET_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'mvp', label: 'MVP Picks' },
  { id: 'offensive-poty', label: 'Offensive POTY Picks' },
  { id: 'favourite-futures', label: 'Favorite Future' },
  { id: 'defensive-poty', label: 'Defensive POTY Picks' },
  { id: 'offensive-roty', label: 'Offensive ROTY Picks' },
] as const
