// 記事ごとの OGP 画像 (/blog/<slug>/og.png) をビルド時に生成する
import type { APIRoute, GetStaticPaths } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts, formatDate } from '../../../utils/blog.js';
import { getPortfolioData, getTagColor } from '../../../utils/data.js';
import { blogOgTree, renderPng } from '../../../utils/og';

export const getStaticPaths = (async () => {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({
        params: { slug: post.id },
        props: { post },
    }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
    const { post } = props as { post: CollectionEntry<'blog'> };
    const profile = getPortfolioData().profile || {};
    const png = await renderPng(
        blogOgTree({
            title: post.data.title,
            date: formatDate(post.data.date),
            // 記事ページのタグと同じ色にする (オススメなど数値でない色は黄色)
            tags: post.data.tags.map((label) => {
                const color = getTagColor(label);
                return { label, color: typeof color === 'number' ? color : 2 };
            }),
            author: profile.name ?? '',
            site: site?.host ?? '',
        })
    );
    return new Response(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png' },
    });
};
