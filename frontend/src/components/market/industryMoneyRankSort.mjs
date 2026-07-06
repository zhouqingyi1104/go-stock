export const INDUSTRY_MONEY_RANK_SORT_FIELDS = {
  avgChange: 'avg_changeratio',
  inAmount: 'inamount',
  outAmount: 'outamount',
  netAmount: 'netamount',
  ratioAmount: 'ratioamount',
  leaderChange: 'ts_changeratio',
  leaderTrade: 'ts_trade',
  leaderRatio: 'ts_ratioamount',
}

export function getNextIndustryMoneyRankSortState(current, field) {
  if (current?.field === field) {
    return {
      field,
      order: current.order === 'desc' ? 'asc' : 'desc',
    }
  }
  return { field, order: 'desc' }
}

export function sortIndustryMoneyRanks(rows, sortState) {
  const field = sortState?.field || INDUSTRY_MONEY_RANK_SORT_FIELDS.netAmount
  const direction = sortState?.order === 'asc' ? 1 : -1

  return [...(rows || [])].sort((a, b) => {
    const left = normalizeMoneyRankNumber(a?.[field])
    const right = normalizeMoneyRankNumber(b?.[field])
    if (left == null && right == null) return 0
    if (left == null) return 1
    if (right == null) return -1
    return (left - right) * direction
  })
}

function normalizeMoneyRankNumber(value) {
  const number = Number.parseFloat(String(value ?? '').replace('%', '').replace(/,/g, ''))
  return Number.isFinite(number) ? number : null
}
