// ============================================
// 消息存储服务
// ============================================

import { v4 as uuidv4 } from 'uuid'
import { query, queryOne } from '../db/mysql.js'
import { cache } from '../db/redis.js'
import logger from '../utils/logger.js'

/** Redis 中每个用户的对话历史 key 前缀 */
const HISTORY_KEY_PREFIX = 'chat:history:'

/** Redis 中对话历史过期时间（秒）：24 小时 */
const HISTORY_TTL = 86400

/** Redis 中保留的最近对话条数 */
const MAX_HISTORY = 10

/**
 * 保存消息到 MySQL
 * @param {string} phone - 用户手机号
 * @param {'user'|'assistant'} role - 角色
 * @param {string} content - 消息内容
 * @returns {Promise<Object>} 保存的消息
 */
export async function saveMessage(phone, role, content) {
  const id = uuidv4()
  const sql = `
    INSERT INTO messages (id, phone, role, content)
    VALUES (?, ?, ?, ?)
  `
  await query(sql, [id, phone, role, content])
  logger.debug(`消息已保存: phone=${phone}, role=${role}`)
  return { id, phone, role, content }
}

/**
 * 获取用户的最近消息（MySQL）
 * @param {string} phone
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRecentMessages(phone, limit = 20) {
  const sql = `
    SELECT id, phone, role, content, created_at
    FROM messages
    WHERE phone = ?
    ORDER BY created_at DESC
    LIMIT ?
  `
  const rows = await query(sql, [phone, limit])
  return rows.reverse()
}

/**
 * 保存消息到 Redis 对话历史（保留最近 10 条）
 * @param {string} phone
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
export async function saveToRedisHistory(phone, role, content) {
  const key = HISTORY_KEY_PREFIX + phone
  const entry = { role, content, timestamp: Date.now() }

  await cache.rpush(key, entry)
  // 只保留最近 N 条
  await cache.ltrim(key, -MAX_HISTORY, -1)
  // 设置过期时间
  await cache.set(key + ':ttl', '1', HISTORY_TTL)

  logger.debug(`Redis 对话历史已更新: phone=${phone}`)
}

/**
 * 从 Redis 获取用户对话历史
 * @param {string} phone
 * @returns {Promise<Array<{role: string, content: string}>>}
 */
export async function getRedisHistory(phone) {
  const key = HISTORY_KEY_PREFIX + phone
  return await cache.lrange(key)
}

/**
 * 保存用户会话上下文到 Redis
 * @param {string} phone
 * @param {Object} context
 */
export async function saveSession(phone, context) {
  const key = `session:${phone}`
  await cache.set(key, context, HISTORY_TTL)
}

/**
 * 获取用户会话上下文
 * @param {string} phone
 * @returns {Promise<Object|null>}
 */
export async function getSession(phone) {
  const key = `session:${phone}`
  return await cache.get(key)
}

export default {
  saveMessage,
  getRecentMessages,
  saveToRedisHistory,
  getRedisHistory,
  saveSession,
  getSession,
}
