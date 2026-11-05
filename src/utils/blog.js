import { getCollection } from 'astro:content';

/** 公開済みの記事を新しい順で返す */
export async function getPublishedPosts() {
    const posts = await getCollection('blog', ({ data }) => !data.draft);
    return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}
