import test from 'node:test'
import assert from 'node:assert/strict'

import {
  INDUSTRY_RANK_SORT_FIELDS,
  getNextIndustryRankSortState,
  sortIndustryRanks,
} from './industryRankSort.mjs'

test('sorts industry ranks by selected growth field', () => {
  const rows = [
    { bd_name: 'A', bd_zdf: 4.66, bd_zdf5: 8.88, bd_zdf20: 7.14 },
    { bd_name: 'B', bd_zdf: 4.36, bd_zdf5: 6.82, bd_zdf20: -12.41 },
    { bd_name: 'C', bd_zdf: 3.6, bd_zdf5: 7.24, bd_zdf20: 3.92 },
  ]

  assert.deepEqual(
    sortIndustryRanks(rows, { field: INDUSTRY_RANK_SORT_FIELDS.fiveDay, order: 'desc' }).map(row => row.bd_name),
    ['A', 'C', 'B'],
  )
  assert.deepEqual(
    sortIndustryRanks(rows, { field: INDUSTRY_RANK_SORT_FIELDS.twentyDay, order: 'asc' }).map(row => row.bd_name),
    ['B', 'C', 'A'],
  )
})

test('toggles order when sorting the same field and defaults to descending for new fields', () => {
  assert.deepEqual(
    getNextIndustryRankSortState(
      { field: INDUSTRY_RANK_SORT_FIELDS.daily, order: 'desc' },
      INDUSTRY_RANK_SORT_FIELDS.fiveDay,
    ),
    { field: INDUSTRY_RANK_SORT_FIELDS.fiveDay, order: 'desc' },
  )
  assert.deepEqual(
    getNextIndustryRankSortState(
      { field: INDUSTRY_RANK_SORT_FIELDS.fiveDay, order: 'desc' },
      INDUSTRY_RANK_SORT_FIELDS.fiveDay,
    ),
    { field: INDUSTRY_RANK_SORT_FIELDS.fiveDay, order: 'asc' },
  )
})

test('keeps missing numeric values at the bottom for either order', () => {
  const rows = [
    { bd_name: 'A', bd_zdf5: 8.88 },
    { bd_name: 'Missing', bd_zdf5: '-' },
    { bd_name: 'B', bd_zdf5: 6.82 },
  ]

  assert.deepEqual(
    sortIndustryRanks(rows, { field: INDUSTRY_RANK_SORT_FIELDS.fiveDay, order: 'desc' }).map(row => row.bd_name),
    ['A', 'B', 'Missing'],
  )
  assert.deepEqual(
    sortIndustryRanks(rows, { field: INDUSTRY_RANK_SORT_FIELDS.fiveDay, order: 'asc' }).map(row => row.bd_name),
    ['B', 'A', 'Missing'],
  )
})
