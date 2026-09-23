/* Home page: research direction list, recent publications carousel,
   team photo scroll-magnetic-snap. */
(function () {
  "use strict";

  var dirs = null;
  var papers = [];
  var pIdx = 0;
  var pcTrack = null;

  function lang() { return window.MSB.lang(); }
  function t(k) { return window.MSB.t(k); }
  function esc(s) { return window.MSB.esc(s); }
  function pick(o, key) {
    var v = lang() === "zh" ? (o[key + "_zh"] || o[key]) : o[key];
    return v || "";
  }

  /* ---------------- 1.2 research directions (names + deep link) ---------------- */
  var dirGrid = document.getElementById("dir-grid");

  function renderDirections() {
    if (!dirGrid || !dirs) return;
    dirGrid.innerHTML = '<ul class="dir-names">' + dirs.map(function (d) {
      var href = "/research/" + (d.slug ? "#" + d.slug : "");
      return '<li><a href="' + esc(href) + '"><span>' + esc(pick(d, "title")) +
        '</span><span class="dir-arrow" aria-hidden="true">→</span></a></li>';
    }).join("") + "</ul>";
  }

  /* ---------------- 1.3 recent publications ---------------- */
  var pcBox = document.getElementById("papers-carousel");
  var plBox = document.getElementById("papers-list");

  function renderPapers() {
    if (!pcBox || !plBox || !papers.length) return;
    pcBox.innerHTML = '<div class="pc-viewport"><div class="pc-track" id="pc-track"></div></div>' +
      '<button class="pc-arrow pc-prev" aria-label="Previous">‹</button>' +
      '<button class="pc-arrow pc-next" aria-label="Next">›</button>';
    pcTrack = pcBox.querySelector("#pc-track");
    pcTrack.innerHTML = papers.map(function (p) {
      return '<a class="pc-slide" href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
        '<span class="pc-cover"><img src="/' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy">' +
        '<span class="pc-fallback"><span class="pc-venue">' + esc(p.venue) + "</span>" +
        '<span class="pc-title">' + esc(p.title) + "</span></span></span></a>";
    }).join("");
    pcTrack.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () { img.parentNode.classList.add("no-cover"); });
    });

    plBox.innerHTML = papers.map(function (p, i) {
      return '<li data-i="' + i + '"><a href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
        esc(p.title) + "</a>" +
        '<div class="paper-meta"><span class="paper-venue">' + esc(p.venue) + "</span>" +
        (p.citations ? '<span class="paper-cite">' + esc(t("publications.citedby")) + " " + p.citations + "</span>" : "") +
        "</div></li>";
    }).join("");
    plBox.querySelectorAll("li").forEach(function (li) {
      li.addEventListener("mouseenter", function () {
        goPaper(parseInt(li.getAttribute("data-i"), 10));
      });
    });

    pcBox.querySelector(".pc-prev").addEventListener("click", function () { goPaper(pIdx - 1); });
    pcBox.querySelector(".pc-next").addEventListener("click", function () { goPaper(pIdx + 1); });

    var sx = null;
    pcBox.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    pcBox.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) goPaper(dx < 0 ? pIdx + 1 : pIdx - 1);
      sx = null;
    }, { passive: true });

    goPaper(pIdx);
  }

  function goPaper(i) {
    if (!papers.length || !pcTrack) return;
    pIdx = (i + papers.length) % papers.length;
    pcTrack.style.transform = "translateX(" + (-pIdx * 100) + "%)";
    plBox.querySelectorAll("li").forEach(function (li, k) {
      li.classList.toggle("active", k === pIdx);
    });
  }

  /* ---------------- 1.4 team photo: scroll then magnetic snap ---------------- */
  var teamPhoto = document.getElementById("team-photo");

  function initTeamPhoto() {
    if (!teamPhoto) return;
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // stay fully visible

    var SNAP = 0.30;    // photo top 30% up the viewport -> absorb into place
    var RELEASE = 0.12; // scrolling back above this line -> release
    var state = "engaged";
    var releaseTimer = null;

    function setVars(o, y, s) {
      teamPhoto.style.setProperty("--tp-o", o);
      teamPhoto.style.setProperty("--tp-y", y);
      teamPhoto.style.setProperty("--tp-s", s);
    }

    // engaged state never fully completes, leaving a visible "pull" for the snap
    function engagedVars(t) {
      setVars(
        (0.12 + 0.78 * t).toFixed(3),
        (-58 + 30 * t).toFixed(1) + "px",
        (0.88 + 0.07 * t).toFixed(4)
      );
    }

    function snap() {
      state = "snapped";
      teamPhoto.classList.remove("is-engaged", "is-releasing");
      teamPhoto.classList.add("is-snapping");
      setVars("1", "0px", "1");
    }

    function release(t) {
      state = "releasing";
      teamPhoto.classList.remove("is-snapping");
      teamPhoto.classList.add("is-releasing");
      engagedVars(t);
      if (releaseTimer) window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(function () {
        state = "engaged";
        teamPhoto.classList.remove("is-releasing");
        teamPhoto.classList.add("is-engaged");
      }, 560);
    }

    teamPhoto.classList.add("is-engaged");
    engagedVars(0);

    var ticking = false;
    function update() {
      ticking = false;
      var r = teamPhoto.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var q = (vh - r.top) / vh;        // 0: top at viewport bottom; 1: top at top
      if (q < 0) q = 0;
      var t = Math.min(q / SNAP, 1);    // 0..1 up to the snap point

      if (state === "snapped") {
        if (q < RELEASE) release(t);
        return;
      }
      if (state === "releasing") return; // let the release animation play
      if (q >= SNAP) { snap(); return; }
      engagedVars(t);
    }

    function req() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    update();
  }

  /* ---------------- boot ---------------- */
  window.MSB.fetchJSON("/_data/research.json").then(function (d) {
    dirs = d.directions || [];
    renderDirections();
  }).catch(function () {});

  window.MSB.fetchJSON("/_data/highlights.json").then(function (d) {
    papers = d.papers || [];
    renderPapers();
  }).catch(function () {});

  document.addEventListener("langchange", function () {
    renderDirections();
    if (papers.length) renderPapers();
  });

  initTeamPhoto();
})();
