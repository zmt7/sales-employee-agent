// ============================================
// 环境变量配置
// ============================================

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载项目根目录的 .env
dotenv.config({ path: resolve(__dirname, '../../.env') })

export const env = {
  // 服务器
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MySQL
  MYSQL_HOST: process.env.MYSQL_HOST || '127.0.0.1',
  MYSQL_PORT: parseInt(process.env.MYSQL_PORT || '3306', 10),
  MYSQL_USER: process.env.MYSQL_USER || 'root',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'whatsapp_ai_saas',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),

  // WhatsApp Cloud API
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v21.0',

  // AI
  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
}

export default env
