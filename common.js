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

const ACTIVE_THEME = 'sunset';

function applyTheme(name) {
    const theme = THEMES[name];
    if (!theme) return;
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

function observeElements() {
    const targets = document.querySelectorAll('.fade-up:not(.visible)');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08 }
    );

    targets.forEach((el) => observer.observe(el));
}
