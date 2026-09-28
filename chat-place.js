/* Keeps the floating help button (#chat-open) off the door drawings.
   Only moves the button; it does not touch what the chat says.
   Tries, in order: normal spot (bottom right), round icon at bottom right,
   and, when the live drawing panel is on screen, a "Questions?" button in the
   panel's heading instead (same chat). Last resorts: round icon at bottom left,
   then the button steps aside until the drawing scrolls away. */
(function () {
  "use strict";
  var chat = document.getElementById("chat"), fab = document.getElementById("chat-open");
  if (!chat || !fab) return;
  var DRAW = "svg.dp-svg, .dcard__draw svg, .qdoor__draw svg, .rq-draw svg, [data-door-preview] svg, .viz__stage canvas";
  var SPOTS = ["", "chat--mini", "chat--mini chat--left"], ALL = ["chat--mini", "chat--left", "chat--tucked"];
  var GAP = 8, queued = false;

  function setSpot(s) {
    ALL.forEach(function (c) { chat.classList.remove(c); });
    if (s) s.split(" ").forEach(function (c) { chat.classList.add(c); });
    document.documentElement.classList.toggle("chat-tucked", s === "chat--tucked");
  }
  // the heading row of the live drawing panel, fully on screen (it holds a "Questions?" button shown while tucked)
  function panelAskOnScreen() {
    var heads = document.querySelectorAll(".dp-head");
    for (var i = 0; i < heads.length; i++) {
      var r = heads[i].getBoundingClientRect();
      if (r.width > 0 && r.top >= 0 && r.bottom <= window.innerHeight && heads[i].querySelector(".dp-ask")) return true;
    }
    return false;
  }
  function drawings() {
    var out = [], vh = window.innerHeight, vw = window.innerWidth;
    document.querySelectorAll(DRAW).forEach(function (el) {
      if (chat.contains(el)) return;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return;
      out.push(r);
    });
    return out;
  }
  function hits(f, list) {
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (f.left < r.right + GAP && f.right > r.left - GAP && f.top < r.bottom + GAP && f.bottom > r.top - GAP) return true;
    }
    return false;
  }
  function place() {
    queued = false;
    if (chat.classList.contains("is-open")) return;
    var list = drawings();
    setSpot("");
    var f = fab.getBoundingClientRect();
    if (!f.width || !list.length) return;          // hidden (small screens) or nothing to avoid
    for (var i = 0; i < SPOTS.length; i++) {
      if (SPOTS[i] === "chat--mini chat--left" && panelAskOnScreen()) break;
      setSpot(SPOTS[i]);
      if (!hits(fab.getBoundingClientRect(), list)) return;
    }
    setSpot("chat--tucked");
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(place); } }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  document.addEventListener("click", function () { setTimeout(queue, 0); setTimeout(queue, 350); }, true);
  document.addEventListener("input", queue, true);
  document.addEventListener("change", queue, true);
  if ("MutationObserver" in window) {
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) if (!chat.contains(recs[i].target)) { queue(); return; }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class", "open"] });
  }
  if ("ResizeObserver" in window) new ResizeObserver(queue).observe(document.body);
  window.addEventListener("load", queue);
  queue();
})();
