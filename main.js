// サムネイル表示フラグ
// true  → work.thumbnail があれば画像表示、なければプレースホルダー表示
// false → サムネイル領域を非表示
const SHOW_THUMBNAILS = false;

// カラーテーマ定義
// --hue-* の値を変えるだけで全体の配色が変わる
// ACTIVE_THEME で使用テーマを選択
const THEMES = {
  // 水色・ピンク・黄色のパステル (デフォルト)
  pastel: {
    '--hue-bg':       222,
    '--hue-primary':  194,   // 水色
    '--hue-pink':     338,   // ピンク
    '--hue-yellow':    50,   // 黄色
    '--hue-lavender': 268,   // ラベンダー
    '--hue-mint':     162,   // ミント
  },
  // 深い青 × ティール
  ocean: {
    '--hue-bg':       215,
    '--hue-primary':  200,
    '--hue-pink':      20,
    '--hue-yellow':    45,
    '--hue-lavender': 240,
    '--hue-mint':     175,
  },
  // オレンジ × ローズ × 紫
  sunset: {
    '--hue-bg':       240,
    '--hue-primary':   30,
    '--hue-pink':     350,
    '--hue-yellow':    55,
    '--hue-lavender': 280,
    '--hue-mint':     140,
  },
  // グリーン × イエロー
  forest: {
    '--hue-bg':       160,
    '--hue-primary':  145,
    '--hue-pink':      20,
    '--hue-yellow':    62,
    '--hue-lavender': 290,
    '--hue-mint':     175,
  },
};

const ACTIVE_THEME = 'pastel';

function applyTheme(name) {
  const theme = THEMES[name];
  if (!theme) {
    console.warn(`Theme "${name}" not found.`);
    return;
  }
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(theme)) {
    root.style.setProperty(prop, String(value));
  }
}

// JSONC パーサー
// 文字列内外を判定するステートマシンでコメントを除去してからJSON.parse
// URL中の https:// が誤って削除されない
function parseJsonc(text) {
  let out = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    // 文字列内
    if (ch === '"') {
      out += ch;
      i++;
      while (i < len) {
        const sc = text[i];
        out += sc;
        i++;
        if (sc === '\\') {
          // エスケープ: 次の1文字もそのまま出力
          if (i < len) { out += text[i]; i++; }
        } else if (sc === '"') {
          break; // 文字列終端
        }
      }
      continue;
    }

    // 行コメント: //
    if (ch === '/' && text[i + 1] === '/') {
      while (i < len && text[i] !== '\n' && text[i] !== '\r') i++;
      continue;
    }

    // ブロックコメント: /* ... */
    if (ch === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < len && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    out += ch;
    i++;
  }

  return JSON.parse(out);
}

// タグごとに 0〜4 の色インデックスを固定で割り当て
const tagColorMap = {};
let tagColorCounter = 0;

function getTagColor(tag) {
  if (!(tag in tagColorMap)) {
    tagColorMap[tag] = tagColorCounter % 5;
    tagColorCounter++;
  }
  return tagColorMap[tag];
}

const ICONS = {
  github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>`,

  x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,

  external: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
};

function renderHero(profile) {
  document.title = `Portfolio | ${profile.name}`;

  const nameEl = document.getElementById('hero-name');
  if (nameEl) nameEl.textContent = profile.name;

  const taglineEl = document.getElementById('hero-tagline');
  if (taglineEl) taglineEl.textContent = profile.tagline ?? '';

  const linksEl = document.getElementById('hero-links');
  if (!linksEl) return;

  const buttons = [];
  if (profile.github) {
    buttons.push(`
      <a id="btn-github" href="${profile.github}" target="_blank" rel="noopener noreferrer"
         class="btn-social btn-github" role="listitem" aria-label="GitHub">
        ${ICONS.github} GitHub
      </a>`);
  }
  if (profile.x) {
    buttons.push(`
      <a id="btn-x" href="${profile.x}" target="_blank" rel="noopener noreferrer"
         class="btn-social btn-x" role="listitem" aria-label="X (Twitter)">
        ${ICONS.x} X (Twitter)
      </a>`);
  }
  linksEl.innerHTML = buttons.join('');
}

function renderOrgs(organizations, bio) {
  const bioEl = document.getElementById('bio-text');
  if (bioEl && bio) bioEl.textContent = bio;

  const grid = document.getElementById('org-grid');
  if (!grid) return;

  grid.innerHTML = organizations.map((org, i) => {
    const tag  = org.url ? 'a' : 'div';
    const href = org.url ? `href="${org.url}" target="_blank" rel="noopener noreferrer"` : '';
    return `
      <${tag} ${href} class="org-card fade-up" style="transition-delay:${i * 75}ms">
        <div class="org-name">${org.name}</div>
        ${org.role   ? `<div class="org-role">${org.role}</div>`     : ''}
        ${org.period ? `<div class="org-period">${org.period}</div>` : ''}
      </${tag}>`;
  }).join('');
}

function renderWorks(works) {
  // 全タグに色を事前割当（カード・フィルター両方で一貫した色にする）
  works.forEach(w => (w.tags ?? []).forEach(t => getTagColor(t)));

  const allTags = [...new Set(works.flatMap(w => w.tags ?? []))];
  const filterBar = document.getElementById('filter-bar');
  if (filterBar) {
    filterBar.innerHTML =
      `<button id="filter-all" class="filter-btn active" data-tag="all">すべて</button>` +
      allTags.map(tag =>
        `<button class="filter-btn" data-tag="${tag}">${tag}</button>`
      ).join('');

    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.tag;
      document.querySelectorAll('.work-card').forEach(card => {
        const cardTags = card.dataset.tags ? card.dataset.tags.split(',') : [];
        const show = selected === 'all' || cardTags.includes(selected);
        card.classList.toggle('hidden', !show);
      });

      setTimeout(observeElements, 50);
    });
  }

  const grid = document.getElementById('works-grid');
  if (!grid) return;

  grid.innerHTML = works.map((work, i) => {
    const tagsHtml = (work.tags ?? [])
      .map(tag => `<span class="tag" data-color="${getTagColor(tag)}">${tag}</span>`)
      .join('');

    const thumbnailHtml = buildThumbnail(work);
    const linksHtml     = buildWorkLinks(work);
    const tagList       = (work.tags ?? []).join(',');
    const delay         = (i % 3) * 80;

    return `
      <article class="work-card fade-up"
               data-tags="${tagList}"
               style="transition-delay:${delay}ms"
               aria-label="${work.title}">
        ${thumbnailHtml}
        <div class="work-body">
          ${work.date ? `<time class="work-date" datetime="${work.date}">${work.date}</time>` : ''}
          <h3 class="work-title">${work.title}</h3>
          <p class="work-description">${work.description ?? ''}</p>
          <div class="work-tags" aria-label="タグ">${tagsHtml}</div>
          <div class="work-links">${linksHtml}</div>
        </div>
      </article>`;
  }).join('');
}

// SHOW_THUMBNAILS が false なら空文字を返す
function buildThumbnail(work) {
  if (!SHOW_THUMBNAILS) return '';

  if (work.thumbnail) {
    return `
      <div class="work-thumbnail">
        <img src="${work.thumbnail}" alt="${work.title}" loading="lazy">
      </div>`;
  }
  return `<div class="work-thumbnail-placeholder" aria-hidden="true">◈</div>`;
}

function buildWorkLinks(work) {
  const links = [];
  if (work.url) {
    links.push(`
      <a href="${work.url}" target="_blank" rel="noopener noreferrer"
         class="work-link" aria-label="${work.title} を開く">
        ${ICONS.external} 開く</a>`);
  }
  if (work.github) {
    links.push(`
      <a href="${work.github}" target="_blank" rel="noopener noreferrer"
         class="work-link" aria-label="${work.title} のコード">
        ${ICONS.github} コード</a>`);
  }
  return links.join('');
}

function renderFooter(profile) {
  const copyEl = document.getElementById('footer-name');
  if (copyEl) copyEl.textContent = `© ${new Date().getFullYear()} ${profile.name}`;

  const linksEl = document.getElementById('footer-links');
  if (!linksEl) return;

  const footerLinks = [];
  if (profile.github) {
    footerLinks.push(`
      <a href="${profile.github}" target="_blank" rel="noopener noreferrer"
         class="footer-link" aria-label="GitHub">
        ${ICONS.github} GitHub</a>`);
  }
  if (profile.x) {
    footerLinks.push(`
      <a href="${profile.x}" target="_blank" rel="noopener noreferrer"
         class="footer-link" aria-label="X (Twitter)">
        ${ICONS.x} X</a>`);
  }
  linksEl.innerHTML = footerLinks.join('');
}

function observeElements() {
  const targets = document.querySelectorAll('.fade-up:not(.visible)');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => observer.observe(el));
}

async function main() {
  applyTheme(ACTIVE_THEME);

  try {
    console.log('[1] fetch:', './data/works.jsonc');
    const res = await fetch('./data/works.jsonc');
    console.log('[2] status:', res.status, res.ok);
    if (!res.ok) throw new Error(`HTTP ${res.status} - file not found`);

    const text = await res.text();
    console.log('[3] text (first 100):', text.slice(0, 100));

    const data = parseJsonc(text);
    console.log('[4] parsed:', Object.keys(data));

    renderHero(data.profile ?? {});
    renderOrgs(data.organizations ?? [], data.profile?.bio ?? '');
    renderWorks(data.works ?? []);
    renderFooter(data.profile ?? {});

    setTimeout(observeElements, 120);
    console.log('[5] done');

  } catch (err) {
    console.error('load error:', err);

    const nameEl = document.getElementById('hero-name');
    if (nameEl) {
      nameEl.style.cssText = '-webkit-text-fill-color: #f87171; font-size: 1rem; font-family: monospace;';
      nameEl.textContent = `Error: ${err.message}`;
    }
    const taglineEl = document.getElementById('hero-tagline');
    if (taglineEl) taglineEl.textContent = 'F12 > Console で詳細を確認';
  }
}

main();
