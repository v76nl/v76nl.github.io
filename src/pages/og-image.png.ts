import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
    const fontPath = path.resolve(
        process.cwd(),
        'node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-700-normal.woff'
    );
    const fontData = fs.readFileSync(fontPath);

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
                    backgroundColor: '#0d1117',
                    backgroundImage:
                        'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.25) 0%, transparent 50%)',
                    padding: '80px',
                    fontFamily: 'Zen Kaku Gothic New',
                    color: '#ffffff',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            backgroundColor: '#6366f1',
                                        },
                                    },
                                },
                                {
                                    type: 'span',
                                    props: {
                                        style: {
                                            fontSize: '24px',
                                            letterSpacing: '0.2em',
                                            color: '#a5b4fc',
                                            textTransform: 'uppercase',
                                        },
                                        children: 'v76nl.github.io',
                                    },
                                },
                            ],
                        },
                    },
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
                                            fontSize: '64px',
                                            fontWeight: '900',
                                            margin: 0,
                                            lineHeight: 1.2,
                                            color: '#ffffff',
                                        },
                                        children: 'wash Portfolio',
                                    },
                                },
                                {
                                    type: 'p',
                                    props: {
                                        style: {
                                            fontSize: '28px',
                                            color: '#94a3b8',
                                            margin: 0,
                                        },
                                        children:
                                            '「感覚 × デジタル」をテーマに開発を行う学生デベロッパー',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', gap: '16px' },
                            children: [
                                'Astro 5',
                                'Web',
                                'UX Design',
                                'GDGoC Chuo',
                            ].map((tag) => ({
                                type: 'span',
                                props: {
                                    style: {
                                        padding: '8px 20px',
                                        borderRadius: '9999px',
                                        backgroundColor:
                                            'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        fontSize: '20px',
                                        color: '#cbd5e1',
                                    },
                                    children: tag,
                                },
                            })),
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
                    data: fontData,
                    weight: 700,
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
