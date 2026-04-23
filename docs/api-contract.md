# API Contract

`Astro Doge` 仓库已经自带一套可部署到 Vercel 的 `api/` 路由。

如果你不用这套内置实现，而是想接到自己的后端、数据库或其他平台，可以按这里的请求 / 响应格式兼容前端。

## 通用约定

- 返回 JSON 即可，不要求必须运行在 Vercel
- `404` / `405` 会被前端视为“功能未启用”
- 评论和在线发布返回 `500` 且带有 `Server configuration error` 时，前端会提示“接口已部署但环境变量未配置完成”
- 点赞接口未配置时，内置实现会返回 `503`

## `GET /api/comments?slug=<slug>`

用途：返回某篇文章或留言板的评论树。

成功响应示例：

```json
{
  "comments": [
    {
      "id": 101,
      "name": "Site Owner",
      "avatar": "https://weavatar.com/avatar/xxx?s=80&d=identicon",
      "website": "https://example.com",
      "content": "这是一条评论",
      "createdAt": "2026-04-23T09:00:00.000Z",
      "userAgent": "Mozilla/5.0",
      "isOwner": true,
      "replies": [
        {
          "id": 102,
          "name": "Alice",
          "avatar": "https://weavatar.com/avatar/yyy?s=80&d=identicon",
          "content": "这是一条回复",
          "createdAt": "2026-04-23T09:10:00.000Z",
          "replyTo": {
            "id": 101,
            "name": "Site Owner"
          }
        }
      ]
    }
  ],
  "count": 1
}
```

字段要求：

- `comments` 必填，数组即可
- 顶层评论会被前端按时间再次排序
- `replies` 可选；如果你直接返回评论树，前端会按树结构渲染

## `POST /api/submit-comment`

用途：提交评论或回复。

请求体示例：

```json
{
  "slug": "my-first-post",
  "title": "我的第一篇文章",
  "name": "Site Owner",
  "email": "hi@example.com",
  "website": "https://example.com",
  "content": "你好，这里是评论内容",
  "replyToId": "101",
  "replyToName": "Alice",
  "ownerToken": "secret-token",
  "_gotcha": "",
  "userAgent": "Mozilla/5.0"
}
```

字段说明：

- `slug`、`title`、`content` 为核心字段
- `name`、`email`、`website` 为访客信息
- `replyToId` / `replyToName` 用于回复
- `ownerToken` 用于博主身份校验
- `_gotcha` 是 honeypot 字段，留空即可

成功响应示例：

```json
{
  "success": true,
  "message": "评论提交成功"
}
```

推荐状态码：

- `400` 参数不合法
- `401` / `403` Token 或博主身份校验失败
- `429` 频率限制
- `500` 服务端异常

## `GET /api/likes?ids=<comma-separated>&type=thought&fingerprint=<fp>`

用途：批量读取碎碎念点赞状态。

请求约定：

- `ids` 必填，逗号分隔，最多 50 个
- `type` 目前固定为 `thought`
- `fingerprint` 可选，但内置前端会传；需要是 8 到 64 位十六进制字符串

成功响应示例：

```json
{
  "likes": {
    "thought:12": {
      "total": 8,
      "userToday": 1
    },
    "thought:13": {
      "total": 2,
      "userToday": 0
    }
  }
}
```

字段说明：

- `total` 是该条内容累计点赞数
- `userToday` 表示当前访客今天是否已点过赞，前端会用它控制按钮状态

## `POST /api/likes`

用途：为一条或多条碎碎念点赞。

单条请求示例：

```json
{
  "targetId": "12",
  "type": "thought",
  "fingerprint": "abcd1234ef567890"
}
```

批量请求示例：

```json
{
  "fingerprint": "abcd1234ef567890",
  "operations": [
    {
      "targetId": "12",
      "type": "thought"
    },
    {
      "targetId": "13",
      "type": "thought"
    }
  ]
}
```

单条成功响应示例：

```json
{
  "success": true,
  "limited": false,
  "total": 9,
  "userToday": 1,
  "dailyLimit": 1
}
```

批量成功响应示例：

```json
{
  "batch": true,
  "results": {
    "thought:12": {
      "success": true,
      "limited": false,
      "total": 9,
      "userToday": 1,
      "dailyLimit": 1
    }
  }
}
```

`limited` 为 `true` 时，前端会根据 `limitReason` 展示“今日已点赞”或“今日点赞已达上限”。

## `GET /api/add-thought`

用途：返回在线发布接口的说明信息。模板的 `/thoughts/new` 页面不依赖它，但部署后可用于自检。

成功响应示例：

```json
{
  "name": "Astro Doge Add Thought API",
  "version": "1.0.0",
  "endpoint": "/api/add-thought",
  "method": "POST"
}
```

## `POST /api/add-thought`

用途：供 `/thoughts/new` 页面在线创建一条新的碎碎念。

请求头：

```text
Authorization: Bearer <THOUGHT_API_TOKEN>
Content-Type: application/json
```

请求体示例：

```json
{
  "content": "今天把博客模板整理干净了。",
  "tags": ["dev", "note"],
  "name": "template-update"
}
```

成功响应示例：

```json
{
  "success": true,
  "message": "碎碎念创建成功",
  "data": {
    "filename": "23_template-update.md",
    "filePath": "src/content/thoughts/2026/04/23_template-update.md",
    "github": {
      "commitUrl": "https://github.com/owner/repo/commit/xxx",
      "fileUrl": "https://github.com/owner/repo/blob/main/src/content/thoughts/2026/04/23_template-update.md"
    }
  }
}
```

前端会直接读取这些字段：

- `data.filename`
- `data.github.commitUrl`
- `data.github.fileUrl`

如果这些字段缺失，成功提示里的链接区域会无法正常显示。
