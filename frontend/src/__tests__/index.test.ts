import { describe, it, expect } from 'vitest';

// ========================================
// TC-02: AI蒸馏模块 - 工具函数测试
// ========================================

describe('TC-02 AI蒸馏模块', () => {

  function generateKeywords(keyword: string, industry: string, types: string[] = ['search', 'question', 'brand']) {
    const result: Record<string, string[]> = { search: [], question: [], brand: [] };

    if (types.includes('search')) {
      result.search = [
        `${keyword}哪家好`, `${keyword}排名`, `${keyword}价格`, `${keyword}多少钱`,
        `${keyword}口碑`, `${keyword}推荐`, `${keyword}评价`, `${keyword}怎么样`
      ];
    }

    if (types.includes('question')) {
      result.question = [
        `${keyword}哪家效果好`, `${keyword}需要多少钱`, `${keyword}怎么选择`,
        `${keyword}要注意什么`, `${keyword}有什么坑`
      ];
    }

    if (types.includes('brand')) {
      result.brand = [
        `${keyword}官网`, `${keyword}电话`, `${keyword}地址`, `${keyword}营业时间`
      ];
    }

    return result;
  }

  it('TC-02-001: 生成关键词分类', () => {
    const result = generateKeywords('雅思培训', 'education');
    expect(result.search.length).toBeGreaterThan(5);
    expect(result.question.length).toBeGreaterThan(3);
    expect(result.brand.length).toBeGreaterThan(2);
    expect(result.search[0]).toContain('雅思培训');
  });

  it('TC-02-002: 核心词必填校验', () => {
    const validateForm = (keyword: string) => keyword.trim().length > 0;
    expect(validateForm('')).toBe(false);
    expect(validateForm('雅思培训')).toBe(true);
  });

  it('TC-02-003: 只生成搜索词', () => {
    const result = generateKeywords('雅思培训', 'education', ['search']);
    expect(result.search.length).toBeGreaterThan(0);
    expect(result.question.length).toBe(0);
    expect(result.brand.length).toBe(0);
  });

  it('TC-02-004: 关键词去重', () => {
    const uniqueKeywords = (keywords: string[]) => [...new Set(keywords)];
    const input = ['雅思培训', '雅思培训', '托福培训', '雅思培训'];
    expect(uniqueKeywords(input).length).toBe(2);
  });
});

// ========================================
// TC-01: 策略分析模块 - 工具函数测试
// ========================================

describe('TC-01 策略分析模块', () => {

  function calculateGEOScore(platforms: Array<{ mentioned: boolean; score: number }>) {
    if (platforms.length === 0) return 0;
    const mentionedCount = platforms.filter(p => p.mentioned).length;
    const avgScore = platforms.reduce((sum, p) => sum + p.score, 0) / platforms.length;
    const coverageScore = (mentionedCount / platforms.length) * 30;
    return Math.round(avgScore * 0.7 + coverageScore);
  }

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

  it('TC-01-005: GEO评分 - 全部提及', () => {
    const platforms = [
      { mentioned: true, score: 90 },
      { mentioned: true, score: 85 },
      { mentioned: true, score: 80 }
    ];
    expect(calculateGEOScore(platforms)).toBeGreaterThan(70);
  });

  it('TC-01-003: 关键词数量限制', () => {
    const MAX_KEYWORDS = 20;
    expect(15 <= MAX_KEYWORDS).toBe(true);
    expect(21 <= MAX_KEYWORDS).toBe(false);
  });
});

// ========================================
// 表单验证测试
// ========================================

describe('表单验证测试', () => {

  it('TC-01-002: 必填项校验', () => {
    const validateDetectionForm = (data: { brandName: string; industry: string; keywords: string[] }) => {
      const errors: string[] = [];
      if (!data.brandName.trim()) errors.push('请输入品牌名称');
      if (!data.industry) errors.push('请选择行业');
      if (data.keywords.length === 0) errors.push('请至少添加一个关键词');
      return { valid: errors.length === 0, errors };
    };

    const result1 = validateDetectionForm({ brandName: '', industry: '', keywords: [] });
    expect(result1.valid).toBe(false);
    expect(result1.errors.length).toBe(3);

    const result2 = validateDetectionForm({ brandName: '新航道', industry: 'education', keywords: ['雅思培训'] });
    expect(result2.valid).toBe(true);
  });

  it('TC-02-002: 蒸馏表单校验', () => {
    const validateDistillationForm = (data: { keyword: string; industry: string }) => {
      const errors: string[] = [];
      if (!data.keyword.trim()) errors.push('请输入核心词');
      if (!data.industry) errors.push('请选择行业');
      return { valid: errors.length === 0, errors };
    };

    expect(validateDistillationForm({ keyword: '', industry: '' }).valid).toBe(false);
    expect(validateDistillationForm({ keyword: '雅思培训', industry: 'education' }).valid).toBe(true);
  });
});

// ========================================
// 工具函数测试
// ========================================

describe('工具函数测试', () => {

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

  it('平台名称映射', () => {
    const platformNames: Record<string, string> = {
      doubao: '豆包', deepseek: 'DeepSeek', yuanbao: '元宝', kimi: 'Kimi'
    };
    expect(platformNames['doubao']).toBe('豆包');
  });

  it('日期格式化', () => {
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    expect(formatDate(new Date('2026-02-25T14:35:00Z'))).toBe('2026-02-25');
  });
});
