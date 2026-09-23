/* Research page: renders the four research directions from _data/research.json */
(function () {
  "use strict";

  var box = document.getElementById("research-list");
  if (!box) return;

  var dirs = null;
  var membersById = {};

  function lang() { return window.MSB.lang(); }
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
      var names = (d.members || []).map(function (id) {
        var m = membersById[id];
        if (!m) return "";
        var r = ROLE[m.role] || ["", ""];
        return '<li><a href="/staff/">' + esc(pick(m, "name")) + "</a>" +
          '<span class="dir-role">' + esc(lang() === "zh" ? r[1] : r[0]) + "</span></li>";
      }).join("");
      return '<article class="res-block"><h3>' + esc(pick(d, "title")) + "</h3>" +
        '<p class="dir-desc">' + esc(pick(d, "desc")) + "</p>" +
        '<ul class="dir-members">' + names + "</ul></article>";
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
