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

    const order = ['home', 'games', 'official', 'latest', 'news', 'updates', 'accounts'];
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

// --- بطاقة لعبة (تُستخدم لقسمي التعريبات والتعريبات الرسمية ولقسم أحدث الإضافات) ---
function buildGameCard(game, sectionFolder) {
    const card = document.createElement('a');
    card.className = 'game-card game-card-link';
    card.href = `${sectionFolder}/${game.slug}.html`;

    let imagesHtml = '';
    (game.images || []).forEach((img, index) => {
        imagesHtml += `<img src="image/${img}" class="slider-img ${index === 0 ? 'active' : ''}" data-idx="${index}" alt="${game.title} - صورة ${index + 1}">`;
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
        <div class="card-meta-row">
            ${game.category ? `<span class="meta-chip">${game.category}</span>` : ''}
            <span class="meta-chip">${game.platform || 'Android'}</span>
        </div>
        <div class="card-footer">
            <div class="game-info-small">${game.version} | ${game.size}</div>
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
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    const start = (page - 1) * itemsPerPage;
    const gamesToShow = officialActiveList.slice(start, start + itemsPerPage);
    gamesToShow.forEach(game => grid.appendChild(buildGameCard(game, 'official')));

    const pageInfo = document.getElementById('officialPageInfo');
    if (pageInfo) pageInfo.innerText = `${officialCurrentPage} / ${Math.max(officialTotalPages(), 1)}`;
    if (paginationBox) paginationBox.style.display = officialTotalPages() > 1 ? 'flex' : 'none';
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

// --- قسم "أحدث الإضافات": يجمع من التعريبات والتعريبات الرسمية مرتّبة بالأحدث ---
function renderLatest() {
    const grid = document.getElementById('latestGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const combined = [
        ...visible(gamesData).map(g => ({ game: g, folder: 'games' })),
        ...visible(officialGamesData).map(g => ({ game: g, folder: 'official' }))
    ].sort((a, b) => (b.game.createdAt || 0) - (a.game.createdAt || 0)).slice(0, 12);

    const emptyMsg = document.getElementById('latestEmptyMsg');
    if (!combined.length) { if (emptyMsg) emptyMsg.style.display = 'block'; return; }
    if (emptyMsg) emptyMsg.style.display = 'none';
    combined.forEach(({ game, folder }) => grid.appendChild(buildGameCard(game, folder)));
}

// --- قسم "التحديثات": نفس الفكرة لكن مرتّبة بآخر تعديل ---
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

// --- فهرس الموقع الزاحف في الأسفل (روابط حقيقية لكل صفحة) ---
function renderSiteIndex() {
    const list = document.getElementById('siteIndexList');
    if (!list) return;
    list.innerHTML = visible(gamesData).map(game =>
        `<li><a href="games/${game.slug}.html">تعريب ${game.title}</a></li>`
    ).join('');
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
        const map = { instagram: 'socialInstagram', youtube: 'socialYoutube', telegram: 'socialTelegram', tiktok: 'socialTiktok' };
        Object.keys(map).forEach(key => {
            if (config.social[key]) {
                const el = document.getElementById(map[key]);
                if (el) el.href = config.social[key];
            }
        });
    }
}

// 👇👇 تهيئة الموقع 👇👇
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
    renderLatest();
    renderUpdates();
    renderNews();
    renderSiteIndex();

    document.querySelectorAll('.container').forEach(el => el.style.display = 'none');
    const initialHash = window.location.hash.replace('#', '');
    const validSections = ['home', 'accounts', 'official', 'latest', 'news', 'updates'];
    if (validSections.includes(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('games');
    }
}

initSite();
