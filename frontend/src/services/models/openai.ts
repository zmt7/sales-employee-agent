// ============================================
// OpenAI GPT 模型服务（预留，待配置 API Key 后启用）
// ============================================

import OpenAI from 'openai'
import type { ChatMessage, IModelService, ImageAttachment } from '@/types'

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

const SYSTEM_PROMPT = `你是一个专业的电商视频营销Agent，专门帮助用户创作和优化电商带货视频内容。`

export const openaiService: IModelService = {
  async chat(historyMessages: ChatMessage[], _images?: ImageAttachment[]): Promise<string> {
    if (!API_KEY) {
      throw new Error('OpenAI API Key 未配置，请在 .env 中设置 VITE_OPENAI_API_KEY')
    }

    const client = new OpenAI({
      apiKey: API_KEY,
      baseURL: `${window.location.origin}/api/openai/v1`,
      dangerouslyAllowBrowser: true,
    })

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...historyMessages
        .filter(m => m.content.trim())
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ]

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 4096,
    })

    return completion.choices[0]?.message?.content || '(空回复)'
  },
}
