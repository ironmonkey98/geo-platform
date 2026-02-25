import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app: Application = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 路由
app.get('/api/detection', (_req: Request, res: Response) => {
  res.json([
    { id: '1', brand: '新航道', status: 'completed', score: 78, createdAt: '2026-02-25T14:35:00Z' },
    { id: '2', brand: '环球雅思', status: 'completed', score: 85, createdAt: '2026-02-15T09:15:00Z' }
  ])
})

app.post('/api/detection', (req: Request, res: Response) => {
  const { brandName, industry, keywords, platforms } = req.body
  const id = Date.now().toString()
  res.json({ id, brandName, industry, keywords, platforms, status: 'pending' })
})

app.get('/api/detection/:id/status', (req: Request, res: Response) => {
  res.json({ id: req.params.id, progress: 78, status: 'running' })
})

app.get('/api/report/:id', (req: Request, res: Response) => {
  res.json({
    id: req.params.id,
    brand: '新航道',
    score: 78,
    platforms: {
      doubao: { mentioned: true, rank: 1, sentiment: 'positive' },
      deepseek: { mentioned: false, rank: null, sentiment: null },
      yuanbao: { mentioned: true, rank: 2, sentiment: 'positive' },
      kimi: { mentioned: true, rank: 3, sentiment: 'neutral' }
    }
  })
})

app.post('/api/distillation', (req: Request, res: Response) => {
  const { keyword, industry, region } = req.body
  res.json({
    search: [`${keyword}哪家好`, `${keyword}排名`, `${keyword}价格`, `${region}${keyword}`],
    question: [`${keyword}哪家效果好`, `${keyword}需要多少钱`, `${keyword}怎么选择`],
    brand: [`${keyword}官网`, `${keyword}电话`, `${keyword}地址`]
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
