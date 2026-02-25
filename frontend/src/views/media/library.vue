<template>
  <div class="media-library-page">
    <div class="page-header">
      <h1 class="page-title">媒体库</h1>
      <p class="page-desc">各AI平台引用的媒体资源库，帮助您了解内容分发策略</p>
    </div>

    <!-- 筛选 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="6">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 100%">
            <el-option label="新闻媒体" value="news" />
            <el-option label="社交媒体" value="social" />
            <el-option label="问答平台" value="qa" />
            <el-option label="百科" value="wiki" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="filters.industry" placeholder="全部行业" clearable style="width: 100%">
            <el-option label="教育培训" value="education" />
            <el-option label="餐饮美食" value="food" />
            <el-option label="运动健身" value="fitness" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="filters.platform" placeholder="引用平台" clearable style="width: 100%">
            <el-option label="豆包" value="doubao" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="元宝" value="yuanbao" />
            <el-option label="Kimi" value="kimi" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-input v-model="filters.keyword" placeholder="搜索媒体..." clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 媒体卡片 -->
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="8" v-for="media in filteredMedia" :key="media.id">
        <el-card shadow="hover" class="media-card">
          <div class="media-header">
            <el-tag :type="getTypeTag(media.type)" size="small">{{ getTypeLabel(media.type) }}</el-tag>
            <div class="media-score">
              <el-icon><Star /></el-icon>
              {{ media.score }}
            </div>
          </div>
          <h3 class="media-name">{{ media.name }}</h3>
          <p class="media-desc">{{ media.desc }}</p>
          <div class="media-tags">
            <el-tag v-for="tag in media.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
          </div>
          <div class="media-footer">
            <div class="platform-icons">
              <el-tooltip v-for="p in media.platforms" :key="p" :content="getPlatformName(p)" placement="top">
                <el-avatar :size="24" :style="{ background: getPlatformGradient(p) }">
                  <el-icon :size="12"><component :is="getPlatformIcon(p)" /></el-icon>
                </el-avatar>
              </el-tooltip>
            </div>
            <el-button size="small" type="primary" @click="addToPlan(media)">加入计划</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Star,
  Sunny,
  MagicStick,
  Collection,
  Moon
} from '@element-plus/icons-vue'

const filters = reactive({
  type: '',
  industry: '',
  platform: '',
  keyword: ''
})

const mediaList = ref([
  { id: 1, name: '今日头条', type: 'news', score: 9.2, desc: '字节跳动旗下新闻资讯平台，豆包主要引用来源', tags: ['豆包引用', '高权重'], platforms: ['doubao'] },
  { id: 2, name: '微信公众号', type: 'social', score: 9.0, desc: '微信生态内容平台，元宝独家优势', tags: ['元宝引用', '长文友好'], platforms: ['yuanbao'] },
  { id: 3, name: '小红书', type: 'social', score: 8.8, desc: '生活方式分享平台，年轻用户聚集地', tags: ['种草平台', '本地生活'], platforms: ['doubao', 'kimi'] },
  { id: 4, name: '知乎', type: 'qa', score: 8.5, desc: '知识问答社区，深度内容聚集地', tags: ['专业内容', 'SEO友好'], platforms: ['deepseek', 'kimi'] },
  { id: 5, name: '百度百科', type: 'wiki', score: 9.5, desc: '百度旗下百科全书，多平台信任来源', tags: ['权威性高', 'AI信任'], platforms: ['doubao', 'yuanbao', 'deepseek', 'kimi'] },
  { id: 6, name: '36氪', type: 'news', score: 8.0, desc: '科技创业媒体，科技类内容首选', tags: ['科技媒体', '创投圈'], platforms: ['deepseek'] }
])

const filteredMedia = computed(() => {
  let result = mediaList.value

  if (filters.type) {
    result = result.filter(m => m.type === filters.type)
  }
  if (filters.platform) {
    result = result.filter(m => m.platforms.includes(filters.platform))
  }
  if (filters.keyword) {
    result = result.filter(m => m.name.includes(filters.keyword) || m.desc.includes(filters.keyword))
  }

  return result
})

function getTypeLabel(type: string) {
  const map: Record<string, string> = { news: '新闻', social: '社交', qa: '问答', wiki: '百科' }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, string> = { news: 'warning', social: 'danger', qa: 'success', wiki: '' }
  return map[type] || ''
}

function getPlatformName(p: string) {
  const map: Record<string, string> = { doubao: '豆包', deepseek: 'DeepSeek', yuanbao: '元宝', kimi: 'Kimi' }
  return map[p] || p
}

function getPlatformGradient(p: string) {
  const map: Record<string, string> = {
    doubao: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    deepseek: 'linear-gradient(135deg, #667eea, #764ba2)',
    yuanbao: 'linear-gradient(135deg, #11998e, #38ef7d)',
    kimi: 'linear-gradient(135deg, #5B86E5, #36D7DC)'
  }
  return map[p] || '#ccc'
}

function getPlatformIcon(p: string) {
  const map: Record<string, any> = { doubao: 'Sunny', deepseek: 'MagicStick', yuanbao: 'Collection', kimi: 'Moon' }
  return map[p] || 'Sunny'
}

function addToPlan(media: any) {
  ElMessage.success(`已将"${media.name}"加入内容分发计划`)
}
</script>

<style lang="scss" scoped>
.media-library-page {
  max-width: 1400px;
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

.filter-card {
  margin-bottom: 20px;

  :deep(.el-card__body) { padding: 16px; }
}

.media-card {
  margin-bottom: 16px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.media-score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #e6a23c;
}

.media-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.media-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px;
  line-height: 1.5;
}

.media-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.media-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.platform-icons {
  display: flex;
  gap: 6px;
}
</style>
MEDIALIBRARYEOF
echo "✅ 媒体库页已完成"
