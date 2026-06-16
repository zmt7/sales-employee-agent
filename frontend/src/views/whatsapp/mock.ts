// ============================================
// WhatsApp Mock 数据
// ============================================

import type { WhatsAppContact, WhatsAppMessage } from '@/types'

/** 预设客户 */
export const mockContacts: WhatsAppContact[] = [
  {
    id: 'contact-1',
    name: '张三',
    phone: '+86 138-0000-1001',
    lastMessage: '好的，我稍后发你商品链接',
    lastMessageTime: '10:28',
    unread: 2,
    online: true,
  },
  {
    id: 'contact-2',
    name: '李四',
    phone: '+86 139-0000-1002',
    lastMessage: '这个优惠还有效吗？',
    lastMessageTime: '09:15',
    unread: 0,
    online: false,
  },
]

/** 张三的聊天记录 */
export const messagesZhangSan: WhatsAppMessage[] = [
  {
    id: 'msg-zs-1',
    contactId: 'contact-1',
    role: 'user',
    content: '你好，我想了解一下你们的视频营销服务',
    contentType: 'text',
    timestamp: Date.now() - 3600000,
    status: 'read',
  },
  {
    id: 'msg-zs-2',
    contactId: 'contact-1',
    role: 'assistant',
    content: '您好！很高兴为您服务。我们提供电商带货视频的全流程解决方案，包括脚本策划、拍摄剪辑和投放优化。请问您主要做哪个品类的产品呢？',
    contentType: 'text',
    timestamp: Date.now() - 3500000,
    status: 'read',
  },
  {
    id: 'msg-zs-3',
    contactId: 'contact-1',
    role: 'user',
    content: '我主要做美妆护肤品，想在抖音和小红书上做推广',
    contentType: 'text',
    timestamp: Date.now() - 3400000,
    status: 'read',
  },
  {
    id: 'msg-zs-4',
    contactId: 'contact-1',
    role: 'assistant',
    content: '美妆护肤品类非常适合视频营销！我建议可以先从"产品测评"和"使用教程"两个方向切入。我们之前帮一个护肤品牌做的短视频，单条播放量突破了 200 万，转化率提升了 35%。\n\n方便的话可以发几张产品图给我，我帮您分析一下卖点。',
    contentType: 'text',
    timestamp: Date.now() - 3300000,
    status: 'read',
  },
  {
    id: 'msg-zs-5',
    contactId: 'contact-1',
    role: 'user',
    content: '好的，我稍后发你商品链接',
    contentType: 'text',
    timestamp: Date.now() - 600000,
    status: 'read',
  },
]

/** 李四的聊天记录 */
export const messagesLiSi: WhatsAppMessage[] = [
  {
    id: 'msg-ls-1',
    contactId: 'contact-2',
    role: 'user',
    content: '你好，上次说的那个直播带货方案出了吗？',
    contentType: 'text',
    timestamp: Date.now() - 7200000,
    status: 'read',
  },
  {
    id: 'msg-ls-2',
    contactId: 'contact-2',
    role: 'assistant',
    content: '李先生您好！方案已经出初稿了，包含 3 套不同风格的脚本和分镜设计。我发您看看？',
    contentType: 'text',
    timestamp: Date.now() - 7100000,
    status: 'read',
  },
  {
    id: 'msg-ls-3',
    contactId: 'contact-2',
    role: 'user',
    content: '可以，发过来吧',
    contentType: 'text',
    timestamp: Date.now() - 7000000,
    status: 'read',
  },
  {
    id: 'msg-ls-4',
    contactId: 'contact-2',
    role: 'assistant',
    content: '好的，这是方案概览：\n\n**方案 A — 场景化种草**\n适合小红书/抖音，突出使用场景\n\n**方案 B — 专家测评**\n适合 B 站/视频号，强调专业背书\n\n**方案 C — 素人分享**\n适合快手，真实感强\n\n您看看倾向哪个方向？',
    contentType: 'text',
    timestamp: Date.now() - 6900000,
    status: 'read',
  },
  {
    id: 'msg-ls-5',
    contactId: 'contact-2',
    role: 'user',
    content: '方案 A 看起来不错，费用怎么算？',
    contentType: 'text',
    timestamp: Date.now() - 3600000,
    status: 'read',
  },
  {
    id: 'msg-ls-6',
    contactId: 'contact-2',
    role: 'assistant',
    content: '方案 A 标准套餐是 2999 元，包含 3 条视频脚本 + 分镜 + 投放建议。新客户首单可以享受 8 折优惠。',
    contentType: 'text',
    timestamp: Date.now() - 3500000,
    status: 'read',
  },
  {
    id: 'msg-ls-7',
    contactId: 'contact-2',
    role: 'user',
    content: '这个优惠还有效吗？',
    contentType: 'text',
    timestamp: Date.now() - 1800000,
    status: 'read',
  },
]

/** 获取指定客户的聊天记录 */
export function getMessagesByContact(contactId: string): WhatsAppMessage[] {
  if (contactId === 'contact-1') return [...messagesZhangSan]
  if (contactId === 'contact-2') return [...messagesLiSi]
  return []
}
