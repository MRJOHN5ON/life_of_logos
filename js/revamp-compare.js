(function () {
  var range = document.getElementById('compare-range');
  var after = document.getElementById('compare-after');
  var handle = document.getElementById('compare-handle');
  var labelBefore = document.querySelector('.compare-label--before');
  var labelAfter = document.querySelector('.compare-label--after');
  var shell = document.getElementById('compare-shell');
  if (!range || !after || !handle) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AUTO_MIN = 0;
  var AUTO_MAX = 100;
  var AUTO_SPEED = 28;
  var RESUME_DELAY = 2200;

  var autoPlaying = !reducedMotion;
  var userHolding = false;
  var resumeTimer = null;
  var autoValue = 50;
  var autoDir = 1;
  var rafId = null;
  var lastTime = 0;

  function updateLabels(pct) {
    if (!labelBefore && !labelAfter) return;
    /* Low % = full after on top; high % = full before underneath */
    if (labelAfter) {
      var showAfter = pct <= 50;
      labelAfter.style.opacity = showAfter ? '1' : '0';
      labelAfter.style.visibility = showAfter ? 'visible' : 'hidden';
      labelAfter.setAttribute('aria-hidden', showAfter ? 'false' : 'true');
    }
    if (labelBefore) {
      var showBefore = pct >= 50;
      labelBefore.style.opacity = showBefore ? '1' : '0';
      labelBefore.style.visibility = showBefore ? 'visible' : 'hidden';
      labelBefore.setAttribute('aria-hidden', showBefore ? 'false' : 'true');
    }
  }

  function setPosition(pct) {
    var clamped = Math.min(100, Math.max(0, pct));
    after.style.clipPath = 'inset(0 0 0 ' + clamped + '%)';
    handle.style.left = clamped + '%';
    range.value = String(clamped);
    range.setAttribute('aria-valuenow', String(Math.round(clamped)));
    updateLabels(clamped);
    autoValue = clamped;
  }

  function pauseAuto() {
    autoPlaying = false;
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  }

  function scheduleResume() {
    if (reducedMotion) return;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      resumeTimer = null;
      if (!userHolding && !document.hidden) autoPlaying = true;
    }, RESUME_DELAY);
  }

  function onUserStart() {
    userHolding = true;
    pauseAuto();
  }

  function onUserEnd() {
    userHolding = false;
    autoValue = Number(range.value);
    if (autoValue >= AUTO_MAX - 1) autoDir = -1;
    else if (autoValue <= AUTO_MIN + 1) autoDir = 1;
    scheduleResume();
  }

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    if (!autoPlaying || userHolding || document.hidden) {
      lastTime = now;
      return;
    }
    if (!lastTime) lastTime = now;
    var dt = (now - lastTime) / 1000;
    lastTime = now;

    autoValue += autoDir * AUTO_SPEED * dt;
    if (autoValue >= AUTO_MAX) {
      autoValue = AUTO_MAX;
      autoDir = -1;
    } else if (autoValue <= AUTO_MIN) {
      autoValue = AUTO_MIN;
      autoDir = 1;
    }
    setPosition(autoValue);
  }

  range.addEventListener('input', function () {
    setPosition(Number(range.value));
  });

  range.addEventListener('pointerdown', onUserStart);
  range.addEventListener('pointerup', onUserEnd);
  range.addEventListener('pointercancel', onUserEnd);
  range.addEventListener('focus', onUserStart);
  range.addEventListener('blur', onUserEnd);

  if (shell) {
    shell.addEventListener('pointerdown', onUserStart);
    shell.addEventListener('pointerup', onUserEnd);
    shell.addEventListener('pointercancel', onUserEnd);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseAuto();
    else if (!userHolding) scheduleResume();
  });

  setPosition(50);

  if (!reducedMotion) {
    rafId = requestAnimationFrame(tick);
  }

  if (shell && window.matchMedia('(pointer: coarse)').matches) {
    var dragging = false;
    function pctFromEvent(e) {
      var rect = shell.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return (x / rect.width) * 100;
    }
    shell.addEventListener(
      'touchstart',
      function (e) {
        onUserStart();
        dragging = true;
        setPosition(pctFromEvent(e));
        e.preventDefault();
      },
      { passive: false }
    );
    shell.addEventListener(
      'touchmove',
      function (e) {
        if (dragging) {
          setPosition(pctFromEvent(e));
          e.preventDefault();
        }
      },
      { passive: false }
    );
    shell.addEventListener('touchend', function () {
      dragging = false;
      onUserEnd();
    });
    shell.addEventListener('touchcancel', function () {
      dragging = false;
      onUserEnd();
    });
  }
})();
