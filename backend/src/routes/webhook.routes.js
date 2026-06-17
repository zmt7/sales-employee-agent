// ============================================
// WhatsApp Webhook 路由
// ============================================

import { Router } from 'express'
import { verifyWebhook, handleWebhook, verifySignature } from '../controllers/webhook.controller.js'
import logger from '../utils/logger.js'

const router = Router()

// 签名校验中间件（仅 POST）
function signatureGuard(req, res, next) {
  if (req.method !== 'POST') return next()
  try {
    verifySignature(req, res, req.rawBody)
    next()
  } catch (_) {
    // verifySignature 内部已发送 403 响应
  }
}

// GET  /webhook — WhatsApp 验证
// POST /webhook — 接收消息（含签名校验）
router
  .get('/', verifyWebhook)
  .post('/', signatureGuard, handleWebhook)

export default router
