import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'detection/create',
        name: 'DetectionCreate',
        component: () => import('@/views/detection/create.vue'),
        meta: { title: '创建检测' }
      },
      {
        path: 'detection/progress/:id',
        name: 'DetectionProgress',
        component: () => import('@/views/detection/progress.vue'),
        meta: { title: '检测进度' }
      },
      {
        path: 'report',
        name: 'ReportList',
        component: () => import('@/views/report/list.vue'),
        meta: { title: '检测报告' }
      },
      {
        path: 'report/:id',
        name: 'ReportDetail',
        component: () => import('@/views/report/detail.vue'),
        meta: { title: '报告详情' }
      },
      {
        path: 'distillation',
        name: 'Distillation',
        component: () => import('@/views/distillation/index.vue'),
        meta: { title: 'AI蒸馏' }
      },
      {
        path: 'content/generator',
        name: 'ContentGenerator',
        component: () => import('@/views/content/generator.vue'),
        meta: { title: '内容生成' }
      },
      {
        path: 'keyword',
        name: 'KeywordManage',
        component: () => import('@/views/keyword/manage.vue'),
        meta: { title: '关键词库' }
      },
      {
        path: 'media',
        name: 'MediaLibrary',
        component: () => import('@/views/media/library.vue'),
        meta: { title: '媒体库' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || ''} - GEO优化平台`
  next()
})

export default router
