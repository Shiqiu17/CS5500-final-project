# Project Status: WhatToDo — Event Recommendation App

## What's Been Done

### Backend (FastAPI — Python)
- Full API structure with Docker/docker-compose setup
- `GET /health` — health check endpoint
- `POST /events/recommendations` — event recommendation endpoint
- **Two AI providers**: Claude (with web search tool) and OpenAI
- **Event schema** (`backend/app/schemas/events.py`): `EventRequest` + `Event` with all fields including AM/PM display and time preferences
- **Processing pipeline** (`backend/app/services/recommendation_service.py`):
  - Web search via Claude tool use
  - Parse events from LLM response
  - Validate events with a 2nd LLM call
  - Filter by user's preferred time window
  - Sort by start time
- **Unit tests** in `backend/tests/` covering router, schema, services, and health
- Environment config via `.env` with `pydantic-settings`

### Frontend (Next.js 16 — JS + Tailwind CSS)
- Project initialized with Next.js, ESLint, and Tailwind CSS
- **Only boilerplate so far** — `frontend/what-to-do/src/app/page.js` is the default Next.js starter page

---

## What Still Needs to Be Done

### Frontend (main remaining work)
- Build the actual UI — currently just the default Next.js template
- Form to collect user input: city, interests, budget, date range, time preferences
- Display event recommendations returned from the API
- Connect frontend to backend (`POST /events/recommendations`)
- Any additional pages (e.g., event detail, history, etc.)

### Potential Backend Additions (depending on scope)
- Database integration (`backend/app/db/` exists but is empty)
- User authentication / session management (`backend/app/internal/` exists but is empty)
- More robust error handling / input validation



- ==================================
Database Recommendation: PostgreSQL
Why PostgreSQL
The app's core data needs are:

User accounts (if adding auth) — structured, relational data
Search history — who searched what city/interests/dates
Cached recommendations — avoid re-calling the LLM for identical queries (saves money and latency)
Saved/favorited events — users bookmarking events they like
All of this is well-structured, relational data. PostgreSQL is the right fit.

Stack to pair with it
Since the backend is FastAPI + Python, the standard modern pairing is:

SQLAlchemy 2.0 — ORM (already common in FastAPI projects)
Alembic — database migrations
asyncpg — async PostgreSQL driver (FastAPI is async-native)
Docker compose already exists in the project, so adding a postgres service there would be straightforward.

When you'd consider alternatives
Option	When to use
SQLite	Only if you want zero-setup local dev with no persistence needs
MongoDB	If event data is highly variable/schema-less (it's not — your Event schema is well-defined)
Redis	Good to add alongside PostgreSQL as a cache layer for LLM responses
Bottom line: PostgreSQL + SQLAlchemy + Alembic, with optional Redis for caching LLM results. Do you want me to set that up?

- ======================================
WhatToDo — AI-Powered Event Recommendation App
WhatToDo is a web app that helps users discover real, upcoming local events tailored to their preferences. You tell it:

What city you're in
Your interests (e.g. "live music, food")
Your budget per person
A date range you're available
Optional preferred times of day (e.g. 4PM–9PM)
...and it uses AI (Claude or OpenAI) to search the web in real time and return a curated list of relevant events — with details like location, cost, duration, indoor/outdoor, tags, and a direct event URL.

How it works
Frontend (Next.js) — user fills out a form with their preferences
Backend (FastAPI) — sends the request to Claude or OpenAI, which searches the web for real events
AI pipeline — finds events → validates them → filters by time window → sorts by start time
Response — a structured list of events returned to the frontend for display
Key characteristic
It's not pulling from a static database of events — it's doing live web search via LLM tool use every time, so results are always current. That's the core value proposition.

Database Recommendation: PostgreSQL
Why PostgreSQL
The app's core data needs are:

User accounts (if adding auth) — structured, relational data
Search history — who searched what city/interests/dates
Cached recommendations — avoid re-calling the LLM for identical queries (saves money and latency)
Saved/favorited events — users bookmarking events they like
All of this is well-structured, relational data. PostgreSQL is the right fit.

Stack to pair with it
Since the backend is FastAPI + Python, the standard modern pairing is:

SQLAlchemy 2.0 — ORM (already common in FastAPI projects)
Alembic — database migrations
asyncpg — async PostgreSQL driver (FastAPI is async-native)
Docker compose already exists in the project, so adding a postgres service there would be straightforward.

When you'd consider alternatives
Option	When to use
SQLite	Only if you want zero-setup local dev with no persistence needs
MongoDB	If event data is highly variable/schema-less (it's not — your Event schema is well-defined)
Redis	Good to add alongside PostgreSQL as a cache layer for LLM responses
Bottom line: PostgreSQL + SQLAlchemy + Alembic, with optional Redis for caching LLM results. Do you want me to set that up? this is our project proposal
Show less
Got it — so the team has decided on PostgreSQL + SQLAlchemy 2.0 + Alembic + asyncpg, with optional Redis for caching.

Do you want me to go ahead and set it up? That would involve:

Adding a postgres (and optionally redis) service to the existing compose.yml
Installing dependencies (sqlalchemy, alembic, asyncpg) in requirements.txt
Setting up the db connection in backend/app/db/
Creating initial models in backend/app/models/ (e.g. users, search history, saved events)
Initializing Alembic for migrations
Just let me know what scope you want to start with (e.g. just the db connection + migrations setup, or also the models).

-- ==========================
WhatToDo 项目开发路线图
阶段一：数据库搭建（后端）
配置 PostgreSQL

在 compose.yml 里加 postgres 服务
更新 .env 加数据库连接参数
安装依赖

在 requirements.txt 加：sqlalchemy, alembic, asyncpg, psycopg2-binary
建立数据库连接

在 backend/app/db/ 里写连接配置
定义数据模型（backend/app/models/）

User — 用户表（id, email, password_hash, created_at）
SearchHistory — 搜索记录表（user_id, city, interests, budget, date_range, created_at）
SavedEvent — 收藏活动表（user_id, event data, saved_at）
初始化 Alembic 做数据库迁移

阶段二：用户认证（后端）
注册 / 登录接口（backend/app/internal/）

POST /auth/register
POST /auth/login
用 JWT token 做身份验证
保护需要登录的接口

搜索历史、收藏功能需要登录才能用
阶段三：新增 API 接口（后端）
搜索历史接口

GET /history — 获取当前用户的搜索记录
收藏接口

POST /events/save — 收藏活动
GET /events/saved — 获取收藏列表
DELETE /events/saved/{id} — 取消收藏
阶段四：前端开发（主要工作）
搜索表单页（首页）

输入城市、兴趣、预算、日期范围、时间偏好
调用 POST /events/recommendations
推荐结果页

展示活动卡片（名称、描述、时间、地点、费用、标签）
收藏按钮
注册 / 登录页

历史记录页

展示之前的搜索
收藏页

展示已收藏的活动
阶段五：收尾
前后端联调测试
写前端单元测试
更新 README 和部署文档
当前进度

阶段一  ░░░░░░░░░░  0%   ← 下一步从这里开始
阶段二  ░░░░░░░░░░  0%
阶段三  ░░░░░░░░░░  0%
阶段四  ░░░░░░░░░░  0%   ← 最大工作量
阶段五  ░░░░░░░░░░  0%
后端核心 ██████████ 100% ✓ 已完成