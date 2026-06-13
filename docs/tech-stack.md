# ORMFOLK Hub — 技术栈说明

## 当前技术栈

| 层面 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | Next.js (App Router) | 16.x | 全栈 React 框架，SSR/SSG/ISR |
| **语言** | TypeScript | 5.x | 类型安全 |
| **样式方案** | Tailwind CSS | 4.x | 原子化 CSS，主题定制 |
| **UI 图标** | Lucide React | 1.x | 轻量图标库 |
| **动画** | Framer Motion | 12.x | 页面过渡和交互动效 |
| **国际化** | next-intl | 4.x | 中/英/泰三语路由级国际化 |
| **数据库 ORM** | Prisma | 7.x | 类型安全 ORM，SQLite→PostgreSQL |
| **认证** | NextAuth.js v5 | (待安装) | 邮箱 + Google 登录 |
| **地图** | Leaflet + react-leaflet | 1.9/5.x | 免费开源世界地图 |
| **工具** | clsx + tailwind-merge | - | 样式合并工具 |
| **日期** | date-fns | 4.x | 日期处理 |

## 开发环境要求
- Node.js ≥ 18.x
- npm ≥ 9.x
- macOS / Windows / Linux

## 运行命令
```bash
npm run dev      # 开发模式 (localhost:3000)
npm run build    # 生产构建
npm run start    # 运行生产版本
npm run lint     # 代码检查
```

## 数据库
- **本地开发**：SQLite（无需额外安装）
- **生产环境**：PostgreSQL（上线时切换）
- Prisma 7.x 使用 `prisma.config.ts` 配置（新语法）

## 部署
- 推荐平台：Vercel（Next.js 官方托管，免费层足够起步）
- 域名：待定（建议 ormfolk-hub.com）

## 项目结构
```
ormfolk-hub/
├── docs/               ← 项目文档
├── dev-log/            ← 开发日志
├── src/
│   ├── app/            ← Next.js App Router 页面
│   │   ├── [locale]/   ← 多语言路由页面
│   │   ├── layout.tsx  ← 根布局
│   │   └── page.tsx    ← 根页面（重定向）
│   ├── components/     ← UI 组件
│   │   └── layout/     ← Header, Footer, LanguageSwitcher
│   ├── i18n/           ← 国际化配置
│   ├── lib/            ← 工具函数 + Mock 数据
│   └── middleware.ts   ← 多语言中间件
├── messages/           ← 翻译 JSON 文件
├── prisma/             ← 数据库 Schema（待添加）
├── public/             ← 静态资源
│   └── images/         ← Ormsin & Folk 照片
└── CLAUDE.md           ← AI 助手指引
```
