/* Shop filters and the same menu used on the other pages. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  var nav = $("#site-nav"), toggle = document.querySelector(".menu-toggle");
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  if (nav) nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024) setMenu(false); });

  var kinds = { doors: 1, frames: 1, hardware: 1, flagpoles: 1 };
  function kindFromHash() {
    var h = (location.hash || "").replace("#", "");
    return kinds[h] ? h : "all";
  }
  function apply(kind) {
    var groups = document.querySelectorAll(".shop-group");
    for (var i = 0; i < groups.length; i++) {
      groups[i].hidden = kind !== "all" && groups[i].getAttribute("data-kind") !== kind;
    }
    var buttons = document.querySelectorAll("[data-shop]");
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute("aria-pressed", buttons[j].getAttribute("data-shop") === kind ? "true" : "false");
    }
  }
  var bar = $(".shop-filters");
  if (bar) {
    apply(kindFromHash());
    bar.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-shop]");
      if (!b) return;
      var kind = b.getAttribute("data-shop");
      apply(kind);
      if (history.replaceState) history.replaceState(null, "", kind === "all" ? location.pathname + location.search : "#" + kind);
    });
    window.addEventListener("hashchange", function () { apply(kindFromHash()); });
  }
})();
