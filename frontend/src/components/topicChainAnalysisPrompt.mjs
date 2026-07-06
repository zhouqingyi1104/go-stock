function cleanText(value, fallback = '') {
  if (value === null || value === undefined) return fallback
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text || fallback
}

function formatStock(stock) {
  if (!stock || typeof stock !== 'object') return cleanText(stock)
  const name = cleanText(stock.name || stock.Name || stock.SECURITY_NAME_ABBR || stock.stockName)
  const code = cleanText(stock.code || stock.Code || stock.SECURITY_CODE || stock.stockCode)
  if (name && code) return `${name}(${code})`
  return name || code
}

export function formatTopicStocks(stockList) {
  if (!Array.isArray(stockList) || stockList.length === 0) return '暂无'
  const items = stockList.map(formatStock).filter(Boolean)
  return items.length > 0 ? items.join('、') : '暂无'
}

export function buildTopicChainAnalysisPrompt(topic, options = {}) {
  const topicName = cleanText(topic?.nickname || topic?.name || topic?.title, '未命名题材')
  const topicDesc = cleanText(topic?.desc || topic?.description, '暂无')
  const stocks = formatTopicStocks(topic?.stock_list || topic?.stocks)
  const today = cleanText(options.today, new Date().toISOString().slice(0, 10))

  return `今天是 ${today}。请对 A 股热点题材「${topicName}」做题材上下游产业链分析。

已知题材描述：${topicDesc}
题材列表自带股票：${stocks}

硬性要求：
1. 必须先联网搜索/调用可用工具核验最新资料，优先核验题材定义、产业链环节、概念成份股、公司公告/研报/新闻，不要只依赖记忆。
2. 如果资料不足，请明确标注“未核验”或“资料不足”，不要编造公司、代码、客户关系、订单、产能或业绩弹性。
3. 股票只作为题材映射与研究线索，不构成投资建议；不要给买入、卖出、目标价等交易指令。

请用中文 Markdown 输出：

## 题材结论
用 3-5 句话说明该题材的核心逻辑、产业化阶段、当前主要催化和最大不确定性。

## 题材图谱
用“上游 -> 中游 -> 下游/应用”的文字链路或表格展示完整结构；如存在关键设备、材料、工艺、系统集成、终端应用，请拆成细分方向。

## 上游
表格列：细分方向 | 作用 | 代表股票 | 关联逻辑 | 核验依据 | 风险点。

## 中游
表格列：细分方向 | 作用 | 代表股票 | 关联逻辑 | 核验依据 | 风险点。

## 下游
表格列：应用/客户方向 | 需求逻辑 | 代表股票 | 关联逻辑 | 核验依据 | 风险点。

## 重点股票映射
表格列：股票代码 | 股票名称 | 所属环节 | 题材相关性 | 需要继续验证的问题。优先覆盖题材列表自带股票，并补充联网核验到的高相关公司。

## 资料来源与不确定性
列出本次检索使用的主要来源名称/链接/时间，并说明哪些结论仍需二次验证。`
}
