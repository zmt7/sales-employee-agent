// ============================================
// 日志工具
// ============================================

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

const currentLevel = LOG_LEVELS.INFO

function timestamp() {
  return new Date().toISOString()
}

function formatMessage(level, message, data) {
  const ts = timestamp()
  const base = `[${ts}] [${level}] ${message}`
  if (data !== undefined) {
    if (data instanceof Error) {
      return `${base} | ${data.message}\n${data.stack || ''}`
    }
    return `${base} | ${JSON.stringify(data, null, 2)}`
  }
  return base
}

export const logger = {
  debug(message, data) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage('DEBUG', message, data))
    }
  },

  info(message, data) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(formatMessage('INFO', message, data))
    }
  },

  warn(message, data) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message, data))
    }
  },

  error(message, data) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message, data))
    }
  },
}

export default logger
