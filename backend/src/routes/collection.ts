/**
 * 采集API路由
 * 提供前端调用的采集接口
 */

import express, { Request, Response } from 'express';
import { collectorManager } from './collectors/manager';
import { Platform } from './types/collector';

const router = express.Router();

// 创建采集任务
router.post('/api/collection/start', async (req: Request, res: Response) => {
  try {
    const { brand, keywords, platforms } = req.body;

    if (!brand || !keywords || !platforms) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['brand', 'keywords', 'platforms']
      });
    }

    const taskId = `task_${Date.now()}`;

    // 异步执行采集
    collectorManager.collectMulti(
      taskId,
      brand,
      keywords,
      platforms as Platform[],
      (progress, message) => {
        console.log(`[Task ${taskId}] ${progress}% - ${message}`);
      }
    ).then(task => {
      console.log(`[Task ${taskId}] 完成, 结果数: ${task.results.length}`);
    }).catch(err => {
      console.error(`[Task ${taskId}] 失败:`, err);
    });

    res.json({
      success: true,
      taskId,
      message: '采集任务已创建'
    });

  } catch (error) {
    console.error('创建采集任务失败:', error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

// 获取任务状态
router.get('/api/collection/status/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = collectorManager.getTask(taskId);

  if (!task) {
    return res.status(404).json({ error: '任务不存在' });
  }

  res.json({
    taskId: task.id,
    status: task.status,
    progress: task.progress,
    resultCount: task.results.length,
    createdAt: task.createdAt,
    completedAt: task.completedAt
  });
});

// 获取采集结果
router.get('/api/collection/result/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = collectorManager.getTask(taskId);

  if (!task) {
    return res.status(404).json({ error: '任务不存在' });
  }

  if (task.status !== 'completed') {
    return res.status(400).json({ error: '任务尚未完成', status: task.status });
  }

  const report = collectorManager.generateReport(task);

  res.json({
    taskId: task.id,
    brand: task.brand,
    keywords: task.keywords,
    ...report
  });
});

// 测试单个平台采集
router.post('/api/collection/test', async (req: Request, res: Response) => {
  try {
    const { platform, keyword, brand } = req.body;

    console.log(`[Test] 开始测试采集: ${platform} - ${keyword} - ${brand}`);

    const result = await collectorManager.collectSingle(
      platform as Platform,
      keyword,
      brand
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('测试采集失败:', error);
    res.status(500).json({
      error: '采集失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;
