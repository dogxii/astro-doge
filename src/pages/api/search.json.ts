import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'

export const prerender = true

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

  const thoughts = (await getCollection('thoughts'))
    .filter((thought) => !thought.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

  const searchData = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || '',
      url: `/${post.data.slug || post.id}`,
      type: 'post' as const,
      date: post.data.date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      content: (post.body ?? '').slice(0, 500),
    })),
    ...thoughts.map((thought, index) => {
      const thoughtId = thoughts.length - index
      return {
        title: `碎碎念 #${thoughtId}`,
        description: (thought.body ?? '')
          .slice(0, 100)
          .replace(/[#*`\n]/g, ' ')
          .trim(),
        url: `/thoughts#${thoughtId}`,
        type: 'thought' as const,
        date: thought.data.date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        content: (thought.body ?? '').slice(0, 300),
        tags: thought.data.tags || [],
      }
    }),
  ]

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
