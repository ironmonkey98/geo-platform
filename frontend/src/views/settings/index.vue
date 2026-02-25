<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
    </div>

    <div class="settings-layout">
      <!-- 菜单 -->
      <el-card shadow="never" class="settings-menu">
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="account">
            <el-icon><User /></el-icon>
            <span>账户信息</span>
          </el-menu-item>
          <el-menu-item index="subscription">
            <el-icon><Wallet /></el-icon>
            <span>订阅管理</span>
          </el-menu-item>
          <el-menu-item index="notification">
            <el-icon><Bell /></el-icon>
            <span>通知设置</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon><Lock /></el-icon>
            <span>安全设置</span>
          </el-menu-item>
        </el-menu>
      </el-card>

      <!-- 内容 -->
      <div class="settings-content">
        <!-- 账户信息 -->
        <el-card shadow="never" v-if="activeMenu === 'account'" class="setting-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><User /></el-icon>
              <span class="section-title">账户信息</span>
            </div>
          </template>
          <el-form :model="accountForm" label-position="top" style="max-width: 400px">
            <el-form-item label="头像">
              <el-avatar :size="64" class="user-avatar">
                <el-icon :size="28"><User /></el-icon>
              </el-avatar>
              <el-button size="small" style="margin-left: 16px">更换头像</el-button>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="accountForm.username" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="accountForm.email" />
            </el-form-item>
            <el-form-item label="公司名称">
              <el-input v-model="accountForm.company" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="accountForm.phone" />
            </el-form-item>
            <el-button type="primary">保存修改</el-button>
          </el-form>
        </el-card>

        <!-- 订阅管理 -->
        <el-card shadow="never" v-if="activeMenu === 'subscription'" class="setting-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><Wallet /></el-icon>
              <span class="section-title">订阅管理</span>
            </div>
          </template>

          <div class="plan-card">
            <div class="plan-header">
              <div>
                <div class="plan-name">专业版</div>
                <div class="plan-price">¥299/月</div>
              </div>
              <el-button type="primary">升级企业版</el-button>
            </div>
            <div class="plan-features">
              <el-tag v-for="f in planFeatures" :key="f" type="success" effect="plain" style="margin-right: 8px">{{ f }}</el-tag>
            </div>
            <div class="plan-footer">
              <el-icon><Timer /></el-icon>
              到期时间：2026-03-25
            </div>
          </div>

          <h4 style="margin: 24px 0 16px">用量统计</h4>
          <div class="usage-list">
            <div class="usage-item">
              <div class="usage-header">
                <span>关键词使用</span>
                <span class="usage-value">15/20</span>
              </div>
              <el-progress :percentage="75" :show-text="false" />
            </div>
            <div class="usage-item">
              <div class="usage-header">
                <span>AI蒸馏次数</span>
                <span class="usage-value">2/5</span>
              </div>
              <el-progress :percentage="40" :show-text="false" />
            </div>
            <div class="usage-item">
              <div class="usage-header">
                <span>本月检测次数</span>
                <span class="usage-value">18/30</span>
              </div>
              <el-progress :percentage="60" :show-text="false" />
            </div>
          </div>
        </el-card>

        <!-- 通知设置 -->
        <el-card shadow="never" v-if="activeMenu === 'notification'" class="setting-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><Bell /></el-icon>
              <span class="section-title">通知设置</span>
            </div>
          </template>

          <div class="notification-list">
            <div class="notification-item">
              <div class="notification-info">
                <span class="notification-title">检测完成通知</span>
                <span class="notification-desc">检测任务完成后发送邮件通知</span>
              </div>
              <el-switch v-model="notifications.detection" />
            </div>
            <div class="notification-item">
              <div class="notification-info">
                <span class="notification-title">每周报告摘要</span>
                <span class="notification-desc">每周一发送上周GEO表现摘要</span>
              </div>
              <el-switch v-model="notifications.weekly" />
            </div>
            <div class="notification-item">
              <div class="notification-info">
                <span class="notification-title">竞品动态提醒</span>
                <span class="notification-desc">竞品GEO表现变化时提醒</span>
              </div>
              <el-switch v-model="notifications.competitor" />
            </div>
            <div class="notification-item">
              <div class="notification-info">
                <span class="notification-title">系统公告</span>
                <span class="notification-desc">接收产品更新和系统公告</span>
              </div>
              <el-switch v-model="notifications.system" />
            </div>
          </div>
        </el-card>

        <!-- 安全设置 -->
        <el-card shadow="never" v-if="activeMenu === 'security'" class="setting-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><Lock /></el-icon>
              <span class="section-title">安全设置</span>
            </div>
          </template>

          <el-form label-position="top" style="max-width: 400px">
            <el-form-item label="修改密码">
              <el-button @click="showPasswordDialog = true">修改密码</el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="danger-zone">
            <h4 class="danger-title">
              <el-icon><WarningFilled /></el-icon>
              危险操作
            </h4>
            <p style="color: #909399; margin: 8px 0 16px">以下操作不可逆，请谨慎操作</p>
            <el-button type="danger" @click="deleteAccount">注销账户</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form label-position="top">
        <el-form-item label="当前密码">
          <el-input type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="showPasswordDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Wallet,
  Bell,
  Lock,
  Timer,
  WarningFilled
} from '@element-plus/icons-vue'

const activeMenu = ref('account')
const showPasswordDialog = ref(false)

const accountForm = reactive({
  username: '张三',
  email: 'zhangsan@example.com',
  company: '新航道教育集团',
  phone: '138****8888'
})

const planFeatures = ['20个关键词', '每日自动检测', 'AI蒸馏 5次/月', '3个竞品对比']

const notifications = reactive({
  detection: true,
  weekly: true,
  competitor: false,
  system: true
})

function handleMenuSelect(key: string) {
  activeMenu.value = key
}

function deleteAccount() {
  ElMessageBox.confirm('确定要注销账户吗？此操作不可恢复！', '警告', { type: 'warning' })
    .then(() => {
      const input = prompt('请输入 "DELETE" 确认注销')
      if (input === 'DELETE') {
        ElMessage.success('账户注销申请已提交')
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.settings-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
}

.settings-menu {
  height: fit-content;
  position: sticky;
  top: 88px;

  :deep(.el-card__body) {
    padding: 8px;
  }

  :deep(.el-menu) {
    border-right: none;
  }
}

.settings-content {
  min-height: 400px;
}

.setting-section {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
  color: #409eff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

.user-avatar {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
}

/* 订阅卡片 */
.plan-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  padding: 24px;
  color: white;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plan-name {
  font-size: 20px;
  font-weight: 600;
}

.plan-price {
  font-size: 24px;
  font-weight: 700;
}

.plan-features {
  margin-bottom: 16px;
}

.plan-footer {
  font-size: 13px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 用量列表 */
.usage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage-item {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.usage-value {
  font-weight: 600;
  color: #409eff;
}

/* 通知列表 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.notification-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
}

.notification-desc {
  font-size: 12px;
  color: #909399;
}

/* 危险区域 */
.danger-zone {
  margin-top: 24px;
  padding: 20px;
  background: rgba(245, 108, 108, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(245, 108, 108, 0.2);
}

.danger-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  margin: 0;
}

@media (max-width: 768px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-menu {
    position: static;
  }
}
</style>
SETTINGSEOF
echo "✅ 设置页已完成"
