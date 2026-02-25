<template>
  <div class="detection-create-page">
    <div class="page-header">
      <h1 class="page-title">创建品牌检测</h1>
      <p class="page-desc">输入品牌信息和关键词，系统将自动检测您在各大AI平台的认知度表现</p>
    </div>

    <!-- 步骤1：基本信息 -->
    <el-card shadow="never" class="form-section">
      <template #header>
        <div class="section-header">
          <el-tag type="primary" effect="dark" size="large">1</el-tag>
          <div>
            <h3 class="section-title">基本信息</h3>
            <span class="section-desc">品牌的基础信息配置</span>
          </div>
        </div>
      </template>
      <el-form :model="formData" :rules="rules" ref="formRef" label-position="top">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="品牌名称" prop="brandName">
              <el-input v-model="formData.brandName" placeholder="请输入品牌名称，如：新航道">
                <template #prefix>
                  <el-icon><OfficeBuilding /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="行业/品类" prop="industry">
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
            <el-form-item label="官网URL">
              <el-input v-model="formData.website" placeholder="https://example.com">
                <template #prefix>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="目标地域">
              <el-input v-model="formData.region" placeholder="如：福州、北京、上海">
                <template #prefix>
                  <el-icon><Location /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 步骤2：关键词 -->
    <el-card shadow="never" class="form-section">
      <template #header>
        <div class="section-header">
          <el-tag type="primary" effect="dark" size="large">2</el-tag>
          <div>
            <h3 class="section-title">核心关键词</h3>
            <span class="section-desc">输入关键词后按回车添加</span>
          </div>
          <el-tag>
            <el-icon><CollectionTag /></el-icon>
            已添加 {{ formData.keywords.length }}/20 个
          </el-tag>
        </div>
      </template>
      <div class="keyword-input-area">
        <el-tag
          v-for="(kw, index) in formData.keywords"
          :key="index"
          closable
          type="primary"
          @close="removeKeyword(index)"
          class="keyword-tag"
        >
          {{ kw }}
        </el-tag>
        <el-input
          v-model="keywordInput"
          placeholder="输入关键词后按回车添加..."
          @keyup.enter="addKeyword"
          class="keyword-input"
        >
          <template #prefix>
            <el-icon><EditPen /></el-icon>
          </template>
        </el-input>
      </div>
      <el-alert type="info" :closable="false" show-icon class="form-hint">
        <template #title>
          专业版最多支持 20 个关键词，<el-link type="primary">升级到企业版</el-link>解锁更多
        </template>
      </el-alert>
    </el-card>

    <!-- 步骤3：竞品 -->
    <el-card shadow="never" class="form-section">
      <template #header>
        <div class="section-header">
          <el-tag type="primary" effect="dark" size="large">3</el-tag>
          <div>
            <h3 class="section-title">竞品对比</h3>
            <span class="section-desc">添加竞品进行对比分析</span>
          </div>
        </div>
      </template>
      <div class="competitor-list">
        <el-input
          v-for="(comp, index) in formData.competitors"
          :key="index"
          v-model="formData.competitors[index]"
          placeholder="输入竞品名称，如：环球雅思"
          class="competitor-input"
        >
          <template #prefix>
            <el-icon><OfficeBuilding /></el-icon>
          </template>
          <template #append>
            <el-button @click="removeCompetitor(index)" :disabled="formData.competitors.length <= 1">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      <el-button @click="addCompetitor" :disabled="formData.competitors.length >= 3">
        <el-icon><Plus /></el-icon>
        添加竞品
      </el-button>
      <el-alert type="info" :closable="false" show-icon class="form-hint">
        <template #title>最多添加 3 个竞品</template>
      </el-alert>
    </el-card>

    <!-- 步骤4：平台选择 -->
    <el-card shadow="never" class="form-section">
      <template #header>
        <div class="section-header">
          <el-tag type="primary" effect="dark" size="large">4</el-tag>
          <div>
            <h3 class="section-title">检测平台</h3>
            <span class="section-desc">选择需要检测的AI平台</span>
          </div>
        </div>
      </template>
      <div class="platform-grid">
        <el-card
          v-for="platform in platforms"
          :key="platform.id"
          shadow="hover"
          :class="['platform-card', { selected: formData.platforms.includes(platform.id) }]"
          @click="togglePlatform(platform.id)"
        >
          <div class="platform-header">
            <el-avatar :size="44" :style="{ background: platform.gradient }">
              <el-icon><component :is="platform.icon" /></el-icon>
            </el-avatar>
            <div class="platform-check" v-if="formData.platforms.includes(platform.id)">
              <el-icon><CircleCheck /></el-icon>
            </div>
          </div>
          <div class="platform-name">{{ platform.name }}</div>
          <div class="platform-desc">{{ platform.desc }}</div>
        </el-card>
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <div class="cost-info">
        <span class="cost-label">预计消耗</span>
        <span class="cost-value">1 次检测</span>
        <el-tag type="info">本月剩余 29 次</el-tag>
      </div>
      <div class="action-buttons">
        <el-button @click="saveDraft">
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
        <el-button type="primary" size="large" @click="submitForm" :loading="submitting">
          <el-icon><Position /></el-icon>
          开始检测
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Delete,
  Plus,
  CircleCheck,
  Position,
  OfficeBuilding,
  Link,
  Location,
  CollectionTag,
  EditPen,
  Document,
  Sunny,
  MagicStick,
  Collection,
  Moon,
  Reading
} from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const keywordInput = ref('')

const formData = reactive({
  brandName: '',
  industry: '',
  website: '',
  region: '',
  keywords: [] as string[],
  competitors: [''],
  platforms: ['doubao', 'deepseek', 'yuanbao', 'kimi']
})

const rules = {
  brandName: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择行业', trigger: 'change' }]
}

// 平台数据 - 使用 Element Plus Icons 替换 Emoji
const platforms = [
  { id: 'doubao', name: '豆包', icon: 'Sunny', desc: '抖音旗下AI助手', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' },
  { id: 'deepseek', name: 'DeepSeek', icon: 'MagicStick', desc: '深度求索AI', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'yuanbao', name: '元宝', icon: 'Collection', desc: '腾讯混元AI', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'kimi', name: 'Kimi', icon: 'Moon', desc: '月之暗面AI', gradient: 'linear-gradient(135deg, #5B86E5, #36D7DC)' },
  { id: 'wenxin', name: '文心一言', icon: 'Reading', desc: '百度AI助手', gradient: 'linear-gradient(135deg, #00C9FF, #92FE9D)' }
]

const addKeyword = () => {
  const kw = keywordInput.value.trim()
  if (!kw) return
  if (formData.keywords.includes(kw)) {
    ElMessage.warning('关键词已存在')
    return
  }
  if (formData.keywords.length >= 20) {
    ElMessage.warning('已达到关键词上限(20个)')
    return
  }
  formData.keywords.push(kw)
  keywordInput.value = ''
}

const removeKeyword = (index: number) => {
  formData.keywords.splice(index, 1)
}

const addCompetitor = () => {
  if (formData.competitors.length >= 3) return
  formData.competitors.push('')
}

const removeCompetitor = (index: number) => {
  formData.competitors.splice(index, 1)
}

const togglePlatform = (id: string) => {
  const idx = formData.platforms.indexOf(id)
  if (idx > -1) {
    formData.platforms.splice(idx, 1)
  } else {
    formData.platforms.push(id)
  }
}

const saveDraft = () => {
  localStorage.setItem('geo_form_draft', JSON.stringify(formData))
  ElMessage.success('草稿已保存')
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (formData.keywords.length === 0) {
        ElMessage.error('请至少添加一个关键词')
        return
      }
      if (formData.platforms.length === 0) {
        ElMessage.error('请至少选择一个检测平台')
        return
      }

      submitting.value = true

      // 模拟提交
      setTimeout(() => {
        localStorage.setItem('geo_detection_task', JSON.stringify(formData))
        ElMessage.success('检测任务创建成功！')
        router.push('/detection/progress/1')
      }, 1500)
    }
  })
}
</script>

<style lang="scss" scoped>
.detection-create-page {
  max-width: 1000px;
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

.form-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.section-desc {
  font-size: 13px;
  color: #909399;
}

.keyword-input-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 100px;
}

.keyword-tag {
  margin: 0;
}

.keyword-input {
  flex: 1;
  min-width: 150px;
  border: none;

  :deep(.el-input__wrapper) {
    box-shadow: none;
    padding: 0;
  }
}

.form-hint {
  margin-top: 12px;
}

.competitor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.competitor-input {
  width: 100%;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  @media (max-width: 991px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 575px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.platform-card {
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;

  :deep(.el-card__body) {
    padding: 20px 16px;
  }

  &.selected {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  &:hover {
    transform: translateY(-2px);
  }
}

.platform-header {
  position: relative;
  margin-bottom: 12px;
}

.platform-check {
  position: absolute;
  top: 0;
  right: 0;
  color: #67c23a;
  font-size: 20px;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.platform-desc {
  font-size: 12px;
  color: #909399;
}

.action-bar {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cost-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cost-label {
  font-size: 13px;
  color: #909399;
}

.cost-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style>
CREATEEOF
echo "✅ create.vue 已修复 - 移除所有 Emoji，使用 Element Plus Icons"
