// OGP 画像 (1200x630) を Satori + resvg で生成する共通処理
// 配色は src/styles/global.css の pastel テーマに合わせている
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fontkit from 'fontkit';
import fs from 'node:fs';
import path from 'node:path';
import { phrases, type Phrase } from './phrases';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const HUE = {
    bg: 222,
    primary: 194,
    pink: 338,
    yellow: 50,
    lavender: 268,
    mint: 162,
};
const hsl = (h: number, s: number, l: number, a = 1) =>
    `hsla(${h}, ${s}%, ${l}%, ${a})`;
const C = {
    bg: hsl(HUE.bg, 25, 97),
    text: hsl(HUE.bg, 25, 12),
    muted: hsl(HUE.bg, 15, 42),
};
// タグの色 (global.css の .tag[data-color='0'〜'4'] と同じ順)
const TAG_COLORS: [number, number][] = [
    [HUE.primary, 70],
    [HUE.pink, 62],
    [HUE.yellow, 80],
    [HUE.lavender, 58],
    [HUE.mint, 55],
];

// ---- フォント・画像 (Satori は woff2 非対応のため woff を使う。初回だけ読み込む) ----
const ROOT = process.cwd();
const readFont = (pkg: string, file: string) =>
    fs.readFileSync(
        path.join(ROOT, 'node_modules/@fontsource', pkg, 'files', file)
    );

type Font = {
    name: string;
    data: Buffer;
    weight: 500 | 700 | 900;
    style: 'normal';
};
let fontsCache: Font[] | undefined;
export function loadFonts(): Font[] {
    fontsCache ??= [
        {
            name: 'Zen Kaku Gothic New',
            data: readFont(
                'zen-kaku-gothic-new',
                'zen-kaku-gothic-new-japanese-500-normal.woff'
            ),
            weight: 500,
            style: 'normal',
        },
        {
            name: 'Zen Kaku Gothic New',
            data: readFont(
                'zen-kaku-gothic-new',
                'zen-kaku-gothic-new-japanese-700-normal.woff'
            ),
            weight: 700,
            style: 'normal',
        },
        {
            name: 'Noto Serif JP',
            data: readFont(
                'noto-serif-jp',
                'noto-serif-jp-japanese-900-normal.woff'
            ),
            weight: 900,
            style: 'normal',
        },
    ];
    return fontsCache;
}

let titleFont: any;
const getTitleFont = () =>
    (titleFont ??= fontkit.create(
        loadFonts().find((f) => f.name === 'Noto Serif JP')!.data
    ));

let avatarCache: string | undefined;
const avatarDataUri = () =>
    (avatarCache ??= `data:image/jpeg;base64,${fs
        .readFileSync(path.join(ROOT, 'src/assets/avatar.jpg'))
        .toString('base64')}`);

/** Satori の要素ツリーを PNG にする */
export async function renderPng(tree: unknown): Promise<Buffer> {
    const svg = await satori(tree as any, {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts: loadFonts(),
    });
    return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } })
        .render()
        .asPng();
}

// ---- 要素ツリーを組み立てる小さなヘルパー ----
type Style = Record<string, string | number>;
const h = (type: string, style: Style = {}, ...children: unknown[]) => ({
    type,
    props: { style: { display: 'flex', ...style }, children: children.flat() },
});
const span = (style: Style, children: string) => ({
    type: 'span',
    props: { style, children },
});

// ---- 見出しの折り返し ----
// Satori は日本語を文字単位で折り返すため、語句に分けたうえで、
// 各行の幅が揃う位置で改行する (text-wrap: balance 相当)
const SPACE_EM = 0.28;

/** 語句を maxWidth に収まる最少の行数に分け、そのうえで最長の行ができるだけ短くなるようにする */
function balanceLines(
    list: Phrase[],
    size: number,
    maxWidth: number
): Phrase[][] {
    const font = getTitleFont();
    const w = list.map(
        (p) => (font.layout(p.text).advanceWidth / font.unitsPerEm) * size
    );
    const lineWidth = (a: number, b: number) => {
        let sum = 0;
        for (let i = a; i < b; i++)
            sum += w[i] + (i < b - 1 && list[i].space ? SPACE_EM * size : 0);
        return sum;
    };
    const n = list.length;
    for (let lines = 1; lines <= n; lines++) {
        // best[k][i]: 先頭 i 語を k 行に分けたときの最長行の幅の最小値
        const best = Array.from({ length: lines + 1 }, () =>
            Array(n + 1).fill(Infinity)
        );
        const from = Array.from({ length: lines + 1 }, () =>
            Array(n + 1).fill(-1)
        );
        best[0][0] = 0;
        for (let k = 1; k <= lines; k++)
            for (let i = 1; i <= n; i++)
                for (let j = k - 1; j < i; j++) {
                    const lw = lineWidth(j, i);
                    if (lw > maxWidth) continue;
                    const v = Math.max(best[k - 1][j], lw);
                    if (v < best[k][i]) {
                        best[k][i] = v;
                        from[k][i] = j;
                    }
                }
        if (best[lines][n] === Infinity) continue;
        const out: Phrase[][] = [];
        for (let k = lines, i = n; k > 0; i = from[k][i], k--)
            out.unshift(list.slice(from[k][i], i));
        return out;
    }
    // 1 語だけで maxWidth を超える場合は 1 語 1 行にする
    return list.map((p) => [p]);
}

/** 見出しの文字サイズと行分けを決める。長いタイトルは maxLines 行に収まるまで小さくする */
function fitTitle(
    str: string,
    maxWidth: number,
    sizes: { max: number; min: number },
    maxLines: number
) {
    const list = phrases(str);
    let size = sizes.max;
    let lines = balanceLines(list, size, maxWidth);
    while (lines.length > maxLines && size > sizes.min) {
        size -= 2;
        lines = balanceLines(list, size, maxWidth);
    }
    return { size, lines };
}

// ---- 部品 ----
// 背景の光の玉 (.hero-orb)。transparent に向けると縁が灰色にくすむため、同じ色の透明度 0 に向ける
const orb = (size: number, pos: Style, [hh, s, l, a]: number[]) =>
    h('div', {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundImage: `radial-gradient(circle, ${hsl(hh, s, l, a)} 0%, ${hsl(hh, s, l, 0)} 68%)`,
        ...pos,
    });

// サイトの .tag (左が三角の値札型)。Satori の clip-path は % 指定が崩れるため三角は SVG で描く
function tag(label: string, colorIndex: number) {
    const [hue, sat] = TAG_COLORS[colorIndex % TAG_COLORS.length];
    const H = 40;
    const tip = H / 2;
    const bg = hsl(hue, sat, 60, 0.18);
    const bd = hsl(hue, sat, 55, 0.4);
    const tri =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${tip}" height="${H}">` +
        `<path d="M${tip} 0 L0 ${tip} L${tip} ${H} Z" fill="${bg}"/>` +
        `<path d="M${tip} 0.75 L0.9 ${tip} L${tip} ${H - 0.75}" fill="none" stroke="${bd}" stroke-width="1.5"/>` +
        `<circle cx="${tip * 0.68}" cy="${tip}" r="3.5" fill="#fff" fill-opacity="0.95"/></svg>`;
    return h(
        'div',
        { height: H },
        {
            type: 'img',
            props: {
                src: `data:image/svg+xml;utf8,${encodeURIComponent(tri)}`,
                width: tip,
                height: H,
            },
        },
        h(
            'div',
            {
                alignItems: 'center',
                height: H,
                padding: '0 16px 2px 8px',
                backgroundColor: bg,
                border: `1.5px solid ${bd}`,
                borderLeft: 'none',
                borderRadius: '0 8px 8px 0',
                color: hsl(hue, sat, 34),
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: '0.04em',
            },
            label
        )
    );
}

// ---- ブログ記事の OGP ----
export type BlogOgInput = {
    title: string;
    date: string;
    tags: { label: string; color: number }[];
    author: string;
    site: string;
};

const TITLE_MAX_WIDTH = 900;

/** 光の玉の上にすりガラスのカードを置いたデザイン */
export function blogOgTree({ title, date, tags, author, site }: BlogOgInput) {
    const { size, lines } = fitTitle(
        title,
        TITLE_MAX_WIDTH,
        { max: 64, min: 40 },
        3
    );
    return h(
        'div',
        {
            position: 'relative',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.bg,
            fontFamily: 'Zen Kaku Gothic New',
            color: C.text,
            overflow: 'hidden',
        },
        orb(820, { top: -300, left: -200 }, [HUE.primary, 68, 60, 0.42]),
        orb(700, { bottom: -300, right: -180 }, [HUE.pink, 60, 65, 0.36]),
        orb(420, { top: 40, right: 140 }, [HUE.lavender, 55, 60, 0.22]),
        h(
            'div',
            {
                width: 1040,
                height: 470,
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '52px 64px',
                borderRadius: 32,
                // Satori の box-shadow はカード内に横線が出るため使わず、枠線で輪郭を出す
                backgroundColor: 'rgba(255,255,255,0.62)',
                border: '1.5px solid rgba(255,255,255,0.9)',
            },
            h(
                'div',
                {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 40,
                },
                h(
                    'div',
                    { gap: 12 },
                    ...tags.map((t) => tag(t.label, t.color))
                ),
                span(
                    {
                        fontSize: 22,
                        fontWeight: 500,
                        color: C.muted,
                        letterSpacing: '0.06em',
                    },
                    date
                )
            ),
            h(
                'div',
                {
                    flexDirection: 'column',
                    fontFamily: 'Noto Serif JP',
                    fontWeight: 900,
                    fontSize: size,
                    lineHeight: 1.38,
                    maxWidth: TITLE_MAX_WIDTH,
                },
                ...lines.map((line) =>
                    h(
                        'div',
                        {},
                        ...line.map((p, i) =>
                            span(
                                {
                                    marginRight:
                                        p.space && i < line.length - 1
                                            ? `${SPACE_EM}em`
                                            : 0,
                                },
                                p.text
                            )
                        )
                    )
                )
            ),
            h(
                'div',
                { alignItems: 'center', gap: 14 },
                {
                    type: 'img',
                    props: {
                        src: avatarDataUri(),
                        width: 52,
                        height: 52,
                        style: {
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.95)',
                        },
                    },
                },
                h(
                    'div',
                    { flexDirection: 'column', lineHeight: 1.2 },
                    span(
                        { fontSize: 22, fontWeight: 700, color: C.text },
                        author
                    ),
                    span(
                        {
                            fontSize: 16,
                            fontWeight: 500,
                            color: C.muted,
                            letterSpacing: '0.08em',
                        },
                        site
                    )
                )
            )
        )
    );
}
