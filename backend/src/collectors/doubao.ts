/**
 * 豆包采集器
 * 采集豆包(doubao.com)的AI回答和引用来源
 */

import { BaseCollector } from './base';
import { PlatformConfig, Source } from '../types/collector';

export class DoubaoCollector extends BaseCollector {
  protected getPlatformConfig(): PlatformConfig {
    return {
      name: 'doubao',
      displayName: '豆包',
      url: 'https://www.doubao.com/chat/',
      selectors: {
        input: 'textarea[placeholder*="输入"], .chat-input textarea, [class*="input"] textarea',
        submit: 'button[type="submit"], [class*="send"], button[class*="submit"]',
        response: '.message-content, [class*="message-content"], [class*="assistant-message"], .chat-message-content',
        sources: '.source-item, [class*="reference"] a, [class*="source-link"]',
        loading: '.loading, [class*="loading"], [class*="typing"]'
      },
      waitStrategy: 'selector',
      waitTime: 3000
    };
  }

  /**
   * 豆包登录检查
   */
  protected async checkLogin(): Promise<void> {
    const loginRequired = await this.page!.$('[class*="login"], .login-button');

    if (loginRequired) {
      console.log('[豆包] 需要登录，等待用户手动登录...');
      // 豆包需要扫码登录，等待用户操作
      await this.page!.waitForSelector('[class*="user-avatar"], [class*="logged-in"]', {
        timeout: 120000 // 2分钟超时
      });
      console.log('[豆包] 登录成功');
    }
  }

  /**
   * 豆包特定的回答提取
   */
  protected async extractResponse(): Promise<string> {
    await this.page!.waitForTimeout(2000);

    // 豆包的回答可能有多个消息块，取最后一个
    const messages = await this.page!.$$('[class*="message-content"], [class*="assistant"]');
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      return await lastMessage.innerText();
    }

    return await super.extractResponse();
  }

  /**
   * 豆包引用来源提取
   */
  protected async extractSources(): Promise<Source[]> {
    const sources: Source[] = [];

    try {
      // 等待引用区域加载
      await this.page!.waitForSelector('[class*="reference"], [class*="source"]', {
        timeout: 5000
      }).catch(() => {});

      // 提取引用来源
      const sourceElements = await this.page!.$$('[class*="reference-item"], [class*="source-item"]');

      for (let i = 0; i < sourceElements.length; i++) {
        const el = sourceElements[i];

        // 获取标题
        const titleEl = await el.$('[class*="title"], [class*="name"]');
        const title = titleEl ? await titleEl.innerText() : '';

        // 获取链接
        const linkEl = await el.$('a[href]');
        const url = linkEl ? await linkEl.getAttribute('href') || '' : '';

        // 获取来源网站
        const sourceEl = await el.$('[class*="source"], [class*="from"]');
        const sourceName = sourceEl ? await sourceEl.innerText() : '';

        if (title || url) {
          sources.push({
            title: title.trim(),
            url,
            domain: this.extractDomain(url),
            sourceType: this.classifySource(url || sourceName)
          });
        }
      }

      // 如果上面的选择器没找到，尝试备用方式
      if (sources.length === 0) {
        const links = await this.page!.$$('a[href*="http"]');
        for (const link of links.slice(0, 10)) { // 最多取10个
          const url = await link.getAttribute('href') || '';
          const text = await link.innerText();

          if (url && !url.includes('doubao.com')) {
            sources.push({
              title: text.trim(),
              url,
              domain: this.extractDomain(url),
              sourceType: this.classifySource(url)
            });
          }
        }
      }

      console.log(`[豆包] 提取到 ${sources.length} 个引用来源`);

    } catch (error) {
      console.warn('[豆包] 提取引用来源失败:', error);
    }

    return sources;
  }

  /**
   * 豆包品牌分析
   */
  protected extractAllBrands(response: string): string[] {
    // 教育培训行业常见品牌
    const knownBrands = [
      '新航道', '新东方', '环球雅思', '学而思', '高途',
      '猿辅导', '作业帮', 'VIPKID', '51Talk', '沪江'
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
export async function createDoubaoCollector() {
  const collector = new DoubaoCollector({
    headless: false, // 豆包需要看到浏览器进行扫码登录
    slowMo: 200
  });
  await collector.init();
  return collector;
}
