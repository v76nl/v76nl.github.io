# my portfolio website

[v76nl.github.io](https://v76nl.github.io/) \
ポートフォリオというより制作物管理の意味合いが強い

## 実行方法

```bash
pnpm run dev
```

## ディレクトリ構成

```text
.
├── index.html                  # ポートフォリオのメインページ
├── vite.config.js              # Viteの設定（複数エントリーポイント、ビルド後コピー処理等の設定）
├── assets/                     # サムネイル画像やアイコンなどの各種静的アセット
├── css/
│   ├── global.css              # 共通テーマ設定、リセット、及び共通コンポーネント（カード、フッター等）のスタイル
│   ├── index.css               # トップページ専用のスタイル
│   └── univ-extensions.css     # 拡張機能一覧ページ専用のスタイル
├── data/
│   ├── works.yaml              # 制作物の一覧データ
│   └── univ-extensions.yaml    # 開発した拡張機能の一覧データ
├── js/
│   ├── common.js               # 全ページで共有されるヘルパー関数（エスケープ処理やテーマ切り替え等）とアイコン等の定数
│   ├── index.js                # トップページ専用のデータ取得およびDOMレンダリング処理
│   └── univ-extensions.js      # 拡張機能一覧ページ専用のデータ取得およびDOMレンダリング処理
└── univ-extensions/
    └── index.html              # 開発した拡張機能一覧の専用ページ
```