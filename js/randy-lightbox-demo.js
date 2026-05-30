(function () {
  var IMAGE_BASE = "assets/images/randy-photos/demo/";

  var PHOTOS = [
    {
      filename: "1779856622533_flickr_51629391607.jpg",
      caption: "Devils Golf Course Sunset",
      dateTaken: "2021-10-26"
    },
    {
      filename: "1779856622527_flickr_51602076520.jpg",
      caption: "Gifford Pinchot - The Fisherman 2",
      dateTaken: "2021-10-18"
    },
    {
      filename: "1779856622493_flickr_46838274114.jpg",
      caption: "Zion Landscape - B&W",
      dateTaken: "2019-04-08"
    },
    {
      filename: "1779856622356_flickr_33542134208.jpg",
      caption: "Beach Cave - B&W",
      dateTaken: "2019-03-19"
    }
  ];

  var root = document.getElementById("randy-lb-demo");
  if (!root) return;

  var imgEl = document.getElementById("randy-lb-demo-img");
  var dateEl = document.getElementById("randy-lb-demo-date");
  var captionEl = document.getElementById("randy-lb-demo-caption");
  var indexEl = document.getElementById("randy-lb-demo-index");
  var shareBtn = document.getElementById("randy-lb-demo-share");
  var shareLabel = shareBtn && shareBtn.querySelector(".randy-lb-demo__share-label");
  var prevBtn = root.querySelector(".randy-lb-demo__nav--prev");
  var nextBtn = root.querySelector(".randy-lb-demo__nav--next");

  var index = 0;

  function formatDate(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function shareUrl() {
    var url = new URL(window.location.href);
    url.searchParams.set("lightbox", String(index + 1));
    url.hash = "";
    return url.toString();
  }

  function readIndexFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var n = parseInt(params.get("lightbox"), 10);
    if (!n || n < 1 || n > PHOTOS.length) return 0;
    return n - 1;
  }

  function showPhoto(i, animate) {
    index = (i + PHOTOS.length) % PHOTOS.length;
    var photo = PHOTOS[index];
    var label = formatDate(photo.dateTaken);
    var src = IMAGE_BASE + photo.filename;

    function apply() {
      imgEl.src = src;
      imgEl.alt = photo.caption;
      captionEl.textContent = photo.caption;
      if (label) {
        dateEl.textContent = label;
        dateEl.hidden = false;
      } else {
        dateEl.textContent = "";
        dateEl.hidden = true;
      }
      if (indexEl) indexEl.textContent = String(index + 1);
      if (shareLabel) shareLabel.textContent = "Share photo";
    }

    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    imgEl.classList.add("is-fading");
    window.setTimeout(function () {
      apply();
      imgEl.classList.remove("is-fading");
    }, 120);
  }

  function step(delta) {
    showPhoto(index + delta, true);
  }

  PHOTOS.forEach(function (p) {
    var preload = new Image();
    preload.src = IMAGE_BASE + p.filename;
  });

  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  });

  if (shareBtn) {
    shareBtn.addEventListener("click", async function () {
      var photo = PHOTOS[index];
      var url = shareUrl();

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Randy's Photography — " + photo.caption,
            text: photo.caption,
            url: url
          });
          return;
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          if (shareLabel) {
            var original = shareLabel.textContent;
            shareLabel.textContent = "Link copied";
            window.setTimeout(function () {
              shareLabel.textContent = original;
            }, 1400);
          }
        } catch (_e) {
          window.prompt("Copy this link:", url);
        }
      } else {
        window.prompt("Copy this link:", url);
      }
    });
  }

  var touchStartX = null;
  root.addEventListener(
    "touchstart",
    function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );
  root.addEventListener(
    "touchend",
    function (e) {
      if (touchStartX === null || !e.changedTouches || !e.changedTouches.length) return;
      var deltaX = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) < 50) return;
      step(deltaX < 0 ? 1 : -1);
    },
    { passive: true }
  );

  showPhoto(readIndexFromUrl(), false);
})();
