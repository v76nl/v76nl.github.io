// public/assets/ の PNG を WebP に変換し(最大幅1200px)、元の PNG を削除する。
// 使い方: node scripts/optimize-images.mjs
// works.yaml などの参照パスは、変換後に自分で .webp へ書き換える。
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = 'public/assets';
// CSS の背景タイルやアイコンは対象外
const SKIP = new Set(['noise.png']);
const MAX_WIDTH = 1200;
const QUALITY = 80;

const files = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.png') && !SKIP.has(f));

let before = 0;
let after = 0;
for (const f of files) {
    const src = path.join(DIR, f);
    const dest = src.replace(/\.png$/, '.webp');
    const out = await sharp(src)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
    fs.writeFileSync(dest, out);
    before += fs.statSync(src).size;
    after += out.length;
    fs.rmSync(src);
    console.log(`${f} -> ${path.basename(dest)} (${Math.round(out.length / 1000)}KB)`);
}
console.log(
    `合計 ${Math.round(before / 1000)}KB -> ${Math.round(after / 1000)}KB`
);
