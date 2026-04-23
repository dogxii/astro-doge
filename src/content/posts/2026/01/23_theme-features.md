---
title: Astro Doge 主题特性一览
description: 看看这个主题都塞了些什么东西。
date: 2026-01-23T10:00:00+08:00
slug: theme-features
draft: false
---

既然选了这个主题，那就花两分钟看看它都能干什么。

## 技术栈

底层很简单：[Astro](https://astro.build) 负责构建，[Tailwind CSS v4](https://tailwindcss.com) 负责样式。内容用 Markdown 和 MDX 编写，代码高亮用的 [Expressive Code](https://expressive-code.com)。没有多余的 JavaScript 框架，页面默认零 JS 交付。

## 页面结构

主题开箱自带以下页面：

| 路由        | 说明                           |
| ----------- | ------------------------------ |
| `/`         | 首页，展示最近文章和碎碎念     |
| `/posts`    | 文章列表                       |
| `/thoughts` | 碎碎念列表，适合短内容         |
| `/about`    | 关于页面，支持项目和技术栈展示 |
| `/friends`  | 友链页面，内置友链交换信息面板 |
| `/messages` | 留言板                         |
| `/rss.xml`  | RSS 订阅                       |

不需要的页面直接删掉对应的 `src/pages/` 目录即可，导航栏在 `Header.astro` 里改。

## 内容管理

### 文章

放在 `src/content/posts/` 下，按 `年/月/` 目录组织。支持 Markdown 和 MDX。frontmatter 字段包括 `title`、`description`、`date`、`slug`、`draft`。

用 `bun new:blog <slug>` 快速创建，省去手写 frontmatter 的重复劳动。

### 碎碎念

放在 `src/content/thoughts/` 下，结构和文章类似但更轻量。支持标签分类。用 `bun t` 快速创建。

碎碎念页面会按日期轮换圆点和编号颜色，显示相对时间、精确到分钟的时间戳、标签、锚点复制和可选点赞。它适合承载短想法，也能作为轻量动态页使用。

## 样式特性

### 暗色模式

三种模式可选：亮色、暗色、跟随系统。切换时有过渡效果，不会闪白屏。状态持久化到 `localStorage`。

### 代码高亮

基于 Expressive Code，默认使用 `github-dark` 主题。支持代码块标题、行高亮等特性：

```ts title="example.ts" {2}
function hello() {
  console.log('Astro Doge')
}
```

### 链接样式

页面内链接带半透明下划线，hover 时加深。外部链接自动追加 `↗` 标识和 `target="_blank"` + `rel="noopener noreferrer"` 属性。这个逻辑在 remark 插件层面处理，不需要手动加。

### GitHub 风格提示框

支持 GitHub 风格的 Alerts 语法：

> [!NOTE]
> 这是一条提示信息。

> [!WARNING]
> 这是一条警告信息。

写法就是标准的 GitHub Alerts：

```md
> [!NOTE]
> 这是一条提示信息。
```

## 功能细节

### 全站搜索

按 <kbd>Ctrl</kbd> + <kbd>K</kbd>（macOS 下 <kbd>Cmd</kbd> + <kbd>K</kbd>）打开搜索面板，支持文章标题和描述的模糊搜索，搜索历史本地持久化。

### 阅读体验

- **阅读时间**：文章列表和详情页自动计算并显示
- **目录导航**：长文自动生成右侧目录，带阅读进度和移动端抽屉
- **图片灯箱**：点击文章内的图片放大查看
- **标题锚点**：hover 标题出现链接图标，方便分享定位
- **相关文章**：文章底部自动推荐相关内容

### PWA

内置 Service Worker 和 Web App Manifest，支持添加到主屏幕和离线缓存。`public/manifest.json` 可以自定义应用名称、图标等。

### 可选动态能力

仓库根目录带了可部署到 Vercel 的 `api/` 路由。配置环境变量后，可以启用 GitHub Issues 评论 / 留言板、碎碎念点赞和 `/thoughts/new` 在线发布；如果你只想保留纯静态博客，可以完全忽略这些能力。

### SEO

自动生成 `sitemap.xml` 和 `robots.txt`，页面自带 Open Graph 和 Twitter Card meta 标签，RSS 订阅开箱即用。

## 定制

主题的设计哲学是**把数据和模板分开**。大部分个人化的内容都集中在 `src/consts.ts` 里：

- `SITE` — 站点名称、邮箱、描述
- `PROJECTS` — 关于页面的项目列表
- `TECH_STACK` — 关于页面的技术栈
- `SOCIALS` — 社交链接

改常量就能更新页面，不用翻模板代码。

样式方面，全局 CSS 在 `src/styles/global.css`，配色基于 Tailwind 的 stone 色系。如果想换色系，全局替换 `stone` 为其他颜色（比如 `zinc`、`slate`、`neutral`）就行。

---

就这些。主题本身不复杂，代码量也不大，遇到想改的地方直接翻源码就好。
