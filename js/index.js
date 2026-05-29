import jsyaml from 'js-yaml';
import { ACTIVE_THEME, applyTheme, escHtml, getTagColor, ICONS, observeElements } from './common.js';

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
    
    // スクロールヒント: organizationsセクション見え始めたら非表示
    const setupScrollHintObserver = () => {
        const scrollHint = document.querySelector('.hero-scroll-hint');
        const organizationsSection = document.getElementById('organizations');
        
        if (!scrollHint || !organizationsSection) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // organizationsセクションが見え始めたら non-pointer-events & opacity 0
                    scrollHint.style.pointerEvents = 'none';
                    scrollHint.style.opacity = '0';
                } else {
                    // 画面内なら表示
                    scrollHint.style.pointerEvents = 'auto';
                    scrollHint.style.opacity = '1';
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(organizationsSection);
    };
    
    // CSS animation の完了を待ってから observer を初期化
    const scrollHint = document.querySelector('.hero-scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('animationend', setupScrollHintObserver, { once: true });
    } else {
        // フォールバック：animationend が発火しない場合
        setTimeout(setupScrollHintObserver, 2500);
    }
}

function renderIntro(profile) {
    const introEl = document.getElementById('intro-text');
    if (introEl && profile?.about) {
        introEl.textContent = profile.about;
    }
}

function renderOrgs(organizations) {
    const grid = document.getElementById('org-grid');
    if (!grid) return;

    grid.innerHTML = organizations
        .map((org, i) => {
            const hasModal = !!org.projects && org.projects.length > 0;
            const modalAttr = hasModal
                ? `data-org-index='${i}'`
                : '';
            const modalClass = hasModal ? 'org-card-modal' : '';
            const cardRole = hasModal ? 'role="button" tabindex="0"' : '';
            const externalButton = org.url
                ? `<a href="${escHtml(org.url)}" target="_blank" rel="noopener noreferrer" class="modal-btn org-url-btn">
                ${ICONS.external} 公式HP
              </a>`
                : '';
            const footerHtml = `
        ${org.role ? `<div class="org-role">${org.role}</div>` : ''}
        ${org.period ? `<div class="org-period">${org.period}</div>` : ''}
        ${externalButton}`;

            return `
      <div class="org-card fade-up ${modalClass}" style="transition-delay:${i * 75}ms" ${cardRole} ${modalAttr}>
        <div class="org-name">${org.name}</div>
        ${footerHtml.trim() ? `<div class="org-card-footer">${footerHtml}</div>` : ''}
      </div>`;
        })
        .join('');

    // Attach event listeners for modals
    grid.querySelectorAll('.org-card-modal').forEach((card) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(card.dataset.orgIndex, 10);
            const orgData = organizations[index];
            openOrgModal(orgData);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const index = parseInt(card.dataset.orgIndex, 10);
                const orgData = organizations[index];
                openOrgModal(orgData);
            }
        });
    });
}

function openOrgModal(org) {
    const modal = document.getElementById('org-modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = org.name;

    let contentHtml = '';
    if (org.projects && org.projects.length > 0) {
        contentHtml += `<div class="modal-project-list">`;
        org.projects.forEach((p) => {
            contentHtml += `
            <div class="modal-project">
                <div class="modal-project-name">${escHtml(p.name)}</div>
                ${p.role ? `<div class="modal-project-role">${escHtml(p.role)}</div>` : ''}
            </div>`;
        });
        contentHtml += `</div>`;
    }
    document.getElementById('modal-content').innerHTML = contentHtml;

    let footerHtml = '';
    if (org.url) {
        footerHtml = `
            <a href="${escHtml(org.url)}" target="_blank" rel="noopener noreferrer" class="modal-btn">
                ${ICONS.external} 公式HP
            </a>
        `;
    }
    document.getElementById('modal-footer').innerHTML = footerHtml;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeOrgModal() {
    const modal = document.getElementById('org-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function setupModalEvents() {
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');

    if (modalClose) modalClose.addEventListener('click', closeOrgModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeOrgModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeOrgModal();
        }
    });
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
    const copyEl = document.getElementById('footer-name');
    if (copyEl) copyEl.textContent = `© ${new Date().getFullYear()} ${profile.name}`;

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
    setupModalEvents();

    try {
        if (DEBUG) console.log('[1] fetch:', './data/works.yaml');
        const res = await fetch('/data/works.yaml');
        if (DEBUG) console.log('[2] status:', res.status, res.ok);
        if (!res.ok) throw new Error(`HTTP ${res.status} - file not found`);

        const text = await res.text();
        if (DEBUG) console.log('[3] text (first 100):', text.slice(0, 100));

        const data = jsyaml.load(text);
        if (DEBUG) console.log('[4] parsed:', Object.keys(data));

        renderHero(data.profile ?? {});
        renderIntro(data.profile ?? {});
        renderOrgs(data.organizations ?? []);
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
