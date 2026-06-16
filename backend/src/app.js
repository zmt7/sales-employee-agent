// ============================================
// Express 应用配置
// ============================================

import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import logger from './utils/logger.js'

// 路由
import webhookRoutes from './routes/webhook.routes.js'
import messageRoutes from './routes/message.routes.js'

const app = express()

// ====== 中间件 ======

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

// JSON 解析（webhook 需要 raw body，但 WhatsApp 发的是 JSON，所以这里用 express.json）
app.use(express.json({ limit: '1mb' }))

// 请求日志
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.url}`)
  next()
})

// ====== 路由 ======

// WhatsApp Webhook
app.use('/webhook', webhookRoutes)

// 消息管理 API（供前端使用）
app.use('/api/messages', messageRoutes)

// ====== 健康检查 ======
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  })
})

// ====== 404 ======
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// ====== 全局错误处理 ======
app.use((err, _req, res, _next) => {
  logger.error('未捕获的异常', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

export default app
