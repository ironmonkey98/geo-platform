import { test, expect, Page } from '@playwright/test';

/**
 * GEO优化平台 - E2E 测试用例
 * 基于 PRD v1.1 和 TEST-CASES.md
 */

test.describe('GEO优化平台 - E2E测试', () => {

  // 测试前登录
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待页面加载
    await page.waitForSelector('.sidebar', { timeout: 10000 });
  });

  // ========================================
  // TC-01: 策略分析模块
  // ========================================

  test.describe('TC-01 策略分析模块', () => {

    /**
     * TC-01-001: 创建检测任务 - 正常流程
     * 优先级: P0
     */
    test('TC-01-001: 创建检测任务 - 正常流程', async ({ page }) => {
      // 1. 点击侧边栏"创建检测"
      await page.click('text=创建检测');
      await expect(page).toHaveURL(/\/detection\/create/);

      // 2. 填写品牌名称
      await page.fill('input[placeholder*="品牌名称"]', '新航道');

      // 3. 选择行业
      await page.click('.form-select, [role="combobox"]');
      await page.click('text=教育培训');

      // 4. 添加关键词
      const keywordInput = page.locator('input[placeholder*="关键词"]').first();
      await keywordInput.fill('福州雅思培训');
      await keywordInput.press('Enter');

      // 5. 确认平台已选择
      const selectedPlatforms = page.locator('.platform-card.selected');
      await expect(selectedPlatforms).toHaveCount(4);

      // 6. 点击开始检测
      await page.click('text=开始检测');

      // 7. 验证跳转到进度页
      await expect(page).toHaveURL(/\/detection\/progress/, { timeout: 5000 });

      // 8. 验证进度条显示
      await expect(page.locator('.el-progress')).toBeVisible();
    });

    /**
     * TC-01-002: 创建检测任务 - 必填项校验
     * 优先级: P0
     */
    test('TC-01-002: 创建检测任务 - 必填项校验', async ({ page }) => {
      await page.click('text=创建检测');

      // 直接点击开始检测，不填写任何信息
      await page.click('text=开始检测');

      // 验证错误提示
      await expect(page.locator('text=请输入品牌名称')).toBeVisible();
    });

    /**
     * TC-01-003: 创建检测任务 - 关键词数量限制
     * 优先级: P1
     */
    test('TC-01-003: 关键词数量限制', async ({ page }) => {
      await page.click('text=创建检测');
      await page.fill('input[placeholder*="品牌名称"]', '测试品牌');
      await page.click('text=教育培训');

      // 添加20个关键词
      const keywordInput = page.locator('input[placeholder*="关键词"]').first();
      for (let i = 1; i <= 21; i++) {
        await keywordInput.fill(`关键词${i}`);
        await keywordInput.press('Enter');
      }

      // 验证显示"已添加 20/20 个"
      await expect(page.locator('text=20/20')).toBeVisible();
    });

    /**
     * TC-01-004: 检测进度 - 进度更新
     * 优先级: P0
     */
    test('TC-01-004: 检测进度 - 进度更新', async ({ page }) => {
      // 创建检测任务
      await page.click('text=创建检测');
      await page.fill('input[placeholder*="品牌名称"]', '新航道');
      await page.click('text=教育培训');
      const keywordInput = page.locator('input[placeholder*="关键词"]').first();
      await keywordInput.fill('雅思培训');
      await keywordInput.press('Enter');
      await page.click('text=开始检测');

      // 等待进度页面
      await page.waitForURL(/\/detection\/progress/);

      // 验证步骤指示器
      await expect(page.locator('.el-steps')).toBeVisible();

      // 等待进度更新 (模拟)
      await page.waitForTimeout(2000);

      // 验证进度百分比变化
      const progressText = await page.locator('.stat-value, text=/\\d+%/').first().textContent();
      expect(progressText).toMatch(/\d+/);
    });

    /**
     * TC-01-005: 报告详情 - GEO评分显示
     * 优先级: P0
     */
    test('TC-01-005: 报告详情 - GEO评分显示', async ({ page }) => {
      // 直接访问报告详情页 (模拟已有报告)
      await page.goto('/report/1');

      // 验证评分区域
      await expect(page.locator('.el-progress--dashboard, .score-circle')).toBeVisible();

      // 验证评分在0-100范围
      const scoreText = await page.locator('.score-value').textContent();
      const score = parseInt(scoreText || '0');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    /**
     * TC-01-006: 报告详情 - 平台分析Tab
     * 优先级: P0
     */
    test('TC-01-006: 报告详情 - 平台分析Tab', async ({ page }) => {
      await page.goto('/report/1');

      // 点击平台分析Tab (默认已选中)
      await expect(page.locator('.platform-result-card, .platform-list')).toBeVisible();

      // 验证平台卡片数量
      const platformCards = page.locator('.platform-result-card, .platform-item');
      const count = await platformCards.count();
      expect(count).toBeGreaterThan(0);
    });

    /**
     * TC-01-007: 报告详情 - 竞品对比Tab
     * 优先级: P0
     */
    test('TC-01-007: 报告详情 - 竞品对比Tab', async ({ page }) => {
      await page.goto('/report/1');

      // 点击竞品对比Tab
      await page.click('text=竞品对比');

      // 验证对比表格
      await expect(page.locator('.el-table')).toBeVisible();
    });

    /**
     * TC-01-008: 报告详情 - 引用来源Tab
     * 优先级: P1
     */
    test('TC-01-008: 报告详情 - 引用来源Tab', async ({ page }) => {
      await page.goto('/report/1');

      // 点击引用来源Tab
      await page.click('text=引用来源');

      // 验证来源统计
      await expect(page.locator('.source-stats, .source-list')).toBeVisible();
    });

    /**
     * TC-01-009: 报告详情 - 优化建议Tab
     * 优先级: P1
     */
    test('TC-01-009: 报告详情 - 优化建议Tab', async ({ page }) => {
      await page.goto('/report/1');

      // 点击优化建议Tab
      await page.click('text=优化建议');

      // 验证建议列表
      await expect(page.locator('.suggestion-groups, .suggestion-list')).toBeVisible();
    });
  });

  // ========================================
  // TC-02: AI蒸馏模块
  // ========================================

  test.describe('TC-02 AI蒸馏模块', () => {

    /**
     * TC-02-001: AI蒸馏 - 正常流程
     * 优先级: P0
     */
    test('TC-02-001: AI蒸馏 - 正常流程', async ({ page }) => {
      await page.click('text=AI蒸馏');
      await expect(page).toHaveURL(/\/distillation/);

      // 填写表单
      await page.fill('input[placeholder*="核心"]', '雅思培训');
      await page.click('.form-select, [role="combobox"]');
      await page.click('text=教育培训');

      // 开始蒸馏
      await page.click('text=开始蒸馏');

      // 等待结果
      await page.waitForSelector('.result-stats, .keyword-grid', { timeout: 10000 });

      // 验证结果
      const searchKeywords = page.locator('.keyword-tag, .el-check-tag');
      const count = await searchKeywords.count();
      expect(count).toBeGreaterThan(10);
    });

    /**
     * TC-02-002: AI蒸馏 - 必填项校验
     * 优先级: P0
     */
    test('TC-02-002: AI蒸馏 - 必填项校验', async ({ page }) => {
      await page.click('text=AI蒸馏');

      // 直接点击开始蒸馏
      await page.click('text=开始蒸馏');

      // 验证错误提示
      await expect(page.locator('text=请输入核心词')).toBeVisible();
    });

    /**
     * TC-02-003: AI蒸馏 - 词类型选择
     * 优先级: P1
     */
    test('TC-02-003: AI蒸馏 - 词类型选择', async ({ page }) => {
      await page.click('text=AI蒸馏');

      // 只选择搜索词
      await page.fill('input[placeholder*="核心"]', '雅思培训');
      await page.click('.form-select');
      await page.click('text=教育培训');

      // 取消问答词和品牌词选择
      await page.click('text=问答词');
      await page.click('text=品牌词');

      // 开始蒸馏
      await page.click('text=开始蒸馏');

      // 等待结果
      await page.waitForSelector('.result-stats', { timeout: 10000 });

      // 验证只有搜索词有数据
      const searchCount = await page.locator('.stat-value.primary').textContent();
      expect(parseInt(searchCount || '0')).toBeGreaterThan(0);
    });

    /**
     * TC-02-004: AI蒸馏 - 复制全部关键词
     * 优先级: P1
     */
    test('TC-02-004: AI蒸馏 - 复制全部关键词', async ({ page }) => {
      // 先执行蒸馏
      await page.goto('/distillation');
      await page.fill('input[placeholder*="核心"]', '雅思培训');
      await page.click('.form-select');
      await page.click('text=教育培训');
      await page.click('text=开始蒸馏');
      await page.waitForSelector('.result-stats', { timeout: 10000 });

      // 点击复制
      await page.click('text=复制全部');

      // 验证提示
      await expect(page.locator('text=已复制到剪贴板')).toBeVisible();
    });
  });

  // ========================================
  // TC-03: 内容生成模块
  // ========================================

  test.describe('TC-03 内容生成模块', () => {

    /**
     * TC-03-001: 内容生成 - 排名榜单模板
     * 优先级: P1
     */
    test('TC-03-001: 内容生成 - 排名榜单模板', async ({ page }) => {
      await page.click('text=内容生成');
      await expect(page).toHaveURL(/\/content\/generator/);

      // 选择排名榜单模板
      await page.click('text=排名榜单');

      // 填写配置
      await page.fill('input[placeholder*="品牌"]', '新航道');
      await page.fill('input[placeholder*="关键词"]', '福州雅思培训');

      // 生成内容
      await page.click('text=生成内容');

      // 等待结果
      await page.waitForSelector('.preview-content', { timeout: 10000 });

      // 验证内容包含标题
      const content = await page.locator('.preview-content').textContent();
      expect(content).toContain('排名');
    });
  });

  // ========================================
  // TC-04: 关键词管理模块
  // ========================================

  test.describe('TC-04 关键词管理模块', () => {

    /**
     * TC-04-001: 关键词列表显示
     * 优先级: P1
     */
    test('TC-04-001: 关键词列表显示', async ({ page }) => {
      await page.click('text=关键词库');
      await expect(page).toHaveURL(/\/keyword/);

      // 验证分组
      await expect(page.locator('text=搜索词')).toBeVisible();
      await expect(page.locator('text=问答词')).toBeVisible();
      await expect(page.locator('text=品牌词')).toBeVisible();
    });

    /**
     * TC-04-002: 批量检测
     * 优先级: P1
     */
    test('TC-04-002: 批量检测', async ({ page }) => {
      await page.click('text=关键词库');

      // 点击全选
      await page.click('text=全选');

      // 点击批量检测
      await page.click('text=批量检测');

      // 验证提示
      await expect(page.locator(/已添加.*关键词/)).toBeVisible();
    });
  });

  // ========================================
  // TC-05: 媒体库模块
  // ========================================

  test.describe('TC-05 媒体库模块', () => {

    /**
     * TC-05-001: 媒体列表筛选
     * 优先级: P2
     */
    test('TC-05-001: 媒体列表筛选', async ({ page }) => {
      await page.click('text=媒体库');
      await expect(page).toHaveURL(/\/media/);

      // 选择新闻媒体
      await page.click('text=新闻媒体');

      // 验证结果
      await expect(page.locator('.media-card')).toBeVisible();
    });

    /**
     * TC-05-002: 媒体详情 - 加入计划
     * 优先级: P2
     */
    test('TC-05-002: 媒体详情 - 加入计划', async ({ page }) => {
      await page.click('text=媒体库');

      // 点击加入计划
      await page.click('text=加入计划');

      // 验证提示
      await expect(page.locator('text=已加入')).toBeVisible();
    });
  });

  // ========================================
  // TC-06: 系统模块
  // ========================================

  test.describe('TC-06 系统模块', () => {

    /**
     * TC-06-001: 用户设置保存
     * 优先级: P2
     */
    test('TC-06-001: 用户设置保存', async ({ page }) => {
      await page.click('text=设置');
      await expect(page).toHaveURL(/\/settings/);

      // 修改用户名
      const input = page.locator('input[value="张三"]');
      await input.fill('测试用户');

      // 保存
      await page.click('text=保存修改');

      // 验证提示
      await expect(page.locator('text=保存成功')).toBeVisible();
    });

    /**
     * TC-06-002: 通知设置切换
     * 优先级: P2
     */
    test('TC-06-002: 通知设置切换', async ({ page }) => {
      await page.click('text=设置');
      await page.click('text=通知设置');

      // 切换开关
      const switchBtn = page.locator('.el-switch').first();
      await switchBtn.click();

      // 验证状态变化
      await expect(switchBtn).toHaveAttribute('aria-checked', /false/);
    });
  });

  // ========================================
  // 导航测试
  // ========================================

  test.describe('导航测试', () => {
    test('侧边栏导航 - 所有页面可访问', async ({ page }) => {
      const navItems = [
        { text: '控制台', url: '/dashboard' },
        { text: '创建检测', url: '/detection/create' },
        { text: 'AI蒸馏', url: '/distillation' },
        { text: '内容生成', url: '/content/generator' },
        { text: '媒体库', url: '/media' },
        { text: '设置', url: '/settings' }
      ];

      for (const item of navItems) {
        await page.click(`text=${item.text}`);
        await expect(page).toHaveURL(new RegExp(item.url));
      }
    });
  });
});
E2ETESTEOF
echo "✅ E2E测试文件已创建"
