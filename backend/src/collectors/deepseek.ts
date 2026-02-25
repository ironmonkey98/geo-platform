/**
 * DeepSeek 采集器
 * 采集 DeepSeek (chat.deepseek.com) 的AI回答和引用来源
 */

import { BaseCollector } from './base';
import { PlatformConfig, Source } from '../types/collector';

export class DeepSeekCollector extends BaseCollector {
  protected getPlatformConfig(): PlatformConfig {
    return {
      name: 'deepseek',
      displayName: 'DeepSeek',
      url: 'https://chat.deepseek.com/',
      selectors: {
        input: 'textarea[placeholder], .chat-input textarea, [class*="input"] textarea',
        submit: 'button[type="submit"], [class*="send"], [aria-label*="发送"]',
        response: '.markdown-body, [class*="response"], [class*="message-content"], .ds-markdown',
        sources: 'a[href^="http"], [class*="reference"] a',
        loading: '.loading, [class*="loading"], [class*="typing"]'
      },
      waitStrategy: 'selector',
      waitTime: 5000
    };
  }

  /**
   * DeepSeek 登录检查
   */
  protected async checkLogin(): Promise<void> {
    // 检查是否需要登录
    const loginButton = await this.page!.$('[class*="login"], button:has-text("登录")');

    if (loginButton) {
      console.log('[DeepSeek] 需要登录...');

      // DeepSeek 支持多种登录方式
      // 这里等待登录成功
      await this.page!.waitForSelector('[class*="user"], [class*="avatar"]', {
        timeout: 120000
      });

      console.log('[DeepSeek] 登录成功');
    }
  }

  /**
   * DeepSeek 特定的搜索流程
   */
  protected async inputAndSearch(keyword: string): Promise<void> {
    // DeepSeek 有"联网搜索"功能，需要先开启
    const webSearchToggle = await this.page!.$('[class*="web-search"], [class*="联网"]');
    if (webSearchToggle) {
      const isChecked = await webSearchToggle.getAttribute('aria-checked');
      if (isChecked !== 'true') {
        await webSearchToggle.click();
        await this.page!.waitForTimeout(500);
      }
    }

    await super.inputAndSearch(keyword);
  }

  /**
   * DeepSeek 引用来源提取
   */
  protected async extractSources(): Promise<Source[]> {
    const sources: Source[] = [];

    try {
      // DeepSeek 的引用通常在回答末尾
      await this.page!.waitForTimeout(3000);

      // 查找所有链接
      const links = await this.page!.$$('a[href^="http"]');

      for (const link of links) {
        const url = await link.getAttribute('href') || '';
        const text = await link.innerText();

        // 过滤掉 DeepSeek 自己的链接
        if (url && !url.includes('deepseek.com')) {
          sources.push({
            title: text.trim() || url,
            url,
            domain: this.extractDomain(url),
            sourceType: this.classifySource(url)
          });
        }
      }

      console.log(`[DeepSeek] 提取到 ${sources.length} 个引用来源`);

    } catch (error) {
      console.warn('[DeepSeek] 提取引用来源失败:', error);
    }

    return sources;
  }

  /**
   * DeepSeek 品牌分析
   */
  protected extractAllBrands(response: string): string[] {
    const knownBrands = [
      '新航道', '新东方', '环球雅思', '学而思', '高途',
      '猿辅导', '作业帮', 'VIPKID', '51Talk'
    ];

    const found: string[] = [];
    for (const brand of knownBrands) {
      if (response.includes(brand)) {
        found.push(brand);
      }
    }

    return found;
  }
}

// 导出工厂函数
export async function createDeepSeekCollector() {
  const collector = new DeepSeekCollector({
    headless: false,
    slowMo: 150
  });
  await collector.init();
  return collector;
}
