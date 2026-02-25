<template>
  <div class="detection-progress-page">
    <!-- 进度卡片 -->
    <el-card class="progress-card" :body-style="{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '24px' }">
      <div class="progress-header">
        <div>
          <h2 style="color: #fff; margin: 0 0 8px">检测进行中</h2>
          <el-progress
            :percentage="progress"
            :stroke-width="12"
            :show-text="false"
            style="width: 300px"
          />
        </div>
        <div style="text-align: right; color: #fff">
          <div style="font-size: 32px; font-weight: 700">{{ progress }}%</div>
          <div style="opacity: 0.8">
            <el-icon><Timer /></el-icon>
            预计剩余 {{ remainingTime }}
          </div>
        </div>
      </div>
      <el-steps :active="currentStep" finish-status="success" simple style="margin-top: 20px">
        <el-step title="初始化" />
        <el-step title="数据采集" />
        <el-step title="结果分析" />
        <el-step title="生成报告" />
      </el-steps>
    </el-card>

    <!-- 平台状态 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header-with-icon">
          <el-icon><Search /></el-icon>
          <span class="card-title">平台检测状态</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" v-for="platform in platforms" :key="platform.name">
          <el-card shadow="never" class="platform-status-card">
            <div class="platform-header">
              <el-avatar :size="40" :style="{ background: platform.gradient }">
                <el-icon><component :is="platform.icon" /></el-icon>
              </el-avatar>
              <div class="platform-info">
                <div class="platform-name">{{ platform.name }}</div>
                <el-tag :type="platform.statusType" size="small">{{ platform.status }}</el-tag>
              </div>
              <span class="platform-progress">{{ platform.progress }}/{{ platform.total }}</span>
            </div>
            <el-progress :percentage="platform.progress / platform.total * 100" :show-text="false" style="margin-top: 12px" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>检测完成后将自动跳转到报告页面</template>
      </el-alert>
      <div>
        <el-button @click="cancelDetection">取消检测</el-button>
        <el-button type="primary" :disabled="!completed" @click="viewReport">
          <el-icon><View /></el-icon>
          查看报告
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer,
  Search,
  View,
  Sunny,
  MagicStick,
  Collection,
  Moon
} from '@element-plus/icons-vue'

const router = useRouter()
const progress = ref(0)
const currentStep = ref(0)
const remainingTime = ref('2分钟')
const completed = ref(false)

const platforms = ref([
  { name: '豆包', icon: 'Sunny', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', status: '等待中', statusType: 'info' as const, progress: 0, total: 3 },
  { name: 'DeepSeek', icon: 'MagicStick', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', status: '等待中', statusType: 'info' as const, progress: 0, total: 3 },
  { name: '元宝', icon: 'Collection', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', status: '等待中', statusType: 'info' as const, progress: 0, total: 3 },
  { name: 'Kimi', icon: 'Moon', gradient: 'linear-gradient(135deg, #5B86E5, #36D7DC)', status: '等待中', statusType: 'info' as const, progress: 0, total: 3 }
])

let timer: number

onMounted(() => {
  simulateProgress()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function simulateProgress() {
  timer = window.setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(timer)
      completed.value = true
      ElMessage.success('检测完成！')
      setTimeout(() => router.push('/report/1'), 2000)
      return
    }

    progress.value += 2

    // 更新步骤
    if (progress.value > 25) currentStep.value = 1
    if (progress.value > 50) currentStep.value = 2
    if (progress.value > 75) currentStep.value = 3
    if (progress.value >= 100) currentStep.value = 4

    // 更新平台状态
    platforms.value.forEach((p, i) => {
      if (progress.value > (i + 1) * 20) {
        p.status = '检测中'
        p.statusType = 'warning'
        p.progress = Math.min(3, Math.floor((progress.value - (i + 1) * 20) / 10))
      }
      if (progress.value > (i + 1) * 25) {
        p.status = '已完成'
        p.statusType = 'success'
        p.progress = 3
      }
    })

    // 更新剩余时间
    const remaining = Math.ceil((100 - progress.value) / 2)
    remainingTime.value = remaining >= 60 ? `${Math.floor(remaining / 60)}分${remaining % 60}秒` : `${remaining}秒`
  }, 100)
}

function cancelDetection() {
  ElMessageBox.confirm('确定要取消当前检测任务吗？', '提示', { type: 'warning' })
    .then(() => router.push('/detection/create'))
    .catch(() => {})
}

function viewReport() {
  router.push('/report/1')
}
</script>

<style lang="scss" scoped>
.progress-card {
  :deep(.el-steps--simple) {
    background: transparent;
  }
  :deep(.el-step__title) {
    color: rgba(255,255,255,0.8);
  }
  :deep(.el-step.is-success .el-step__title) {
    color: #fff;
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.platform-status-card {
  background: #f5f7fa;
  margin-bottom: 16px;
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-info {
  flex: 1;
}

.platform-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.platform-progress {
  font-size: 13px;
  color: #909399;
}

.action-bar {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  margin-top: 20px;
}
</style>
PROGRESSEOF
echo "✅ progress.vue 已修复 - 移除 Emoji，使用 Element Plus Icons"
