// デバッグ出力フラグ
// true  → console.log / warn / error をすべて出力
// false → コンソール出力を抑制
const DEBUG = true;

// サムネイル表示フラグ
// true  → work.thumbnail があれば画像表示、なければプレースホルダー表示
// false → サムネイル領域を非表示
const SHOW_THUMBNAILS = true;



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
         class="btn-social btn-x" role="listitem" aria-label="X">
        ${ICONS.x} X
      </a>`);
    }
    linksEl.innerHTML = buttons.join('');
}

function renderOrgs(organizations, bio) {
    const bioEl = document.getElementById('bio-text');
    if (bioEl && bio) bioEl.textContent = bio;

    const grid = document.getElementById('org-grid');
    if (!grid) return;

    grid.innerHTML = organizations
        .map((org, i) => {
            const tag = org.url ? 'a' : 'div';
            const href = org.url
                ? `href="${org.url}" target="_blank" rel="noopener noreferrer"`
                : '';
            return `
      <${tag} ${href} class="org-card fade-up" style="transition-delay:${i * 75}ms">
        <div class="org-name">${org.name}</div>
        ${org.role ? `<div class="org-role">${org.role}</div>` : ''}
        ${org.period ? `<div class="org-period">${org.period}</div>` : ''}
      </${tag}>`;
        })
        .join('');
}

function renderWorks(works) {
    // 全タグに色を事前割当（カード・フィルター両方で一貫した色にする）
    works.forEach((w) => (w.tags ?? []).forEach((t) => getTagColor(t)));

    const allTags = [...new Set(works.flatMap((w) => w.tags ?? []))];
    const filterBar = document.getElementById('filter-bar');
    if (filterBar) {
        filterBar.innerHTML =
            `<button id="filter-all" class="filter-btn active" data-tag="all">すべて</button>` +
            allTags
                .map(
                    (tag) =>
                        `<button class="filter-btn" data-tag="${tag}">${tag}</button>`
                )
                .join('');

        filterBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            document
                .querySelectorAll('.filter-btn')
                .forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const selected = btn.dataset.tag;
            document.querySelectorAll('.work-card').forEach((card) => {
                const cardTags = card.dataset.tags
                    ? card.dataset.tags.split(',')
                    : [];
                const show = selected === 'all' || cardTags.includes(selected);
                card.classList.toggle('hidden', !show);
            });

            setTimeout(observeElements, 50);
        });
    }

    const grid = document.getElementById('works-grid');
    if (!grid) return;

    grid.innerHTML = works
        .map((work, i) => {
            const tagsHtml = (work.tags ?? [])
                .map(
                    (tag) =>
                        `<span class="tag" data-color="${getTagColor(tag)}">${tag}</span>`
                )
                .join('');

            const thumbnailHtml = buildThumbnail(work);
            const linksHtml = buildWorkLinks(work);
            const tagList = (work.tags ?? []).join(',');
            const delay = Math.min(i * 80, 400);

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
        })
        .join('');
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

    // 詳細ページへのリンク (最優先で先頭に表示)
    if (work.detailUrl) {
        links.push(`
      <a href="${escHtml(work.detailUrl)}"
         class="work-link work-link--detail" aria-label="${escHtml(work.title)} の詳細を見る">
        ${ICONS.external} 詳しく見る</a>`);
    }
    if (work.url) {
        links.push(`
      <a href="${escHtml(work.url)}" target="_blank" rel="noopener noreferrer"
         class="work-link" aria-label="${escHtml(work.title)} を開く">
        ${ICONS.external} Webページ</a>`);
    }
    if (work.github) {
        links.push(`
      <a href="${escHtml(work.github)}" target="_blank" rel="noopener noreferrer"
         class="work-link" aria-label="${escHtml(work.title)} のコード">
        ${ICONS.github} GitHub</a>`);
    }
    return links.join('');
}

function renderFooter(profile) {
    // const copyEl = document.getElementById('footer-name');
    // if (copyEl) copyEl.textContent = `© ${new Date().getFullYear()} ${profile.name}`;

    const linksEl = document.getElementById('footer-links');
    if (!linksEl) return;

    const footerLinks = [];
    if (profile.github) {
        footerLinks.push(`
      <a href="${profile.github}" target="_blank" rel="noopener noreferrer"
         class="footer-link" aria-label="GitHub">
        ${ICONS.github}</a>`);
    }
    if (profile.x) {
        footerLinks.push(`
      <a href="${profile.x}" target="_blank" rel="noopener noreferrer"
         class="footer-link" aria-label="X">
        ${ICONS.x}</a>`);
    }
    linksEl.innerHTML = footerLinks.join('');
}



async function main() {
    applyTheme(ACTIVE_THEME);

    try {
        if (DEBUG) console.log('[1] fetch:', './data/works.yaml');
        const res = await fetch('./data/works.yaml');
        if (DEBUG) console.log('[2] status:', res.status, res.ok);
        if (!res.ok) throw new Error(`HTTP ${res.status} - file not found`);

        const text = await res.text();
        if (DEBUG) console.log('[3] text (first 100):', text.slice(0, 100));

        const data = jsyaml.load(text);
        if (DEBUG) console.log('[4] parsed:', Object.keys(data));

        renderHero(data.profile ?? {});
        renderOrgs(data.organizations ?? [], data.profile?.bio ?? '');
        renderWorks(data.works ?? []);
        renderFooter(data.profile ?? {});

        setTimeout(observeElements, 120);
        if (DEBUG) console.log('[5] done');
    } catch (err) {
        if (DEBUG) console.error('load error:', err);

        const nameEl = document.getElementById('hero-name');
        if (nameEl) {
            nameEl.style.cssText =
                '-webkit-text-fill-color: #f87171; font-size: 1rem; font-family: monospace;';
            nameEl.textContent = `Error: ${err.message}`;
        }
        const taglineEl = document.getElementById('hero-tagline');
        if (taglineEl) taglineEl.textContent = 'F12 > Console で詳細を確認';
    }
}

main();
