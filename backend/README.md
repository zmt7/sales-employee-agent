# ============================================
# WhatsApp AI SaaS — 后端项目
# ============================================

## 技术栈

- Node.js (ESModule)
- Express
- MySQL (mysql2)
- Redis (ioredis)
- dotenv / cors / axios / uuid

---

## 快速启动

### 1. 安装依赖

```bash
cd backend-node
npm install
```

### 2. 配置环境变量

```bash
# 复制模板
cp .env.example .env

# 编辑 .env，填写你的配置
```

### 3. 启动 MySQL

确保 MySQL 服务已启动，并创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS whatsapp_ai_saas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

表结构会在服务启动时自动创建。

### 4. 启动 Redis

#### Windows
```bash
# 使用 WSL 或 Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### 5. 启动服务

```bash
# 开发模式（nodemon 热重载）
npm run dev

# 生产模式
npm start
```

---

## 项目结构

```
backend-node/
├── src/
│   ├── app.js              # Express 应用配置
│   ├── server.js           # 服务器入口
│   ├── config/
│   │   └── env.js          # 环境变量
│   ├── controllers/
│   │   ├── webhook.controller.js   # WhatsApp Webhook 处理
│   │   └── message.controller.js   # 消息 API 处理
│   ├── db/
│   │   ├── mysql.js        # MySQL 连接池
│   │   └── redis.js        # Redis 连接 + 缓存封装
│   ├── routes/
│   │   ├── webhook.routes.js       # Webhook 路由
│   │   └── message.routes.js       # 消息 API 路由
│   ├── services/
│   │   ├── ai.service.js           # AI 服务（mock + 预留）
│   │   ├── message.service.js      # 消息存储服务
│   │   └── whatsapp.service.js     # WhatsApp 发送服务
│   └── utils/
│       └── logger.js       # 日志工具
├── .env.example            # 环境变量模板
├── package.json
└── README.md
```

---

## API 接口

### WhatsApp Webhook

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/webhook` | Webhook 验证 |
| POST | `/webhook` | 接收 WhatsApp 消息 |

### 消息管理 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/messages?phone=xxx&limit=50` | 获取用户消息 |
| POST | `/api/messages/send` | 发送消息并获取 AI 回复 |
| GET  | `/api/messages/conversations` | 获取对话列表 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/health` | 服务健康检查 |

---

## WhatsApp Webhook 配置

1. 在 Meta Developer 平台创建 WhatsApp 应用
2. 配置 Webhook URL：`https://your-domain.com/webhook`
3. Verify Token 填写 `.env` 中的 `WHATSAPP_VERIFY_TOKEN`
4. 订阅 `messages` 字段

---

## 消息处理流程

```
用户 WhatsApp 消息
  → POST /webhook
  → 解析消息（phone + content）
  → 保存到 MySQL（messages 表）
  → 写入 Redis（最近 10 条对话历史）
  → 调用 AI Service
  → AI 回复保存到 MySQL + Redis
  → 通过 WhatsApp Cloud API 发送回复
```

---

## MySQL 表结构

### messages 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 UUID |
| phone | VARCHAR(50) | 用户手机号 |
| role | ENUM('user','assistant') | 消息角色 |
| content | TEXT | 消息内容 |
| created_at | TIMESTAMP | 创建时间 |

### sessions 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 UUID |
| phone | VARCHAR(50) | 用户手机号（唯一） |
| context | JSON | 会话上下文 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
