(function () {
  var range = document.getElementById('compare-range');
  var after = document.getElementById('compare-after');
  var handle = document.getElementById('compare-handle');
  var labelBefore = document.querySelector('.compare-label--before');
  var labelAfter = document.querySelector('.compare-label--after');
  if (!range || !after || !handle) return;

  function updateLabels(pct) {
    if (!labelBefore && !labelAfter) return;

    /* Left of handle = before, right = after — hide the tag on the side that's barely visible */
    if (labelBefore) {
      var showBefore = pct < 55;
      labelBefore.style.opacity = showBefore ? '1' : '0';
      labelBefore.style.visibility = showBefore ? 'visible' : 'hidden';
      labelBefore.setAttribute('aria-hidden', showBefore ? 'false' : 'true');
    }
    if (labelAfter) {
      var showAfter = pct > 45;
      labelAfter.style.opacity = showAfter ? '1' : '0';
      labelAfter.style.visibility = showAfter ? 'visible' : 'hidden';
      labelAfter.setAttribute('aria-hidden', showAfter ? 'false' : 'true');
    }
  }

  function setPosition(pct) {
    var clamped = Math.min(100, Math.max(0, pct));
    /* Match CSS default: reveal after image from the left edge up to the handle */
    after.style.clipPath = 'inset(0 0 0 ' + clamped + '%)';
    handle.style.left = clamped + '%';
    range.setAttribute('aria-valuenow', String(Math.round(clamped)));
    updateLabels(clamped);
  }

  range.addEventListener('input', function () {
    setPosition(Number(range.value));
  });
  setPosition(50);

  var shell = document.getElementById('compare-shell');
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
    });
  }
})();
