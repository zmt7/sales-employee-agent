// ============================================
// 消息管理路由（供前端 Vue 界面使用）
// ============================================

import { Router } from 'express'
import {
  getMessages,
  sendMessage,
  getConversations,
} from '../controllers/message.controller.js'

const router = Router()

// GET  /api/messages        — 获取用户消息列表
// POST /api/messages/send   — 发送消息并获取 AI 回复
// GET  /api/conversations   — 获取所有对话列表
router.get('/', getMessages)
router.post('/send', sendMessage)
router.get('/conversations', getConversations)

export default router
