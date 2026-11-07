import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Load fonts
const zenGothicPath = path.resolve(
    process.cwd(),
    'node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-500-normal.woff'
);
const zenGothicData = fs.readFileSync(zenGothicPath);

/**
 * Measures optical vertical centering of text/icons inside a container.
 * Scans rendered pixels to find the container's top/bottom borders
 * and the inner content's topmost/bottommost non-background pixels.
 */
async function auditElement({ name, vdom, width = 360, height = 120 }) {
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    fontFamily: 'Zen Kaku Gothic New',
                },
                children: [vdom],
            },
        },
        {
            width,
            height,
            fonts: [
                {
                    name: 'Zen Kaku Gothic New',
                    data: zenGothicData,
                    weight: 500,
                    style: 'normal',
                },
            ],
        }
    );

    const resvg = new Resvg(svg);
    const png = resvg.render().asPng();
    const raw = await import('sharp').then((m) =>
        m.default(png).raw().toBuffer({ resolveWithObject: true })
    );

    const { data, info } = raw;
    let bTop = -1,
        bBot = -1;
    let bLeft = -1,
        bRight = -1;

    // 1. Find container outer bounds
    for (let y = 10; y < info.height - 10; y++) {
        for (let x = 10; x < info.width - 10; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = data[idx],
                g = data[idx + 1],
                b = data[idx + 2];
            // Non-white pixel indicates container background or border
            if (r < 250 || g < 250 || b < 250) {
                if (bTop === -1) bTop = y;
                bBot = y;
                if (bLeft === -1 || x < bLeft) bLeft = x;
                if (bRight === -1 || x > bRight) bRight = x;
            }
        }
    }

    if (bTop === -1) {
        return { name, error: 'Could not detect element' };
    }

    // 2. Find text / icon content bounds inside the container
    // Inset from container edge to avoid outer borders
    let contentTop = 999,
        contentBot = -1;
    for (let y = bTop + 3; y <= bBot - 3; y++) {
        for (let x = bLeft + 10; x <= bRight - 10; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = data[idx],
                g = data[idx + 1],
                b = data[idx + 2];
            // Detect text/icon pixels
            if (r < 220 || g < 220 || b < 220) {
                if (y < contentTop) contentTop = y;
                if (y > contentBot) contentBot = y;
            }
        }
    }

    const boxHeight = bBot - bTop + 1;
    const glyphHeight = contentBot - contentTop + 1;
    const topSpace = contentTop - bTop;
    const bottomSpace = bBot - contentBot;
    const diff = topSpace - bottomSpace; // negative: shifted down, positive: shifted up

    return {
        name,
        boxHeight,
        glyphHeight,
        topSpace,
        bottomSpace,
        diff,
        isCentered: Math.abs(diff) <= 1,
    };
}

async function runAudit() {
    console.log('=== Y-Axis Vertical Alignment Audit ===\n');

    const elements = [
        {
            name: '.btn-social (Hero ソーシャルボタン)',
            vdom: {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '42px',
                        padding: '0 22px',
                        borderRadius: '50px',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '14px',
                        fontFamily: 'Zen Kaku Gothic New',
                        fontWeight: '500',
                        lineHeight: '1',
                        width: '140px',
                        justifyContent: 'center',
                    },
                    children: [
                        {
                            type: 'span',
                            props: {
                                style: {
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: '#475569',
                                },
                            },
                        },
                        { type: 'span', props: { children: 'GitHub' } },
                    ],
                },
            },
        },
        {
            name: '.modal-btn (モーダル内アクションボタン)',
            vdom: {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        height: '44px',
                        padding: '0 20px',
                        borderRadius: '8px',
                        border: '1px solid #0284c7',
                        color: '#0284c7',
                        fontSize: '14px',
                        fontWeight: '500',
                        lineHeight: '1',
                        width: '180px',
                    },
                    children: [
                        {
                            type: 'span',
                            props: {
                                style: {
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: '#0284c7',
                                },
                            },
                        },
                        { type: 'span', props: { children: 'GitHub' } },
                    ],
                },
            },
        },
        {
            name: '.filter-btn (制作物フィルターボタン)',
            vdom: {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '34px',
                        padding: '0 16px 3px',
                        borderRadius: '50px',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '14px',
                        fontWeight: '500',
                        lineHeight: '1',
                    },
                    children: [{ type: 'span', props: { children: 'Web' } }],
                },
            },
        },
        {
            name: '.work-detail-badge (制作物詳細バッジ)',
            vdom: {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        padding: '0 10px',
                        borderRadius: '50px',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '700',
                        lineHeight: '1',
                    },
                    children: [{ type: 'span', props: { children: '詳細' } }],
                },
            },
        },
    ];

    let hasFailures = false;
    for (const el of elements) {
        const res = await auditElement(el);
        const status = res.isCentered ? '✅ OK' : '⚠️ ズレあり';
        if (!res.isCentered) hasFailures = true;
        console.log(`${status} ${res.name}`);
        console.log(
            `   枠高さ: ${res.boxHeight}px | 上余白: ${res.topSpace}px | 下余白: ${res.bottomSpace}px | 差分: ${res.diff}px\n`
        );
    }

    if (hasFailures) {
        console.log('⚠️ 一部の要素で Y 軸中心線のズレが検出されました。');
    } else {
        console.log('✨ すべての要素の Y 軸中心線が許容範囲（±1px）に収まっています。');
    }
}

runAudit().catch(console.error);
