<template>
  <div class="topbar">
    <div class="topbar-left">
      <el-icon class="toggle-btn" @click="$emit('toggle-sidebar')">
        <Fold />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">
          <el-icon><HomeFilled /></el-icon>
          首页
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute.meta?.title">
          {{ currentRoute.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="topbar-right">
      <el-input
        v-model="searchText"
        placeholder="搜索功能..."
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-badge :value="3" :max="99" class="notification-badge">
        <el-button circle>
          <el-icon><Bell /></el-icon>
        </el-button>
      </el-badge>
      <el-button circle>
        <el-icon><QuestionFilled /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Bell, QuestionFilled, Fold, HomeFilled } from '@element-plus/icons-vue'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const currentRoute = computed(() => route)
const searchText = ref('')
</script>

<style lang="scss" scoped>
.topbar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;

  &:hover {
    color: #409eff;
  }
}

.search-input {
  width: 240px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-badge {
  cursor: pointer;
}
</style>
TOPBAREOF
echo "✅ Topbar.vue 已修复"
