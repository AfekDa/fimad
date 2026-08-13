export interface MvpPickContent {
  readonly nodeId: string
  readonly rankNodeId: string
  readonly nameNodeId: string
  readonly descriptionNodeId: string
  readonly oddsNodeId: string
  readonly rank: number
  readonly name: string
  readonly description: string
  readonly odds: string
}

const DESCRIPTION =
  'Despite throwing 41 touchdowns and over 4,100 yards last season, Lamar couldn’t retain his MVP title. It was the first time he surpassed 4,000 passing yards and he only threw 4 interceptions as well. I suspect there was some voter fatigue but that shouldn’t be an issue for him this season. The Baltimore offense remains one of the best in the NFL and the addition of DeAndre Hopkins gives Lamar another weapon.'

/** Three horizontally scrollable cards in Figma frame 188:2186. */
export const MVP_PICKS: readonly MvpPickContent[] = [
  {
    nodeId: '188:2196',
    rankNodeId: '188:2198',
    nameNodeId: '188:2201',
    descriptionNodeId: '188:2202',
    oddsNodeId: '188:2204',
    rank: 1,
    name: 'LAMAR JACKSON',
    description: DESCRIPTION,
    odds: '+430',
  },
  {
    nodeId: '188:2481',
    rankNodeId: '188:2483',
    nameNodeId: '188:2486',
    descriptionNodeId: '188:2487',
    oddsNodeId: '188:2489',
    rank: 2,
    name: 'LAMAR JACKSON',
    description: DESCRIPTION,
    odds: '+430',
  },
  {
    nodeId: '188:2497',
    rankNodeId: '188:2499',
    nameNodeId: '188:2502',
    descriptionNodeId: '188:2503',
    oddsNodeId: '188:2505',
    rank: 3,
    name: 'LAMAR JACKSON',
    description: DESCRIPTION,
    odds: '+430',
  },
]
