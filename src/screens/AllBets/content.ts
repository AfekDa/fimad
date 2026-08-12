export interface BetContent {
  readonly id: string
  readonly category: 'Best Bet' | 'Parlay' | 'Prop'
  readonly matchup: string
  readonly pick: string
  readonly detail: string
  readonly odds: string
  readonly nodeId: string
}

/** Editorial examples for the first mobile All Bets screen. */
export const ALL_BETS: readonly BetContent[] = [
  {
    id: 'bills-spread',
    category: 'Best Bet',
    matchup: 'Buffalo Bills  v  New York Jets',
    pick: 'Bills -3.5',
    detail: 'The matchup I’m most confident in this week.',
    odds: '-110',
    nodeId: '98:641',
  },
  {
    id: 'chiefs-parlay',
    category: 'Parlay',
    matchup: 'Sunday Sides Parlay',
    pick: 'Chiefs ML  ·  Ravens ML  ·  49ers ML',
    detail: 'Three teams I’m backing to get the job done.',
    odds: '+245',
    nodeId: '98:655',
  },
  {
    id: 'achane-touchdown',
    category: 'Prop',
    matchup: 'Miami Dolphins  v  New England Patriots',
    pick: 'De’Von Achane anytime TD',
    detail: 'Look for Miami to create space early and often.',
    odds: '+105',
    nodeId: '98:669',
  },
  {
    id: 'eagles-total',
    category: 'Best Bet',
    matchup: 'Philadelphia Eagles  v  Dallas Cowboys',
    pick: 'Over 47.5 points',
    detail: 'Two aggressive offenses make this total worth a look.',
    odds: '-105',
    nodeId: '98:683',
  },
] as const
