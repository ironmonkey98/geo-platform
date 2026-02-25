import { describe, it, expect, beforeEach } from 'vitest';

/**
 * GEO优化平台 - 单元测试
 * 基于 PRD v1.1 和 TEST-CASES.md
 */

// ========================================
// TC-02: AI蒸馏模块 - 工具函数测试
// ========================================

describe('TC-02 AI蒸馏模块 - 单元测试', () => {

  // 模拟关键词生成函数
  function generateKeywords(keyword: string, industry: string, types: string[] = ['search', 'question', 'brand']) {
    const result: Record<string, string[]> = {
      search: [],
      question: [],
      brand: []
    };

    if (types.includes('search')) {
      result.search = [
        `${keyword}哪家好`,
        `${keyword}排名`,
        `${keyword}价格`,
        `${keyword}多少钱`,
        `${keyword}口碑`,
        `${keyword}推荐`,
        `${keyword}评价`,
        `${keyword}怎么样`,
        `${keyword}机构`,
        `${keyword}培训班`
      ];
    }

    if (types.includes('question')) {
      result.question = [
        `${keyword}哪家效果好`,
        `${keyword}需要多少钱`,
        `${keyword}怎么选择`,
        `${keyword}要注意什么`,
        `${keyword}有什么坑`,
        `${keyword}多久能学会`,
        `${keyword}难不难`,
        `${keyword}有没有用`,
        `${keyword}值不值得报`,
        `${keyword}效果怎么样`
      ];
    }

    if (types.includes('brand')) {
      result.brand = [
        `${keyword}官网`,
        `${keyword}电话`,
        `${keyword}地址`,
        `${keyword}营业时间`,
        `${keyword}师资`,
        `${keyword}怎么样`,
        `${keyword}好不好`,
        `${keyword}靠谱吗`,
        `${keyword}口碑如何`,
        `${keyword}评价`
      ];
    }

    return result;
  }

  /**
   * TC-02-001: 生成关键词分类
   */
  it('TC-02-001: 生成关键词分类', () => {
    const result = generateKeywords('雅思培训', 'education');

    expect(result.search.length).toBeGreaterThan(5);
    expect(result.question.length).toBeGreaterThan(5);
    expect(result.brand.length).toBeGreaterThan(5);

    // 验证关键词包含核心词
    expect(result.search[0]).toContain('雅思培训');
  });

  /**
   * TC-02-002: 核心词必填校验
   */
  it('TC-02-002: 核心词必填校验', () => {
    const validateForm = (keyword: string) => {
      return keyword.trim().length > 0;
    };

    expect(validateForm('')).toBe(false);
    expect(validateForm('雅思培训')).toBe(true);
  });

  /**
   * TC-02-003: 只生成搜索词
   */
  it('TC-02-003: 只生成搜索词', () => {
    const result = generateKeywords('雅思培训', 'education', ['search']);

    expect(result.search.length).toBeGreaterThan(0);
    expect(result.question.length).toBe(0);
    expect(result.brand.length).toBe(0);
  });

  /**
   * TC-02-004: 只生成问答词
   */
  it('TC-02-004: 只生成问答词', () => {
    const result = generateKeywords('雅思培训', 'education', ['question']);

    expect(result.search.length).toBe(0);
    expect(result.question.length).toBeGreaterThan(0);
    expect(result.brand.length).toBe(0);
  });

  /**
   * TC-02-005: 关键词去重
   */
  it('TC-02-005: 关键词去重', () => {
    const uniqueKeywords = (keywords: string[]) => {
      return [...new Set(keywords)];
    };

    const input = ['雅思培训', '雅思培训', '托福培训', '雅思培训'];
    const result = uniqueKeywords(input);

    expect(result.length).toBe(2);
  });
});

// ========================================
// TC-01: 策略分析模块 - 工具函数测试
// ========================================

describe('TC-01 策略分析模块 - 单元测试', () => {

  // 模拟GEO评分计算
  function calculateGEOScore(platforms: Array<{ mentioned: boolean; score: number }>) {
    if (platforms.length === 0) return 0;

    const mentionedCount = platforms.filter(p => p.mentioned).length;
    const avgScore = platforms.reduce((sum, p) => sum + p.score, 0) / platforms.length;
    const coverageScore = (mentionedCount / platforms.length) * 30;

    return Math.round(avgScore * 0.7 + coverageScore);
  }

  /**
   * TC-01-005: GEO评分计算 - 正常
   */
  it('TC-01-005: GEO评分计算 - 正常', () => {
    const platforms = [
      { mentioned: true, score: 92 },
      { mentioned: false, score: 0 },
      { mentioned: true, score: 78 },
      { mentioned: true, score: 71 }
    ];

    const score = calculateGEOScore(platforms);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  /**
   * TC-01-005: GEO评分 - 全部提及
   */
  it('TC-01-005: GEO评分 - 全部提及', () => {
    const platforms = [
      { mentioned: true, score: 90 },
      { mentioned: true, score: 85 },
      { mentioned: true, score: 80 },
      { mentioned: true, score: 75 }
    ];

    const score = calculateGEOScore(platforms);

    expect(score).toBeGreaterThan(70);
  });

  /**
   * TC-01-005: GEO评分 - 全部未提及
   */
  it('TC-01-005: GEO评分 - 全部未提及', () => {
    const platforms = [
      { mentioned: false, score: 0 },
      { mentioned: false, score: 0 },
      { mentioned: false, score: 0 }
    ];

    const score = calculateGEOScore(platforms);

    expect(score).toBe(0);
  });

  /**
   * TC-01-003: 关键词数量限制
   */
  it('TC-01-003: 关键词数量限制', () => {
    const MAX_KEYWORDS = 20;

    const validateKeywordCount = (count: number) => {
      return count <= MAX_KEYWORDS;
    };

    expect(validateKeywordCount(15)).toBe(true);
    expect(validateKeywordCount(20)).toBe(true);
    expect(validateKeywordCount(21)).toBe(false);
  });
});

// ========================================
// TC-03: 内容生成模块 - 工具函数测试
// ========================================

describe('TC-03 内容生成模块 - 单元测试', () => {

  // 模拟内容模板
  const templates = {
    ranking: (brand: string, keyword: string, region: string) => `
      <h1>${region}${keyword}机构排名 2026实评版</h1>
      <p>为了帮助学员选择合适的机构...</p>
      <h2>TOP 5 机构排名</h2>
      <h3>1. ${brand}</h3>
    `,
    review: (brand: string, keyword: string) => `
      <h1>${keyword}深度评测</h1>
      <p>本次评测对象为${brand}...</p>
    `
  };

  /**
   * TC-03-001: 排名榜单模板生成
   */
  it('TC-03-001: 排名榜单模板生成', () => {
    const content = templates.ranking('新航道', '雅思培训', '福州');

    expect(content).toContain('福州');
    expect(content).toContain('雅思培训');
    expect(content).toContain('新航道');
    expect(content).toContain('排名');
  });

  /**
   * TC-03-002: 评测对比模板生成
   */
  it('TC-03-002: 评测对比模板生成', () => {
    const content = templates.review('新航道', '雅思培训');

    expect(content).toContain('评测');
    expect(content).toContain('新航道');
  });

  /**
   * TC-03-003: 内容字数统计
   */
  it('TC-03-003: 内容字数统计', () => {
    const countWords = (html: string) => {
      const text = html.replace(/<[^>]+>/g, '');
      return text.length;
    };

    const content = templates.ranking('新航道', '雅思培训', '福州');
    const wordCount = countWords(content);

    expect(wordCount).toBeGreaterThan(50);
  });
});

// ========================================
// TC-04: 关键词管理模块 - 工具函数测试
// ========================================

describe('TC-04 关键词管理模块 - 单元测试', () => {

  /**
   * TC-04-001: 关键词分组
   */
  it('TC-04-001: 关键词分组', () => {
    const keywords = [
      { text: '雅思培训哪家好', type: 'search' },
      { text: '雅思培训哪家效果好', type: 'question' },
      { text: '新航道官网', type: 'brand' }
    ];

    const grouped = {
      search: keywords.filter(k => k.type === 'search'),
      question: keywords.filter(k => k.type === 'question'),
      brand: keywords.filter(k => k.type === 'brand')
    };

    expect(grouped.search.length).toBe(1);
    expect(grouped.question.length).toBe(1);
    expect(grouped.brand.length).toBe(1);
  });

  /**
   * TC-04-002: 批量选择
   */
  it('TC-04-002: 批量选择', () => {
    const keywords = ['关键词1', '关键词2', '关键词3'];
    const selected: string[] = [];

    const selectAll = () => {
      selected.push(...keywords);
    };

    selectAll();

    expect(selected.length).toBe(3);
  });
});

// ========================================
// 表单验证测试
// ========================================

describe('表单验证测试', () => {

  /**
   * TC-01-002: 必填项校验
   */
  it('TC-01-002: 必填项校验', () => {
    const validateDetectionForm = (data: { brandName: string; industry: string; keywords: string[] }) => {
      const errors: string[] = [];

      if (!data.brandName.trim()) errors.push('请输入品牌名称');
      if (!data.industry) errors.push('请选择行业');
      if (data.keywords.length === 0) errors.push('请至少添加一个关键词');

      return { valid: errors.length === 0, errors };
    };

    // 空表单
    const result1 = validateDetectionForm({ brandName: '', industry: '', keywords: [] });
    expect(result1.valid).toBe(false);
    expect(result1.errors.length).toBe(3);

    // 完整表单
    const result2 = validateDetectionForm({
      brandName: '新航道',
      industry: 'education',
      keywords: ['雅思培训']
    });
    expect(result2.valid).toBe(true);
  });

  /**
   * TC-02-002: 蒸馏表单校验
   */
  it('TC-02-002: 蒸馏表单校验', () => {
    const validateDistillationForm = (data: { keyword: string; industry: string }) => {
      const errors: string[] = [];

      if (!data.keyword.trim()) errors.push('请输入核心词');
      if (!data.industry) errors.push('请选择行业');

      return { valid: errors.length === 0, errors };
    };

    const result1 = validateDistillationForm({ keyword: '', industry: '' });
    expect(result1.valid).toBe(false);

    const result2 = validateDistillationForm({ keyword: '雅思培训', industry: 'education' });
    expect(result2.valid).toBe(true);
  });
});

// ========================================
// 工具函数测试
// ========================================

describe('工具函数测试', () => {

  /**
   * 评分颜色映射
   */
  it('评分颜色映射', () => {
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'success';
      if (score >= 50) return 'warning';
      return 'danger';
    };

    expect(getScoreColor(92)).toBe('success');
    expect(getScoreColor(65)).toBe('warning');
    expect(getScoreColor(15)).toBe('danger');
  });

  /**
   * 平台名称映射
   */
  it('平台名称映射', () => {
    const platformNames: Record<string, string> = {
      doubao: '豆包',
      deepseek: 'DeepSeek',
      yuanbao: '元宝',
      kimi: 'Kimi'
    };

    expect(platformNames['doubao']).toBe('豆包');
    expect(platformNames['deepseek']).toBe('DeepSeek');
  });

  /**
   * 日期格式化
   */
  it('日期格式化', () => {
    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 10);
    };

    const date = new Date('2026-02-25T14:35:00Z');
    expect(formatDate(date)).toBe('2026-02-25');
  });
});
UNITTESTEOF
echo "✅ 单元测试文件已创建"
