# ORMFOLK Hub — AI 助手指引

## 项目简介
ORMFOLK Hub 是一个面向全球 ORMFOLK 粉丝的免费社区网站。支持电脑端和手机端访问，提供英文、中文、泰文三种语言。

## 重要文档路径

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求规格 | [docs/requirements.md](docs/requirements.md) | 功能需求、用户角色、设计风格 |
| 技术栈 | [docs/tech-stack.md](docs/tech-stack.md) | 技术选型、运行命令、项目结构 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色彩、字体、圆角、阴影、动效 |
| 开发步骤 | [docs/dev-steps.md](docs/dev-steps.md) | 分步执行计划与进度 |
| 系统架构 | [docs/architecture.md](docs/architecture.md) | 架构图、路由、数据流 |
| 开发日志 | [dev-log/](dev-log/) | 每日开发日志（按日期命名） |

## 工作原则

1. **分步推进**：每次只做一小步，完成后记录日志，再推进下一步。
2. **先读文档**：动手前先阅读上面列出的相关标准文件。
3. **及时记录**：每次开发结束后，更新 `dev-log/YYYY-MM-DD.md`，记录完成事项和待办事项。
4. **设计一致性**：所有 UI 必须遵循 `docs/design-spec.md` 的色彩和组件规范。
5. **三语覆盖**：所有面向用户的文字必须同步更新 `messages/en.json`、`zh.json`、`th.json`。
6. **Next.js 16 注意**：本项目使用 Next.js 16，API 和文件结构可能与你训练数据中的旧版不同。编写代码前，如有疑问请查阅 `node_modules/next/dist/docs/` 中的相关文档。

## 日常开发流程

```
1. 阅读 dev-log/ 最新日志，了解当前进度
2. 阅读 docs/dev-steps.md，确定下一步
3. 实施开发（分小步、确保可运行）
4. 写 dev-log/ 当日日志
5. 如有新功能/变更，更新相关 docs/ 文件
```

## 项目状态（截至 2025-06-01）

- ✅ 项目骨架搭建完成
- ✅ 多语言框架完成（en/zh/th）
- ✅ 首页 UI 完成（Hero + 动态 + 模块网格）
- ✅ 全局布局组件完成（Header + Footer + LanguageSwitcher）
- ✅ 主题色系统完成
- ✅ Mock 数据充足
- ✅ 文档体系完成
- ⬜ 认证系统（NextAuth.js）
- ⬜ 数据库（Prisma + SQLite）
- ⬜ 论坛、创作、日历、地图、留言墙页面
- ⬜ 用户系统
- ⬜ 管理后台
