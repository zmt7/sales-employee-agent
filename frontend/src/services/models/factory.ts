// ============================================
// 模型服务工厂 — 根据 provider 返回对应服务
// ============================================

import type { ModelProvider, IModelService } from '@/types'
import { deepseekService } from './deepseek'
import { openaiService } from './openai'

const serviceMap: Record<ModelProvider, IModelService> = {
  deepseek: deepseekService,
  openai: openaiService,
  anthropic: {
    async chat(): Promise<string> {
      throw new Error('Anthropic 模型暂未接入')
    },
  },
  custom: {
    async chat(): Promise<string> {
      throw new Error('自定义模型暂未接入')
    },
  },
}

/**
 * 根据 provider 获取模型服务实例
 */
export function getModelService(provider: ModelProvider): IModelService {
  const service = serviceMap[provider]
  if (!service) {
    throw new Error(`未找到模型服务: ${provider}`)
  }
  return service
}
