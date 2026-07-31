(function () {
    var KEY = 'soim-theme';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var theme = saved || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    function syncThemeColor(t) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', t === 'dark' ? '#141218' : '#5B4FE9');
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncThemeColor(theme);
        var btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            syncThemeColor(next);
            try { localStorage.setItem(KEY, next); } catch (e) {}
        });
    });

    // --- Smooth page loading transition, speed adapts to connection quality ---
    var html = document.documentElement;
    html.classList.add('page-loading');

    var speed = 300; // default transition speed (ms)
    try {
        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn && conn.effectiveType) {
            if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') speed = 550;
            else if (conn.effectiveType === '3g') speed = 400;
            else speed = 220; // 4g / fast connections: quick, snappy transition
            if (conn.saveData) speed = 550;
        }
    } catch (e) {}
    html.style.setProperty('--page-transition-speed', speed + 'ms');

    function revealPage() {
        html.classList.add('page-ready');
        setTimeout(function () { html.classList.remove('page-loading'); }, speed + 60);
    }
    if (document.readyState === 'complete') {
        revealPage();
    } else {
        window.addEventListener('load', revealPage);
        // fallback in case 'load' is delayed by slow third-party scripts
        setTimeout(revealPage, 2500);
    }

    // --- Smooth exit transition when navigating to another page on this site ---
    document.addEventListener('click', function (e) {
        var link = e.target.closest && e.target.closest('a[href]');
        if (!link) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var url;
        try { url = new URL(link.href, window.location.href); } catch (err) { return; }
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.hash) return; // in-page anchor, no transition needed

        e.preventDefault();
        html.classList.remove('page-ready');
        html.classList.add('page-loading');
        setTimeout(function () { window.location.href = link.href; }, speed);
    });

    // --- منع قائمة "حفظ/نسخ الصورة" الافتراضية، ونسخ رابط الزر بدل ذلك عند الضغط المطوّل ---
    function showCopyToast(text) {
        var toast = document.getElementById('soim-copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'soim-copy-toast';
            toast.className = 'copy-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () {});
        }
    }

    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest && (e.target.closest('.slider-container img, .gallery-hero img, .gallery-thumb img, .lightbox img, .big-btn, .big-btn-secondary'))) {
            e.preventDefault();
        }
    });

    var pressTimer = null;
    var longPressTriggered = false;
    document.addEventListener('touchstart', function (e) {
        var btn = e.target.closest && e.target.closest('.big-btn, .big-btn-secondary');
        if (!btn) return;
        longPressTriggered = false;
        pressTimer = setTimeout(function () {
            longPressTriggered = true;
            copyText(btn.href || '');
            showCopyToast('تم نسخ الرابط');
        }, 550);
    }, { passive: true });
    ['touchend', 'touchmove', 'touchcancel'].forEach(function (evt) {
        document.addEventListener(evt, function () { clearTimeout(pressTimer); }, { passive: true });
    });
    document.addEventListener('click', function (e) {
        if (longPressTriggered) {
            var btn = e.target.closest && e.target.closest('.big-btn, .big-btn-secondary');
            if (btn) { e.preventDefault(); e.stopPropagation(); }
            longPressTriggered = false;
        }
    }, true);

    // --- شفافية إضافية خفيفة للشريط العلوي أثناء التمرير/التنقل ---
    document.addEventListener('DOMContentLoaded', function () {
        var navInner = document.querySelector('.nav-inner');
        if (!navInner) return;
        var scrollTimer = null;
        window.addEventListener('scroll', function () {
            navInner.classList.add('nav-scrolling');
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () { navInner.classList.remove('nav-scrolling'); }, 400);
        }, { passive: true });
    });
})();

