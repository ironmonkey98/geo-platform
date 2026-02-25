/**
 * 采集器基类
 * 所有平台采集器的公共逻辑
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import {
  Platform,
  PlatformResult,
  Source,
  CollectorConfig,
  PlatformConfig
} from '../types/collector';

export abstract class BaseCollector {
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected page: Page | null = null;
  protected config: CollectorConfig;
  protected platformConfig: PlatformConfig;

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = {
      headless: true,
      timeout: 30000,
      slowMo: 100,
      ...config
    };
    this.platformConfig = this.getPlatformConfig();
  }

  /**
   * 子类必须实现：返回平台配置
   */
  protected abstract getPlatformConfig(): PlatformConfig;

  /**
   * 子类必须实现：平台特定的登录逻辑
   */
  protected abstract login(): Promise<void>;

  /**
   * 子类可选实现：平台特定的回答解析
   */
  protected parseResponse(): string {
    return '';
  }

  /**
   * 子类可选实现：平台特定的引用来源解析
   */
  protected parseSources(): Source[] {
    return [];
  }

  /**
   * 初始化浏览器
   */
  async init(): Promise<void> {
    console.log(`[Collector] 初始化 ${this.platformConfig.displayName} 采集器`);

    this.browser = await chromium.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    // 创建带自定义UA的上下文
    this.context = await this.browser.newContext({
      userAgent: this.config.userAgent || this.getDefaultUserAgent(),
      viewport: { width: 1280, height: 800 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    });

    // 注入反检测脚本
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.config.timeout);
  }

  /**
   * 执行采集
   */
  async collect(keyword: string, brand: string): Promise<PlatformResult> {
    const startTime = Date.now();

    if (!this.page) {
      await this.init();
    }

    console.log(`[${this.platformConfig.displayName}] 开始采集: "${keyword}" 品牌: "${brand}"`);

    const result: PlatformResult = {
      platform: this.platformConfig.name,
      keyword,
      brand,
      mentioned: false,
      rank: null,
      sentiment: null,
      response: '',
      brandContext: '',
      sources: [],
      sourceCount: 0,
      collectedAt: new Date(),
      screenshot: '',
      responseTime: 0
    };

    try {
      // 1. 打开平台
      await this.page.goto(this.platformConfig.url, { waitUntil: 'domcontentloaded' });

      // 2. 检查登录状态
      await this.checkLogin();

      // 3. 输入关键词并搜索
      await this.inputAndSearch(keyword);

      // 4. 等待回答完成
      await this.waitForResponse();

      // 5. 解析回答内容
      result.response = await this.extractResponse();

      // 6. 解析引用来源
      result.sources = await this.extractSources();
      result.sourceCount = result.sources.length;

      // 7. 分析品牌提及
      const analysis = this.analyzeBrandMention(result.response, brand);
      result.mentioned = analysis.mentioned;
      result.rank = analysis.rank;
      result.brandContext = analysis.context;
      result.sentiment = analysis.sentiment;

      // 8. 截图保存
      const screenshotPath = `screenshots/${this.platformConfig.name}_${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;

      result.responseTime = Date.now() - startTime;

      console.log(`[${this.platformConfig.displayName}] 采集完成: 提及=${result.mentioned}, 排名=${result.rank}, 来源数=${result.sourceCount}`);

    } catch (error) {
      console.error(`[${this.platformConfig.displayName}] 采集失败:`, error);
      throw error;
    }

    return result;
  }

  /**
   * 检查登录状态，未登录则执行登录
   */
  protected async checkLogin(): Promise<void> {
    // 子类实现具体的登录检查逻辑
  }

  /**
   * 输入关键词并提交搜索
   */
  protected async inputAndSearch(keyword: string): Promise<void> {
    const selectors = this.platformConfig.selectors;

    // 等待输入框出现
    await this.page!.waitForSelector(selectors.input, { state: 'visible' });

    // 清空并输入
    await this.page!.fill(selectors.input, '');
    await this.page!.type(selectors.input, keyword, { delay: 50 });

    // 提交搜索
    if (selectors.submit) {
      await this.page!.click(selectors.submit);
    } else {
      await this.page!.keyboard.press('Enter');
    }
  }

  /**
   * 等待AI回答完成
   */
  protected async waitForResponse(): Promise<void> {
    const selectors = this.platformConfig.selectors;

    // 等待加载状态消失
    if (selectors.loading) {
      try {
        await this.page!.waitForSelector(selectors.loading, { state: 'hidden', timeout: 60000 });
      } catch {
        // 忽略超时，继续
      }
    }

    // 额外等待确保内容加载
    await this.page!.waitForTimeout(2000);
  }

  /**
   * 提取AI回答内容
   */
  protected async extractResponse(): Promise<string> {
    const selectors = this.platformConfig.selectors;

    try {
      const responseEl = await this.page!.waitForSelector(selectors.response, { timeout: 10000 });
      return await responseEl.innerText();
    } catch {
      return '';
    }
  }

  /**
   * 提取引用来源
   */
  protected async extractSources(): Promise<Source[]> {
    const sources: Source[] = [];
    const selectors = this.platformConfig.selectors;

    if (!selectors.sources) return sources;

    try {
      const sourceEls = await this.page!.$$(selectors.sources);

      for (const el of sourceEls) {
        const title = await el.getAttribute('title') || await el.innerText();
        const url = await el.getAttribute('href') || '';
        const domain = this.extractDomain(url);

        sources.push({
          title: title.trim(),
          url,
          domain,
          sourceType: this.classifySource(domain)
        });
      }
    } catch (error) {
      console.warn('提取引用来源失败:', error);
    }

    return sources;
  }

  /**
   * 分析品牌提及
   */
  protected analyzeBrandMention(response: string, brand: string): {
    mentioned: boolean;
    rank: number | null;
    context: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  } {
    const lowerResponse = response.toLowerCase();
    const lowerBrand = brand.toLowerCase();

    if (!lowerResponse.includes(lowerBrand)) {
      return { mentioned: false, rank: null, context: '', sentiment: 'neutral' };
    }

    // 提取品牌上下文（前后100字符）
    const index = lowerResponse.indexOf(lowerBrand);
    const start = Math.max(0, index - 100);
    const end = Math.min(response.length, index + brand.length + 100);
    const context = response.slice(start, end);

    // 计算排名（在所有品牌提及中的位置）
    const brands = this.extractAllBrands(response);
    const rank = brands.indexOf(brand) + 1 || null;

    // 简单情感分析
    const sentiment = this.analyzeSentiment(context);

    return { mentioned: true, rank, context, sentiment };
  }

  /**
   * 提取回答中提到的所有品牌
   */
  protected extractAllBrands(response: string): string[] {
    // 这里应该有一个品牌词库，暂时返回空
    return [];
  }

  /**
   * 情感分析
   */
  protected analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['推荐', '好评', '优秀', '专业', '权威', '领先'];
    const negativeWords = ['差评', '不推荐', '避坑', '坑', '不好'];

    const lowerText = text.toLowerCase();

    for (const word of positiveWords) {
      if (lowerText.includes(word)) return 'positive';
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) return 'negative';
    }

    return 'neutral';
  }

  /**
   * 从URL提取域名
   */
  protected extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  /**
   * 分类来源类型
   */
  protected classifySource(domain: string): string {
    const typeMap: Record<string, string[]> = {
      '新闻': ['news', '日报', '晚报', '财经', '新浪', '网易', '腾讯'],
      '百科': ['baike', 'wiki'],
      '问答': ['zhihu', 'quora', '百度知道'],
      '社交': ['weibo', 'xiaohongshu', 'douyin']
    };

    for (const [type, keywords] of Object.entries(typeMap)) {
      if (keywords.some(kw => domain.includes(kw))) {
        return type;
      }
    }

    return '其他';
  }

  /**
   * 获取默认User-Agent
   */
  protected getDefaultUserAgent(): string {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 随机延时
   */
  protected async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await this.page?.waitForTimeout(delay);
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}
