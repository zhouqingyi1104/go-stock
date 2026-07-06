import assert from 'node:assert/strict'
import test from 'node:test'

import {
  INDUSTRY_MONEY_RANK_SORT_FIELDS,
  getNextIndustryMoneyRankSortState,
  sortIndustryMoneyRanks,
} from './industryMoneyRankSort.mjs'

test('sorts industry money ranks by selected numeric field', () => {
  const rows = [
    { name: 'A', netamount: 300, inamount: 500, avg_changeratio: 0.03 },
    { name: 'B', netamount: 100, inamount: 900, avg_changeratio: -0.01 },
    { name: 'C', netamount: 200, inamount: 700, avg_changeratio: 0.05 },
  ]

  assert.deepEqual(
    sortIndustryMoneyRanks(rows, { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.netAmount, order: 'desc' }).map(row => row.name),
    ['A', 'C', 'B'],
  )
  assert.deepEqual(
    sortIndustryMoneyRanks(rows, { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.inAmount, order: 'asc' }).map(row => row.name),
    ['A', 'C', 'B'],
  )
  assert.deepEqual(
    sortIndustryMoneyRanks(rows, { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.avgChange, order: 'desc' }).map(row => row.name),
    ['C', 'A', 'B'],
  )
})

test('toggles order for the same field and defaults new fields to descending', () => {
  assert.deepEqual(
    getNextIndustryMoneyRankSortState(
      { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.netAmount, order: 'desc' },
      INDUSTRY_MONEY_RANK_SORT_FIELDS.inAmount,
    ),
    { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.inAmount, order: 'desc' },
  )
  assert.deepEqual(
    getNextIndustryMoneyRankSortState(
      { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.inAmount, order: 'desc' },
      INDUSTRY_MONEY_RANK_SORT_FIELDS.inAmount,
    ),
    { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.inAmount, order: 'asc' },
  )
})

test('keeps missing numeric values at the bottom', () => {
  const rows = [
    { name: 'A', ratioamount: 0.03 },
    { name: 'Missing', ratioamount: '-' },
    { name: 'B', ratioamount: 0.01 },
  ]

  assert.deepEqual(
    sortIndustryMoneyRanks(rows, { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.ratioAmount, order: 'desc' }).map(row => row.name),
    ['A', 'B', 'Missing'],
  )
  assert.deepEqual(
    sortIndustryMoneyRanks(rows, { field: INDUSTRY_MONEY_RANK_SORT_FIELDS.ratioAmount, order: 'asc' }).map(row => row.name),
    ['B', 'A', 'Missing'],
  )
})
