<template>
  <div class="report-list-page">
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">检测报告</h1>
        <p class="page-desc">查看所有品牌检测报告和竞品分析</p>
      </div>
      <el-button type="primary" @click="$router.push('/detection/create')">
        <el-icon><Plus /></el-icon>
        新建检测
      </el-button>
    </div>

    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="6">
          <el-select v-model="filters.brand" placeholder="全部品牌" clearable style="width: 100%">
            <el-option label="新航道" value="xhd" />
            <el-option label="环球雅思" value="hqys" />
            <el-option label="新东方" value="xdf" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 100%">
            <el-option label="品牌检测" value="detection" />
            <el-option label="竞品分析" value="competitor" />
            <el-option label="监测报告" value="monitor" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-input v-model="filters.keyword" placeholder="搜索报告..." clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总报告</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value primary">{{ stats.detection }}</div>
          <div class="stat-label">品牌检测</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value success">{{ stats.competitor }}</div>
          <div class="stat-label">竞品分析</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value warning">{{ stats.monitor }}</div>
          <div class="stat-label">监测报告</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报告表格 -->
    <el-card shadow="never">
      <el-table :data="filteredReports" stripe style="width: 100%">
        <el-table-column type="selection" width="50" />
        <el-table-column label="报告名称" min-width="250">
          <template #default="{ row }">
            <div class="report-name-cell">
              <el-icon class="report-icon" :class="getScoreClass(row.score)"><Document /></el-icon>
              <router-link :to="`/report/${row.id}`" class="report-link">{{ row.name }}</router-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="品牌" prop="brand" width="120" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getScoreTag(row.score)" size="small" effect="dark">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="平台" width="100">
          <template #default="{ row }">
            <span class="platform-count">{{ row.platforms }}个平台</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" width="160" sortable />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewReport(row)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button size="small" link type="primary" @click="exportReport(row)">
              <el-icon><Download /></el-icon> 导出
            </el-button>
            <el-button size="small" link type="danger" @click="deleteReport(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Document,
  View,
  Download,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()

const filters = reactive({
  brand: '',
  type: '',
  dateRange: null as any,
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 23
})

const stats = reactive({
  total: 23,
  detection: 18,
  competitor: 3,
  monitor: 2
})

const reports = ref([
  { id: '1', name: '新航道 - GEO检测报告', brand: '新航道', type: 'detection', score: 78, platforms: 4, createdAt: '2026-02-25 14:35' },
  { id: '2', name: '环球雅思 - 竞品分析', brand: '环球雅思', type: 'competitor', score: 85, platforms: 5, createdAt: '2026-02-15 09:15' },
  { id: '3', name: 'DeepSeek专项检测', brand: '新航道', type: 'detection', score: 15, platforms: 1, createdAt: '2026-01-28 11:30' },
  { id: '4', name: '新航道 - 周度监测', brand: '新航道', type: 'monitor', score: 73, platforms: 4, createdAt: '2026-02-18 10:20' },
  { id: '5', name: '新东方 - 竞品分析', brand: '新东方', type: 'competitor', score: 82, platforms: 5, createdAt: '2026-02-10 16:45' }
])

const filteredReports = computed(() => {
  let result = reports.value

  if (filters.brand) {
    result = result.filter(r => r.brand.includes(filters.brand))
  }

  if (filters.type) {
    result = result.filter(r => r.type === filters.type)
  }

  if (filters.keyword) {
    result = result.filter(r => r.name.toLowerCase().includes(filters.keyword.toLowerCase()))
  }

  return result
})

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    detection: '品牌检测',
    competitor: '竞品分析',
    monitor: '监测报告'
  }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, string> = {
    detection: '',
    competitor: 'warning',
    monitor: 'success'
  }
  return map[type] || ''
}

function getScoreTag(score: number) {
  if (score >= 80) return 'success'
  if (score >= 50) return ''
  return 'danger'
}

function getScoreClass(score: number) {
  if (score >= 80) return 'success'
  if (score >= 50) return 'normal'
  return 'danger'
}

function viewReport(row: any) {
  router.push(`/report/${row.id}`)
}

function exportReport(row: any) {
  ElMessage.success(`正在导出: ${row.name}`)
}

function deleteReport(row: any) {
  ElMessageBox.confirm(`确定要删除报告"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = reports.value.findIndex(r => r.id === row.id)
      if (idx > -1) {
        reports.value.splice(idx, 1)
        ElMessage.success('报告已删除')
      }
    })
    .catch(() => {})
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
}

function handlePageChange(page: number) {
  pagination.page = page
}
</script>

<style lang="scss" scoped>
.report-list-page {
  max-width: 1400px;
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

.filter-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;

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

.report-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-icon {
  font-size: 18px;

  &.success { color: #67c23a; }
  &.normal { color: #409eff; }
  &.danger { color: #f56c6c; }
}

.report-link {
  color: #303133;
  text-decoration: none;
  font-weight: 500;
}

.report-link:hover {
  color: #409eff;
}

.platform-count {
  font-size: 13px;
  color: #909399;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
REPORTLISTEOF
echo "✅ 报告列表页已完成"
