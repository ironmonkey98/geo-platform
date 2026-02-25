/**
 * 采集器类型定义
 * 定义各平台采集结果的统一格式
 */

// 平台类型
export type Platform = 'doubao' | 'deepseek' | 'yuanbao' | 'kimi' | 'wenxin';

// 引用来源
export interface Source {
  title: string;          // 来源标题
  url: string;            // 来源URL
  domain: string;         // 域名
  sourceType: string;     // 来源类型：新闻/百科/问答/社交
}

// 平台检测结果
export interface PlatformResult {
  platform: Platform;           // 平台名称
  keyword: string;              // 检测关键词
  brand: string;                // 检测品牌

  // 核心指标
  mentioned: boolean;           // 是否被提及
  rank: number | null;          // 排名（1=第一个提及）
  sentiment: 'positive' | 'neutral' | 'negative' | null;  // 情感倾向

  // 详细内容
  response: string;             // AI完整回答
  brandContext: string;         // 品牌提及的上下文

  // 引用来源
  sources: Source[];            // 引用的来源列表
  sourceCount: number;          // 引用来源数量

  // 元数据
  collectedAt: Date;            // 采集时间
  screenshot: string;           // 截图路径
  responseTime: number;         // 响应时间(ms)
}

// 采集任务
export interface CollectionTask {
  id: string;
  brand: string;
  keywords: string[];
  platforms: Platform[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: PlatformResult[];
  createdAt: Date;
  completedAt?: Date;
}

// 采集器配置
export interface CollectorConfig {
  headless: boolean;            // 是否无头模式
  timeout: number;              // 超时时间(ms)
  slowMo: number;               // 慢速模式(ms)
  proxy?: string;               // 代理地址
  userAgent?: string;           // User-Agent
}

// 平台配置
export interface PlatformConfig {
  name: Platform;
  displayName: string;
  url: string;
  selectors: {
    input: string;              // 输入框选择器
    submit: string;             // 提交按钮选择器
    response: string;           // 回答区域选择器
    sources: string;            // 引用来源选择器
    loading: string;            // 加载状态选择器
  };
  waitStrategy: 'networkidle' | 'selector' | 'timeout';
  waitTime: number;             // 等待时间
}
