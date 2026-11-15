// ブログ記事 (Markdown) の画像に対する処理。astro.config.mjs から使う。

// 記事本文の表示幅。.article (max-width: 720px) から左右の余白 28px を引いた値。
// srcset から適切な大きさの画像を選んでもらうために sizes へ渡す。
const ARTICLE_IMAGE_SIZES = '(min-width: 720px) 664px, calc(100vw - 56px)';

/** 画像に、記事の表示幅に合わせた sizes を付ける */
export const blogImages = {
    name: 'blog-images',
    element: {
        filter: ['img'],
        visit(node, ctx) {
            ctx.setProperty(node, 'sizes', ARTICLE_IMAGE_SIZES);
        },
    },
};
