/**
 * 采集器管理器
 * 统一管理所有平台的采集任务
 */

import { Platform, PlatformResult, CollectionTask } from '../types/collector';
import { DoubaoCollector, createDoubaoCollector } from './doubao';
import { DeepSeekCollector, createDeepSeekCollector } from './deepseek';

// 采集器类型
type Collector = DoubaoCollector | DeepSeekCollector;

// 采集器工厂映射
const collectorFactories: Record<Platform, () => Promise<Collector>> = {
  doubao: createDoubaoCollector,
  deepseek: createDeepSeekCollector,
  yuanbao: async () => { throw new Error('元宝采集器待实现'); },
  kimi: async () => { throw new Error('Kimi采集器待实现'); },
  wenxin: async () => { throw new Error('文心采集器待实现'); }
};

export class CollectorManager {
  private collectors: Map<Platform, Collector> = new Map();
  private tasks: Map<string, CollectionTask> = new Map();

  /**
   * 获取或创建采集器
   */
  async getCollector(platform: Platform): Promise<Collector> {
    if (!this.collectors.has(platform)) {
      const factory = collectorFactories[platform];
      const collector = await factory();
      this.collectors.set(platform, collector);
    }
    return this.collectors.get(platform)!;
  }

  /**
   * 执行单平台采集
   */
  async collectSingle(
    platform: Platform,
    keyword: string,
    brand: string
  ): Promise<PlatformResult> {
    const collector = await this.getCollector(platform);
    return collector.collect(keyword, brand);
  }

  /**
   * 执行多平台采集任务
   */
  async collectMulti(
    taskId: string,
    brand: string,
    keywords: string[],
    platforms: Platform[],
    onProgress?: (progress: number, message: string) => void
  ): Promise<CollectionTask> {
    const task: CollectionTask = {
      id: taskId,
      brand,
      keywords,
      platforms,
      status: 'running',
      progress: 0,
      results: [],
      createdAt: new Date()
    };

    this.tasks.set(taskId, task);

    const totalSteps = keywords.length * platforms.length;
    let completedSteps = 0;

    try {
      for (const keyword of keywords) {
        for (const platform of platforms) {
          onProgress?.(
            Math.round((completedSteps / totalSteps) * 100),
            `正在采集 ${platform} - ${keyword}`
          );

          try {
            const result = await this.collectSingle(platform, keyword, brand);
            task.results.push(result);
          } catch (error) {
            console.error(`采集失败: ${platform} - ${keyword}`, error);
            // 记录失败结果
            task.results.push({
              platform,
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
            });
          }

          completedSteps++;
          task.progress = Math.round((completedSteps / totalSteps) * 100);
        }
      }

      task.status = 'completed';
      task.completedAt = new Date();
      onProgress?.(100, '采集完成');

    } catch (error) {
      task.status = 'failed';
      console.error('采集任务失败:', error);
    }

    return task;
  }

  /**
   * 获取任务状态
   */
  getTask(taskId: string): CollectionTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 关闭所有采集器
   */
  async closeAll(): Promise<void> {
    for (const collector of this.collectors.values()) {
      await collector.close();
    }
    this.collectors.clear();
  }

  /**
   * 生成GEO报告
   */
  generateReport(task: CollectionTask): {
    score: number;
    platformResults: Record<Platform, PlatformResult>;
    summary: {
      totalPlatforms: number;
      mentionedPlatforms: number;
      avgRank: number | null;
      topSource: string;
    };
  } {
    const platformResults: Record<string, PlatformResult> = {};

    for (const result of task.results) {
      platformResults[result.platform] = result;
    }

    // 计算GEO健康度评分
    const mentionedCount = task.results.filter(r => r.mentioned).length;
    const totalPlatforms = task.platforms.length;
    const coverageScore = (mentionedCount / totalPlatforms) * 40;

    // 平均排名分数（排名越靠前分数越高）
    const ranks = task.results
      .filter(r => r.rank !== null)
      .map(r => r.rank!);
    const avgRank = ranks.length > 0
      ? ranks.reduce((a, b) => a + b, 0) / ranks.length
      : null;
    const rankScore = avgRank ? Math.max(0, 30 - avgRank * 5) : 0;

    // 引用来源多样性
    const allSources = task.results.flatMap(r => r.sources);
    const uniqueDomains = new Set(allSources.map(s => s.domain));
    const sourceScore = Math.min(30, uniqueDomains.size * 5);

    const score = Math.round(coverageScore + rankScore + sourceScore);

    // 找出最常见的引用来源
    const domainCounts: Record<string, number> = {};
    for (const source of allSources) {
      domainCounts[source.domain] = (domainCounts[source.domain] || 0) + 1;
    }
    const topSource = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      score,
      platformResults: platformResults as Record<Platform, PlatformResult>,
      summary: {
        totalPlatforms,
        mentionedPlatforms: mentionedCount,
        avgRank,
        topSource
      }
    };
  }
}

// 导出单例
export const collectorManager = new CollectorManager();
