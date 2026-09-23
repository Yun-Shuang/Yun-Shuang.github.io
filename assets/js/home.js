/* Home page: research directions, recent publications carousel,
   team photo scroll reveal. */
(function () {
  "use strict";

  var membersById = {};
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

  var ROLE_LABELS = {
    phd: ["PhD student", "博士生"],
    master: ["Master student", "硕士生"],
    alumni: ["Alumni", "毕业校友"]
  };

  /* ---------------- 1.2 research directions ---------------- */
  var dirGrid = document.getElementById("dir-grid");

  function renderDirections() {
    if (!dirGrid || !dirs) return;
    dirGrid.innerHTML = dirs.map(function (d) {
      var names = (d.members || []).map(function (id) {
        var m = membersById[id];
        if (!m) return "";
        var pair = ROLE_LABELS[m.role] || ["", ""];
        return '<li><a href="/staff/">' + esc(pick(m, "name")) + "</a>" +
          '<span class="dir-role">' + esc(lang() === "zh" ? pair[1] : pair[0]) + "</span></li>";
      }).join("");
      return '<article class="dir-card"><h3>' + esc(pick(d, "title")) + "</h3>" +
        '<p class="dir-desc">' + esc(pick(d, "desc")) + "</p>" +
        '<ul class="dir-members">' + names + "</ul></article>";
    }).join("");
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

  /* ---------------- 1.4 team photo scroll reveal ---------------- */
  var teamPhoto = document.getElementById("team-photo");

  function initTeamPhoto() {
    if (!teamPhoto) return;
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var img = teamPhoto.querySelector("img");
    if (reduce || !img) return;

    img.style.opacity = "0";
    img.style.willChange = "opacity, transform";
    var ticking = false;

    function update() {
      ticking = false;
      var r = teamPhoto.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // p: 0 when photo top reaches viewport bottom, 1 after ~45% of viewport
      var p = (vh - r.top) / (vh * 0.45);
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      var e = 1 - Math.pow(1 - p, 3); // easeOutCubic: fast in, slow out
      img.style.opacity = e.toFixed(3);
      img.style.transform = "translateY(" + ((1 - e) * 54).toFixed(1) +
        "px) scale(" + (1 + (1 - e) * 0.035).toFixed(4) + ")";
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
  window.MSB.fetchJSON("/_data/members.json").then(function (d) {
    (d.members || []).forEach(function (m) { membersById[m.id] = m; });
    renderDirections();
  }).catch(function () {});

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
