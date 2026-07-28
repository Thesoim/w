(function () {
    var KEY = 'soim-theme';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var theme = saved || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem(KEY, next); } catch (e) {}
        });
    });
})();
