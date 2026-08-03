// =====================================================================
// كل البيانات تُقرأ وقت التحميل من games.json / official.json / news.json
// (بدل ما تكون مكتوبة داخل ملف .js ثابت) — عشان تطبيق الإدارة (AndroidIDE)
// يقدر يعدلها مباشرة عن طريق GitHub API ويظهر التغيير فوراً بدون رفع الموقع يدوياً.
// =====================================================================
let gamesData = [];
let officialGamesData = [];
let newsData = [];

// عناصر مخفية (isHidden) ما تظهر في أي قائمة أو مخطط SEO
const visible = (list) => list.filter(g => !g.isHidden);

// 1. SEO Schema (ItemList) — لكل قسم
function buildItemListSchema(list, section) {
    if (!list.length) return;
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": list.map((game, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://thesoim.github.io/w/${section}/${game.slug}.html`,
            "item": {
                "@type": "SoftwareApplication",
                "name": game.title,
                "operatingSystem": "Android",
                "applicationCategory": "Game",
                "description": game.story,
                "softwareVersion": game.version,
                "keywords": game.keywords || "Android Game, Translation",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            }
        }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
}

// Pagination Settings (تعريبات)
const itemsPerPage = 5;
let currentPage = 1;
let activeList = [];
let activeTag = '';
const totalPages = () => Math.ceil(activeList.length / itemsPerPage);

// Pagination (تعريبات رسمية)
let officialCurrentPage = 1;
let officialActiveList = [];
let officialActiveTag = '';
const officialTotalPages = () => Math.ceil(officialActiveList.length / itemsPerPage);

// --- شارة الحالة: "جديد" / "تحديث" / "قديم" — تختفي تلقائياً بعد statusUntil لو محدد ---
function statusBadgeHtml(game) {
    const status = game.status;
    if (!status) return '';
    if (game.statusUntil && Date.now() > game.statusUntil) return '';
    const labels = { new: 'جديد', updated: 'تحديث', old: 'قديم' };
    return `<span class="status-badge status-${status}">${labels[status] || status}</span>`;
}

function tagRowHtml(tags) {
    if (!tags || !tags.length) return '';
    return `<div class="tag-row">${tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}</div>`;
}

// جمع كل الوسوم الفريدة من قائمة ألعاب (لصف الفلترة)
function uniqueTags(list) {
    const set = new Set();
    list.forEach(g => (g.tags || []).forEach(t => set.add(t)));
    return Array.from(set);
}

// Navigation Function with Animations
function showSection(sectionId) {
    const containers = document.querySelectorAll('.container');
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // فهرس الموقع الزاحف أسفل الصفحة انحذف (كان يكرر نفس أسماء الألعاب الظاهرة أصلاً بالأعلى)

    const order = ['home', 'games', 'official', 'news', 'updates', 'accounts'];
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const idx = order.indexOf(sectionId);
    const navBtns = document.querySelectorAll('.nav-btn');
    if (idx >= 0 && navBtns[idx]) navBtns[idx].classList.add('active');

    let currentActive = null;
    containers.forEach(el => {
        if (el.style.display === 'block' || el.classList.contains('active-section')) {
            currentActive = el;
        }
    });

    if (currentActive && currentActive !== targetSection) {
        currentActive.classList.remove('fade-in-blur');
        currentActive.classList.add('fade-out-blur');
        setTimeout(() => {
            currentActive.style.display = 'none';
            currentActive.classList.remove('fade-out-blur');
            currentActive.classList.remove('active-section');
            targetSection.style.display = 'block';
            targetSection.classList.add('fade-in-blur');
            targetSection.classList.add('active-section');
        }, 350);
    } else {
        containers.forEach(el => el.style.display = 'none');
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in-blur');
        targetSection.classList.add('active-section');
    }

    // كل قسم يصير له رابط حقيقي خاص فيه (يقدر ينشارك، ويبقى نفسه بعد تحديث الصفحة)
    if (window.location.hash.replace('#', '') !== sectionId) {
        history.replaceState(null, '', '#' + sectionId);
    }
}

// لو حد غيّر الـhash بدون إعادة تحميل كامل (رابط داخلي، أو زر رجوع بالمتصفح)
window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (h && document.getElementById(h)) showSection(h);
});

// --- بطاقة لعبة (تُستخدم لقسمي التعريبات والتعريبات الرسمية وقسم التحديثات) ---
function buildGameCard(game, sectionFolder) {
    const card = document.createElement('a');
    card.className = 'game-card game-card-link';
    card.href = `${sectionFolder}/${game.slug}.html`;

    let imagesHtml = '';
    (game.images || []).forEach((img, index) => {
        const src = /^https?:\/\//.test(img) ? img : `image/${img}`;
        imagesHtml += `<img src="${src}" class="slider-img ${index === 0 ? 'active' : ''}" data-idx="${index}" alt="${game.title} - صورة ${index + 1}">`;
    });

    card.innerHTML = `
        ${statusBadgeHtml(game)}
        <div class="slider-container">
            ${imagesHtml}
            <div class="slider-nav">
                <div class="arrow" data-dir="-1">&#10094;</div>
                <div class="arrow" data-dir="1">&#10095;</div>
            </div>
        </div>
        <div class="game-title">${game.title}</div>
        <div class="card-footer">
            <div class="game-info-small">${game.version} | ${game.size}</div>
            <div class="game-platform-tag">${game.platform || 'Android'}</div>
            ${(game.categories && game.categories.length) ? `<div class="game-category-tag">${game.categories[0]}</div>` : ''}
        </div>
    `;

    card.querySelectorAll('.arrow').forEach(arrowEl => {
        arrowEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            moveSlide(arrowEl, parseInt(arrowEl.dataset.dir, 10));
        });
    });

    return card;
}

function moveSlide(btn, direction) {
    const container = btn.parentElement.parentElement;
    const images = container.querySelectorAll('.slider-img');
    let activeIndex = 0;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) { activeIndex = index; img.classList.remove('active'); }
    });
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    images[newIndex].classList.add('active');
}

// --- قسم "التعريبات" ---
function renderGames(page) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const gamesToShow = activeList.slice(start, start + itemsPerPage);
    gamesToShow.forEach(game => grid.appendChild(buildGameCard(game, 'games')));
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.innerText = `${currentPage} / ${Math.max(totalPages(), 1)}`;
    const gamesCount = document.getElementById('gamesCount');
    if (gamesCount) gamesCount.innerText = activeList.length;
    renderTagFilter('gamesTagFilter', uniqueTags(visible(gamesData)), activeTag, (t) => { activeTag = t; filterGames(document.getElementById('gameSearchInput')?.value || ''); });
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages()) {
        currentPage = newPage;
        renderGames(currentPage);
        window.scrollTo(0, 0);
    }
}

function filterGames(term) {
    const query = term.trim().toLowerCase();
    const paginationBox = document.getElementById('paginationBox');
    const noResultsMsg = document.getElementById('noResultsMsg');
    let base = visible(gamesData);
    if (activeTag) base = base.filter(g => (g.tags || []).includes(activeTag));
    activeList = query === '' ? base : base.filter(game => `${game.title} ${game.keywords || ''}`.toLowerCase().includes(query));
    currentPage = 1;

    if (activeList.length === 0) {
        document.getElementById('gamesGrid').innerHTML = '';
        if (noResultsMsg) noResultsMsg.style.display = 'block';
        if (paginationBox) paginationBox.style.display = 'none';
        return;
    }
    if (noResultsMsg) noResultsMsg.style.display = 'none';
    if (paginationBox) paginationBox.style.display = totalPages() > 1 ? 'flex' : 'none';
    renderGames(currentPage);
}

// --- قسم "تعريبات رسمية" ---
function renderOfficial(page) {
    const grid = document.getElementById('officialGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const emptyMsg = document.getElementById('officialEmptyMsg');
    const paginationBox = document.getElementById('officialPaginationBox');

    if (!visible(officialGamesData).length) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (paginationBox) paginationBox.style.display = 'none';
        const officialCount = document.getElementById('officialCount');
        if (officialCount) officialCount.innerText = 0;
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    const start = (page - 1) * itemsPerPage;
    const gamesToShow = officialActiveList.slice(start, start + itemsPerPage);
    gamesToShow.forEach(game => grid.appendChild(buildGameCard(game, 'official')));

    const pageInfo = document.getElementById('officialPageInfo');
    if (pageInfo) pageInfo.innerText = `${officialCurrentPage} / ${Math.max(officialTotalPages(), 1)}`;
    if (paginationBox) paginationBox.style.display = officialTotalPages() > 1 ? 'flex' : 'none';
    const officialCount = document.getElementById('officialCount');
    if (officialCount) officialCount.innerText = officialActiveList.length;
    renderTagFilter('officialTagFilter', uniqueTags(visible(officialGamesData)), officialActiveTag, (t) => { officialActiveTag = t; filterOfficial(document.getElementById('officialSearchInput')?.value || ''); });
}

function changeOfficialPage(direction) {
    const newPage = officialCurrentPage + direction;
    if (newPage >= 1 && newPage <= officialTotalPages()) {
        officialCurrentPage = newPage;
        renderOfficial(officialCurrentPage);
        window.scrollTo(0, 0);
    }
}

function filterOfficial(term) {
    const query = term.trim().toLowerCase();
    const noResultsMsg = document.getElementById('officialNoResultsMsg');
    let base = visible(officialGamesData);
    if (officialActiveTag) base = base.filter(g => (g.tags || []).includes(officialActiveTag));
    officialActiveList = query === '' ? base : base.filter(game => `${game.title} ${game.keywords || ''}`.toLowerCase().includes(query));
    officialCurrentPage = 1;

    if (officialActiveList.length === 0) {
        document.getElementById('officialGrid').innerHTML = '';
        if (noResultsMsg) noResultsMsg.style.display = 'block';
        return;
    }
    if (noResultsMsg) noResultsMsg.style.display = 'none';
    renderOfficial(officialCurrentPage);
}

// --- صف فلترة الوسوم (يُستخدم لقسمي التعريبات والتعريبات الرسمية) ---
function renderTagFilter(containerId, tags, active, onSelect) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!tags.length) { el.innerHTML = ''; return; }
    el.innerHTML = `<span class="tag-chip tag-chip-clickable ${active === '' ? 'tag-chip-active' : ''}" data-tag="">الكل</span>` +
        tags.map(t => `<span class="tag-chip tag-chip-clickable ${active === t ? 'tag-chip-active' : ''}" data-tag="${t}">${t}</span>`).join('');
    el.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => onSelect(chip.dataset.tag));
    });
}

// --- قسم "التحديثات": يجمع من التعريبات والتعريبات الرسمية مرتّبة بآخر تعديل ---
function renderUpdates() {
    const grid = document.getElementById('updatesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const combined = [
        ...visible(gamesData).map(g => ({ game: g, folder: 'games' })),
        ...visible(officialGamesData).map(g => ({ game: g, folder: 'official' }))
    ].filter(x => (x.game.updatedAt || 0) > (x.game.createdAt || 0) || x.game.status === 'updated')
     .sort((a, b) => (b.game.updatedAt || 0) - (a.game.updatedAt || 0)).slice(0, 12);

    const emptyMsg = document.getElementById('updatesEmptyMsg');
    if (!combined.length) { if (emptyMsg) emptyMsg.style.display = 'block'; return; }
    if (emptyMsg) emptyMsg.style.display = 'none';
    combined.forEach(({ game, folder }) => grid.appendChild(buildGameCard(game, folder)));
}

// --- قسم "الأخبار والإعلانات" ---
function renderNews() {
    const list = document.getElementById('newsList');
    if (!list) return;
    const emptyMsg = document.getElementById('newsEmptyMsg');
    if (!newsData.length) { if (emptyMsg) emptyMsg.style.display = 'block'; list.innerHTML = ''; return; }
    if (emptyMsg) emptyMsg.style.display = 'none';
    const sorted = [...newsData].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    list.innerHTML = sorted.map(post => {
        const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        return `<div class="news-card"><h3>${post.title}</h3><span class="news-date">${date}</span><p>${post.body}</p></div>`;
    }).join('');
}

// --- (فهرس الموقع الزاحف أسفل الصفحة انحذف بناءً على طلب: كان يكرر أسماء الألعاب فقط بدون فائدة إضافية) ---

// --- أيقونات SVG جاهزة لأشهر منصات التواصل، تُختار تلقائياً حسب اسم المنصة ---
const SOCIAL_ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-20 8 6 2 2 6 3-4 6 4z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v11a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3a5 5 0 0 0 5 5"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16M20 4 4 20"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16M20 4 4 20"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="11" rx="5"/><circle cx="9" cy="12.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.5-4.5A8 8 0 1 1 8.5 19.5z"/></svg>',
    snapchat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3 0 5 2 5 5v3c0 2 2 3 2 3s-1 2-3 2c0 0 0 3-4 3s-4-3-4-3c-2 0-3-2-3-2s2-1 2-3V7c0-3 2-5 5-5z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4-1 4-4.5 0-1-.4-2-1-2.7.1-.3.4-1.4-.1-2.8 0 0-.9-.3-3 1a10 10 0 0 0-5 0c-2.1-1.3-3-1-3-1-.5 1.4-.2 2.5-.1 2.8A4 4 0 0 0 5 8.5c0 3.5 2 4.3 4 4.5-.4.4-.5.8-.5 1.5V19"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'
};

function matchSocialIcon(name) {
    const key = (name || '').trim().toLowerCase();
    if (SOCIAL_ICONS[key]) return SOCIAL_ICONS[key];
    for (const k of Object.keys(SOCIAL_ICONS)) {
        if (key.includes(k)) return SOCIAL_ICONS[k];
    }
    return SOCIAL_ICONS.link;
}

function renderSocialLinks(links) {
    const grid = document.getElementById('socialGrid');
    if (!grid || !links || !links.length) return;
    grid.innerHTML = links.map(link => {
        const icon = matchSocialIcon(link.name);
        const label = link.name ? link.name.charAt(0).toUpperCase() + link.name.slice(1) : 'رابط';
        return `<a href="${link.url}" class="social-item" target="_blank" rel="noopener"><span class="social-icon">${icon}</span><h3>${label}</h3></a>`;
    }).join('');
}

// --- تطبيق إعدادات الموقع (الاسم/الوصف/روابط التواصل) من site-config.json ---
function applySiteConfig(config) {
    if (!config) return;
    if (config.siteName) {
        const el = document.getElementById('homeSiteName');
        if (el) el.textContent = config.siteName;
        document.title = config.siteName;
    }
    if (config.intro) {
        const el = document.getElementById('homeIntroText');
        if (el) el.innerHTML = config.intro;
    }
    if (config.social) {
        // يدعم الشكل الجديد (مصفوفة {name,url}) والشكل القديم (كائن بمفاتيح ثابتة) لو ما تحدث بعد
        const links = Array.isArray(config.social)
            ? config.social
            : Object.keys(config.social).map(key => ({ name: key, url: config.social[key] }));
        renderSocialLinks(links);
    }
}

// === تهيئة الموقع ===
async function initSite() {
    try {
        const [gamesRes, officialRes, newsRes, configRes] = await Promise.all([
            fetch('games.json', { cache: 'no-store' }),
            fetch('official.json', { cache: 'no-store' }),
            fetch('news.json', { cache: 'no-store' }),
            fetch('site-config.json', { cache: 'no-store' })
        ]);
        gamesData = await gamesRes.json();
        officialGamesData = officialRes.ok ? await officialRes.json() : [];
        newsData = newsRes.ok ? await newsRes.json() : [];
        if (configRes.ok) applySiteConfig(await configRes.json());
    } catch (err) {
        console.error('تعذر تحميل بيانات الموقع:', err);
        gamesData = []; officialGamesData = []; newsData = [];
    }

    activeList = visible(gamesData);
    officialActiveList = visible(officialGamesData);

    buildItemListSchema(visible(gamesData), 'games');
    buildItemListSchema(visible(officialGamesData), 'official');

    renderGames(currentPage);
    renderOfficial(officialCurrentPage);
    renderUpdates();
    renderNews();

    document.querySelectorAll('.container').forEach(el => el.style.display = 'none');
    const initialHash = window.location.hash.replace('#', '');
    const validSections = ['home', 'accounts', 'official', 'news', 'updates'];
    if (validSections.includes(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('games');
    }

    setupNotifications();
}

// =====================================================================
// إشعارات المحتوى الجديد
// ملاحظة مهمة: هذا إشعار يعمل بمتصفح الجهاز طالما المتصفح مفتوح (ولو بالخلفية)،
// وليس إشعار Push حقيقي يوصل والموقع مسكّر تماماً — هذا يحتاج خدمة Push حقيقية
// (مثل Firebase Cloud Messaging) مع service worker وخادم يرسلها، لأن GitHub Pages
// موقع ثابت بدون سيرفر خاص. الجزء ده ممكن نضيفه بمرحلة ثانية لو تحب.
// =====================================================================
function setupNotifications() {
    if (!('Notification' in window)) return;

    const banner = document.getElementById('notifyBanner');
    const enableBtn = document.getElementById('notifyEnableBtn');
    const dismissBtn = document.getElementById('notifyDismissBtn');
    if (!banner) return;

    const DAY_MS = 24 * 60 * 60 * 1000;
    const lastPromptAt = parseInt(localStorage.getItem('soim-notify-last-prompt') || '0', 10);
    const shouldPrompt = Notification.permission === 'default' && (Date.now() - lastPromptAt > DAY_MS);

    if (shouldPrompt) {
        banner.classList.add('show');
        localStorage.setItem('soim-notify-last-prompt', String(Date.now()));
    }

    if (enableBtn) {
        enableBtn.addEventListener('click', () => {
            Notification.requestPermission().then(() => {
                banner.classList.remove('show');
                if (Notification.permission === 'granted') checkForNewContent();
            });
        });
    }
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            // مجرد إخفاء لهذه الزيارة — بكرة لو لسا ما وافق، التذكير يرجع يظهر مرة وحدة بس
            banner.classList.remove('show');
        });
    }

    if (Notification.permission === 'granted') {
        checkForNewContent();
        // فحص دوري كل 4 دقائق طول ما الموقع مفتوح عند المستخدم (تبويب نشط أو خلفية)
        setInterval(checkForNewContent, 4 * 60 * 1000);
        // فحص فوري كل ما يرجع المستخدم لتبويب الموقع بعد ما كان بعيد عنه
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') checkForNewContent();
        });
    }
}

async function checkForNewContent() {
    let games = gamesData, official = officialGamesData, news = newsData;
    // تحديث خفيف للبيانات من السيرفر (بدون ما نعيد رسم كل الواجهة) عشان الفحص يكون على أحدث نسخة فعلاً
    try {
        const [gRes, oRes, nRes] = await Promise.all([
            fetch('games.json', { cache: 'no-store' }),
            fetch('official.json', { cache: 'no-store' }),
            fetch('news.json', { cache: 'no-store' })
        ]);
        if (gRes.ok) games = await gRes.json();
        if (oRes.ok) official = await oRes.json();
        if (nRes.ok) news = await nRes.json();
    } catch (e) { /* لو فشل التحديث، نكمل بالبيانات المحمّلة أصلاً بدون ما نوقف الفحص */ }

    const combined = [
        ...games.map(g => ({ title: g.title, createdAt: g.createdAt || 0 })),
        ...official.map(g => ({ title: g.title, createdAt: g.createdAt || 0 })),
        ...news.map(n => ({ title: n.title, createdAt: n.createdAt || 0 }))
    ];
    if (!combined.length) return;

    const latest = combined.reduce((a, b) => (b.createdAt > a.createdAt ? b : a));
    const lastSeen = parseInt(localStorage.getItem('soim-last-seen-content') || '0', 10);

    if (latest.createdAt > lastSeen) {
        if (lastSeen > 0) { // ما نبعث إشعار أول مرة يفتح الموقع فيها الشخص
            try {
                new Notification('تعريبات ذا سويم', {
                    body: `في جديد: ${latest.title}`,
                    icon: 'image/thesoim.png'
                });
            } catch (e) { /* بعض المتصفحات تمنع الإشعارات بدون تفاعل مباشر من المستخدم */ }
        }
        localStorage.setItem('soim-last-seen-content', String(latest.createdAt));
    }
}

initSite();
