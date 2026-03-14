# Ticket Watcher

本机运行的“票价监控 + 飞书推送 + 辅助下单”应用（MVP）。

- 目标平台：大麦 / 携程 / 12306（MVP 先跑通框架，再逐个接入真实抓取）
- 抓取频率：每 30 分钟一次（worker）
- 数据保留：默认保留 7 天，过期自动删除（可手动清空）
- 推送：飞书群机器人 Webhook
- 支付：不自动支付，只引导到支付前，最后一步你手动完成

## 运行方式（开发态）

### 1) 安装依赖
```bash
npm i
```

### 2) 配置环境变量
复制一份：
```bash
cp .env.example .env.local
```
然后在 `.env.local` 填上飞书机器人 webhook：
- `FEISHU_WEBHOOK_URL=`

> 说明：当前数据默认落地在 `data/db.json`（本地文件）。后续接 Supabase 时会切换到云端。

### 3) 启动 Web UI
```bash
npm run dev
```
打开：<http://localhost:3000>

### 4) 启动抓取/推送 worker（每 30 分钟）
另开一个终端：
```bash
npm run worker
```

## 当前进度
- ✅ 任务 CRUD API：`/api/tasks`
- ✅ 本地存储：`data/db.json`
- ✅ worker 框架：定时任务 + 通知框架
- 🧪 携程机票抓取：Playwright 初版（可能受页面改版/风控影响，需要迭代）
- ⏳ 其它平台抓取：待实现（Playwright）
- ⏳ “近期新低”判断：待实现（目前仅有低于阈值提醒）
- ⏳ UI 表单：待实现（目前用 curl 示例创建任务）

## Playwright
安装浏览器（需要时执行一次）：
```bash
npx playwright install chromium
```
