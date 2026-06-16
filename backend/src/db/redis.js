// ============================================
// Redis 连接
// ============================================

import Redis from 'ioredis'
import { env } from '../config/env.js'
import logger from '../utils/logger.js'

let client = null

/**
 * 获取 Redis 客户端
 */
export function getRedis() {
  if (!client) {
    const config = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      db: env.REDIS_DB,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 3000)
        return delay
      },
      maxRetriesPerRequest: 3,
    }

    if (env.REDIS_PASSWORD) {
      config.password = env.REDIS_PASSWORD
    }

    client = new Redis(config)

    client.on('connect', () => {
      logger.info('Redis 连接成功')
    })

    client.on('error', (err) => {
      logger.error('Redis 连接错误', err)
    })
  }

  return client
}

/**
 * Redis 缓存操作封装
 */
export const cache = {
  /**
   * 获取缓存值
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      const redis = getRedis()
      const value = await redis.get(key)
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    } catch (error) {
      logger.error(`Redis GET 失败: ${key}`, error)
      return null
    }
  },

  /**
   * 设置缓存值
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - 过期时间（秒），0 表示不过期
   */
  async set(key, value, ttl = 0) {
    try {
      const redis = getRedis()
      const strValue = typeof value === 'string' ? value : JSON.stringify(value)
      if (ttl > 0) {
        await redis.setex(key, ttl, strValue)
      } else {
        await redis.set(key, strValue)
      }
      return true
    } catch (error) {
      logger.error(`Redis SET 失败: ${key}`, error)
      return false
    }
  },

  /**
   * 删除缓存
   * @param {string} key
   */
  async del(key) {
    try {
      const redis = getRedis()
      await redis.del(key)
      return true
    } catch (error) {
      logger.error(`Redis DEL 失败: ${key}`, error)
      return false
    }
  },

  /**
   * 向列表尾部追加元素
   * @param {string} key
   * @param {any} value
   */
  async rpush(key, value) {
    try {
      const redis = getRedis()
      const strValue = typeof value === 'string' ? value : JSON.stringify(value)
      await redis.rpush(key, strValue)
      return true
    } catch (error) {
      logger.error(`Redis RPUSH 失败: ${key}`, error)
      return false
    }
  },

  /**
   * 获取列表所有元素
   * @param {string} key
   * @returns {Promise<Array>}
   */
  async lrange(key, start = 0, stop = -1) {
    try {
      const redis = getRedis()
      const values = await redis.lrange(key, start, stop)
      return values.map((v) => {
        try { return JSON.parse(v) } catch { return v }
      })
    } catch (error) {
      logger.error(`Redis LRANGE 失败: ${key}`, error)
      return []
    }
  },

  /**
   * 修剪列表，只保留指定范围
   * @param {string} key
   * @param {number} start
   * @param {number} stop
   */
  async ltrim(key, start, stop) {
    try {
      const redis = getRedis()
      await redis.ltrim(key, start, stop)
      return true
    } catch (error) {
      logger.error(`Redis LTRIM 失败: ${key}`, error)
      return false
    }
  },

  /**
   * 测试 Redis 连接
   */
  async testConnection() {
    try {
      const redis = getRedis()
      await redis.ping()
      logger.info('Redis 连接测试成功')
      return true
    } catch (error) {
      logger.error('Redis 连接测试失败', error)
      return false
    }
  },
}

export default { getRedis, cache }
