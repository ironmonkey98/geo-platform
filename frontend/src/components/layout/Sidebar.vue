<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <el-icon :size="24" color="#fff"><Aim /></el-icon>
      <span v-if="!collapse" class="logo-text">GEO平台</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="collapse"
      :collapse-transition="false"
      background-color="#001529"
      text-color="rgba(255, 255, 255, 0.65)"
      active-text-color="#ffffff"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>控制台</template>
      </el-menu-item>

      <el-sub-menu index="detection">
        <template #title>
          <el-icon><Search /></el-icon>
          <span>检测中心</span>
        </template>
        <el-menu-item index="/detection/create">
          <el-icon><CirclePlus /></el-icon>
          <template #title>创建检测</template>
        </el-menu-item>
        <el-menu-item index="/report">
          <el-icon><Tickets /></el-icon>
          <template #title>检测报告</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="content">
        <template #title>
          <el-icon><Edit /></el-icon>
          <span>内容工具</span>
        </template>
        <el-menu-item index="/distillation">
          <el-icon><MagicStick /></el-icon>
          <template #title>AI蒸馏</template>
        </el-menu-item>
        <el-menu-item index="/content/generator">
          <el-icon><Document /></el-icon>
          <template #title>内容生成</template>
        </el-menu-item>
        <el-menu-item index="/keyword">
          <el-icon><PriceTag /></el-icon>
          <template #title>关键词库</template>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/media">
        <el-icon><Collection /></el-icon>
        <template #title>媒体库</template>
      </el-menu-item>

      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>设置</template>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <div class="user-info">
        <el-avatar :size="36" class="user-avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div v-if="!collapse" class="user-detail">
          <span class="user-name">张三</span>
          <el-tag size="small" type="warning">专业版</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Aim,
  Odometer,
  Search,
  CirclePlus,
  Tickets,
  Edit,
  MagicStick,
  Document,
  PriceTag,
  Collection,
  Setting,
  User
} from '@element-plus/icons-vue'

defineProps<{
  collapse: boolean
}>()

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #001529;
}

.sidebar-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    &:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }
  }

  :deep(.el-menu-item.is-active) {
    background-color: #3b82f6 !important;
  }

  :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: #ffffff !important;
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  flex-shrink: 0;
  color: #ffffff;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}
</style>
SIDEBAREOF
echo "✅ Sidebar.vue 已修复"
