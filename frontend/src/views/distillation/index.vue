<template>
  <div class="distillation-page">
    <div class="page-header">
      <h1 class="page-title">AI关键词蒸馏</h1>
      <p class="page-desc">输入核心词，AI自动生成50+相关关键词，覆盖搜索、问答、品牌三大场景</p>
    </div>

    <!-- 配置卡片 -->
    <el-card shadow="never" class="config-card">
      <template #header>
        <div class="card-header-row">
          <div class="card-header-left">
            <el-icon class="card-icon"><MagicStick /></el-icon>
            <span class="card-title">蒸馏配置</span>
          </div>
          <el-tag type="info">
            <el-icon><Timer /></el-icon>
            本月剩余: <strong>5</strong> 次
          </el-tag>
        </div>
      </template>
      <el-form :model="formData" :rules="rules" ref="formRef" label-position="top">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="核心词" prop="keyword">
              <el-input v-model="formData.keyword" placeholder="输入核心业务词，如：雅思培训">
                <template #prefix>
                  <el-icon><EditPen /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="行业分类" prop="industry">
              <el-select v-model="formData.industry" placeholder="请选择行业" style="width: 100%">
                <el-option label="教育培训" value="education" />
                <el-option label="餐饮美食" value="food" />
                <el-option label="运动健身" value="fitness" />
                <el-option label="医疗健康" value="medical" />
                <el-option label="金融理财" value="finance" />
                <el-option label="科技互联网" value="tech" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="目标地域">
              <el-input v-model="formData.region" placeholder="如：福州、北京">
                <template #prefix>
                  <el-icon><Location /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="词类型">
              <el-checkbox-group v-model="formData.types">
                <el-checkbox label="search">
                  <el-icon><Search /></el-icon> 搜索词
                </el-checkbox>
                <el-checkbox label="question">
                  <el-icon><QuestionFilled /></el-icon> 问答词
                </el-checkbox>
                <el-checkbox label="brand">
                  <el-icon><PriceTag /></el-icon> 品牌词
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="form-actions">
          <el-button type="primary" size="large" @click="startDistillation" :loading="distilling">
            <el-icon><Position /></el-icon>
            开始蒸馏
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 结果区域 -->
    <template v-if="showResults">
      <!-- 统计 -->
      <el-row :gutter="16" class="result-stats">
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-box">
            <div class="stat-value">{{ totalCount }}</div>
            <div class="stat-label">总关键词</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-box">
            <div class="stat-value primary">{{ results.search.length }}</div>
            <div class="stat-label">搜索词</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-box">
            <div class="stat-value success">{{ results.question.length }}</div>
            <div class="stat-label">问答词</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-box">
            <div class="stat-value warning">{{ results.brand.length }}</div>
            <div class="stat-label">品牌词</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 结果卡片 -->
      <el-card shadow="never">
        <el-tabs v-model="activeTab">
          <el-tab-pane name="search">
            <template #label>
              <span class="tab-label">
                <el-icon><Search /></el-icon>
                搜索词
                <el-badge :value="results.search.length" type="primary" />
              </span>
            </template>
            <div class="panel-header">
              <span class="panel-title">搜索词列表</span>
              <div class="panel-actions">
                <el-button size="small" @click="copyAll('search')">
                  <el-icon><DocumentCopy /></el-icon>
                  复制全部
                </el-button>
                <el-button type="primary" size="small" @click="addToDetection('search')">
                  <el-icon><Plus /></el-icon>
                  添加到检测
                </el-button>
              </div>
            </div>
            <div class="keyword-grid">
              <el-check-tag
                v-for="(kw, idx) in results.search"
                :key="idx"
                :checked="selectedKeywords.search.includes(kw)"
                @change="toggleKeyword('search', kw)"
                class="keyword-tag"
              >
                {{ kw }}
              </el-check-tag>
            </div>
          </el-tab-pane>

          <el-tab-pane name="question">
            <template #label>
              <span class="tab-label">
                <el-icon><QuestionFilled /></el-icon>
                问答词
                <el-badge :value="results.question.length" type="success" />
              </span>
            </template>
            <div class="panel-header">
              <span class="panel-title">问答词列表</span>
              <div class="panel-actions">
                <el-button size="small" @click="copyAll('question')">
                  <el-icon><DocumentCopy /></el-icon>
                  复制全部
                </el-button>
                <el-button type="primary" size="small" @click="addToDetection('question')">
                  <el-icon><Plus /></el-icon>
                  添加到检测
                </el-button>
              </div>
            </div>
            <div class="keyword-grid">
              <el-check-tag
                v-for="(kw, idx) in results.question"
                :key="idx"
                :checked="selectedKeywords.question.includes(kw)"
                @change="toggleKeyword('question', kw)"
                class="keyword-tag"
              >
                {{ kw }}
              </el-check-tag>
            </div>
          </el-tab-pane>

          <el-tab-pane name="brand">
            <template #label>
              <span class="tab-label">
                <el-icon><PriceTag /></el-icon>
                品牌词
                <el-badge :value="results.brand.length" type="warning" />
              </span>
            </template>
            <div class="panel-header">
              <span class="panel-title">品牌词列表</span>
              <div class="panel-actions">
                <el-button size="small" @click="copyAll('brand')">
                  <el-icon><DocumentCopy /></el-icon>
                  复制全部
                </el-button>
                <el-button type="primary" size="small" @click="addToDetection('brand')">
                  <el-icon><Plus /></el-icon>
                  添加到检测
                </el-button>
              </div>
            </div>
            <div class="keyword-grid">
              <el-check-tag
                v-for="(kw, idx) in results.brand"
                :key="idx"
                :checked="selectedKeywords.brand.includes(kw)"
                @change="toggleKeyword('brand', kw)"
                class="keyword-tag"
              >
                {{ kw }}
              </el-check-tag>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <!-- 历史记录 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header-row">
          <div class="card-header-left">
            <el-icon class="card-icon"><Clock /></el-icon>
            <span class="card-title">蒸馏历史</span>
          </div>
        </div>
      </template>
      <el-table :data="history" stripe>
        <el-table-column label="核心词" prop="keyword" />
        <el-table-column label="行业" prop="industry" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getIndustryLabel(row.industry) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生成数量" prop="count" width="100" />
        <el-table-column label="时间" prop="time" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="reuseHistory(row)">复用</el-button>
            <el-button size="small" link type="primary" @click="viewHistory(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Timer,
  EditPen,
  Location,
  Search,
  QuestionFilled,
  PriceTag,
  Position,
  Plus,
  DocumentCopy,
  Clock
} from '@element-plus/icons-vue'

const formRef = ref()
const distilling = ref(false)
const showResults = ref(false)
const activeTab = ref('search')

const formData = reactive({
  keyword: '',
  industry: '',
  region: '',
  types: ['search', 'question', 'brand']
})

const rules = {
  keyword: [{ required: true, message: '请输入核心词', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择行业', trigger: 'change' }]
}

const results = reactive({
  search: [] as string[],
  question: [] as string[],
  brand: [] as string[]
})

const selectedKeywords = reactive({
  search: [] as string[],
  question: [] as string[],
  brand: [] as string[]
})

const history = ref([
  { keyword: '雅思培训', industry: 'education', count: 78, time: '2026-02-24 15:32' },
  { keyword: '健身教练', industry: 'fitness', count: 65, time: '2026-02-23 10:15' }
])

const totalCount = computed(() => results.search.length + results.question.length + results.brand.length)

const industryMap: Record<string, string> = {
  education: '教育培训',
  food: '餐饮美食',
  fitness: '运动健身',
  medical: '医疗健康',
  finance: '金融理财',
  tech: '科技互联网'
}

function getIndustryLabel(key: string) {
  return industryMap[key] || key
}

function startDistillation() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return

    if (formData.types.length === 0) {
      ElMessage.warning('请至少选择一种词类型')
      return
    }

    distilling.value = true

    // 模拟蒸馏
    setTimeout(() => {
      generateResults()
      distilling.value = false
      showResults.value = true
      ElMessage.success('关键词蒸馏完成！')
    }, 2000)
  })
}

function generateResults() {
  const kw = formData.keyword
  const region = formData.region

  results.search = [
    `${kw}哪家好`, `${kw}排名`, `${kw}价格`, `${kw}多少钱`,
    `${kw}口碑`, `${kw}推荐`, `${kw}评价`, `${kw}怎么样`,
    `${region}${kw}`, `${region}${kw}哪家好`, `${kw}怎么选`,
    `${kw}避坑`, `${kw}攻略`, `${kw}机构`, `${kw}培训班`
  ]

  results.question = [
    `${kw}哪家效果好`, `${kw}需要多少钱`, `${kw}怎么选择`,
    `${kw}要注意什么`, `${kw}有什么坑`, `${kw}多久能学会`,
    `${kw}难不难`, `${kw}有没有用`, `${kw}值不值得报`, `${kw}效果怎么样`
  ]

  results.brand = [
    `${kw}官网`, `${kw}电话`, `${kw}地址`,
    `${kw}营业时间`, `${kw}师资`, `${kw}怎么样`,
    `${kw}好不好`, `${kw}靠谱吗`, `${kw}口碑如何`, `${kw}评价`
  ]

  // 默认全选
  selectedKeywords.search = [...results.search]
  selectedKeywords.question = [...results.question]
  selectedKeywords.brand = [...results.brand]
}

function toggleKeyword(type: string, kw: string) {
  const list = selectedKeywords[type as keyof typeof selectedKeywords]
  const idx = list.indexOf(kw)
  if (idx > -1) {
    list.splice(idx, 1)
  } else {
    list.push(kw)
  }
}

function copyAll(type: string) {
  const text = results[type as keyof typeof results].join('\n')
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

function addToDetection(type: string) {
  const list = selectedKeywords[type as keyof typeof selectedKeywords]
  if (list.length === 0) {
    ElMessage.warning('请先选择关键词')
    return
  }

  const existing = JSON.parse(localStorage.getItem('geo_selected_keywords') || '[]')
  const merged = [...new Set([...existing, ...list])]
  localStorage.setItem('geo_selected_keywords', JSON.stringify(merged))

  ElMessage.success(`已添加 ${list.length} 个关键词`)
}

function reuseHistory(row: any) {
  formData.keyword = row.keyword
  formData.industry = row.industry
  ElMessage.success('已填充历史配置')
}

function viewHistory(row: any) {
  ElMessage.info('查看历史详情功能开发中')
}
</script>

<style lang="scss" scoped>
.distillation-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.page-desc {
  color: #909399;
  font-size: 14px;
}

.config-card {
  margin-bottom: 20px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 18px;
  color: #409eff;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.result-stats {
  margin-bottom: 20px;
}

.stat-box {
  text-align: center;
  padding: 16px;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;

  &.primary { color: #409eff; }
  &.success { color: #67c23a; }
  &.warning { color: #e6a23c; }
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.keyword-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.keyword-tag {
  font-size: 13px;
}
</style>
DISTILLATIONEOF
echo "✅ AI蒸馏页已完成"
