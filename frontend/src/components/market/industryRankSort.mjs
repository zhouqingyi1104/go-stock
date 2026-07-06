export const INDUSTRY_RANK_SORT_FIELDS = {
  daily: 'bd_zdf',
  fiveDay: 'bd_zdf5',
  twentyDay: 'bd_zdf20',
}

export function getNextIndustryRankSortState(current, field) {
  if (current?.field === field) {
    return {
      field,
      order: current.order === 'desc' ? 'asc' : 'desc',
    }
  }
  return { field, order: 'desc' }
}

export function sortIndustryRanks(rows, sortState) {
  const field = sortState?.field || INDUSTRY_RANK_SORT_FIELDS.daily
  const direction = sortState?.order === 'asc' ? 1 : -1

  return [...(rows || [])].sort((a, b) => {
    const left = normalizeRankNumber(a?.[field])
    const right = normalizeRankNumber(b?.[field])
    if (left == null && right == null) return 0
    if (left == null) return 1
    if (right == null) return -1
    return (left - right) * direction
  })
}

function normalizeRankNumber(value) {
  const number = Number.parseFloat(String(value ?? '').replace('%', ''))
  return Number.isFinite(number) ? number : null
}
