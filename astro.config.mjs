import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { blogImages } from './src/utils/markdown-images.mjs';

export default defineConfig({
    site: 'https://v76nl.github.io',
    integrations: [sitemap()],
    // 記事内の画像を画面幅に応じたサイズで出し分ける (srcset を自動生成)
    image: { layout: 'constrained' },
    markdown: {
        processor: satteri({ hastPlugins: [blogImages] }),
    },
});
