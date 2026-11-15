// ブログ記事 (Markdown) の画像に対する処理。astro.config.mjs から使う。

// 記事本文の表示幅。.article (max-width: 720px) から左右の余白 28px を引いた値。
// srcset から適切な大きさの画像を選んでもらうために sizes へ渡す。
const ARTICLE_IMAGE_SIZES = '(min-width: 720px) 664px, calc(100vw - 56px)';

const isBlankText = (node) => node.type === 'text' && !node.value.trim();

/**
 * - 画像に、記事の表示幅に合わせた sizes を付ける
 * - `![代替テキスト](画像 "キャプション")` のようにタイトルを書いた画像は、
 *   figure で包んでタイトルを画像下のキャプション (figcaption) にする
 */
export const blogImages = {
    name: 'blog-images',
    element: {
        filter: ['img'],
        visit(node, ctx) {
            ctx.setProperty(node, 'sizes', ARTICLE_IMAGE_SIZES);

            const caption = node.properties?.title;
            if (typeof caption !== 'string' || !caption.trim()) return;

            const parent = ctx.parent(node);
            // 子ノードは取り出すたびに別のオブジェクトになるので、=== ではなく中身で判定する
            const others = parent?.children.filter((c) => !isBlankText(c));
            const onlyImage =
                parent?.type === 'element' &&
                parent.tagName === 'p' &&
                others.length === 1 &&
                others[0].tagName === 'img';
            if (!onlyImage) return;

            // キャプションと同じ文がツールチップにも出ないよう、title を除いた img を作り直す
            const { title: _title, ...imgProps } = node.properties;
            ctx.replaceNode(parent, {
                type: 'element',
                tagName: 'figure',
                properties: {},
                children: [
                    {
                        type: 'element',
                        tagName: 'img',
                        properties: { ...imgProps, sizes: ARTICLE_IMAGE_SIZES },
                        children: [],
                    },
                    {
                        type: 'element',
                        tagName: 'figcaption',
                        properties: {},
                        children: [{ type: 'text', value: caption.trim() }],
                    },
                ],
            });
        },
    },
};
