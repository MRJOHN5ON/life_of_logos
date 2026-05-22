(function () {
    function initAiLightbox(root) {
        var lightbox = document.getElementById('ai-lightbox');
        var lightboxImg = document.getElementById('ai-lightbox-img');
        var closeBtn = document.getElementById('ai-lightbox-close');
        if (!root || !lightbox || !lightboxImg || !closeBtn) return;

        var lastFocus = null;

        function openLightbox(src, label) {
            if (!src) return;
            lastFocus = document.activeElement;
            lightboxImg.src = src;
            lightboxImg.alt = label || 'AI generated artwork (expanded)';
            lightbox.classList.add('show');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        }

        function closeLightbox() {
            lightbox.classList.remove('show');
            lightbox.setAttribute('aria-hidden', 'true');
            lightboxImg.src = '';
            document.body.style.overflow = '';
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        root.querySelectorAll('.gallery-card').forEach(function (btn, i) {
            btn.addEventListener('click', function () {
                var src = btn.getAttribute('data-ai-src');
                var img = btn.querySelector('img');
                if (src && img && img.naturalWidth) {
                    openLightbox(src, 'AI generated artwork ' + (i + 1));
                }
            });
        });

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('show')) closeLightbox();
        });
    }

    function initAiGalleryCarousel(carousel) {
        var track = carousel.querySelector('.ai-gallery-track');
        var pages = carousel.querySelectorAll('.ai-gallery-page');
        var prevBtn = carousel.querySelector('[data-gallery-prev]');
        var nextBtn = carousel.querySelector('[data-gallery-next]');
        var dots = carousel.querySelectorAll('[data-gallery-dot]');
        var countEl = carousel.querySelector('[data-gallery-count]');
        if (!track || !pages.length) return;

        var index = 0;
        var total = pages.length;
        var touchStartX = 0;

        function goTo(i) {
            index = Math.max(0, Math.min(total - 1, i));
            track.style.transform = 'translateX(-' + index * 100 + '%)';
            if (prevBtn) prevBtn.disabled = index === 0;
            if (nextBtn) nextBtn.disabled = index === total - 1;
            if (countEl) countEl.textContent = (index + 1) + ' / ' + total;
            dots.forEach(function (dot, di) {
                dot.classList.toggle('is-active', di === index);
                dot.setAttribute('aria-selected', di === index ? 'true' : 'false');
            });
            pages.forEach(function (page, pi) {
                page.setAttribute('aria-hidden', pi === index ? 'false' : 'true');
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                goTo(index - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                goTo(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var target = parseInt(dot.getAttribute('data-gallery-dot'), 10);
                if (!isNaN(target)) goTo(target);
            });
        });

        carousel.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goTo(index - 1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goTo(index + 1);
            }
        });

        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        carousel.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(dx) < 50) return;
            if (dx < 0) goTo(index + 1);
            else goTo(index - 1);
        }, { passive: true });

        goTo(0);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var carousel = document.getElementById('ai-gallery-carousel');
        if (carousel) {
            initAiLightbox(carousel);
            initAiGalleryCarousel(carousel);
        }
    });
})();
