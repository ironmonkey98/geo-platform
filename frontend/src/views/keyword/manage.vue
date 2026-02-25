<template>
  <div class="keyword-manage-page">
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">关键词库</h1>
        <p class="page-desc">管理所有蒸馏生成的关键词，支持批量操作和检测</p>
      </div>
      <div class="page-header-right">
        <el-button @click="importKeywords">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button type="primary" @click="$router.push('/distillation')">
          <el-icon><Plus /></el-icon>
          添加关键词
        </el-button>
      </div>
    </div>

    <!-- 统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card blue">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总关键词</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card green">
          <div class="stat-value">{{ stats.search }}</div>
          <div class="stat-label">搜索词</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card orange">
          <div class="stat-value">{{ stats.question }}</div>
          <div class="stat-label">问答词</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card purple">
          <div class="stat-value">{{ stats.brand }}</div>
          <div class="stat-label">品牌词</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关键词分组 -->
    <el-card shadow="never">
      <div v-for="(group, gIdx) in keywordGroups" :key="gIdx" class="keyword-group">
        <div class="group-header">
          <el-icon class="group-icon"><component :is="group.icon" /></el-icon>
          <span class="group-title">{{ group.name }} ({{ group.keywords.length }})</span>
          <div class="group-actions">
            <el-button size="small" @click="selectAll(group.type)">全选</el-button>
            <el-button size="small" type="primary" @click="batchDetect(group.type)">批量检测</el-button>
          </div>
        </div>
        <div class="keyword-tags">
          <el-check-tag
            v-for="(kw, idx) in group.keywords"
            :key="idx"
            :checked="selectedKeywords.includes(kw)"
            @change="toggleKeyword(kw)"
            class="keyword-tag"
          >
            <el-icon v-if="kw.source === 'distill'" class="source-icon"><MagicStick /></el-icon>
            <el-icon v-else class="source-icon"><EditPen /></el-icon>
            {{ kw.text }}
          </el-check-tag>
          <span class="more-tag" @click="showMore(group.type)">+{{ group.more }} 更多</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  Plus,
  Search,
  QuestionFilled,
  PriceTag,
  MagicStick,
  EditPen
} from '@element-plus/icons-vue'

const selectedKeywords = ref<string[]>([])

const stats = reactive({
  total: 156,
  search: 68,
  question: 52,
  brand: 36
})

const keywordGroups = ref([
  {
    type: 'search',
    name: '搜索词',
    icon: 'Search',
    keywords: [
      { text: '福州雅思培训', source: 'distill' },
      { text: '雅思培训机构排名', source: 'distill' },
      { text: '雅思培训哪家好', source: 'manual' },
      { text: '雅思培训班多少钱', source: 'distill' }
    ],
    more: 64
  },
  {
    type: 'question',
    name: '问答词',
    icon: 'QuestionFilled',
    keywords: [
      { text: '雅思培训哪家效果好', source: 'distill' },
      { text: '雅思培训需要多少钱', source: 'distill' }
    ],
    more: 50
  },
  {
    type: 'brand',
    name: '品牌词',
    icon: 'PriceTag',
    keywords: [
      { text: '新航道官网', source: 'distill' }
    ],
    more: 35
  }
])

function toggleKeyword(kw: string) {
  const idx = selectedKeywords.value.indexOf(kw)
  if (idx > -1) {
    selectedKeywords.value.splice(idx, 1)
  } else {
    selectedKeywords.value.push(kw)
  }
}

function selectAll(type: string) {
  const group = keywordGroups.value.find(g => g.type === type)
  if (group) {
    group.keywords.forEach(kw => {
      if (!selectedKeywords.value.includes(kw.text)) {
        selectedKeywords.value.push(kw.text)
      }
    })
    ElMessage.success('已全选')
  }
}

function batchDetect(type: string) {
  const group = keywordGroups.value.find(g => g.type === type)
  if (group) {
    const count = group.keywords.length
    ElMessage.success(`已添加 ${count} 个关键词到检测任务`)
  }
}

function showMore(type: string) {
  ElMessage.info(`展开${type}类型全部关键词`)
}

function importKeywords() {
  ElMessage.info('导入功能开发中')
}
</script>

<style lang="scss" scoped>
.keyword-manage-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-header-right {
  display: flex;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border-top: 3px solid;

  &.blue { border-color: #409eff; }
  &.green { border-color: #67c23a; }
  &.orange { border-color: #e6a23c; }
  &.purple { border-color: #a855f7; }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.keyword-group {
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.group-icon {
  font-size: 20px;
  color: #409eff;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.source-icon {
  font-size: 12px;
  color: #909399;
}

.more-tag {
  padding: 6px 12px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.more-tag:hover {
  background: rgba(64, 158, 255, 0.2);
}
</style>
KEYWORDMANAGEEOF
echo "✅ 关键词管理页已完成"
