// 1. SEO Schema
function generateGameSchema() {
    if (typeof gamesData === 'undefined') return;
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": gamesData.map((game, index) => ({
            "@type": "ListItem",
            "position": index + 1,
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
const totalPages = Math.ceil(gamesData.length / itemsPerPage);

// Navigation Function with Animations
function showSection(sectionId) {
    const containers = document.querySelectorAll('.container');
    const targetSection = document.getElementById(sectionId);
    
    // Update Navbar Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(sectionId === 'home') document.querySelectorAll('.nav-btn')[0].classList.add('active');
    if(sectionId === 'games') document.querySelectorAll('.nav-btn')[1].classList.add('active');
    if(sectionId === 'accounts') document.querySelectorAll('.nav-btn')[2].classList.add('active');

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

// Render Games Card Structure
function renderGames(page) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const gamesToShow = gamesData.slice(start, end);

    gamesToShow.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = (e) => {
            if(!e.target.classList.contains('arrow') && !e.target.classList.contains('download-btn')) {
                openGameDetails(game);
            }
        };

        let imagesHtml = '';
        game.images.forEach((img, index) => {
            imagesHtml += `<img src="${img}" class="slider-img ${index === 0 ? 'active' : ''}" data-idx="${index}">`;
        });

        card.innerHTML = `
            <div class="slider-container">
                ${imagesHtml}
                <div class="slider-nav">
                    <div class="arrow" onclick="moveSlide(this, -1)">&#10094;</div>
                    <div class="arrow" onclick="moveSlide(this, 1)">&#10095;</div>
                </div>
            </div>
            
            <div class="game-title">${game.title}</div>
            
            <div class="card-footer">
                <a href="${game.downloadLink}" class="download-btn" target="_blank">تحميل</a>
                <div class="game-info-small">${game.version} | ${game.size}</div>
            </div>
        `;
        grid.appendChild(card);
    });

    const pageInfo = document.getElementById('pageInfo');
    if(pageInfo) pageInfo.innerText = `${currentPage} / ${totalPages}`;
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
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderGames(currentPage);
        window.scrollTo(0, 0);
    }
}

function openGameDetails(game) {
    const detailTitle = document.getElementById('detailTitle');
    const detailImage = document.getElementById('detailImage');
    const detailStory = document.getElementById('detailStory');
    const detailTime = document.getElementById('detailTime');
    const detailEndings = document.getElementById('detailEndings');
    const btnContainer = document.getElementById('detailButtons');
    const instructBox = document.getElementById('instructionsArea');
    const view = document.getElementById('gameDetailView');

    if (detailTitle) detailTitle.innerText = game.title;
    if (detailImage) detailImage.src = game.images[0];
    if (detailStory) detailStory.innerText = game.story;
    if (detailTime) detailTime.innerText = game.timeToBeat;
    if (detailEndings) detailEndings.innerText = game.endings;

    if (btnContainer) {
        btnContainer.innerHTML = `<a href="${game.downloadLink}" class="big-btn" target="_blank">تحميل اللعبة</a>`;
        
        if (game.extraLink) {
            const extraBtn = document.createElement('a');
            extraBtn.href = game.extraLink;
            extraBtn.className = 'big-btn';
            extraBtn.innerText = game.extraText;
            extraBtn.target = "_blank";
            extraBtn.style.background = "#f1c40f"; 
            btnContainer.appendChild(extraBtn);
        }

        if (game.hasInstructions) {
            const instructBtn = document.createElement('button');
            instructBtn.className = 'big-btn';
            instructBtn.innerText = "طريقة إضافة التعريب";
            instructBtn.style.background = "#000000";
            instructBtn.style.color = "#fff";
            instructBtn.onclick = () => {
                instructBox.style.display = 'block';
            };
            btnContainer.appendChild(instructBtn);
            
            if (instructBox) {
                instructBox.innerHTML = `
                    <h4 style="color:var(--accent); margin-bottom:10px;">طريقة إضافة التعريب :</h4>
                    <p>1. استخدم تطبيق ZArchiver.</p>
                    <p>2. استخرج ملف التعريب وسيظهر لك مجلد باسم Telltale.</p>
                    <p>3. انقل مجلد Telltale إلى ذاكرة الهاتف الداخلية بجانب مجلدات: Download و Android.</p>
                `;
                instructBox.style.display = 'none';
            }
        }
    }

    if (view) view.style.display = 'block';
}

function closeGameDetail() {
    const view = document.getElementById('gameDetailView');
    if (view) view.style.display = 'none';
    const instructBox = document.getElementById('instructionsArea');
    if (instructBox) instructBox.style.display = 'none';
}

// 👇👇 تهيئة الموقع: تشغيل الألعاب والذهاب لقسم التعريبات مباشرة 👇👇
renderGames(currentPage);
// إخفاء الأقسام الأخرى أولاً
document.querySelectorAll('.container').forEach(el => el.style.display = 'none');
// تفعيل قسم الألعاب
showSection('games');
