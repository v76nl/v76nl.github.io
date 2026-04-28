// ── アプリ設定 ──────────────────────────────────────────
const DEBUG = false;
// ────────────────────────────────────────────────────────

const STATUS_LABEL = {
    active: '公開中',
    archived: 'アーカイブ',
    wip: '開発中',
};

function renderExtensions(extensions) {
    const grid = document.getElementById('ext-grid');
    const loading = document.getElementById('loading-message');
    if (loading) loading.remove();

    grid.innerHTML = extensions
        .map((ext, i) => {
            const status = ext.status ?? 'active';
            const tagsHtml = (ext.tags ?? [])
                .map(
                    (t) =>
                        `<span class="tag" data-color="${getTagColor(t)}">${escHtml(t)}</span>`
                )
                .join('');
            const delay = (i % 3) * 80;
            const githubHtml = ext.github
                ? `<a href="${escHtml(ext.github)}" target="_blank" rel="noopener noreferrer"
      class="work-link" aria-label="${escHtml(ext.title)} のリポジトリ">
     ${ICONS.github} GitHub
   </a>`
                : '';

            const statusBadgeHtml = status !== 'active'
                ? `\n  <span class="ext-status-badge ${escHtml(status)}" aria-label="ステータス: ${escHtml(STATUS_LABEL[status] ?? status)}" style="margin-bottom: 8px;">\n    ${escHtml(STATUS_LABEL[status] ?? status)}\n  </span>`
                : '';

            return `
<article class="work-card fade-up" style="transition-delay:${delay}ms"
         aria-label="${escHtml(ext.title)}">
  <div class="work-body">
    ${statusBadgeHtml}
    <h3 class="work-title">${escHtml(ext.title)}</h3>
    <p class="work-description">${escHtml(ext.description ?? '')}</p>
    <div class="work-tags" aria-label="タグ">${tagsHtml}</div>
    ${githubHtml ? `<div class="work-links" style="margin-top:auto; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--glass-border);">${githubHtml}</div>` : ''}
  </div>
</article>`;
        })
        .join('');

    // スクロールアニメーション (main.jsのロジックを優先して共通化)
    setTimeout(observeElements, 50);
}

async function main() {
    applyTheme(ACTIVE_THEME);

    try {
        if (DEBUG) console.log('[1] fetch univ-extensions.yaml');
        const res = await fetch('./data/univ-extensions.yaml');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = jsyaml.load(await res.text());
        if (DEBUG) console.log('[2] parsed:', data);

        renderExtensions(data.extensions ?? []);
    } catch (err) {
        console.error('load error:', err);
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.textContent = `データの読み込みに失敗しました: ${err.message}`;
            loading.style.color = 'hsl(0, 70%, 55%)';
        }
    }
}

main();
