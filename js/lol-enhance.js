(function () {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;

    function injectLoader() {
        if (reduced || sessionStorage.getItem('lol-visited')) return;
        var el = document.createElement('div');
        el.className = 'lol-loader';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML =
            '<p class="lol-loader__logo">Life of Logos</p>' +
            '<div class="lol-loader__bar"><span></span></div>';
        document.body.prepend(el);
        requestAnimationFrame(function () {
            setTimeout(function () {
                el.classList.add('is-done');
                sessionStorage.setItem('lol-visited', '1');
                setTimeout(function () { el.remove(); }, 500);
            }, 700);
        });
    }

    function injectProgress() {
        var bar = document.createElement('div');
        bar.className = 'lol-progress';
        bar.setAttribute('role', 'presentation');
        document.body.appendChild(bar);
        function update() {
            var h = document.documentElement.scrollHeight - window.innerHeight;
            var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
            bar.style.width = pct + '%';
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function injectGrain() {
        var g = document.createElement('div');
        g.className = 'lol-grain';
        g.setAttribute('aria-hidden', 'true');
        document.body.appendChild(g);
    }

    function initReveal() {
        var nodes = document.querySelectorAll(
            '.lol-reveal, section[id], .project-card, .section-tag, .about-card, .case-card, .about-skill, .lol-stat'
        );
        nodes.forEach(function (el, i) {
            if (!el.classList.contains('lol-reveal')) el.classList.add('lol-reveal');
            if (i % 4 === 1) el.classList.add('lol-reveal--delay-1');
            if (i % 4 === 2) el.classList.add('lol-reveal--delay-2');
            if (i % 4 === 3) el.classList.add('lol-reveal--delay-3');
        });
        if (reduced) {
            nodes.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        );
        nodes.forEach(function (el) { io.observe(el); });
    }

    function initTilt() {
        if (!finePointer || reduced) return;
        document.querySelectorAll('.project-card').forEach(function (card) {
            card.classList.add('lol-tilt');
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) scale(1.02)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    function initCursorRing() {
        if (!finePointer) return;
        var dot = document.getElementById('custom-cursor');
        if (!dot) return;
        var ring = document.createElement('div');
        ring.id = 'cursor-ring';
        ring.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ring);
        document.addEventListener('mousemove', function (e) {
            ring.style.left = e.clientX + 'px';
            ring.style.top = e.clientY + 'px';
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('a, button, .project-card, .gallery-card, .about-cta, input, textarea').forEach(function (el) {
            el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
            el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
        });
    }

    function initSplatters() {
        if (reduced) return;
        document.querySelectorAll('.splatter').forEach(function (s, i) {
            s.classList.add('lol-drift');
            s.style.animationDelay = i * 3 + 's';
        });
    }

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            var id = a.getAttribute('href').slice(1);
            if (!id) return;
            a.addEventListener('click', function (e) {
                var target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        injectGrain();
        injectProgress();
        initReveal();
        initTilt();
        initCursorRing();
        initSplatters();
        initSmoothAnchors();
        injectLoader();
    });
})();
