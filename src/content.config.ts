import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      type: z.enum(['essay', 'photo']), // 随笔 / 摄影日记
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(), // 列表缩略 / 首屏图
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .optional(), // 摄影日记用
      lang: z.enum(['zh', 'ja']).default('zh'),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
