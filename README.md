# v76nl.github.io

[v76nl.github.io](https://v76nl.github.io/)

個人的な制作物管理を兼ねたポートフォリオサイト。

## ページ

- メイン

    https://v76nl.github.io/

- 拡張機能一覧

    https://v76nl.github.io/univ-extensions/

- QRコード

    https://v76nl.github.io/qr/

- ブログ

    https://v76nl.github.io/blog/

## 技術スタック

- フレームワーク: Astro 7
- スタイリング: CSS
- フォント: Fontsource セルフホスト (Zen 角ゴシック, Noto Serif JP)
- フォーマッター: Prettier (`prettier-plugin-astro`)
- SEO: `@astrojs/sitemap`
- OGP画像生成: Satori (`satori`, `@resvg/resvg-js`)
- ライブラリ: qrcode (ビルド時インラインSVG生成)
- パッケージマネージャー: pnpm

## 実行方法

| コマンド       | 実行内容                     |
| -------------- | ---------------------------- |
| `pnpm install` | 依存パッケージのインストール |
| `pnpm dev`     | 開発サーバーの起動           |
| `pnpm build`   | プロダクションビルド         |
| `pnpm format`  | コード自動整形 (Prettier)    |

### ブログ記事の追加

`src/content/blog/` に Markdown ファイルを追加する。ファイル名がそのまま URL になる (`hoge-fuga.md` → `/blog/hoge-fuga/`)。

```md
---
title: 'タイトル'
description: '概要 (省略可)'
date: 2026-11-05
tags: ['タグ'] # 省略可
draft: false # true で非公開 (省略可)
---
```

### 文字サイズ

文字サイズは `src/styles/global.css` の `:root` にある変数 (`--fs-xs` 〜 `--fs-2xl`, `--fs-page-title`) を使う。値を直接書かない。12px 未満は使わない。

| 変数        | サイズ | 用途                           |
| ----------- | ------ | ------------------------------ |
| `--fs-xs`   | 12px   | タグ・バッジ・日付などメタ情報 |
| `--fs-sm`   | 14px   | 補助テキスト・ボタン           |
| `--fs-base` | 16px   | 本文                           |
| `--fs-lg`   | 18px   | カードの見出し                 |
| `--fs-xl`   | 20px   | モーダルの見出し               |
| `--fs-2xl`  | 24px   | 小さめのページ見出し           |

### データの更新・アセットの追加について

- **データ**: `src/data/works.yaml` または `src/data/univ-extensions.yaml` を編集
- **画像アセット**: 制作物のサムネイル等の画像は `public/assets/` に配置し、YAML には `assets/ファイル名.png` のように記述
- **オススメ**: `works.yaml` の `tags` に `オススメ` を付けた作品は、一覧の先頭に並ぶ。タグは金色で表示され、フィルターバーでも「すべて」の次に強調される
- **技能の軌道図**: 習熟度(`level`)ごとに輪を分け、内側ほどチップを大きくする。輪はCSSでゆっくり公転し、ホバー・フォーカス中はJSで速度をなめらかに落として止める。項目にカーソルを合わせると中央に名前を表示する(切り替え時は短くフェード)。幅800px以下では索引風のリストに切り替わる
- **技能のアイコン**: `src/data/skills.yaml` の `icon` に [Simple Icons](https://simpleicons.org/) の slug を書くと、軌道図にそのロゴを表示する(`simple-icons` パッケージ。SVG は CC0、ロゴの商標は各社に帰属)。多色のロゴは `logo: 'logos:visual-studio-code'` のように Iconify のセット(`logos` は CC0、`skill-icons` は MIT)から指定でき、画像ファイルは `image`(`public/` 以下のパス)で指定できる。どれもない項目は `monogram`(省略時は名前の先頭2文字)を円の中に表示する。WSL のアイコンは Microsoft の WSL リポジトリ(MIT)の画像
- **制作物の詳細モーダル**: `works.yaml` の作品に `detail` を書くと、カードをタップしたときに詳細がモーダルで開く(GitHub などのリンクボタンはモーダルを開かず、そのリンクだけが動く)。`detail` がない作品は従来どおり

  ```yaml
  detail:
      text: '4文程度の説明'
      images: # 省略するとサムネイルを表示
          - 'assets/画像1.png'
          - 'assets/画像2.png'
  ```

## ディレクトリ構成

```text
.
├── .prettierrc                  - Prettierの設定
├── astro.config.mjs             - Astroの設定 (Sitemap等)
├── tsconfig.json                - TypeScriptの設定 (Astroの型定義)
├── public/                      - 静的配信ファイル
│   └── assets/                  - サムネイル等の画像アセット
└── src/
    ├── data/                    - YAML形式のデータソース
    │   ├── works.yaml           - 制作物・人物データ
    │   └── univ-extensions.yaml - 開発した拡張機能データ
    ├── content/
    │   └── blog/                - ブログ記事 (Markdown)
    ├── content.config.ts        - ブログのコレクション定義
    ├── layouts/
    │   └── Layout.astro         - 全体の共通レイアウト (Fontsource, OGPタグ)
    ├── pages/
    │   ├── index.astro          - トップページ
    │   ├── og-image.png.ts      - Satoriによる動的OGP画像エンドポイント
    │   ├── blog/
    │   │   ├── index.astro      - ブログ記事一覧
    │   │   └── [slug].astro     - ブログ記事ページ
    │   ├── qr/
    │   │   └── index.astro      - QRコード表示ページ
    │   └── univ-extensions/
    │       └── index.astro      - 拡張機能一覧ページ
    ├── scripts/
    │   └── common.js            - クライアントスクリプト (テーマ切替, フィルター等)
    ├── styles/
    │   ├── global.css           - 共通スタイル
    │   ├── blog.css             - ブログ専用スタイル
    │   ├── index.css            - トップページ専用スタイル
    │   ├── qr.css               - QRコードページ専用スタイル
    │   └── univ-extensions.css  - 拡張機能一覧ページ専用スタイル
    └── utils/
        ├── blog.js              - ブログ記事取得ユーティリティ
        └── data.js              - ビルド用YAML読み込みユーティリティ
```
