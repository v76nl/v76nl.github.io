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

## 技術スタック

- フレームワーク: Astro 5
- スタイリング: CSS
- フォント: Zen 角ゴシック (Zen Kaku Gothic New), Noto Serif JP
- ライブラリ: qrcode (ビルド時インラインSVG生成)
- パッケージマネージャー: pnpm

## 実行方法

| コマンド | 実行内容 |
| -- | -- |
| `pnpm install` | 依存パッケージのインストール |
| `pnpm dev` | 開発サーバーの起動 |
| `pnpm build` | プロダクションビルド |

### データの更新・アセットの追加について

- **データ**: `src/data/works.yaml` または `src/data/univ-extensions.yaml` を編集
- **画像アセット**: 制作物のサムネイル等の画像は `public/assets/` に配置し、YAML には `assets/ファイル名.png` のように記述

## ディレクトリ構成

```text
.
├── astro.config.mjs             - Astroの設定
├── public/                      - 静的配信ファイル
│   └── assets/                  - サムネイル等の画像アセット
└── src/
    ├── data/                    - YAML形式のデータソース
    │   ├── works.yaml           - 制作物・人物データ
    │   └── univ-extensions.yaml - 開発した拡張機能データ
    ├── layouts/
    │   └── Layout.astro         - 全体の共通レイアウト
    ├── pages/
    │   ├── index.astro          - トップページ
    │   ├── qr.astro             - QRコード表示ページ
    │   └── univ-extensions/
    │       └── index.astro      - 拡張機能一覧ページ
    ├── scripts/
    │   └── common.js            - クライアントスクリプト (テーマ切替, フィルター等)
    ├── styles/
    │   ├── global.css           - 共通スタイル
    │   ├── index.css            - トップページ専用スタイル
    │   ├── qr.css               - QRコードページ専用スタイル
    │   └── univ-extensions.css  - 拡張機能一覧ページ専用スタイル
    └── utils/
        └── data.js              - ビルド用YAML読み込みユーティリティ
```
