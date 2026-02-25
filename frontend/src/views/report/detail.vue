<template>
  <div class="report-detail-page">
    <!-- 报告头部 -->
    <div class="report-header">
      <div class="report-meta">
        <el-page-header @back="$router.back()">
          <template #content>
            <span class="report-title">{{ report.brand }} - GEO检测报告</span>
          </template>
        </el-page-header>
        <div class="report-info">
          <span class="info-item">
            <el-icon><Calendar /></el-icon>
            {{ report.createdAt }}
          </span>
          <span class="info-item">
            <el-icon><CollectionTag /></el-icon>
            {{ report.keywords }}个关键词
          </span>
          <span class="info-item">
            <el-icon><Monitor /></el-icon>
            {{ report.platforms }}个平台
          </span>
        </div>
      </div>
      <div class="report-actions">
        <el-button @click="exportPDF">
          <el-icon><Download /></el-icon>
          导出PDF
        </el-button>
        <el-button @click="shareReport">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-button type="primary" @click="reDetect">
          <el-icon><Refresh /></el-icon>
          重新检测
        </el-button>
      </div>
    </div>

    <!-- 执行摘要 -->
    <el-card shadow="never" class="summary-card">
      <el-row :gutter="24">
        <el-col :xs="24" :md="8">
          <div class="score-section">
            <div class="score-circle">
              <el-progress
                type="dashboard"
                :percentage="report.score"
                :color="getScoreColor(report.score)"
                :width="160"
              >
                <template #default="{ percentage }">
                  <span class="score-value">{{ percentage }}</span>
                  <span class="score-label">GEO健康度</span>
                </template>
              </el-progress>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :md="16">
          <div class="breakdown-section">
            <h3 class="section-title">维度分数</h3>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <span class="breakdown-label">平台覆盖率</span>
                <el-progress :percentage="75" :stroke-width="10" />
                <span class="breakdown-value">75%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">关键词提及率</span>
                <el-progress :percentage="67" :stroke-width="10" />
                <span class="breakdown-value">67%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">平均排名</span>
                <el-progress :percentage="50" :stroke-width="10" status="warning" />
                <span class="breakdown-value">第2名</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">正面情感</span>
                <el-progress :percentage="82" :stroke-width="10" status="success" />
                <span class="breakdown-value">82%</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-divider />

      <div class="findings-section">
        <h3 class="section-title">核心发现</h3>
        <div class="findings-list">
          <el-alert
            v-for="(finding, idx) in findings"
            :key="idx"
            :title="finding.title"
            :type="finding.type"
            show-icon
            :closable="false"
            class="finding-item"
          />
        </div>
      </div>
    </el-card>

    <!-- Tab 切换 -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <!-- 平台分析 -->
        <el-tab-pane name="platform">
          <template #label>
            <span class="tab-label"><el-icon><Monitor /></el-icon> 平台分析</span>
          </template>
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" v-for="platform in platformResults" :key="platform.name">
              <el-card shadow="never" class="platform-result-card">
                <div class="platform-header">
                  <el-avatar :size="44" :style="{ background: platform.gradient }">
                    <el-icon><component :is="platform.icon" /></el-icon>
                  </el-avatar>
                  <div class="platform-info">
                    <span class="platform-name">{{ platform.name }}</span>
                    <el-tag :type="platform.mentioned ? 'success' : 'danger'" size="small">
                      {{ platform.mentioned ? '已提及' : '未提及' }}
                    </el-tag>
                  </div>
                  <div class="platform-score">
                    <span class="score" :class="{ low: platform.score < 30 }">{{ platform.score }}</span>
                  </div>
                </div>
                <div class="platform-metrics">
                  <div class="metric">
                    <span class="metric-label">排名</span>
                    <span class="metric-value">{{ platform.rank || '--' }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">情感</span>
                    <span class="metric-value">{{ platform.sentiment || '--' }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">引用数</span>
                    <span class="metric-value">{{ platform.citations }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 竞品对比 -->
        <el-tab-pane name="competitor">
          <template #label>
            <span class="tab-label"><el-icon><DataLine /></el-icon> 竞品对比</span>
          </template>
          <el-table :data="competitors" stripe>
            <el-table-column label="维度" prop="dimension" />
            <el-table-column label="新航道">
              <template #default="{ row }">
                <span :class="{ 'text-success': row.ours > row.theirs, 'text-danger': row.ours < row.theirs }">
                  {{ row.ours }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="环球雅思">
              <template #default="{ row }">
                <span :class="{ 'text-success': row.theirs > row.ours, 'text-danger': row.theirs < row.ours }">
                  {{ row.theirs }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="差距">
              <template #default="{ row }">
                <span :class="{ 'text-success': row.ours > row.theirs, 'text-danger': row.ours < row.theirs }">
                  {{ row.ours > row.theirs ? '+' : '' }}{{ row.ours - row.theirs }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 引用来源 -->
        <el-tab-pane name="source">
          <template #label>
            <span class="tab-label"><el-icon><Link /></el-icon> 引用来源</span>
          </template>
          <div class="source-stats">
            <el-row :gutter="16">
              <el-col :xs="12" :sm="6" v-for="stat in sourceStats" :key="stat.label">
                <el-card shadow="hover" class="source-stat-card">
                  <el-icon :size="24" class="stat-icon"><component :is="stat.icon" /></el-icon>
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          <div class="source-list">
            <div v-for="(source, idx) in sources" :key="idx" class="source-item">
              <el-tag :type="source.type === 'ranking' ? 'warning' : 'primary'" size="small">
                {{ source.type === 'ranking' ? '排名' : '评测' }}
              </el-tag>
              <a href="#" class="source-link">{{ source.title }}</a>
              <span class="source-count">引用{{ source.count }}次</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- 优化建议 -->
        <el-tab-pane name="suggestion">
          <template #label>
            <span class="tab-label"><el-icon><Opportunity /></el-icon> 优化建议</span>
          </template>
          <div class="suggestion-groups">
            <div class="suggestion-group">
              <h4 class="group-title">
                <el-icon><WarningFilled /></el-icon>
                立即执行 (1-2周)
              </h4>
              <el-alert
                v-for="(s, idx) in immediateSuggestions"
                :key="idx"
                :title="s.title"
                :description="s.desc"
                type="error"
                show-icon
                :closable="false"
                class="suggestion-alert"
              >
                <template #default>
                  <div class="suggestion-meta">
                    <span><el-icon><TrendCharts /></el-icon> 预期效果: {{ s.effect }}</span>
                    <span><el-icon><Timer /></el-icon> 执行时间: {{ s.time }}</span>
                  </div>
                  <el-button type="primary" size="small" style="margin-top: 12px">
                    <el-icon><EditPen /></el-icon> 生成内容
                  </el-button>
                </template>
              </el-alert>
            </div>

            <div class="suggestion-group">
              <h4 class="group-title">
                <el-icon><Clock /></el-icon>
                短期规划 (1-3月)
              </h4>
              <el-alert
                title="完善百度百科词条"
                description="百科内容被多个AI平台信任引用"
                type="warning"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  CollectionTag,
  Monitor,
  Download,
  Share,
  Refresh,
  DataLine,
  Link,
  Opportunity,
  WarningFilled,
  TrendCharts,
  Timer,
  EditPen,
  Clock,
  Sunny,
  MagicStick,
  Collection,
  Moon,
  Tickets
} from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('platform')

const report = reactive({
  brand: '新航道',
  score: 78,
  keywords: 3,
  platforms: 4,
  createdAt: '2026-02-25 14:35'
})

const findings = [
  { title: '在豆包、元宝、Kimi三大平台均有提及', type: 'success' },
  { title: '"福州雅思培训"关键词在豆包中排名第一', type: 'success' },
  { title: 'DeepSeek平台未被提及，建议重点优化', type: 'warning' },
  { title: '竞品"环球雅思"在豆包中被多次提及', type: 'info' }
]

const platformResults = [
  { name: '豆包', icon: 'Sunny', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', score: 92, mentioned: true, rank: '第1名', sentiment: '正面', citations: 8 },
  { name: 'DeepSeek', icon: 'MagicStick', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', score: 15, mentioned: false, rank: null, sentiment: null, citations: 0 },
  { name: '元宝', icon: 'Collection', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', score: 78, mentioned: true, rank: '第2名', sentiment: '正面', citations: 4 },
  { name: 'Kimi', icon: 'Moon', gradient: 'linear-gradient(135deg, #5B86E5, #36D7DC)', score: 71, mentioned: true, rank: '第3名', sentiment: '中性', citations: 2 }
]

const competitors = [
  { dimension: '平台覆盖率', ours: 75, theirs: 100 },
  { dimension: '关键词提及率', ours: 67, theirs: 83 },
  { dimension: '平均排名', ours: 1.5, theirs: 2 },
  { dimension: '正面情感', ours: 82, theirs: 75 }
]

const sourceStats = [
  { icon: 'Tickets', label: '总引用', value: 14 },
  { icon: 'Sunny', label: '排名榜单', value: 8 },
  { icon: 'EditPen', label: '评测对比', value: 4 },
  { icon: 'QuestionFilled', label: '问答攻略', value: 2 }
]

const sources = [
  { type: 'ranking', title: '福州雅思培训机构排名 2026实评版', count: 3 },
  { type: 'ranking', title: '福州市英语雅思培训机构推荐', count: 2 },
  { type: 'review', title: '福州热门雅思机构测评与推荐', count: 1 }
]

const immediateSuggestions = [
  { title: 'DeepSeek平台急需优化', desc: '当前在该平台完全未被提及，建议立即布局技术文档和FAQ内容', effect: '覆盖率+20%', time: '3-5天' },
  { title: '发布排名榜单内容', desc: '豆包偏好排名类内容，预期提升引用率40%', effect: '引用率+40%', time: '2-3天' }
]

function getScoreColor(score: number) {
  if (score >= 80) return '#67c23a'
  if (score >= 50) return '#409eff'
  return '#f56c6c'
}

function exportPDF() {
  ElMessage.success('PDF导出功能开发中')
}

function shareReport() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    ElMessage.success('链接已复制')
  })
}

function reDetect() {
  router.push('/detection/create')
}
</script>

<style lang="scss" scoped>
.report-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.report-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-title {
  font-size: 20px;
  font-weight: 600;
}

.report-info {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.summary-card {
  margin-bottom: 20px;
}

.score-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.score-value {
  font-size: 42px;
  font-weight: 700;
  color: #303133;
}

.score-label {
  font-size: 13px;
  color: #909399;
  display: block;
  margin-top: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 100px 1fr 50px;
  align-items: center;
  gap: 12px;
}

.breakdown-label {
  font-size: 13px;
  color: #606266;
}

.breakdown-value {
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.findings-section {
  margin-top: 20px;
}

.finding-item {
  margin-bottom: 12px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.platform-result-card {
  margin-bottom: 16px;
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.platform-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.platform-name {
  font-size: 15px;
  font-weight: 500;
}

.platform-score .score {
  font-size: 20px;
  font-weight: 700;
  color: #67c23a;

  &.low { color: #f56c6c; }
}

.platform-metrics {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.metric {
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
}

.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }

.source-stats {
  margin-bottom: 20px;
}

.source-stat-card {
  text-align: center;
  padding: 16px;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-icon {
  color: #409eff;
  margin-bottom: 8px;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.source-link {
  flex: 1;
  color: #303133;
  text-decoration: none;
}

.source-link:hover {
  color: #409eff;
}

.source-count {
  font-size: 12px;
  color: #909399;
}

.suggestion-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.suggestion-alert {
  margin-bottom: 12px;
}

.suggestion-meta {
  display: flex;
  gap: 20px;
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
}
</style>
REPORTDETAILEOF
echo "✅ 报告详情页已完成"
