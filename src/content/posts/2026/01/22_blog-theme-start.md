---
title: Astro Doge 主题 - 快速开始
description: 从 clone 到跑起来，五分钟搞定。包含评论系统、留言板、碎碎念等完整配置指南。
date: 2026-01-22T12:30:02+08:00
slug: blog-theme-start
draft: false
---

从 clone 到跑起来，五分钟的事。后面的进阶配置可以按需阅读。

## 获取源码

```bash
git clone https://github.com/dogxii/astro-doge.git my-blog
cd my-blog
```

安装依赖，推荐 [Bun](https://bun.sh)，当然 npm / pnpm / yarn 也行：

```bash
bun install
```

启动开发服务器：

```bash
bun dev
```

浏览器打开 `http://localhost:4321`，能看到页面就说明没问题。

## 基础配置

主要改三个地方。

### 1. astro.config.mjs

把 `site` 换成你自己的域名，`allowHostnames` 也一并改掉——它控制哪些域名的链接不被标记为外链：

```mjs title="astro.config.mjs"
export default defineConfig({
  site: 'https://your-domain.com/',
  // ...
  markdown: {
    remarkPlugins: [
      // ...
      [remarkExternalLinks, { allowHostnames: ['your-domain.com'] }],
    ],
  },
})
```

### 2. src/consts.ts

站点元信息都在这里，按需改就行：

```ts title="src/consts.ts"
export const SITE: Site = {
  NAME: '你的站名',
  EMAIL: 'you@example.com',
  DESCRIPTION: '一句话描述你的博客.',
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_THOUGHTS_ON_HOMEPAGE: 3,
  NUM_RELATED_POSTS_ON_POST: 5,
}
```

同文件里的 `PROJECTS`、`TECH_STACK`、`SOCIALS` 等常量也在这里，结构都很直白，照着改就行。

### 3. 导航与底部

- `src/components/Header.astro` — 顶部导航栏的链接和文字
- `src/components/Footer.astro` — 底部版权信息、外链

找到对应的文字和链接替换成你自己的就好。

---

## 写文章

### 快速创建

主题提供了脚手架命令：

```bash
bun new:blog my-first-post
```

它会在 `src/content/posts/` 下按日期创建目录和文件，frontmatter 自动填好，省去手打的麻烦。

### 手动创建

在 `src/content/posts/` 下新建 `.md` 文件即可。注意文件开头需要 frontmatter：

```md title="my-first-post.md"
---
title: 我的第一篇文章
description: 简单的描述。
date: 2025-01-01T12:00:00+08:00
slug: my-first-post
draft: false
---

正文从这里开始。
```

各字段说明：

| 字段          | 类型          | 说明                                       |
| ------------- | ------------- | ------------------------------------------ |
| `title`       | string        | 文章标题                                   |
| `description` | string        | 文章描述，显示在列表和 SEO meta 中         |
| `date`        | ISO 8601      | 发布时间，`T` 分隔日期时间，末尾带时区偏移 |
| `slug`        | string (可选) | 自定义 URL 路径，不填则使用文件名          |
| `draft`       | boolean       | `true` 时文章不会被构建                    |

> 不熟悉 Markdown？看看 [Markdown 速通](/markdown-tutorial)。

---

## 碎碎念

碎碎念是短内容，类似微博/推文。

### 快速创建

```bash
bun t
```

这条命令会在 `src/content/thoughts/` 下按当前日期自动创建文件。你也可以直接带上内容：

```bash
bun t random-name "今天天气不错"
```

第一个参数是文件名后缀（可选，不传会随机生成），第二个参数是正文内容。

### 手动创建

在 `src/content/thoughts/` 下新建 `.md` 文件，frontmatter 更简单：

```md title="src/content/thoughts/2025/01/01_hello.md"
---
date: 2025-01-01T10:00:00+08:00
draft: false
tags:
  - dev
---

今天又学到了一个新东西。
```

碎碎念的 frontmatter 字段：

| 字段    | 类型     | 说明                         |
| ------- | -------- | ---------------------------- |
| `date`  | ISO 8601 | 发布时间                     |
| `draft` | boolean  | `true` 时不会被构建          |
| `tags`  | string[] | 可选标签，显示在碎碎念条目中 |

碎碎念页面会自动按时间倒序排列，按日期轮换圆点和编号颜色，显示相对时间（如「3 小时前」）、星期、日期、标签和可选点赞。每条碎碎念都有锚点编号，点击 `#n` 可以复制直链。

### 在线发布（/thoughts/new）

主题还提供了一个网页端碎碎念编辑器，访问 `/thoughts/new` 即可使用。支持实时 Markdown 预览、标签选择、自定义标签等功能。

使用前需要配置 API Token：

1. 在部署平台设置环境变量 `THOUGHT_API_TOKEN`，值为你自定义的一个密钥字符串
2. 在 `/thoughts/new` 页面的 **API Token** 输入框中填入这个密钥
3. Token 会保存在浏览器本地，下次访问不用重复输入

编辑器会调用模板内置的 `/api/add-thought` 接口，将内容提交到 GitHub 仓库（通过 GitHub API 直接创建文件并提交）。推荐按仓库里的 `docs/deploy-vercel.md` 部署到 Vercel，并配置 `GITHUB_TOKEN`、`CONTENT_REPO`、`THOUGHT_API_TOKEN` 等环境变量。

> [!TIP]
> 如果你不需要在线发布功能，可以删除 `src/pages/thoughts/new.astro`，只用 `bun t` 命令在本地创建碎碎念。

---

## 评论系统

主题内置了一套基于 **GitHub Issues** 的评论系统。评论数据存储在你指定的 GitHub 仓库的 Issues 中，通过 serverless API 进行读写。

### 工作原理

- 每篇文章/页面的评论对应一个 GitHub Issue（以 `slug` 作为标识）
- 前端通过 `/api/comments` 读取评论，通过 `/api/submit-comment` 提交评论
- 支持头像、Markdown 渲染、表情包、剧透语法、嵌套回复

### 第一步：创建评论仓库

1. 在 GitHub 上创建一个**公开仓库**，专门用于存放评论（例如 `my-blog-comments`）
2. 不需要任何初始化内容，空仓库就行

> [!TIP]
> 建议用独立仓库存评论，不要和博客源码混在一起，这样更干净。

### 第二步：创建 GitHub Token

1. 前往 [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. 点击 **Generate new token**
3. 设置 Token 名称（如 `blog-comments`）和过期时间
4. 在 **Repository access** 中选择 **Only select repositories**，选中你的评论仓库
5. 在 **Permissions** 中，给 **Issues** 设置 **Read and write** 权限
6. 生成并复制 Token

### 第三步：配置环境变量

在项目根目录创建 `.env` 文件：

```bash title=".env"
# 站点地址
SITE_URL=https://your-domain.com

# GitHub API Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# 评论 / 留言板仓库
COMMENTS_REPO=your-github-username/my-blog-comments

# 点赞仓库（可选，不配会回退到 COMMENTS_REPO / GITHUB_REPO）
LIKES_REPO=your-github-username/my-blog-likes

# 在线发布碎碎念写入的内容仓库
CONTENT_REPO=your-github-username/my-blog

# 博主身份验证（用于评论中显示「博主」标识）
OWNER_NAME=你的名字
OWNER_EMAIL=you@example.com
OWNER_TOKEN=your-secret-token
PUBLIC_OWNER_NAME=你的名字

# 碎碎念在线发布（可选，仅 /thoughts/new 页面需要）
THOUGHT_API_TOKEN=your-thought-api-token
CONTENT_BRANCH=main
SITE_TIMEZONE=Asia/Shanghai
```

各变量说明：

| 变量                | 说明                                           |
| ------------------- | ---------------------------------------------- |
| `SITE_URL`          | 线上站点地址，用于生成链接和 CORS              |
| `GITHUB_TOKEN`      | 上一步创建的 Fine-grained Token                |
| `COMMENTS_REPO`     | 评论 / 留言板仓库，格式 `owner/repo`           |
| `LIKES_REPO`        | 点赞数据仓库，可选                             |
| `CONTENT_REPO`      | `/thoughts/new` 写入的内容仓库                 |
| `OWNER_NAME`        | 博主名称，评论中使用此名字时会触发身份验证     |
| `OWNER_EMAIL`       | 博主邮箱，同上                                 |
| `OWNER_TOKEN`       | 博主验证口令，在前端提交评论时用于证明博主身份 |
| `PUBLIC_OWNER_NAME` | 前端用于提示博主输入 token                     |
| `THOUGHT_API_TOKEN` | 在线发布碎碎念所需口令                         |

> [!WARNING]
> `.env` 文件已在 `.gitignore` 中，不会被提交。如果部署到 Vercel/Netlify 等平台，需要在平台的环境变量设置中添加这些变量。

### 第四步：部署 API 端点

模板仓库根目录已经带了这些 API：

- `api/comments.ts`
- `api/submit-comment.ts`
- `api/likes.ts`
- `api/add-thought.ts`

最省事的方式是直接部署到 Vercel。因为 Vercel 可以同时托管静态站点和根目录下的 `api/` Serverless Functions，所以你不需要把 Astro 改成 SSR，也不需要自己再补一套后端。

如果你不用 Vercel，或者不想用 GitHub Issues / 仓库来存这些数据，也可以参考仓库里的 `docs/api-contract.md` 自己实现兼容接口。

> [!NOTE]
> 如果你不需要评论功能，可以直接删除 `src/components/Comments.astro` 文件，并移除文章页面（`src/pages/[...slug].astro`）和留言板页面中对它的引用。

### 博主身份验证（Owner Token）

当有人用和博主相同的名称或邮箱发表评论时，前端会弹出一个输入框要求输入验证 Token。只有输入正确的 `OWNER_TOKEN` 才能以博主身份发表评论，评论旁会显示「博主」标识。

验证通过后，Token 会保存在浏览器的 `localStorage` 中，下次不需要重复输入。如果 Token 错误，已保存的缓存也会被自动清除。

---

## 留言板

留言板页面位于 `src/pages/messages/index.astro`，本质上是一个固定 `slug` 为 `messages` 的评论区。它复用了评论组件，所以**留言板正常工作的前提是评论系统已经配置好**。

如果你不需要留言板，直接删除 `src/pages/messages/` 目录，并在 `Header.astro` 中移除对应导航链接即可。

## 点赞

碎碎念页已经接入 `/api/likes`。如果你部署到 Vercel 并配置了 `GITHUB_TOKEN` 和 `LIKES_REPO` / `COMMENTS_REPO` / `GITHUB_REPO`，点赞数据会写入 GitHub Issue；如果不配置，页面仍可正常浏览，只是点赞按钮会提示接口尚未配置。

---

## 关于页面

`src/pages/about/index.astro` 是关于页面。页面中的项目列表和技术栈数据来自 `src/consts.ts` 中的 `PROJECTS` 和 `TECH_STACK` 常量，直接改常量就能更新页面。

```ts title="src/consts.ts"
export const PROJECTS: Projects = [
  {
    category: '开源项目',
    items: [
      {
        name: 'My Project',
        href: 'https://github.com/username/project',
        homepage: 'https://project.example.com',
        badge: 'Active',
        description: '项目简介',
      },
    ],
  },
]
```

---

## 友链

`src/pages/friends/index.astro` 文件顶部的 `FRIENDS` 数组定义了友链列表，`MY_SITE` 对象是你自己的站点信息（用于友链交换）。改数组就行，不需要动模板逻辑。

---

## 部署

### 纯静态部署（默认）

Astro Doge 默认输出静态文件（`output: 'static'`），构建产物在 `dist/` 目录。

```bash
bun run build
```

生成的文件可以部署到任何静态托管服务：Vercel、Netlify、Cloudflare Pages、GitHub Pages 等。

> [!NOTE]
> 纯静态模式下，评论、留言板、点赞和网页端发布不会生效。如果你需要这些功能，推荐直接按 `docs/deploy-vercel.md` 部署内置 API。

### 使用 Vercel 部署内置 API

如果你需要评论功能、碎碎念点赞或 `/thoughts/new` 在线发布，推荐直接把整个项目部署到 Vercel。

模板已经自带 `vercel.json` 和根目录 `api/`，你只需要在 Vercel Dashboard 中补齐环境变量，例如：

- `SITE_URL`
- `GITHUB_TOKEN`
- `COMMENTS_REPO` 或 `GITHUB_REPO`
- `LIKES_REPO` 或 `COMMENTS_REPO`
- `CONTENT_REPO`
- `THOUGHT_API_TOKEN`

完整步骤见仓库里的 `docs/deploy-vercel.md`。

---

## PWA

主题内置了 PWA 支持。相关文件：

- `public/manifest.json` — 应用名称、图标、主题色等
- `public/sw.js` — Service Worker 缓存策略

修改 `manifest.json` 中的 `name`、`short_name`、`icons` 等字段来自定义你的 PWA 信息：

```json title="public/manifest.json"
{
  "name": "你的博客名",
  "short_name": "博客",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafaf9",
  "theme_color": "#fafaf9"
}
```

---

## 其他

- **RSS**：自动生成，访问 `/rss.xml` 即可订阅。
- **Sitemap**：自动生成，搜索引擎会自动发现。
- **暗色模式**：开箱即用，右上角切换，支持跟随系统。
- **全站搜索**：按 `Ctrl+K`（macOS 下 `Cmd+K`）打开搜索面板。
- **代码高亮**：基于 Expressive Code，支持代码块标题、行高亮。

---

## 环境变量汇总

| 变量                | 必需     | 说明                          |
| ------------------- | -------- | ----------------------------- |
| `SITE_URL`          | 动态功能 | 线上站点地址                  |
| `GITHUB_TOKEN`      | 动态功能 | GitHub Fine-grained Token     |
| `COMMENTS_REPO`     | 评论     | 评论 / 留言板仓库             |
| `LIKES_REPO`        | 点赞     | 点赞数据仓库                  |
| `CONTENT_REPO`      | 碎碎念   | 在线发布写入的内容仓库        |
| `GITHUB_REPO`       | 可选回退 | 不拆仓库时可作为通用回退      |
| `OWNER_NAME`        | 评论     | 博主名称（身份验证用）        |
| `OWNER_EMAIL`       | 评论     | 博主邮箱（身份验证用）        |
| `OWNER_TOKEN`       | 评论     | 博主验证口令                  |
| `PUBLIC_OWNER_NAME` | 评论     | 前端提示博主输入 token        |
| `THOUGHT_API_TOKEN` | 碎碎念   | 在线发布碎碎念的 API 验证密钥 |

标注为「评论」的变量在使用评论/留言板功能时需要配置，标注为「碎碎念」的在使用在线发布功能（`/thoughts/new`）时需要配置。纯静态 + 本地写作的方式不需要任何环境变量。

---

有问题欢迎去 [GitHub Issues](https://github.com/dogxii/astro-doge/issues) 反馈。
