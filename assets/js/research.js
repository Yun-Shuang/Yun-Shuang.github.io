/* Research page: renders the four research directions from _data/research.json
   (title, description, focus-area tags, representative publications, members).
   Optional fields degrade gracefully: empty papers -> hidden block. */
(function () {
  "use strict";

  var box = document.getElementById("research-list");
  if (!box) return;

  var dirs = null;
  var membersById = {};

  function lang() { return window.MSB.lang(); }
  function t(k) { return window.MSB.t(k); }
  function esc(s) { return window.MSB.esc(s); }
  function pick(o, k) {
    var v = lang() === "zh" ? (o[k + "_zh"] || o[k]) : o[k];
    return v || "";
  }

  var ROLE = {
    phd: ["PhD student", "博士生"],
    master: ["Master student", "硕士生"],
    alumni: ["Alumni", "毕业校友"]
  };

  function render() {
    if (!dirs) return;

    box.innerHTML = dirs.map(function (d) {
      var points = lang() === "zh" ? (d.points_zh || d.points || []) : (d.points || d.points_zh || []);
      var tags = points.length
        ? '<ul class="res-points">' + points.map(function (p) {
            return "<li>" + esc(p) + "</li>";
          }).join("") + "</ul>"
        : "";

      var papers = d.papers || [];
      var papersHtml = "";
      if (papers.length) {
        papersHtml = '<h4 class="res-sub">' + esc(t("research.papers.title")) + "</h4>" +
          '<ul class="res-papers">' + papers.map(function (p) {
            return '<li><a href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
              esc(p.title) + "</a>" +
              '<span class="res-paper-meta">' + esc(p.venue || "") +
              (p.year ? " · " + esc(p.year) : "") + "</span></li>";
          }).join("") + "</ul>";
      } else if (d.ongoing) {
        papersHtml = '<p class="res-ongoing">' + esc(t("research.ongoing")) + "</p>";
      }

      var names = (d.members || []).map(function (id) {
        var m = membersById[id];
        if (!m) return "";
        var r = ROLE[m.role] || ["", ""];
        return '<li><a href="/staff/">' + esc(pick(m, "name")) + "</a>" +
          '<span class="dir-role">' + esc(lang() === "zh" ? r[1] : r[0]) + "</span></li>";
      }).join("");
      var membersHtml = names
        ? '<h4 class="res-sub">' + esc(t("research.members.title")) + '</h4><ul class="dir-members">' + names + "</ul>"
        : "";

      return '<article class="res-block" id="' + esc(d.slug || "") + '"><h3>' +
        esc(pick(d, "title")) + "</h3>" +
        '<p class="dir-desc">' + esc(pick(d, "desc")) + "</p>" +
        tags + papersHtml + membersHtml +
        "</article>";
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
