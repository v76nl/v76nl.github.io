// ── アプリ設定 ──────────────────────────────────────────
const DEBUG = false;
const ACTIVE_THEME = 'sunset';
// ────────────────────────────────────────────────────────

const THEMES = {
    pastel: {
        '--hue-bg': 222,
        '--hue-primary': 194,
        '--hue-pink': 338,
        '--hue-yellow': 50,
        '--hue-lavender': 268,
        '--hue-mint': 162,
    },
    ocean: {
        '--hue-bg': 215,
        '--hue-primary': 200,
        '--hue-pink': 20,
        '--hue-yellow': 45,
        '--hue-lavender': 240,
        '--hue-mint': 175,
    },
    sunset: {
        '--hue-bg': 240,
        '--hue-primary': 30,
        '--hue-pink': 350,
        '--hue-yellow': 55,
        '--hue-lavender': 280,
        '--hue-mint': 140,
    },
    forest: {
        '--hue-bg': 160,
        '--hue-primary': 145,
        '--hue-pink': 20,
        '--hue-yellow': 62,
        '--hue-lavender': 290,
        '--hue-mint': 175,
    },
};

function applyTheme(name) {
    const theme = THEMES[name];
    if (!theme) {
        if (DEBUG) console.warn(`Theme "${name}" not found.`);
        return;
    }
    const root = document.documentElement;
    for (const [prop, value] of Object.entries(theme)) {
        root.style.setProperty(prop, String(value));
    }
}

function escHtml(str) {
    if (str == null) return '';
    return String(str).replace(
        /[&<>"']/g,
        (c) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[c]
    );
}


const ICON_GITHUB = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>`;

const STATUS_LABEL = {
    active: '公開中',
    archived: 'アーカイブ',
    wip: '開発中',
};

// tag color は index % 5 で割り当て
const tagColorMap = {};
let tagColorCounter = 0;
function getTagColor(tag) {
    if (!(tag in tagColorMap)) {
        tagColorMap[tag] = tagColorCounter++ % 5;
    }
    return tagColorMap[tag];
}

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
      class="ext-github-link" aria-label="${escHtml(ext.title)} のリポジトリ">
     ${ICON_GITHUB} GitHub
   </a>`
                : '';

            return `
<article class="ext-card fade-up" style="transition-delay:${delay}ms"
         aria-label="${escHtml(ext.title)}">
  <span class="ext-status-badge ${escHtml(status)}" aria-label="ステータス: ${escHtml(STATUS_LABEL[status] ?? status)}">
    ${escHtml(STATUS_LABEL[status] ?? status)}
  </span>
  <h2 class="ext-title">${escHtml(ext.title)}</h2>
  <p class="ext-description">${escHtml(ext.description ?? '')}</p>
  <div class="ext-tags" aria-label="タグ">${tagsHtml}</div>
  ${githubHtml ? `<div class="ext-footer">${githubHtml}</div>` : ''}
</article>`;
        })
        .join('');

    // スクロールアニメーション
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        },
        { threshold: 0.08 }
    );

    document
        .querySelectorAll('.ext-card.fade-up')
        .forEach((el) => observer.observe(el));
}

async function main() {
    applyTheme(ACTIVE_THEME);

    try {
        if (DEBUG) console.log('[1] fetch univ-crx.yaml');
        const res = await fetch('./data/univ-crx.yaml');
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
