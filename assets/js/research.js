/* Research page: magazine-style single column.
   Big index number + serif title + description + keyword line +
   year-hanging publication list + member avatar row.
   Optional fields degrade gracefully (empty papers -> hidden). */
(function () {
  "use strict";

  var box = document.getElementById("research-list");
  var nav = document.getElementById("research-nav");
  if (!box) return;

  var MAX_PAPERS = 3;
  var dirs = null;
  var membersById = {};

  function lang() { return window.MSB.lang(); }
  function t(k) { return window.MSB.t(k); }
  function esc(s) { return window.MSB.esc(s); }
  function pick(o, k) {
    var v = lang() === "zh" ? (o[k + "_zh"] || o[k]) : o[k];
    return v || "";
  }
  function initials(name) {
    return (name || "?").split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
  }

  var ROLE = {
    phd: ["PhD student", "博士生"],
    master: ["Master student", "硕士生"],
    alumni: ["Alumni", "毕业校友"]
  };

  function renderNav() {
    if (!nav) return;
    nav.innerHTML = '<div class="wrap res-nav-inner">' + dirs.map(function (d) {
      return '<a href="#' + esc(d.slug || "") + '">' + esc(pick(d, "title")) + "</a>";
    }).join("") + "</div>";
  }

  function personItem(id) {
    var m = membersById[id];
    if (!m) return "";
    var r = ROLE[m.role] || ["", ""];
    var av = m.photo
      ? '<img class="res-avatar" src="/' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy">'
      : '<span class="res-avatar is-initials">' + esc(initials(m.name)) + "</span>";
    return '<li><a href="/staff/">' + av +
      '<span class="res-person"><span class="res-person-name">' + esc(pick(m, "name")) + "</span>" +
      '<span class="res-person-role">' + esc(lang() === "zh" ? r[1] : r[0]) + "</span></span></a></li>";
  }

  function render() {
    if (!dirs) return;
    renderNav();

    box.innerHTML = dirs.map(function (d, i) {
      var idx = ("0" + (i + 1)).slice(-2);

      var points = lang() === "zh" ? (d.points_zh || d.points || []) : (d.points || d.points_zh || []);
      var keywords = points.length
        ? '<p class="res-keywords">' + points.map(esc).join(" · ") + "</p>"
        : "";

      var papers = d.papers || [];
      var shown = papers.slice(0, MAX_PAPERS);
      var papersHtml = "";
      if (shown.length) {
        papersHtml = '<h4 class="res-sub">' + esc(t("research.papers.title")) + "</h4>" +
          '<ul class="res-papers">' + shown.map(function (p) {
            return '<li><span class="res-year">' + esc(p.year || "") + "</span>" +
              '<span class="res-paper-body"><a href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
              esc(p.title) + "</a>" +
              '<span class="res-paper-venue">' + esc(p.venue || "") + "</span></span></li>";
          }).join("") + "</ul>" +
          (papers.length > MAX_PAPERS
            ? '<p class="res-more"><a href="/publications/">' + esc(t("research.more")) + " →</a></p>"
            : "");
      } else if (d.ongoing) {
        papersHtml = '<p class="res-ongoing">' + esc(t("research.ongoing")) + "</p>";
      }

      var people = (d.members || []).map(personItem).join("");
      var peopleHtml = people
        ? '<h4 class="res-sub">' + esc(t("research.members.title")) + '</h4><ul class="res-people">' + people + "</ul>"
        : "";

      return '<article class="res-block" id="' + esc(d.slug || "") + '">' +
        '<div class="res-index" aria-hidden="true">' + idx + "</div>" +
        '<div class="res-body">' +
        "<h3>" + esc(pick(d, "title")) + "</h3>" +
        '<p class="res-desc">' + esc(pick(d, "desc")) + "</p>" +
        keywords + papersHtml + peopleHtml +
        "</div></article>";
    }).join("");
  }

  window.MSB.fetchJSON("/_data/members.json").then(function (d) {
    (d.members || []).forEach(function (m) { membersById[m.id] = m; });
    render();
  }).catch(function () {});

  window.MSB.fetchJSON("/_data/research.json").then(function (d) {
    dirs = d.directions || [];
    render();
  }).catch(function () {});

  document.addEventListener("langchange", render);
})();
