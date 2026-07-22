import { defineConfig, defineCollection, s } from 'velite'

// Blog post collection schema definition
const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      id: s.string().optional(),
      title: s.string().max(100),
      slug: s.path().transform((p) => p.replace(/^blog\//, '')), // strip 'blog/' prefix for clean URLs
      type: s.literal('blog').default('blog'),
      summary: s.string(),
      topics: s.array(s.string()).default([]),
      status: s.enum(['draft', 'published', 'archived']).default('draft'),
      published_at: s.isodate(),
      updated_at: s.isodate().optional(),
      cover_image: s.string().optional(),
      related_content: s.array(s.string()).optional(),
      content: s.mdx(),
    })
    .transform((data) => {
      // Calculate reading time (roughly 200 words per minute)
      // Since MDX compiles to JS code in content, we estimate word count from MDX string
      const rawText = data.content || ''
      const wordCount = rawText.split(/\s+/).filter(Boolean).length
      const reading_time_minutes = Math.max(1, Math.ceil(wordCount / 200))
      
      return {
        ...data,
        id: data.id || data.slug,
        reading_time_minutes,
      }
    }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
})
