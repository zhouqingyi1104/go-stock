import assert from 'node:assert/strict'
import test from 'node:test'

import { buildTopicChainAnalysisPrompt } from './topicChainAnalysisPrompt.mjs'

test('builds a tool-first upstream downstream analysis prompt with topic context', () => {
  const prompt = buildTopicChainAnalysisPrompt(
    {
      nickname: '复合集流体',
      desc: '锂电池新材料热点',
      stock_list: [
        { name: '东威科技', code: 'sh688700' },
        { name: '宝明科技', code: 'sz002992' }
      ]
    },
    { today: '2026-07-06' }
  )

  assert.match(prompt, /复合集流体/)
  assert.match(prompt, /锂电池新材料热点/)
  assert.match(prompt, /东威科技\(sh688700\)/)
  assert.match(prompt, /宝明科技\(sz002992\)/)
  assert.match(prompt, /必须先联网搜索/)
  assert.match(prompt, /上游/)
  assert.match(prompt, /中游/)
  assert.match(prompt, /下游/)
  assert.match(prompt, /代表股票/)
  assert.match(prompt, /不构成投资建议/)
  assert.match(prompt, /2026-07-06/)
})

test('uses explicit empty-stock fallback without dropping the topic', () => {
  const prompt = buildTopicChainAnalysisPrompt(
    {
      nickname: 'AI眼镜',
      desc: ''
    },
    { today: '2026-07-06' }
  )

  assert.match(prompt, /AI眼镜/)
  assert.match(prompt, /题材列表自带股票：暂无/)
  assert.match(prompt, /不要编造/)
})
