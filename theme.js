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
})();

