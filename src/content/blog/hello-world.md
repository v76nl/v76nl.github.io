---
title: 'ブログを始めました'
description: 'ポートフォリオサイトにブログ機能を追加しました。'
date: 2026-11-05
tags:
    - 'お知らせ'
draft: true
---

ポートフォリオサイトにブログ機能を追加しました。

## 記事の書き方

`src/content/blog/` に Markdown ファイルを置くと、ファイル名がそのまま URL になります。

例: `hoge-fuga-foo-bar.md` → `/blog/hoge-fuga-foo-bar/`

```md
---
title: 'タイトル'
description: '概要'
date: 2026-11-05
tags: ['タグ']
draft: false
---
```

`draft: true` にすると公開されません。
