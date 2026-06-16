// ============================================
// 服务器入口
// ============================================

import app from './app.js'
import { env } from './config/env.js'
import logger from './utils/logger.js'
import { testConnection as testMySQL, initTables } from './db/mysql.js'
import { cache } from './db/redis.js'

async function startServer() {
  logger.info('========================================')
  logger.info('WhatsApp AI SaaS 后端启动中...')
  logger.info(`环境: ${env.NODE_ENV}`)
  logger.info('========================================')

  // -------- MySQL --------
  try {
    const mysqlOk = await testMySQL()
    if (mysqlOk) {
      await initTables()
      logger.info('MySQL 连接并初始化完成')
    } else {
      logger.warn('MySQL 连接失败，服务将以降级模式运行')
    }
  } catch (error) {
    logger.error('MySQL 初始化异常', error)
    logger.warn('服务将以降级模式运行（无数据库）')
  }

  // -------- Redis --------
  try {
    const redisOk = await cache.testConnection()
    if (redisOk) {
      logger.info('Redis 连接成功')
    } else {
      logger.warn('Redis 连接失败，缓存功能不可用')
    }
  } catch (error) {
    logger.error('Redis 初始化异常', error)
    logger.warn('缓存功能不可用')
  }

  // -------- 启动 HTTP 服务 --------
  app.listen(env.PORT, () => {
    logger.info('========================================')
    logger.info(`✅ 服务器已启动: http://localhost:${env.PORT}`)
    logger.info(`📋 健康检查: http://localhost:${env.PORT}/health`)
    logger.info(`📨 Webhook:   http://localhost:${env.PORT}/webhook`)
    logger.info(`💬 消息 API:  http://localhost:${env.PORT}/api/messages`)
    logger.info('========================================')
  })
}

startServer().catch((error) => {
  logger.error('服务器启动失败', error)
  process.exit(1)
})
