/**
 * 采集器测试脚本
 * 用于测试各平台的采集功能
 */

import { createDoubaoCollector } from './collectors/doubao';
import { createDeepSeekCollector } from './collectors/deepseek';
import { collectorManager } from './collectors/manager';

async function testDoubao() {
  console.log('\n========================================');
  console.log('测试豆包采集器');
  console.log('========================================\n');

  try {
    const collector = await createDoubaoCollector();

    const result = await collector.collect(
      '福州雅思培训哪家好',
      '新航道'
    );

    console.log('\n📊 采集结果:');
    console.log('─'.repeat(50));
    console.log(`平台: ${result.platform}`);
    console.log(`关键词: ${result.keyword}`);
    console.log(`品牌: ${result.brand}`);
    console.log(`是否提及: ${result.mentioned ? '✅ 是' : '❌ 否'}`);
    console.log(`排名: ${result.rank || '未提及'}`);
    console.log(`情感: ${result.sentiment || '无'}`);
    console.log(`响应时间: ${result.responseTime}ms`);
    console.log(`截图: ${result.screenshot}`);

    console.log('\n📝 AI回答 (前500字):');
    console.log('─'.repeat(50));
    console.log(result.response.slice(0, 500) + '...');

    console.log('\n🔗 引用来源:');
    console.log('─'.repeat(50));
    if (result.sources.length === 0) {
      console.log('(无引用来源)');
    } else {
      result.sources.forEach((source, i) => {
        console.log(`${i + 1}. ${source.title}`);
        console.log(`   域名: ${source.domain}`);
        console.log(`   类型: ${source.sourceType}`);
        console.log(`   URL: ${source.url}`);
      });
    }

    await collector.close();

  } catch (error) {
    console.error('豆包采集测试失败:', error);
  }
}

async function testDeepSeek() {
  console.log('\n========================================');
  console.log('测试 DeepSeek 采集器');
  console.log('========================================\n');

  try {
    const collector = await createDeepSeekCollector();

    const result = await collector.collect(
      '福州雅思培训哪家好',
      '新航道'
    );

    console.log('\n📊 采集结果:');
    console.log('─'.repeat(50));
    console.log(`平台: ${result.platform}`);
    console.log(`关键词: ${result.keyword}`);
    console.log(`品牌: ${result.brand}`);
    console.log(`是否提及: ${result.mentioned ? '✅ 是' : '❌ 否'}`);
    console.log(`排名: ${result.rank || '未提及'}`);
    console.log(`情感: ${result.sentiment || '无'}`);
    console.log(`响应时间: ${result.responseTime}ms`);

    console.log('\n📝 AI回答 (前500字):');
    console.log('─'.repeat(50));
    console.log(result.response.slice(0, 500) + '...');

    console.log('\n🔗 引用来源:');
    console.log('─'.repeat(50));
    if (result.sources.length === 0) {
      console.log('(无引用来源)');
    } else {
      result.sources.forEach((source, i) => {
        console.log(`${i + 1}. ${source.title}`);
        console.log(`   域名: ${source.domain}`);
      });
    }

    await collector.close();

  } catch (error) {
    console.error('DeepSeek 采集测试失败:', error);
  }
}

async function testMultiPlatform() {
  console.log('\n========================================');
  console.log('测试多平台采集');
  console.log('========================================\n');

  const taskId = `test_${Date.now()}`;

  try {
    const task = await collectorManager.collectMulti(
      taskId,
      '新航道',
      ['福州雅思培训'],
      ['doubao', 'deepseek'] as any,
      (progress, message) => {
        console.log(`[${progress}%] ${message}`);
      }
    );

    console.log('\n📊 任务结果:');
    console.log('─'.repeat(50));
    console.log(`状态: ${task.status}`);
    console.log(`进度: ${task.progress}%`);
    console.log(`结果数: ${task.results.length}`);

    const report = collectorManager.generateReport(task);
    console.log('\n📈 GEO报告:');
    console.log('─'.repeat(50));
    console.log(`GEO健康度: ${report.score}`);
    console.log(`覆盖平台: ${report.summary.mentionedPlatforms}/${report.summary.totalPlatforms}`);
    console.log(`平均排名: ${report.summary.avgRank || '无'}`);
    console.log(`主要来源: ${report.summary.topSource || '无'}`);

  } catch (error) {
    console.error('多平台采集测试失败:', error);
  }

  await collectorManager.closeAll();
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'doubao';

  switch (testType) {
    case 'doubao':
      await testDoubao();
      break;
    case 'deepseek':
      await testDeepSeek();
      break;
    case 'multi':
      await testMultiPlatform();
      break;
    default:
      console.log('用法: npx ts-node test-collector.ts [doubao|deepseek|multi]');
  }

  process.exit(0);
}

main();
