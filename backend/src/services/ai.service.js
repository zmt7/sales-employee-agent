// ============================================
// AI 服务（当前为 mock，后续替换为 DeepSeek / OpenAI）
// ============================================

import { env } from '../config/env.js'
import logger from '../utils/logger.js'

/**
 * 调用 AI 模型获取回复
 *
 * @param {string} message - 用户消息
 * @param {Array<{role: string, content: string}>} history - 对话历史
 * @returns {Promise<string>} AI 回复
 */
export async function askAI(message, history = []) {
  logger.info(`[AI Service] Provider: ${env.AI_PROVIDER}, Message: ${message.slice(0, 80)}...`)

  switch (env.AI_PROVIDER) {
    case 'deepseek':
      return askDeepSeek(message, history)
    case 'openai':
      return askOpenAI(message, history)
    case 'mock':
    default:
      return askMock(message, history)
  }
}

/**
 * Mock AI — 简单回显，用于开发测试
 */
async function askMock(message, history) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300))

  const contextInfo = history.length > 0
    ? `（历史对话共 ${history.length} 条）`
    : ''

  return `[AI Mock 回复] ${contextInfo}\n\n收到您的消息：「${message}」\n\n这是模拟回复，后续将接入真实 AI 模型。`
}

/**
 * DeepSeek AI（预留）
 */
async function askDeepSeek(message, history) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API Key 未配置')
  }

  // 预留：后续实现真正的 DeepSeek 调用
  // 当前回退到 mock
  logger.warn('[AI Service] DeepSeek 尚未实现，使用 mock 回复')
  return askMock(message, history)
}

/**
 * OpenAI GPT（预留）
 */
async function askOpenAI(message, history) {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key 未配置')
  }

  // 预留：后续实现真正的 OpenAI 调用
  logger.warn('[AI Service] OpenAI 尚未实现，使用 mock 回复')
  return askMock(message, history)
}

export default { askAI }
