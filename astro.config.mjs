// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// User homepage repo (kuukikun.github.io) -> deployed at root, no `base`.
export default defineConfig({
  site: 'https://kuukikun.github.io',
  integrations: [mdx()],
});
