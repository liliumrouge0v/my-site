# 生活记录(计时器 + 习惯打卡)

一个给自己用的生活记录网站:

- ⏱️ **计时器(掐表)**:选一个活动开始计时,停止后自动保存用时;刷新页面也不会丢失正在跑的秒表;支持手动补录。
- 📊 **时间统计**:按天分组的记录列表 + 本周时间分布柱状图、各活动占比。
- ✅ **习惯打卡**:每日打卡、连续天数(当前/最佳)、GitHub 风格热力网格。
- 🏠 **今日总览**:今日累计计时、今日习惯完成情况、快速打卡。
- 🔗 **公开页**(`/share`):朋友无需登录即可浏览你**标记为公开**的记录与习惯,纯只读。

数据保存在 **Supabase**(云端),多设备同步。本人邮箱登录一次后长期保持登录。

技术栈:React + TypeScript + Vite + Tailwind CSS + Supabase + TanStack Query + Recharts。

---

## 一、配置 Supabase(一次性)

1. 打开你的 Supabase 项目 → **SQL Editor**,把 `supabase/schema.sql` 整段粘贴执行(建表 + 行级安全 RLS)。
2. **Authentication → Users → Add user**,创建你自己的账号(邮箱 + 密码)。这就是"本人"账号。
   - 如想用邮箱链接登录,确保 Authentication → Providers → Email 已开启。
3. **Project Settings → API**,记下:
   - `Project URL`
   - `anon public` key

## 二、本地运行

```bash
npm install
cp .env.example .env.local      # 填入上一步的 URL 和 anon key
npm run dev                     # 打开 http://localhost:5173
```

`.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

用第一步创建的账号登录即可开始使用。

## 三、部署到 Cloudflare Pages

1. 把本仓库推到 GitHub。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**,选择本仓库。
3. 构建配置:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 展开 **Environment variables (Production)**,添加:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 点 **Save and Deploy**,约 1 分钟后得到 `xxx.pages.dev` 网址。
6. 在 Supabase **Authentication → URL Configuration** 把该网址加入 **Site URL** 和 **Redirect URLs**(邮箱链接登录需要)。

> SPA 路由由 `public/_redirects`(`/* /index.html 200`)处理,刷新子路径不会 404。
> `VITE_` 变量在构建时写入,改动环境变量后需 **重新部署(Retry deployment)** 才生效。

> 也可用 Vercel 部署:Import 仓库 → 自动识别 Vite → 加同样两个环境变量即可;SPA 路由由 `vercel.json` 处理。

## 四、公开分享给朋友

- 在「记录」里点每条记录的眼睛图标、或在「习惯」卡片上点眼睛图标,即可把该条设为**公开**。
- 把 `你的域名/share` 发给朋友,他们无需登录即可浏览你公开的内容。
- 公开权限由数据库 RLS 强制:匿名访客只能读到 `is_public = true` 的数据,改不了任何东西。

## 项目结构

```
supabase/schema.sql      建表 + RLS(在 Supabase 执行一次)
src/lib/                 supabase 客户端、数据查询(queries)、时间/日期/连续天数工具
src/context/             登录状态
src/components/          导航、秒表、活动选择、记录列表、统计图、习惯卡片/热力网格
src/pages/               今日总览、计时、记录、习惯、公开页、登录
```
