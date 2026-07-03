# my portfolio website

[v76nl.github.io](https://v76nl.github.io/)

ポートフォリオというより制作物管理の意味合いが強い

## ページ

- メイン
  https://v76nl.github.io/

- 拡張機能一覧
  https://v76nl.github.io/univ-extensions/

## 実行方法

```bash
pnpm dev
```

### データの更新・アセットの追加について

- **データ**: `src/data/works.yaml` または `src/data/univ-extensions.yaml` を編集するだけ
- **画像アセット**: 制作物のサムネイル等の画像は `public/assets/` に配置し、YAML には `assets/ファイル名.png` のように記述

## ディレクトリ構成

```text
.
├── astro.config.mjs             # Astroの設定
├── public/                      # そのまま配信される静的ファイル
│   ├── favicon.ico
│   └── assets/                  # サムネイルなどの画像アセット
└── src/
    ├── data/                    # YAML形式のデータソース
    │   ├── works.yaml           # 制作物の一覧データ
    │   └── univ-extensions.yaml # 開発した拡張機能の一覧データ
    ├── layouts/
    │   └── Layout.astro         # サイト全体の共通レイアウト (headや背景の定義)
    ├── pages/
    │   ├── index.astro          # ポートフォリオのトップページ
    │   └── univ-extensions/
    │       └── index.astro      # 拡張機能一覧ページ
    ├── scripts/
    │   └── common.js            # クライアントサイドで動作するJS (テーマ切替, フィルター等)
    ├── styles/
    │   ├── global.css           # 共通テーマ・コンポーネントスタイル
    │   ├── index.css            # トップページ専用スタイル
    │   └── univ-extensions.css  # 拡張機能一覧ページ専用スタイル
    └── utils/
        └── data.js              # ビルド時にYAMLを読み込むサーバーサイドユーティリティ
```
