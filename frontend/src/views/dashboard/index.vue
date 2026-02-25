<template>
  <div class="dashboard-page">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-content">
        <div>
          <h1 class="welcome-title">
            早上好，张三
            <el-icon class="wave-icon"><Sunny /></el-icon>
          </h1>
          <p class="welcome-desc">今天是优化品牌AI认知度的好日子，让我们开始吧！</p>
        </div>
        <el-button type="primary" size="large" @click="$router.push('/detection/create')">
          <el-icon><Position /></el-icon>
          开始检测
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-avatar :size="44" class="stat-icon blue">
              <el-icon><Odometer /></el-icon>
            </el-avatar>
            <span class="stat-label">GEO 健康度</span>
          </div>
          <div class="stat-body">
            <span class="stat-value">78</span>
            <el-tag type="success" size="small">
              <el-icon><Top /></el-icon> +5 较上周
            </el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-avatar :size="44" class="stat-icon green">
              <el-icon><Monitor /></el-icon>
            </el-avatar>
            <span class="stat-label">平台覆盖</span>
          </div>
          <div class="stat-body">
            <span class="stat-value">4/5</span>
            <el-tag type="success" size="small">
              <el-icon><Top /></el-icon> +1 新增
            </el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-avatar :size="44" class="stat-icon orange">
              <el-icon><PriceTag /></el-icon>
            </el-avatar>
            <span class="stat-label">关键词库</span>
          </div>
          <div class="stat-body">
            <span class="stat-value">156</span>
            <el-tag type="success" size="small">
              <el-icon><Top /></el-icon> +12 本月
            </el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-avatar :size="44" class="stat-icon purple">
              <el-icon><Tickets /></el-icon>
            </el-avatar>
            <span class="stat-label">检测报告</span>
          </div>
          <div class="stat-body">
            <span class="stat-value">23</span>
            <el-tag type="success" size="small">
              <el-icon><Top /></el-icon> +3 本月
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 双列布局 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><Aim /></el-icon>
              <span class="card-title">平台表现</span>
            </div>
          </template>
          <div class="platform-list">
            <div v-for="platform in platforms" :key="platform.name" class="platform-item">
              <el-avatar :size="44" :style="{ background: platform.gradient }">
                <el-icon><component :is="platform.icon" /></el-icon>
              </el-avatar>
              <div class="platform-info">
                <span class="platform-name">{{ platform.name }}</span>
                <span :class="['platform-status', platform.statusClass]">{{ platform.status }}</span>
              </div>
              <div class="platform-score">
                <el-progress
                  :percentage="platform.score"
                  :stroke-width="8"
                  :color="platform.score < 30 ? '#f56c6c' : '#67c23a'"
                  :show-text="false"
                />
                <span class="score-text" :class="{ low: platform.score < 30 }">{{ platform.score }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon class="card-icon"><Opportunity /></el-icon>
              <span class="card-title">优化建议</span>
            </div>
          </template>
          <div class="suggestion-list">
            <el-alert
              v-for="(suggestion, index) in suggestions"
              :key="index"
              :title="suggestion.title"
              :description="suggestion.desc"
              :type="suggestion.type"
              show-icon
              :closable="false"
              class="suggestion-item"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card shadow="never" class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <el-icon class="card-icon"><Promotion /></el-icon>
          <span class="card-title">快捷操作</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" v-for="action in quickActions" :key="action.path">
          <el-card
            shadow="hover"
            class="quick-action-card"
            @click="$router.push(action.path)"
          >
            <el-avatar :size="48" class="action-icon">
              <el-icon><component :is="action.icon" /></el-icon>
            </el-avatar>
            <div class="action-content">
              <span class="action-title">{{ action.title }}</span>
              <span class="action-desc">{{ action.desc }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  Position,
  Odometer,
  Monitor,
  PriceTag,
  Tickets,
  Aim,
  Opportunity,
  Promotion,
  Top,
  Sunny,
  Search,
  CirclePlus,
  Edit,
  MagicStick,
  Document,
  Collection
} from '@element-plus/icons-vue'

const platforms = reactive([
  { name: '豆包', icon: 'Sunny', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', score: 92, status: '第1名', statusClass: 'success' },
  { name: 'DeepSeek', icon: 'MagicStick', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', score: 15, status: '需优化', statusClass: 'warning' },
  { name: '元宝', icon: 'Collection', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', score: 78, status: '表现良好', statusClass: 'success' },
  { name: 'Kimi', icon: 'Sunny', gradient: 'linear-gradient(135deg, #5B86E5, #36D7DC)', score: 71, status: '表现良好', statusClass: 'success' }
])

const suggestions = reactive([
  { title: 'DeepSeek平台急需优化', desc: '当前在该平台完全未被提及，建议立即布局技术文档', type: 'error' as const },
  { title: '发布排名榜单内容', desc: '豆包偏好排名类内容，预期提升引用率40%', type: 'warning' as const },
  { title: '完善百度百科词条', desc: '百科内容被多个AI平台信任引用', type: 'info' as const }
])

const quickActions = [
  { icon: 'Search', title: '创建检测', desc: '检测品牌AI认知度', path: '/detection/create' },
  { icon: 'MagicStick', title: 'AI蒸馏', desc: '生成50+关键词', path: '/distillation' },
  { icon: 'Edit', title: '内容生成', desc: 'GEO优化模板', path: '/content/generator' },
  { icon: 'Tickets', title: '查看报告', desc: '历史检测报告', path: '/report' }
]
</script>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  color: #fff;
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  .wave-icon {
    animation: wave 1s ease-in-out infinite;
    display: inline-block;
  }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

.welcome-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-icon {
  &.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  &.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  &.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  &.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-body {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 18px;
  color: #3b82f6;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.platform-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
}

.platform-status {
  font-size: 12px;

  &.success { color: #67c23a; }
  &.warning { color: #e6a23c; }
}

.platform-score {
  width: 140px;
  display: flex;
  align-items: center;
  gap: 12px;

  .el-progress {
    flex: 1;
  }

  .score-text {
    font-size: 14px;
    font-weight: 600;
    min-width: 28px;
    text-align: right;

    &.low { color: #f56c6c; }
  }
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-actions-card {
  :deep(.el-card__body) {
    padding-top: 0;
  }
}

.quick-action-card {
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;

  :deep(.el-card__body) {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &:hover {
    transform: translateY(-2px);
  }
}

.action-icon {
  background: #f5f7fa;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-title {
  font-size: 14px;
  font-weight: 500;
}

.action-desc {
  font-size: 12px;
  color: #909399;
}
</style>
DASHBOARDEOF
echo "✅ Dashboard 已修复 - 移除所有 Emoji，使用 Element Plus Icons"
