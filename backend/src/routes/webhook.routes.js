// ============================================
// WhatsApp Webhook 路由
// ============================================

import { Router } from 'express'
import { verifyWebhook, handleWebhook } from '../controllers/webhook.controller.js'

const router = Router()

// GET  /webhook — WhatsApp 验证
// POST /webhook — 接收消息
router
  .get('/', verifyWebhook)
  .post('/', handleWebhook)

export default router
