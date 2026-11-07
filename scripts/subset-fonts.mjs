// サイトで実際に使っている文字だけを含む日本語フォントを生成する。
// src/ 内の文字を走査し、@fontsource のフル日本語フォントからサブセット化して
// src/generated/fonts/ に woff2 と fonts.css を出力する(生成物は git 管理しない)。
// dev / build の前に自動で実行され、使用文字が変わらなければ再生成を省く。
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';

const OUT_DIR = 'src/generated/fonts';
const SCAN_DIR = 'src';
const SCAN_EXT = new Set([
    '.astro',
    '.md',
    '.mdx',
    '.yaml',
    '.yml',
    '.ts',
    '.js',
    '.mjs',
    '.json',
    '.css',
]);
// 走査から除く(生成物そのものと、フォントの文字を含まない場所)
const SCAN_SKIP = new Set(['generated']);

const FAMILIES = [
    {
        family: 'Zen Kaku Gothic New',
        pkg: 'zen-kaku-gothic-new',
        weights: [400, 500, 700],
    },
    {
        family: 'Noto Serif JP',
        pkg: 'noto-serif-jp',
        weights: [400, 700, 900],
    },
];

// @fontsource の latin と同じ範囲。この範囲は latin 用の小さいフォントに任せる
const LATIN_RANGE =
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

// 文章に出てこなくても欠けさせたくない文字(ひらがな・カタカナ・全角英数記号)
const BASE_RANGES = [
    [0x3000, 0x303f],
    [0x3040, 0x309f],
    [0x30a0, 0x30ff],
    [0xff01, 0xff5e],
];

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SCAN_SKIP.has(entry.name)) walk(path.join(dir, entry.name), files);
        } else if (SCAN_EXT.has(path.extname(entry.name))) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
}

function collectChars() {
    const used = new Set();
    for (const file of walk(SCAN_DIR)) {
        for (const ch of fs.readFileSync(file, 'utf8')) {
            if (ch.codePointAt(0) >= 0x80) used.add(ch);
        }
    }
    const all = new Set(used);
    for (const [from, to] of BASE_RANGES) {
        for (let cp = from; cp <= to; cp++) all.add(String.fromCodePoint(cp));
    }
    return { used: [...used].sort(), text: [...all].sort().join('') };
}

const fontFile = (pkg, subset, weight) =>
    `node_modules/@fontsource/${pkg}/files/${pkg}-${subset}-${weight}-normal.woff2`;

const { used, text } = collectChars();
const hash = crypto
    .createHash('sha256')
    .update(text)
    .update(fs.readFileSync(new URL(import.meta.url)))
    .update(
        FAMILIES.flatMap((f) =>
            f.weights.map((w) => fs.statSync(fontFile(f.pkg, 'japanese', w)).size)
        ).join(',')
    )
    .digest('hex');

const hashFile = path.join(OUT_DIR, '.hash');
if (
    fs.existsSync(hashFile) &&
    fs.readFileSync(hashFile, 'utf8') === hash &&
    fs.existsSync(path.join(OUT_DIR, 'fonts.css'))
) {
    console.log('[fonts] 使用文字に変更なし。サブセットを再利用します');
    process.exit(0);
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// 元フォントに存在しない文字は豆腐や代替フォントになるため、気付けるよう警告する
const missing = new Set();
for (const { pkg, weights } of FAMILIES) {
    const ja = fontkit.openSync(fontFile(pkg, 'japanese', weights[0]));
    const latin = fontkit.openSync(fontFile(pkg, 'latin', weights[0]));
    for (const ch of used) {
        const cp = ch.codePointAt(0);
        if (!ja.hasGlyphForCodePoint(cp) && !latin.hasGlyphForCodePoint(cp)) {
            missing.add(ch);
        }
    }
}
if (missing.size) {
    console.warn(
        `[fonts] 注意: 次の文字は元のフォントに無く、代替フォントで表示されます: ${[...missing].join(' ')}`
    );
}

let css = '/* scripts/subset-fonts.mjs が生成する。直接編集しない */\n';
let total = 0;
for (const { family, pkg, weights } of FAMILIES) {
    for (const weight of weights) {
        const source = fs.readFileSync(fontFile(pkg, 'japanese', weight));
        const out = await subsetFont(source, text, { targetFormat: 'woff2' });
        const jaName = `${pkg}-ja-${weight}.woff2`;
        fs.writeFileSync(path.join(OUT_DIR, jaName), out);

        const latinName = `${pkg}-latin-${weight}.woff2`;
        fs.copyFileSync(
            fontFile(pkg, 'latin', weight),
            path.join(OUT_DIR, latinName)
        );
        total += out.length + fs.statSync(path.join(OUT_DIR, latinName)).size;

        // 日本語(範囲指定なし)を先に、latin(範囲指定あり)を後に宣言し、
        // 重なる文字は latin 側を優先させる
        css += `@font-face {
    font-family: '${family}';
    font-style: normal;
    font-display: swap;
    font-weight: ${weight};
    src: url('./${jaName}') format('woff2');
}
@font-face {
    font-family: '${family}';
    font-style: normal;
    font-display: swap;
    font-weight: ${weight};
    src: url('./${latinName}') format('woff2');
    unicode-range: ${LATIN_RANGE};
}
`;
    }
}
fs.writeFileSync(path.join(OUT_DIR, 'fonts.css'), css);
fs.writeFileSync(hashFile, hash);
console.log(
    `[fonts] ${[...text].length}文字で生成しました (woff2 合計 ${Math.round(total / 1000)}KB)`
);
