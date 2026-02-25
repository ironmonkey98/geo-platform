import { test, expect } from '@playwright/test';

test.describe('GEO优化平台 - E2E测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.sidebar', { timeout: 10000 });
  });

  test('TC-01-001: 创建检测任务 - 正常流程', async ({ page }) => {
    await page.click('text=创建检测');
    await expect(page).toHaveURL(/\/detection\/create/);
    await page.fill('input[placeholder*="品牌名称"]', '新航道');
    await page.click('.form-select, [role="combobox"]');
    await page.click('text=教育培训');
    const keywordInput = page.locator('input[placeholder*="关键词"]').first();
    await keywordInput.fill('福州雅思培训');
    await keywordInput.press('Enter');
    const selectedPlatforms = page.locator('.platform-card.selected');
    await expect(selectedPlatforms).toHaveCount(4);
    await page.click('text=开始检测');
    await expect(page).toHaveURL(/\/detection\/progress/, { timeout: 5000 });
    await expect(page.locator('.el-progress')).toBeVisible();
  });

  test('TC-01-002: 创建检测任务 - 必填项校验', async ({ page }) => {
    await page.click('text=创建检测');
    await page.click('text=开始检测');
    await expect(page.locator('text=请输入品牌名称')).toBeVisible();
  });

  test('TC-01-003: 关键词数量限制', async ({ page }) => {
    await page.click('text=创建检测');
    await page.fill('input[placeholder*="品牌名称"]', '测试品牌');
    await page.click('text=教育培训');
    const keywordInput = page.locator('input[placeholder*="关键词"]').first();
    for (let i = 1; i <= 21; i++) {
      await keywordInput.fill(`关键词${i}`);
      await keywordInput.press('Enter');
    }
    await expect(page.locator('text=20/20')).toBeVisible();
  });

  test('TC-02-001: AI蒸馏 - 正常流程', async ({ page }) => {
    await page.click('text=AI蒸馏');
    await expect(page).toHaveURL(/\/distillation/);
    await page.fill('input[placeholder*="核心"]', '雅思培训');
    await page.click('.form-select, [role="combobox"]');
    await page.click('text=教育培训');
    await page.click('text=开始蒸馏');
    await page.waitForSelector('.result-stats, .keyword-grid', { timeout: 10000 });
    const searchKeywords = page.locator('.keyword-tag, .el-check-tag');
    const count = await searchKeywords.count();
    expect(count).toBeGreaterThan(10);
  });

  test('TC-02-002: AI蒸馏 - 必填项校验', async ({ page }) => {
    await page.click('text=AI蒸馏');
    await page.click('text=开始蒸馏');
    await expect(page.locator('text=请输入核心词')).toBeVisible();
  });

  test('TC-03-001: 内容生成 - 排名榜单模板', async ({ page }) => {
    await page.click('text=内容生成');
    await expect(page).toHaveURL(/\/content\/generator/);
    await page.click('text=排名榜单');
    await page.fill('input[placeholder*="品牌"]', '新航道');
    await page.fill('input[placeholder*="关键词"]', '福州雅思培训');
    await page.click('text=生成内容');
    await page.waitForSelector('.preview-content', { timeout: 10000 });
    const content = await page.locator('.preview-content').textContent();
    expect(content).toContain('排名');
  });

  test('TC-04-001: 关键词列表显示', async ({ page }) => {
    await page.click('text=关键词库');
    await expect(page).toHaveURL(/\/keyword/);
    await expect(page.locator('text=搜索词')).toBeVisible();
    await expect(page.locator('text=问答词')).toBeVisible();
    await expect(page.locator('text=品牌词')).toBeVisible();
  });

  test('TC-05-001: 媒体列表筛选', async ({ page }) => {
    await page.click('text=媒体库');
    await expect(page).toHaveURL(/\/media/);
    await page.click('text=新闻媒体');
    await expect(page.locator('.media-card')).toBeVisible();
  });

  test('TC-06-001: 用户设置保存', async ({ page }) => {
    await page.click('text=设置');
    await expect(page).toHaveURL(/\/settings/);
    const input = page.locator('input[value="张三"]');
    await input.fill('测试用户');
    await page.click('text=保存修改');
  });

  test('导航测试 - 所有页面可访问', async ({ page }) => {
    const navItems = [
      { text: '控制台', url: '/dashboard' },
      { text: 'AI蒸馏', url: '/distillation' },
      { text: '媒体库', url: '/media' },
      { text: '设置', url: '/settings' }
    ];
    for (const item of navItems) {
      await page.click(`text=${item.text}`);
      await expect(page).toHaveURL(new RegExp(item.url));
    }
  });
});
