import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
    const zenGothicPath = path.resolve(
        process.cwd(),
        'node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-500-normal.woff'
    );
    const notoSerifPath = path.resolve(
        process.cwd(),
        'node_modules/@fontsource/noto-serif-jp/files/noto-serif-jp-japanese-900-normal.woff'
    );

    const zenGothicData = fs.readFileSync(zenGothicPath);
    const notoSerifData = fs.readFileSync(notoSerifPath);

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    backgroundColor: '#f5f7fb',
                    backgroundImage:
                        'radial-gradient(circle at 85% 15%, rgba(14, 165, 233, 0.18) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(236, 72, 153, 0.14) 0%, transparent 55%)',
                    padding: '80px',
                    fontFamily: 'Zen Kaku Gothic New',
                    color: '#0f172a',
                },
                children: [
                    // ヘッダー (アンダーライン装飾付き小文字ドメイン)
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '3px solid #0284c7',
                                paddingBottom: '6px',
                            },
                            children: [
                                {
                                    type: 'span',
                                    props: {
                                        style: {
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            letterSpacing: '0.15em',
                                            color: '#0284c7',
                                        },
                                        children: 'v76nl.github.io',
                                    },
                                },
                            ],
                        },
                    },
                    // メインコンテンツ (タイトル & キャッチコピー)
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                            },
                            children: [
                                {
                                    type: 'h1',
                                    props: {
                                        style: {
                                            fontFamily: 'Noto Serif JP',
                                            fontSize: '68px',
                                            fontWeight: '900',
                                            margin: 0,
                                            lineHeight: 1.2,
                                            color: '#0f172a',
                                        },
                                        children: 'wash Portfolio',
                                    },
                                },
                                {
                                    type: 'p',
                                    props: {
                                        style: {
                                            fontFamily: 'Zen Kaku Gothic New',
                                            fontSize: '28px',
                                            fontWeight: '500',
                                            color: '#334155',
                                            margin: 0,
                                        },
                                        children:
                                            '「感覚 × デジタル」をテーマに開発を行う文系学生デベロッパー',
                                    },
                                },
                            ],
                        },
                    },
                    // 下部タグバッジ
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', gap: '16px' },
                            children: ['Web', 'UX Design', 'チーム開発'].map(
                                (tag) => ({
                                    type: 'span',
                                    props: {
                                        style: {
                                            padding: '8px 22px',
                                            borderRadius: '9999px',
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.85)',
                                            border: '1px solid rgba(203, 213, 225, 0.8)',
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: '#334155',
                                            boxShadow:
                                                '0 4px 12px rgba(0, 0, 0, 0.04)',
                                        },
                                        children: tag,
                                    },
                                })
                            ),
                        },
                    },
                ],
            },
        },
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Zen Kaku Gothic New',
                    data: zenGothicData,
                    weight: 500,
                    style: 'normal',
                },
                {
                    name: 'Noto Serif JP',
                    data: notoSerifData,
                    weight: 900,
                    style: 'normal',
                },
            ],
        }
    );

    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    });

    const image = resvg.render();
    return new Response(image.asPng(), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
};
