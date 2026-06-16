// ============================================
// MySQL 连接池
// ============================================

import mysql from 'mysql2/promise'
import { env } from '../config/env.js'
import logger from '../utils/logger.js'

let pool = null

/**
 * 获取 MySQL 连接池
 */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    })
    logger.info('MySQL 连接池已创建')
  }
  return pool
}

/**
 * 执行 SQL 查询
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果
 */
export async function query(sql, params = []) {
  const pool = getPool()
  const [rows] = await pool.execute(sql, params)
  return rows
}

/**
 * 获取单条记录
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

/**
 * 测试数据库连接
 */
export async function testConnection() {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    logger.info('MySQL 连接测试成功')
    return true
  } catch (error) {
    logger.error('MySQL 连接测试失败', error)
    return false
  }
}

/**
 * 初始化数据库表
 */
export async function initTables() {
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(36) PRIMARY KEY,
      phone VARCHAR(50) NOT NULL,
      role ENUM('user', 'assistant') NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_phone (phone),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `

  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(36) PRIMARY KEY,
      phone VARCHAR(50) NOT NULL UNIQUE,
      context JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `

  try {
    await query(createMessagesTable)
    logger.info('表 messages 初始化成功')

    await query(createSessionsTable)
    logger.info('表 sessions 初始化成功')

    return true
  } catch (error) {
    logger.error('数据库表初始化失败', error)
    throw error
  }
}

export default { getPool, query, queryOne, testConnection, initTables }
