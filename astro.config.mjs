import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://v76nl.github.io',
    integrations: [sitemap()],
});
