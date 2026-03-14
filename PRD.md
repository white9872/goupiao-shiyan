# Ticket Watcher（票价监控 + 辅助下单）PRD（MVP）

## 目标
- 在本机运行一个网页应用（同一台机器打开即可用；同一局域网内可被手机/电脑访问）。
- 对指定票务平台（大麦、携程、12306）进行**半小时一次**的价格/可售状态抓取。
- 识别“近期最低价”（按近 7 天最低）并通过**飞书**推送提醒。
- 提供“辅助下单”：一键跳转/引导至支付前的页面，**支付由用户手动完成**。

## 非目标（MVP 不做）
- 自动化支付/自动扣款。
- 绕过平台风控（验证码、滑块、人机验证等）。
- 面向公众的大规模服务（仅小团体自用）。

## 核心用户故事（MVP）
1. 我可以创建一个“监控任务”，包含：平台、目标（关键词/链接）、阈值、启停。
2. 系统每 30 分钟抓取一次，记录价格快照。
3. 我可以在看板看到：当前价、近 24h 最低、近 7d 最低、最后抓取时间。
4. 当出现“近 7d 新低”或低于阈值时，系统通过飞书提醒。
5. 我点击任务可以打开对应平台页面，继续手动下单，直到支付前一步。

## 数据模型（逻辑）
- Task
  - id, platform, name
  - targetUrl / query
  - enabled, checkEveryMinutes (=30)
  - notifyRule: belowPrice? / newLowWindowDays (=7)
  - createdAt, updatedAt
- PriceSnapshot
  - id, taskId, price, currency, status, url, capturedAt
- NotificationLog
  - id, taskId, kind, message, sentAt, success, error

## 风险与约束
- 抓取：各平台 ToS/反爬限制可能导致失败；MVP 先做“可跑通”的最小抓取（可能只做 1-2 平台），其它平台保留接口。
- 账户安全：不存储账号密码；不自动付款。

## 里程碑
- M0（0.5 天）：需求冻结 + 数据结构 + UI 草图
- M1（1 天）：可运行骨架 + 任务 CRUD + 本地存储
- M2（1-2 天）：半小时定时抓取 + 价格历史 + 飞书推送
- M3（可选）：接入 Supabase 云存储/多端共享访问口令
