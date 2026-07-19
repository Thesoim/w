// 1. SEO Schema (ItemList of all translated games)
function generateGameSchema() {
    if (typeof gamesData === 'undefined') return;
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": gamesData.map((game, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://thesoim.github.io/w/games/${game.slug}.html`,
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
generateGameSchema();

// Pagination Settings
const itemsPerPage = 5;
let currentPage = 1;
let activeList = gamesData; // switches to filtered results while searching
const totalPages = () => Math.ceil(activeList.length / itemsPerPage);

// Navigation Function with Animations
function showSection(sectionId) {
    const containers = document.querySelectorAll('.container');
    const targetSection = document.getElementById(sectionId);

    // Update Navbar Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (sectionId === 'home') document.querySelectorAll('.nav-btn')[0].classList.add('active');
    if (sectionId === 'games') document.querySelectorAll('.nav-btn')[1].classList.add('active');
    if (sectionId === 'accounts') document.querySelectorAll('.nav-btn')[2].classList.add('active');

    // Header Logic (Logo)
    const header = document.querySelector('header');
    if (header) {
        if (sectionId === 'games') {
            header.style.display = 'flex';
            setTimeout(() => header.style.opacity = '1', 50);
        } else {
            header.style.opacity = '0';
            setTimeout(() => header.style.display = 'none', 300);
        }
    }

    // Section Transition Logic
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
}

// Render Games Card Structure — every card links to its own SEO page
function renderGames(page) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const gamesToShow = activeList.slice(start, end);

    gamesToShow.forEach(game => {
        const card = document.createElement('a');
        card.className = 'game-card game-card-link';
        card.href = `games/${game.slug}.html`;

        let imagesHtml = '';
        game.images.forEach((img, index) => {
            imagesHtml += `<img src="${img}" class="slider-img ${index === 0 ? 'active' : ''}" data-idx="${index}" alt="${game.title} - صورة ${index + 1}">`;
        });

        card.innerHTML = `
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
            </div>
        `;

        // Arrows change the preview image without navigating to the game page
        card.querySelectorAll('.arrow').forEach(arrowEl => {
            arrowEl.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                moveSlide(arrowEl, parseInt(arrowEl.dataset.dir, 10));
            });
        });

        grid.appendChild(card);
    });

    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.innerText = `${currentPage} / ${Math.max(totalPages(), 1)}`;
}

function moveSlide(btn, direction) {
    const container = btn.parentElement.parentElement;
    const images = container.querySelectorAll('.slider-img');
    let activeIndex = 0;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            activeIndex = index;
            img.classList.remove('active');
        }
    });
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    images[newIndex].classList.add('active');
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages()) {
        currentPage = newPage;
        renderGames(currentPage);
        window.scrollTo(0, 0);
    }
}

// --- Search: filters by title and keywords ---
function filterGames(term) {
    const query = term.trim().toLowerCase();
    const paginationBox = document.getElementById('paginationBox');
    const noResultsMsg = document.getElementById('noResultsMsg');

    if (query === '') {
        activeList = gamesData;
    } else {
        activeList = gamesData.filter(game => {
            const haystack = `${game.title} ${game.keywords || ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }

    currentPage = 1;

    if (activeList.length === 0) {
        document.getElementById('gamesGrid').innerHTML = '';
        if (noResultsMsg) noResultsMsg.style.display = 'block';
        if (paginationBox) paginationBox.style.display = 'none';
        return;
    }

    if (noResultsMsg) noResultsMsg.style.display = 'none';
    if (paginationBox) paginationBox.style.display = (query === '') ? 'flex' : (totalPages() > 1 ? 'flex' : 'none');
    renderGames(currentPage);
}

// --- Build the crawlable site index footer with real links to every game page ---
function renderSiteIndex() {
    const list = document.getElementById('siteIndexList');
    if (!list || typeof gamesData === 'undefined') return;
    list.innerHTML = gamesData.map(game =>
        `<li><a href="games/${game.slug}.html">تعريب ${game.title}</a></li>`
    ).join('');
}

// 👇👇 تهيئة الموقع: تشغيل الألعاب وفتح القسم المطلوب (يدعم الوصول من صفحات الألعاب عبر #accounts أو #home) 👇👇
renderGames(currentPage);
renderSiteIndex();
// إخفاء الأقسام الأخرى أولاً
document.querySelectorAll('.container').forEach(el => el.style.display = 'none');
// تحديد القسم المطلوب فتحه بناءً على الرابط (hash)
const initialHash = window.location.hash.replace('#', '');
if (initialHash === 'home' || initialHash === 'accounts') {
    showSection(initialHash);
} else {
    showSection('games');
}
