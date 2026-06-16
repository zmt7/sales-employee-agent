// ============================================
// DeepSeek 模型服务
// ============================================

import OpenAI from 'openai'
import type { ChatMessage, IModelService, ImageAttachment } from '@/types'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: `${window.location.origin}/api/deepseek/v1`,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `你是一个专业的电商视频营销Agent，专门帮助用户创作和优化电商带货视频内容。

你的能力包括：
1. 分析商品卖点和目标用户群体
2. 生成视频脚本框架和分镜方案
3. 提供营销策略建议（渠道、话术、节奏）
4. 优化产品文案和推广话术
5. 解答电商营销相关问题

回复要求：
- 使用中文回复，专业但不生硬
- 结构化输出，使用标题和列表
- 给具体可执行的建议，而非空泛理论
- 适当使用加粗强调关键点
- 回答简洁有力，直击要点
- 如果用户消息中包含 [上传图片 N] 标记，说明用户上传了图片。由于你无法直接查看图片，请礼貌告知用户你暂不支持直接查看图片，但可以请用户用文字描述图片内容，你再基于描述进行分析。不要假装看到了图片内容。`

export const deepseekService: IModelService = {
  async chat(historyMessages: ChatMessage[], images?: ImageAttachment[]): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    for (const m of historyMessages) {
      if (!m.content.trim() && (!images || images.length === 0)) continue

      if (m.role === 'user') {
        let content = m.content.trim()

        // DeepSeek 当前 API 不支持 image_url vision 格式
        // 将图片元信息作为文本传递给 AI
        if (images && images.length > 0) {
          const imgDescs = images.map((img, i) => {
            const format = img.mimeType.replace('image/', '').toUpperCase()
            const sizeKB = Math.round(img.base64.length * 0.75 / 1024)
            return `[上传图片 ${i + 1}：${format} 格式，约 ${sizeKB}KB]`
          })
          content = imgDescs.join('；') + (content ? '\n\n' + content : '')
        }

        messages.push({ role: 'user', content })
      } else {
        messages.push({ role: 'assistant', content: m.content })
      }
    }

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 4096,
    })

    return completion.choices[0]?.message?.content || '(空回复)'
  },
}
