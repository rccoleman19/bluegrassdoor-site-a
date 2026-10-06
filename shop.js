/* Shop filters, the quote list, and the same menu used on the other pages.
   The list is sent with the same quote request the door builder and the flagpole page already use. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var S = window.DoorSpec;
  var PHONE = "270-780-3235";
  var QUOTE_API = { url: "https://esrwugfaqlwttxmfkpkx.supabase.co/rest/v1/quote_requests", key: "sb_publishable_aOUQv3tbsDOP4eTDjbyA6w_RKZBxx8K" };
  var STORE = "bgd-shop-quote";
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
    function showKind(kind) {
      var el, head;
      if (!kinds[kind]) return;
      el = document.getElementById(kind);
      if (!el || !el.scrollIntoView) return;
      head = el.querySelector ? el.querySelector("h2") : null;
      if (!head) head = el;
      if (head.setAttribute && head.getAttribute && head.getAttribute("tabindex") == null) head.setAttribute("tabindex", "-1");
      el.scrollIntoView({ block: "start" });
      if (head.focus) head.focus();
    }
    window.addEventListener("hashchange", function () {
      var kind = kindFromHash();
      apply(kind);
      showKind(kind);
    });
  }

  var items = [];
  function load() {
    try {
      var raw = sessionStorage.getItem(STORE);
      var parsed = raw ? JSON.parse(raw) : [];
      items = [];
      if (!parsed || !parsed.length) return;
      for (var i = 0; i < parsed.length && items.length < 20; i++) {
        var it = parsed[i];
        if (!it || !it.label || !it.kind) continue;
        items.push({ kind: String(it.kind), type: String(it.type || ""), label: String(it.label).slice(0, 80) });
      }
    } catch (e1) { items = []; }
  }
  function save() {
    try { sessionStorage.setItem(STORE, JSON.stringify(items)); } catch (e2) {}
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function kindWord(kind) {
    if (kind === "door") return "Door";
    if (kind === "frame") return "Frame";
    if (kind === "hardware") return "Hardware";
    return "Flagpole";
  }
  function plainLine(it) {
    if (it.kind === "flagpole") return "Flagpole";
    return kindWord(it.kind) + ": " + it.label;
  }
  function render() {
    var list = $("#qlist-items"), empty = $("#qlist-empty"), form = $("#qlist-form");
    var n = items.length;
    $("#qlist-count").textContent = n === 0 ? "Nothing added yet." : (n === 1 ? "1 item" : n + " items");
    var call = $("#qlist-call");
    if (call) call.textContent = n ? "Your quote (" + n + ")" : "Your quote";
    var stick = $("#qlist-bar"), names = $("#qlist-bar-names"), link = $("#qlist-bar-link");
    if (stick) {
      stick.hidden = n === 0;
      if (link) link.textContent = n === 1 ? "Your quote, 1 item" : "Your quote, " + n + " items";
      if (names) {
        var bits = [];
        for (var i = 0; i < items.length; i++) bits.push(plainLine(items[i]));
        names.textContent = bits.join(" · ");
      }
    }
    if (empty) empty.hidden = n !== 0;
    if (form) form.hidden = n === 0;
    if (!list) return;
    var html = "";
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      html += "<li><span><span class=\"qlist__kind\">" + esc(kindWord(it.kind)) + "</span><span class=\"qlist__name\">" + esc(it.kind === "flagpole" ? "Flagpole" : it.label) + "</span></span>" +
        "<button type=\"button\" class=\"btn btn--text\" data-remove=\"" + k + "\">Remove</button></li>";
    }
    list.innerHTML = html;
  }
  function addItem(kind, type, label) {
    if (sending || !kind || !label || items.length >= 20) return;
    var done = $("#qlist-done"); if (done) done.hidden = true;
    items.push({ kind: kind, type: type || "", label: label });
    save();
    render();
    $("#qlist-count").textContent = "Added " + (kind === "flagpole" ? "Flagpole" : label) + ". " + (items.length === 1 ? "1 item" : items.length + " items") + " in your quote.";
  }
  document.addEventListener("click", function (e) {
    var add = e.target.closest && e.target.closest("[data-add]");
    var rm = e.target.closest && e.target.closest("[data-remove]");
    if (sending && (add || rm)) return;
    if (add) {
      addItem(add.getAttribute("data-add"), add.getAttribute("data-type") || "", add.getAttribute("data-label") || "");
      return;
    }
    if (!rm) return;
    var idx = parseInt(rm.getAttribute("data-remove"), 10);
    if (!isFinite(idx) || idx < 0 || idx >= items.length) return;
    var next = [];
    for (var i = 0; i < items.length; i++) if (i !== idx) next.push(items[i]);
    items = next;
    save();
    render();
  });

  function fieldErr(el, bad) {
    var field = el.closest ? el.closest(".field") : null;
    if (field) field.classList.toggle("is-invalid", bad);
    el.setAttribute("aria-invalid", bad ? "true" : "false");
  }
  function checkName() {
    var el = $("#ql-name"), bad = !el.value.trim();
    fieldErr(el, bad);
    if (bad) el.setAttribute("aria-describedby", "ql-name-err"); else el.removeAttribute("aria-describedby");
    return !bad;
  }
  function emailOk(ev) {
    if (!ev) return true;
    var at = ev.indexOf("@");
    if (at < 1 || ev.indexOf("@", at + 1) !== -1) return false;
    var domain = ev.slice(at + 1);
    var dot = domain.lastIndexOf(".");
    if (dot < 1 || domain.length - dot < 3) return false;
    var bad = " <>\"'";
    for (var i = 0; i < ev.length; i++) if (bad.indexOf(ev.charAt(i)) >= 0 || ev.charAt(i) === " ") return false;
    return true;
  }
  function checkReach() {
    var p = $("#ql-phone"), e = $("#ql-email"), pv = p.value.trim(), ev = e.value.trim(), msg = "";
    var pOk = !pv || pv.replace(/\D/g, "").length >= 7;
    var eOk = emailOk(ev);
    if (!pv && !ev) msg = "Please give us a phone number or an email address.";
    else if (!pOk) msg = "Please check the phone number (at least 7 digits).";
    else if (!eOk) msg = "That email address doesn't look quite right.";
    var set = $("#ql-reach");
    set.classList.toggle("is-invalid", !!msg);
    $("#ql-reach-err").textContent = msg || "Please give us a phone number or an email address.";
    fieldErr(p, !!msg && (!pOk || (!pv && !ev)));
    fieldErr(e, !!msg && (!eOk || (!pv && !ev)));
    [p, e].forEach(function (x) { if (msg) x.setAttribute("aria-describedby", "ql-reach-err"); else x.removeAttribute("aria-describedby"); });
    return !msg;
  }
  function showErr(id, on) {
    var el = $(id);
    if (!el) return;
    el.classList.toggle("is-on", !!on);
  }
  function doorRow(it, i) {
    var know;
    if (it.kind === "flagpole") know = ["This is a flagpole quote."];
    else if (it.kind === "hardware") know = ["Hardware on this quote."];
    else if (it.kind === "frame") know = ["Frame on this quote."];
    else know = ["Door type chosen on the shop list. Material and size were not chosen here."];
    return {
      door: i + 1, location: "", quantity: 1,
      type: it.kind === "flagpole" ? "Flagpole" : it.label,
      type_id: it.kind === "flagpole" ? "flagpole" : (it.type || it.kind),
      material: "", material_id: "", size: "", size_id: "", custom_size: false,
      width_in: null, height_in: null, width: "", height: "",
      hardware: it.kind === "hardware" ? [it.label] : [],
      good_to_know: know
    };
  }
  function notesFor(extra, list) {
    var lines = ["Quote list from the shop."];
    for (var i = 0; i < list.length; i++) lines.push((i + 1) + ". " + plainLine(list[i]));
    lines.push("");
    lines.push("Buying and deposits are not available online. This is a quote request. The office follows up.");
    if (extra) { lines.push(""); lines.push(extra); }
    return lines.join("\n").slice(0, 4000);
  }
  var sending = false, reqRef = "", reqTries = 0, reqSig = "";
  function sendErr(msg) {
    var box = $("#ql-send-err");
    if (!msg) { box.classList.remove("is-on"); box.innerHTML = ""; return; }
    box.innerHTML = msg; box.classList.add("is-on");
  }
  function rowFor(c, list) {
    var page = location.href.split("#")[0];
    var doors = [];
    for (var i = 0; i < list.length; i++) doors.push(doorRow(list[i], i));
    return {
      reference: reqRef, name: c.n, company: c.co || null, phone: c.p || null, email: c.e || null,
      project_location: c.a || null, timeline: c.tl || null, notes: notesFor(c.x, list),
      doors: doors, door_count: doors.length, total_quantity: doors.length,
      build_link: page, office_link: page,
      user_agent: String(navigator.userAgent || "").slice(0, 400)
    };
  }
  function setLocked(on) {
    var i, nodes, formEl, fields;
    nodes = document.querySelectorAll("[data-add]");
    for (i = 0; i < nodes.length; i++) nodes[i].disabled = !!on;
    nodes = document.querySelectorAll("[data-remove]");
    for (i = 0; i < nodes.length; i++) nodes[i].disabled = !!on;
    formEl = $("#qlist-form");
    if (!formEl || !formEl.querySelectorAll) return;
    fields = formEl.querySelectorAll("input, textarea, select");
    for (i = 0; i < fields.length; i++) {
      if (fields[i].id === "ql-submit") continue;
      fields[i].disabled = !!on;
    }
  }
  function showSent(ref) {
    var done = $("#qlist-done");
    var strong = $("#qlist-ref");
    var para;
    if (!strong && done) {
      para = done.querySelector("p");
      if (para) {
        para.innerHTML = "Reference <strong id=\"qlist-ref\"></strong>. This is one quote request, not a purchase. Buying and deposits are not available online. Our office follows up.";
        strong = $("#qlist-ref");
      }
    }
    if (strong) strong.textContent = ref;
    if (!done) return;
    done.hidden = false;
    if (done.focus) done.focus();
  }
  function withoutSent(live, snap) {
    var left = [], next = [], i, j, found;
    for (i = 0; i < snap.length; i++) left.push(snap[i]);
    for (i = 0; i < live.length; i++) {
      found = -1;
      for (j = 0; j < left.length; j++) {
        if (left[j].kind === live[i].kind && left[j].type === live[i].type && left[j].label === live[i].label) { found = j; break; }
      }
      if (found >= 0) left.splice(found, 1);
      else next.push(live[i]);
    }
    return next;
  }
  function sent(snap) {
    var ref = reqRef;
    var next = withoutSent(items, snap);
    showSent(ref);
    items = next;
    save();
    reqRef = "";
    reqTries = 0;
    reqSig = "";
    render();
    if (next.length) return;
    var empty = $("#qlist-empty");
    if (empty) empty.hidden = true;
    var count = $("#qlist-count");
    if (count) count.textContent = "Sent.";
    var formEl = $("#qlist-form");
    if (formEl) formEl.hidden = true;
    var stick = $("#qlist-bar");
    if (stick) stick.hidden = true;
    var call = $("#qlist-call");
    if (call) call.textContent = "Your quote";
  }
  function sendRequest(c, snap) {
    if (sending) return;
    var btn = $("#ql-submit");
    sending = true; sendErr("");
    setLocked(true);
    btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.textContent = "Sending\u2026";
    var retry = reqTries > 0; reqTries++;
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
    var done = function () { clearTimeout(timer); sending = false; setLocked(false); btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = "Send my quote request"; };
    fetch(QUOTE_API.url, {
      method: "POST", mode: "cors", credentials: "omit", signal: ctl ? ctl.signal : undefined,
      headers: { "Content-Type": "application/json", apikey: QUOTE_API.key, Prefer: "return=minimal" },
      body: JSON.stringify(rowFor(c, snap))
    }).then(function (r) {
      if (r.ok || (r.status === 409 && retry)) { done(); sent(snap); return; }
      if (r.status === 409) { done(); reqRef = S.newRef(); reqTries = 0; sendRequest(c, snap); return; }
      throw new Error("HTTP " + r.status);
    }).catch(function () {
      done();
      sendErr("<strong>We couldn't send your quote just now.</strong> Please check your connection and press <strong>Send my quote request</strong> again. Your list is still here. Or call us at <a href=\"tel:+12707803235\">" + PHONE + "</a>.");
    });
  }
  var form = $("#qlist-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showErr("#ql-list-err", items.length === 0);
      if (!items.length) { var listTop = $("#quote-list"); if (listTop) listTop.scrollIntoView({ block: "nearest" }); return; }
      var okName = checkName(), okReach = checkReach();
      if (!okName) { $("#ql-name").focus(); return; }
      if (!okReach) { var p = $("#ql-phone"); (p.getAttribute("aria-invalid") === "true" ? p : $("#ql-email")).focus(); return; }
      var c = S.unpackContact({ n: $("#ql-name").value, co: $("#ql-company").value, p: $("#ql-phone").value, e: $("#ql-email").value, a: $("#ql-addr").value, tl: $("#ql-when").value, x: $("#ql-notes").value });
      var snap = [], sig, s;
      for (s = 0; s < items.length; s++) snap.push({ kind: items[s].kind, type: items[s].type, label: items[s].label });
      sig = JSON.stringify({ items: snap, n: c.n, co: c.co, p: c.p, e: c.e, a: c.a, tl: c.tl, x: c.x });
      if (!reqRef || sig !== reqSig) { reqRef = S.newRef(); reqSig = sig; reqTries = 0; }
      sendRequest(c, snap);
    });
    $("#ql-name").addEventListener("input", function () { if (this.getAttribute("aria-invalid") === "true") checkName(); });
    ["#ql-phone", "#ql-email"].forEach(function (sel) {
      $(sel).addEventListener("input", function () { if ($("#ql-reach").classList.contains("is-invalid")) checkReach(); });
    });
  }
  load();
  render();
})();
