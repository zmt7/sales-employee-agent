// ============================================
// 模型注册表 — 新增模型只需在此加配置
// ============================================

import type { ModelConfig } from '@/types'

export const MODEL_REGISTRY: ModelConfig[] = [
  {
    id: 'auto',
    name: '自动选择',
    provider: 'deepseek',
    model: 'deepseek-chat',
    icon: 'Bot',
    isAuto: true,
    enabled: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'deepseek',
    model: 'deepseek-chat',
    icon: 'Zap',
    enabled: true,
  },
  {
    id: 'openai',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    icon: 'Sparkles',
    enabled: true, // 尚未配置 API Key，暂不启用
  },
  // 后续新增模型示例：
  // {
  //   id: 'claude',
  //   name: 'Claude 3.5',
  //   provider: 'anthropic',
  //   model: 'claude-3-5-sonnet-20241022',
  //   icon: 'Bot',
  //   enabled: false,
  // },
]

/** 获取启用的模型列表（排除 auto） */
export function getEnabledModels(): ModelConfig[] {
  return MODEL_REGISTRY.filter(m => !m.isAuto && m.enabled)
}

/** 获取自动模式对应的模型 */
export function getAutoModel(): ModelConfig {
  return MODEL_REGISTRY.find(m => m.isAuto) || MODEL_REGISTRY[0]
}
