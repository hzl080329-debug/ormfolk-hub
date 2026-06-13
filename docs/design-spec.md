# ORMFOLK Hub — 设计规范

## 色彩系统

| 用途 | 变量名 | 色值 | 说明 |
|------|--------|------|------|
| 主色 | `--color-primary` | `#C9B1FF` | 薰衣草紫 |
| 主色深 | `--color-primary-dark` | `#A78BFA` | 按钮 hover、重点文字 |
| 主色浅 | `--color-primary-light` | `#E8DEFF` | 背景高亮、卡片底 |
| 辅助色 | `--color-secondary` | `#FFD1E0` | 柔和粉 |
| 辅助色深 | `--color-secondary-dark` | `#FFB8D0` | 强调元素 |
| 辅助色浅 | `--color-secondary-light` | `#FFF0F5` | 粉色背景底 |
| 强调色 | `--color-accent` | `#9B7FE8` | 按钮、链接、高亮 |
| 背景色 | `--color-background` | `#FAF8FF` | 全局背景 |
| 白色 | `--color-background-white` | `#FFFFFF` | 卡片、导航 |
| 主文字 | `--color-text-primary` | `#2D1B4E` | 标题、正文 |
| 次要文字 | `--color-text-secondary` | `#6B5B7B` | 描述文字 |
| 弱化文字 | `--color-text-muted` | `#9B8BAD` | 辅助信息 |
| 边框 | `--color-border` | `#E8E0F0` | 卡片边框、分割线 |

## 字体规范

| 用途 | 字体 | 字重 | 大小 |
|------|------|------|------|
| 大标题 (H1) | Nunito | 800 (extrabold) | 2.25-3.75rem |
| 标题 (H2) | Nunito | 800 | 1.5-1.875rem |
| 小标题 (H3) | Nunito | 700 | 1.125-1.25rem |
| 正文 | Nunito | 400 | 0.875-1rem |
| 小字 | Nunito | 500 | 0.75-0.875rem |
| 按钮 | Nunito | 600 | 0.875rem |
| 中文 | Noto Sans SC | - | 同上 |
| 泰文 | Noto Sans Thai | - | 同上 |

## 圆角规范
- 大卡片：`rounded-2xl` (16px)
- 小卡片/按钮/输入框：`rounded-xl` (12px)
- 标签/Badge：`rounded-full`

## 阴影规范
- 卡片默认：`shadow-sm`
- 卡片 hover：`0 12px 24px rgba(155, 127, 232, 0.15)`
- 按钮阴影：`shadow-lg shadow-accent/25`

## 动效规范
- 卡片 hover：`translateY(-4px)` + 阴影加深，transition `0.3s ease`
- 浮动装饰：`animate-float`（3s 上下浮动）
- 按钮脉冲发光：`animate-pulse-glow`（2s 光晕扩散）

## 渐变
- 渐变文字：`gradient-text`（紫→粉渐变填充）
- 渐变背景：`gradient-bg`（紫→粉→白渐变）
- 品牌色渐变按钮：`from-accent to-primary-dark`

## 布局规范
- 最大内容宽度：`max-w-7xl` (1280px)
- 水平内边距：`px-4 sm:px-6`
- 区域间距：`py-16`
- 顶部导航高度：`h-16` (64px)
- 响应式断点：sm(640px), md(768px), lg(1024px), xl(1280px)

## 组件设计原则
1. 白色卡片 + 圆角 + 柔和边框 = 温暖感
2. 渐变只用于强调元素（Hero 区、按钮、图标）
3. 粉色和紫色交替使用，避免单一色调疲劳
4. 大量留白，呼吸感
5. emoji 和图标点缀增加趣味性
