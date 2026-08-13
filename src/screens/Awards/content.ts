export interface AwardCardContent {
  readonly nodeId: string
  readonly headingNodeId: string
  readonly buttonNodeId: string
  readonly title: string
}

/** Four cards shown in the All Awards frame 188:2037, in source order. */
export const AWARD_CARDS: readonly AwardCardContent[] = [
  { nodeId: '188:2047', headingNodeId: '188:2048', buttonNodeId: '188:2049', title: 'MOST VALUABLE PLAYER PICKS' },
  { nodeId: '188:2050', headingNodeId: '188:2051', buttonNodeId: '188:2052', title: 'MOST VALUABLE PLAYER PICKS' },
  { nodeId: '188:2053', headingNodeId: '188:2054', buttonNodeId: '188:2055', title: 'MOST VALUABLE PLAYER PICKS' },
  { nodeId: '188:2056', headingNodeId: '188:2057', buttonNodeId: '188:2058', title: 'MOST VALUABLE PLAYER PICKS' },
]
