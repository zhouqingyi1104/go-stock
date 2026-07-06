<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { useMessage } from 'naive-ui'
import {
  AbortSummaryStockNews,
  GetAiConfigs,
  HotTopic,
  OpenURL,
  SummaryStockNews
} from '../../wailsjs/go/main/App'
import { Environment, EventsOff, EventsOn } from '../../wailsjs/runtime'
import { buildTopicChainAnalysisPrompt } from './topicChainAnalysisPrompt.mjs'

const TOPIC_CHAIN_EVENT = 'topicChainAnalysis'

const message = useMessage()
const list = ref<any[]>([])
const task = ref<ReturnType<typeof setInterval> | null>(null)
const aiConfigs = ref<any[]>([])
const aiConfigId = ref<number | null>(null)
const thinkingMode = ref(true)

const analysisVisible = ref(false)
const analysisLoading = ref(false)
const selectedTopic = ref<any | null>(null)
const analysisContent = ref('')
const analysisReasoning = ref('')
const analysisModel = ref('')
const analysisTime = ref('')

const drawerTitle = computed(() => {
  const name = selectedTopic.value?.nickname || selectedTopic.value?.name
  return name ? `${name} 上下游分析` : '题材上下游分析'
})

onBeforeMount(async () => {
  EventsOn(TOPIC_CHAIN_EVENT, onTopicChainAnalysis)
  await Promise.all([loadHotTopics(), loadAiConfigs()])
  task.value = setInterval(loadHotTopics, 1000 * 10)
})

onUnmounted(() => {
  if (task.value) {
    clearInterval(task.value)
  }
  if (analysisLoading.value) {
    AbortSummaryStockNews().catch(() => {})
  }
  EventsOff(TOPIC_CHAIN_EVENT)
})

async function loadHotTopics() {
  list.value = await HotTopic(10)
}

async function loadAiConfigs() {
  const configs = await GetAiConfigs().catch(() => [])
  aiConfigs.value = Array.isArray(configs) ? configs : []
  const firstConfig = aiConfigs.value[0]
  aiConfigId.value = firstConfig?.ID ?? null
  if (typeof firstConfig?.thinking === 'boolean') {
    thinkingMode.value = firstConfig.thinking
  }
}

function openCenteredWindow(url: string | URL | undefined, width: number, height: number) {
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  Environment().then(env => {
    switch (env.platform) {
      case 'windows':
        window.open(
          url,
          'centeredWindow',
          `width=${width},height=${height},left=${left},top=${top}`
        )
        break
      default:
        if (url) OpenURL(url.toString())
        break
    }
  })
}

function showPage(htid: string | number) {
  openCenteredWindow(`https://gubatopic.eastmoney.com/topic_v3.html?htid=${htid}`, 1000, 600)
}

function isAnalyzingTopic(item: { htid: any }) {
  return analysisLoading.value && selectedTopic.value?.htid === item?.htid
}

async function analyzeTopic(item: any) {
  if (!item) return
  if (!aiConfigId.value) {
    await loadAiConfigs()
  }
  if (!aiConfigId.value) {
    message.warning('请先在设置中配置 AI')
    return
  }

  selectedTopic.value = item
  analysisVisible.value = true
  analysisLoading.value = true
  analysisContent.value = ''
  analysisReasoning.value = ''
  analysisModel.value = ''
  analysisTime.value = ''

  const prompt = buildTopicChainAnalysisPrompt(item)
  SummaryStockNews(prompt, aiConfigId.value, null, true, thinkingMode.value, TOPIC_CHAIN_EVENT, '')
    .catch(() => {
      analysisLoading.value = false
      message.error('AI 分析启动失败')
    })
}

function stopAnalysis() {
  if (!analysisLoading.value) return
  AbortSummaryStockNews().catch(() => {})
  analysisLoading.value = false
}

function closeAnalysis() {
  if (analysisLoading.value) {
    AbortSummaryStockNews().catch(() => {})
  }
  analysisLoading.value = false
  analysisVisible.value = false
}

function handleAnalysisVisibleUpdate(show: any) {
  if (show) {
    analysisVisible.value = true
    return
  }
  closeAnalysis()
}

function onTopicChainAnalysis(msg: any | string) {
  if (msg === 'DONE') {
    analysisLoading.value = false
    return
  }
  if (!msg || typeof msg !== 'object') return
  if (msg.content) {
    analysisContent.value += msg.content
  }
  if (msg.extraContent) {
    analysisContent.value += msg.extraContent
  }
  if (msg.reasoning_content) {
    analysisReasoning.value += msg.reasoning_content
  }
  if (msg.model) {
    analysisModel.value = msg.model
  }
  if (msg.time) {
    analysisTime.value = msg.time
  }
}
</script>

<template>
  <n-list bordered hoverable clickable>
    <n-list-item v-for="(item, index) in list" :key="item.htid || index">
      <n-thing
        :title="item.nickname"
        :description="item.desc"
        :description-style="'font-size: 14px;'"
        @click="showPage(item.htid)"
      >
        <template v-if="item.squareImg" #avatar>
          <n-avatar :src="item.squareImg" :size="60" />
        </template>
        <template v-if="item.stock_list" #footer>
          <n-flex>
            <n-tag
              v-for="(v, i) in item.stock_list"
              :key="v.code || v.name || i"
              type="info"
              :bordered="false"
              size="small"
            >
              {{ v.name }}
            </n-tag>
          </n-flex>
        </template>
        <template #header-extra>
          <n-flex align="center">
            <n-button
              secondary
              type="primary"
              size="tiny"
              :loading="isAnalyzingTopic(item)"
              @click.stop="analyzeTopic(item)"
            >
              上下游分析
            </n-button>
            <n-button v-if="item.clickNumber" secondary type="warning" size="tiny">
              讨论数：<n-number-animation show-separator :from="0" :to="item.postNumber" />
            </n-button>
            <n-tag v-if="item.clickNumber" :bordered="false" type="warning" size="small">
              浏览量：<n-number-animation show-separator :from="0" :to="item.clickNumber" />
            </n-tag>
          </n-flex>
        </template>
      </n-thing>
    </n-list-item>
  </n-list>

  <n-drawer
    :show="analysisVisible"
    :width="760"
    placement="right"
    @update:show="handleAnalysisVisibleUpdate"
  >
    <n-drawer-content :title="drawerTitle" closable>
      <div class="topic-chain-panel">
        <div class="topic-chain-header">
          <div class="topic-chain-meta">
            <div class="topic-chain-name">{{ selectedTopic?.nickname }}</div>
            <div v-if="selectedTopic?.desc" class="topic-chain-desc">{{ selectedTopic.desc }}</div>
            <div v-if="analysisModel || analysisTime" class="topic-chain-runtime">
              <span v-if="analysisModel">{{ analysisModel }}</span>
              <span v-if="analysisTime">{{ analysisTime }}</span>
            </div>
          </div>
          <n-flex>
            <n-button size="small" :loading="analysisLoading" @click="analyzeTopic(selectedTopic)">
              重新分析
            </n-button>
            <n-button v-if="analysisLoading" size="small" type="error" ghost @click="stopAnalysis">
              中断
            </n-button>
          </n-flex>
        </div>

        <n-alert
          v-if="analysisLoading && !analysisContent"
          type="info"
          :show-icon="false"
          class="topic-chain-status"
        >
          正在联网检索并分析...
        </n-alert>
        <n-alert
          v-else-if="!analysisLoading && !analysisContent"
          type="warning"
          :show-icon="false"
          class="topic-chain-status"
        >
          暂无分析结果
        </n-alert>

        <n-collapse v-if="analysisReasoning" class="topic-chain-reasoning">
          <n-collapse-item title="思考与工具调用" name="reasoning">
            <pre>{{ analysisReasoning }}</pre>
          </n-collapse-item>
        </n-collapse>

        <MdPreview
          v-if="analysisContent"
          editor-id="topic-chain-analysis-preview"
          :model-value="analysisContent"
          theme="light"
          class="topic-chain-markdown"
        />
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.topic-chain-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.topic-chain-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--n-border-color);
}

.topic-chain-meta {
  min-width: 0;
}

.topic-chain-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.topic-chain-desc {
  margin-top: 4px;
  color: var(--n-text-color-2);
  line-height: 1.6;
}

.topic-chain-runtime {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: var(--n-text-color-3);
  font-size: 12px;
}

.topic-chain-status {
  margin-top: 2px;
}

.topic-chain-reasoning pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.6;
}

.topic-chain-markdown {
  text-align: left;
}
</style>
