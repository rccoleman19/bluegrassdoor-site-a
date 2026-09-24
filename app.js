/* Bluegrass Commercial Door & More: site scripts */
(function () {
  "use strict";
  var PHONE = "270-780-3235";
  var TEL = "tel:+12707803235";
  var EMAIL = "sonya@bluegrassdoor.com";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Year ---------- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header + mobile menu ---------- */
  var header = $(".header");
  var nav = $("#site-nav");
  var toggle = $(".menu-toggle");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setMenu(false); closeChat(); closeLightbox(); }
  });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024) setMenu(false); });
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Sticky call bar ---------- */
  var callbar = $(".callbar");
  var chatWrap = $("#chat");
  if ("IntersectionObserver" in window) {
    var hideFor = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) hideFor.add(en.target); else hideFor.delete(en.target); });
      callbar.classList.toggle("is-visible", hideFor.size === 0);
    }, { threshold: 0 });
    // show the bar once the hero buttons scroll away; hide it over the quote form and footer so it never covers fields
    [$(".hero__ctas"), $("#quote-form"), $(".footer")].forEach(function (el) { if (el) io.observe(el); });
  } else { callbar.classList.add("is-visible"); }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$(".svc, .pillar, .review, .about__copy, .about__photo, .area__copy, .area__map, .gallery__item");
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { el.classList.add("reveal"); rio.observe(el); });
  }

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox"), lbImg = $("#lightbox-img"), lbCap = $("#lightbox-cap"), lastFocus = null;
  $$(".gallery__item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lastFocus = btn;
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.getAttribute("data-caption");
      lbCap.textContent = btn.getAttribute("data-caption");
      lb.hidden = false;
      $(".lightbox__close", lb).focus();
    });
  });
  function closeLightbox() { if (!lb.hidden) { lb.hidden = true; if (lastFocus) lastFocus.focus(); } }
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lightbox__close")) closeLightbox(); });

  /* ---------- Service card links pre-select project type ---------- */
  var qType = $("#q-type");
  $$("[data-project]").forEach(function (a) {
    a.addEventListener("click", function () { setSelect(qType, a.getAttribute("data-project")); });
  });
  function setSelect(sel, val) {
    for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text === val) { sel.selectedIndex = i; return; } }
  }

  /* ---------- Door builder ---------- */
  var ICON = {
    storefront: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M12 3v18M9 12h1M14 12h1"/></svg>',
    steel: '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="1"/><path d="M15 12h1"/></svg>',
    fire: '<svg viewBox="0 0 24 24"><path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-4 3 0-2-1-4-2-5-1 4-4 6-4 11 0 4.3 3 7 7 7z"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
    door: '<svg viewBox="0 0 24 24"><path d="M4 22h16M6 22V3h12v19"/><path d="M14 12h1"/></svg>',
    barn: '<svg viewBox="0 0 24 24"><path d="M2 4h20"/><path d="M7 4v2M15 4v2"/><rect x="5" y="6" width="12" height="16"/><path d="m5 6 12 16M17 6 5 22"/></svg>',
    glass: '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="m8 7 3-3M8 12l7-7M11 13l5-5"/></svg>',
    wood: '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="1"/><rect x="8" y="5" width="8" height="6"/><rect x="8" y="13" width="8" height="6"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    single: '<svg viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="18"/><path d="M14 12h.5"/></svg>',
    pair: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18"/><path d="M12 3v18M10 12h.5M14 12h-.5"/></svg>',
    ruler: '<svg viewBox="0 0 24 24"><path d="m3 17 14-14 4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/></svg>',
    tape: '<svg viewBox="0 0 24 24"><circle cx="11" cy="12" r="8"/><circle cx="11" cy="12" r="2"/><path d="M19 12h3v8h-9"/></svg>',
    lever: '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="3"/><path d="M11 12h10"/></svg>',
    panic: '<svg viewBox="0 0 24 24"><rect x="2" y="10" width="20" height="4" rx="2"/><path d="M6 10V8M18 10V8"/></svg>',
    closer: '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="10" height="4" rx="1"/><path d="M12 6l8 6"/></svg>',
    keypad: '<svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01"/></svg>',
    hinge: '<svg viewBox="0 0 24 24"><rect x="6" y="3" width="5" height="18"/><rect x="13" y="3" width="5" height="18"/><path d="M11 7h2M11 12h2M11 17h2"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    track: '<svg viewBox="0 0 24 24"><path d="M2 6h20"/><circle cx="7" cy="6" r="2"/><circle cx="17" cy="6" r="2"/><path d="M7 8v4M17 8v4"/></svg>',
    plate: '<svg viewBox="0 0 24 24"><rect x="3" y="15" width="18" height="6" rx="1"/><path d="M6 3v12M18 3v12"/></svg>',
    help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/></svg>'
  };

  var TYPES = [
    { v: "storefront", t: "Storefront / Entrance", s: "Aluminum & glass commercial entry", i: "storefront", project: "Commercial entrance / storefront" },
    { v: "hollow", t: "Hollow Metal / Steel", s: "Back doors, stairwells, utility rooms", i: "steel", project: "Fire-rated / hollow metal doors" },
    { v: "fire", t: "Fire-Rated Door", s: "Code-compliant door & frame", i: "fire", project: "Fire-rated / hollow metal doors" },
    { v: "security", t: "Security / Safe Room", s: "Heavy-duty protection", i: "shield", project: "Security / safe room door" },
    { v: "swing", t: "Interior / Exterior Swing", s: "Residential or commercial", i: "door", project: "Interior / exterior doors" },
    { v: "barn", t: "Sliding Barn Door", s: "Interior sliding on track", i: "barn", project: "Interior / exterior doors" }
  ];
  var MATERIALS = {
    storefront: [["alglass", "Aluminum & glass", "Classic storefront framing", "storefront"], ["fullglass", "All-glass entrance", "Frameless look", "glass"]],
    hollow: [["steel", "Hollow metal steel", "Durable, paintable", "steel"], ["steellite", "Steel with vision lite", "Steel door with a glass window", "glass"]],
    fire: [["steel", "Hollow metal steel", "Labeled steel door & frame", "steel"], ["wood", "Wood", "Labeled wood door", "wood"]],
    security: [["steel", "Heavy-gauge steel", "Maximum strength", "steel"], ["steellite", "Steel with security glass", "Visibility with protection", "glass"]],
    swing: [["wood", "Wood", "Paint- or stain-grade", "wood"], ["steel", "Steel", "Tough and low maintenance", "steel"], ["fiberglass", "Fiberglass", "Weather-resistant exterior", "door"], ["glasslite", "Glass panel", "Full or half lite", "glass"]],
    barn: [["woodpanel", "Wood panel", "Shaker or plank style", "wood"], ["frosted", "Frosted glass", "Light through, privacy kept", "glass"]]
  };
  var SIZES = [
    ["single", "Single door, 3' × 7'", "Standard 36\" × 84\" opening", "single"],
    ["single8", "Single door, 3' × 8'", "Taller 36\" × 96\" opening", "single"],
    ["pair", "Pair of doors, 6' × 7'", "Double door, 72\" × 84\"", "pair"],
    ["custom", "Custom size", "Enter width and height", "ruler"],
    ["measure", "Not sure", "Please measure for me", "tape"]
  ];
  var HW_STD = [
    ["Lever lockset", "Keyed or passage lever", "lever"], ["Deadbolt", "Added security", "lock"], ["Panic / exit device", "Push bar for egress", "panic"],
    ["Door closer", "Controlled self-closing", "closer"], ["Keypad / access control", "Code or card entry", "keypad"], ["Hinges / pivots", "Heavy-duty or continuous", "hinge"],
    ["Kick plate & accessories", "Protection plates, stops, seals", "plate"], ["Recommend for me", "We'll spec the hardware", "help"]
  ];
  var HW_BARN = [
    ["Barn track hardware", "Black flat track & rollers", "track"], ["Door pull / handle", "Pulls and flush pulls", "lever"], ["Privacy latch", "Simple lock for bed/bath", "lock"],
    ["Soft-close", "Gentle stop at each end", "closer"], ["Recommend for me", "We'll pick matching hardware", "help"]
  ];

  var state = { type: null, material: null, size: null, hardware: [] };
  var step = 1, MAX = 5;
  var btnNext = $("#b-next"), btnBack = $("#b-back"), btnSend = $("#b-send"), btnRestart = $("#b-restart");

  function optHTML(value, title, sub, icon, multi, selected) {
    return '<button type="button" class="opt" ' + (multi ? 'aria-pressed="' + selected + '"' : 'role="radio" aria-checked="' + selected + '"') + ' data-value="' + value + '">' +
      '<span class="opt__icon">' + (ICON[icon] || ICON.door) + '</span>' +
      '<span class="opt__text"><strong>' + title + '</strong><small>' + sub + '</small></span><span class="opt__tick"></span></button>';
  }
  function labelOf(list, v, idx) { for (var i = 0; i < list.length; i++) { var it = list[i]; var key = Array.isArray(it) ? it[0] : it.v; if (key === v) return Array.isArray(it) ? it[idx || 1] : it.t; } return v; }

  function renderStep() {
    var box;
    if (step === 1) {
      box = $('[data-field="type"]');
      box.innerHTML = TYPES.map(function (o) { return optHTML(o.v, o.t, o.s, o.i, false, state.type === o.v); }).join("");
    }
    if (step === 2) {
      box = $('[data-field="material"]');
      var mats = (MATERIALS[state.type] || []).concat([["recommend", "Recommend for me", "We'll suggest the right fit", "star"]]);
      box.innerHTML = mats.map(function (m) { return optHTML(m[0], m[1], m[2], m[3], false, state.material === m[0]); }).join("");
    }
    if (step === 3) {
      box = $('[data-field="size"]');
      box.innerHTML = SIZES.map(function (s) { return optHTML(s[0], s[1], s[2], s[3], false, state.size === s[0]); }).join("");
      $("#custom-size").hidden = state.size !== "custom";
    }
    if (step === 4) {
      box = $('[data-field="hardware"]');
      var hw = state.type === "barn" ? HW_BARN : HW_STD;
      box.innerHTML = hw.map(function (h) { return optHTML(h[0], h[0], h[1], h[2], true, state.hardware.indexOf(h[0]) > -1); }).join("");
    }
    if (step === 5) {
      $("#builder-summary").innerHTML = summaryRows().map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
    }
    $$(".builder__panel").forEach(function (p) { p.hidden = +p.getAttribute("data-step") !== step; });
    $$("[data-step-dot]").forEach(function (d) {
      var n = +d.getAttribute("data-step-dot");
      d.classList.toggle("is-active", n === step); d.classList.toggle("is-done", n < step);
    });
    btnBack.hidden = step === 1;
    btnRestart.hidden = step !== MAX;
    btnNext.hidden = step === MAX;
    btnSend.hidden = step !== MAX;
    updateNext();
  }
  function sizeText() {
    if (state.size === "custom") {
      var w = $("#size-w").value, h = $("#size-h").value, q = $("#size-q").value || 1;
      return "Custom: " + (w || "?") + "\" W × " + (h || "?") + "\" H" + (q > 1 ? " (qty " + q + ")" : "");
    }
    return labelOf(SIZES, state.size);
  }
  function summaryRows() {
    var mats = (MATERIALS[state.type] || []).concat([["recommend", "Recommend for me"]]);
    return [
      ["Door type", labelOf(TYPES, state.type)],
      ["Material", labelOf(mats, state.material)],
      ["Size", sizeText()],
      ["Hardware", state.hardware.length ? state.hardware.join(", ") : "None selected"]
    ];
  }
  function updateNext() {
    var ok = false;
    if (step === 1) ok = !!state.type;
    if (step === 2) ok = !!state.material;
    if (step === 3) ok = !!state.size && (state.size !== "custom" || ($("#size-w").value && $("#size-h").value));
    if (step === 4) ok = state.hardware.length > 0;
    btnNext.disabled = !ok;
  }
  $("#door-builder").addEventListener("click", function (e) {
    var opt = e.target.closest(".opt"); if (!opt) return;
    var field = opt.parentElement.getAttribute("data-field"), v = opt.getAttribute("data-value");
    if (field === "hardware") {
      var i = state.hardware.indexOf(v);
      if (v === "Recommend for me") state.hardware = i > -1 ? [] : ["Recommend for me"];
      else {
        state.hardware = state.hardware.filter(function (h) { return h !== "Recommend for me"; });
        if (i > -1) state.hardware.splice(state.hardware.indexOf(v), 1); else state.hardware.push(v);
      }
    } else {
      if (field === "type" && state.type !== v) { state.material = null; state.hardware = []; }
      state[field] = v;
    }
    renderStep();
    if (field === "size" && v === "custom") $("#size-w").focus();
  });
  ["#size-w", "#size-h", "#size-q"].forEach(function (s) { $(s).addEventListener("input", updateNext); });
  function scrollBuilderTop() {
    var top = $("#door-builder").getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 12);
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  }
  btnNext.addEventListener("click", function () { if (!btnNext.disabled && step < MAX) { step++; renderStep(); scrollBuilderTop(); } });
  btnBack.addEventListener("click", function () { if (step > 1) { step--; renderStep(); scrollBuilderTop(); } });
  btnRestart.addEventListener("click", function () {
    state = { type: null, material: null, size: null, hardware: [] }; $("#builder-notes").value = ""; step = 1; renderStep(); scrollBuilderTop();
  });

  var attached = null;
  btnSend.addEventListener("click", function () {
    var rows = summaryRows();
    var notes = $("#builder-notes").value.trim();
    attached = rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n") + (notes ? "\nNotes: " + notes : "");
    $("#builder-attach-text").textContent = attached;
    $("#builder-attach").hidden = false;
    var t = TYPES.filter(function (o) { return o.v === state.type; })[0];
    if (t) setSelect(qType, t.project);
    var msg = $("#q-msg");
    if (!msg.value.trim()) msg.value = "I'd like a quote for the door I put together in the door builder" + (notes ? ". " + notes : ".");
    showForm();
    document.getElementById("quote").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { $("#q-name").focus({ preventScroll: true }); }, 700);
  });
  $("#attach-remove").addEventListener("click", function () { attached = null; $("#builder-attach").hidden = true; });
  renderStep();

  /* ---------- Quote form ---------- */
  var form = $("#quote-form"), done = $("#quote-done");
  function validField(el) {
    var v = el.value.trim(), ok = !!v;
    if (ok && el.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (ok && el.type === "tel") ok = v.replace(/\D/g, "").length >= 7;
    el.closest(".field").classList.toggle("is-invalid", !ok);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }
  $$("[required]", form).forEach(function (el) {
    el.addEventListener("blur", function () { if (el.value.trim()) validField(el); });
    el.addEventListener("input", function () { if (el.closest(".field").classList.contains("is-invalid")) validField(el); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    $$("[required]", form).forEach(function (el) { if (!validField(el) && !firstBad) firstBad = el; });
    if (firstBad) { firstBad.focus(); return; }
    var d = {
      name: $("#q-name").value.trim(), phone: $("#q-phone").value.trim(), email: $("#q-email").value.trim(),
      city: $("#q-city").value.trim(), type: qType.value, when: $("#q-when").value, msg: $("#q-msg").value.trim()
    };
    var subject = "Quote request: " + d.type + " (" + d.name + ")";
    var body = "Name: " + d.name + "\nPhone: " + d.phone + "\nEmail: " + d.email +
      (d.city ? "\nProject location: " + d.city : "") + "\nProject type: " + d.type +
      (d.when ? "\nTimeline: " + d.when : "") + "\n\nProject details:\n" + d.msg +
      (attached ? "\n\nDoor builder selections:\n" + attached : "") + "\n\nSent from the Bluegrass Commercial Door & More website";
    var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    $("#done-mailto").href = href;
    $("#done-name").textContent = d.name.split(" ")[0];
    form.hidden = true; done.hidden = false; done.focus();
    window.location.href = href;
  });
  function showForm() { form.hidden = false; done.hidden = true; }
  $("#quote-reset").addEventListener("click", function () {
    form.reset(); attached = null; $("#builder-attach").hidden = true;
    $$(".field", form).forEach(function (f) { f.classList.remove("is-invalid"); });
    showForm(); $("#q-name").focus();
  });

  /* ---------- Help chat ---------- */
  var chatPanel = $("#chat-panel"), chatLog = $("#chat-log"), chatChips = $("#chat-chips"), chatInput = $("#chat-input"), chatOpenBtn = $("#chat-open");
  var started = false;
  var CHIPS = ["Services", "Scheduling & hours", "Service area", "Broken door", "Get a quote", "Contact info"];
  function openChat() {
    chatPanel.hidden = false; chatWrap.classList.add("is-open"); chatOpenBtn.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      bot("Hi there! Thanks for visiting <strong>Bluegrass Commercial Door &amp; More</strong>. What can we help you with today?");
      renderChips(CHIPS);
    }
    setTimeout(function () { if (window.innerWidth >= 640) chatInput.focus(); }, 50);
  }
  function closeChat() { if (chatPanel.hidden) return; chatPanel.hidden = true; chatWrap.classList.remove("is-open"); chatOpenBtn.setAttribute("aria-expanded", "false"); if (window.innerWidth >= 1024) chatOpenBtn.focus(); }
  chatOpenBtn.addEventListener("click", openChat);
  $$("[data-open-chat]").forEach(function (b) { b.addEventListener("click", openChat); });
  $("#chat-close").addEventListener("click", closeChat);
  function scrollLog() { chatLog.scrollTop = chatLog.scrollHeight; }
  function bot(html, actions) {
    var m = document.createElement("div"); m.className = "msg msg--bot"; m.innerHTML = html;
    if (actions && actions.length) {
      var a = document.createElement("div"); a.className = "msg__actions";
      a.innerHTML = actions.map(function (x) {
        return x.href ? '<a href="' + x.href + '"' + (x.alt ? ' class="alt"' : "") + ">" + x.label + "</a>"
          : '<button type="button" data-go="' + x.go + '"' + (x.alt ? ' class="alt"' : "") + ">" + x.label + "</button>";
      }).join("");
      m.appendChild(a);
    }
    chatLog.appendChild(m); scrollLog();
  }
  function user(text) { var m = document.createElement("div"); m.className = "msg msg--user"; m.textContent = text; chatLog.appendChild(m); scrollLog(); }
  function renderChips(list) { chatChips.innerHTML = list.map(function (c) { return '<button type="button">' + c + "</button>"; }).join(""); }
  var CALL = { href: TEL, label: "Call " + PHONE };
  var MAIL = { href: "mailto:" + EMAIL, label: "Email us", alt: true };
  var INTENTS = [
    { k: /(emergenc|broken|break[- ]?in|won'?t (close|lock|latch|open)|stuck|damag|urgent|asap|right away|kicked|smash|repair|fix)/i, r: function () {
      bot("Sorry to hear that! For a broken, damaged or unsecured door, please <strong>call our office right away at " + PHONE + "</strong> so we can get you taken care of as quickly as possible.", [CALL, { go: "quote", label: "Send details", alt: true }]); } },
    { k: /(flag ?pole|flag)/i, r: function () {
      bot("Yes, we install flagpoles! Our professionally installed flagpoles are built to stand tall through the toughest weather, so you can proudly fly your American and state flags every day.", [{ go: "quote", label: "Request a flagpole quote" }, CALL]); } },
    { k: /(fire|rated|code|egress|panic|exit device|stairwell)/i, r: function () {
      bot("We provide <strong>code-compliant fire-rated doors</strong> along with hollow metal doors and frames and the hardware to go with them (closers, exit devices, and more). Tell us about your openings and we'll help you get it right.", [{ go: "builder", label: "Build my door" }, { go: "quote", label: "Request a quote", alt: true }]); } },
    { k: /(storefront|glass|entrance|entry|commercial|business|office|retail|industrial|security|safe ?room)/i, r: function () {
      bot("For businesses we offer <strong>complete commercial entrance solutions</strong>: storefront doors and glass, code-compliant fire-rated doors, and durable security doors. We also do safe room doors for homes and businesses.", [{ go: "builder", label: "Build my door" }, { go: "quote", label: "Request a quote", alt: true }]); } },
    { k: /(residential|home|house|interior|barn|closet|replace|replacement|remodel|swing)/i, r: function () {
      bot("We do residential too! That includes interior and exterior swing doors, replacement doors, safe room doors, and custom door solutions like sliding barn doors, for new construction or remodeling.", [{ go: "gallery", label: "See our work" }, { go: "quote", label: "Request a quote", alt: true }]); } },
    { k: /(price|cost|how much|quote|estimate|bid|pricing)/i, r: function () {
      bot("Every opening is a little different, so we quote each project individually. The fastest way is to use our <strong>Door Builder</strong> (it takes about a minute) or send a quote request, and our office will follow up.", [{ go: "builder", label: "Build my door" }, { go: "quote", label: "Request a quote", alt: true }]); } },
    { k: /(hour|open|close[sd]?\b|schedul|appointment|when can|availability|available|time)/i, r: function () {
      bot("The best way to get on the schedule is to <strong>call our office at " + PHONE + "</strong>. You can also send a quote request any time, and we'll reach out to set things up.", [CALL, { go: "quote", label: "Request a quote", alt: true }]); } },
    { k: /(area|serve|service area|travel|county|where|location|located|near|bowling green|warren|kentucky|\bky\b|come to)/i, r: function () {
      bot("We're based at <strong>930 Gordon Avenue in Bowling Green, KY</strong> and serve <strong>Warren County and the surrounding area</strong>. Not sure if you're in range? Just give us a call at " + PHONE + ".", [{ go: "area", label: "View map" }, CALL]); } },
    { k: /(service|offer|what do you|do you do|products|hardware|frame|partition|accessor|door)/i, r: function () {
      bot("We're your door specialists! We handle <strong>doors, frames, hardware, partitions, accessories and flag poles</strong> for commercial and residential projects: storefronts and glass, fire-rated and hollow metal, security and safe room doors, interior and exterior doors, and flagpoles. Fabrication is done by our in-house team.", [{ go: "services", label: "View services" }, { go: "builder", label: "Build my door", alt: true }]); } },
    { k: /(contact|phone|call|email|e-mail|address|talk|speak|person|human|someone)/i, r: function () {
      bot("You can reach us at:<br>&#9742; <a href='" + TEL + "'>" + PHONE + "</a><br>&#9993; <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a><br>930 Gordon Avenue, Bowling Green, KY 42101", [CALL, MAIL]); } },
    { k: /(thank|thanks|thx|appreciate)/i, r: function () { bot("You're welcome! If anything else comes up, we're just a call away at " + PHONE + "."); } },
    { k: /^(hi|hello|hey|howdy|good (morning|afternoon|evening))\b/i, r: function () { bot("Hello! How can we help? Pick a topic below or type your question."); } }
  ];
  var CHIP_MAP = { "Services": "services", "Scheduling & hours": "hours", "Service area": "service area", "Broken door": "broken door", "Get a quote": "quote", "Contact info": "contact" };
  function answer(text) {
    for (var i = 0; i < INTENTS.length; i++) { if (INTENTS[i].k.test(text)) { INTENTS[i].r(); return; } }
    bot("That's a great question for our team. Give us a call at <strong>" + PHONE + "</strong> or send us an email, and we'll be glad to help.", [CALL, MAIL]);
  }
  function ask(text, query) {
    user(text);
    var t = document.createElement("div"); t.className = "msg msg--bot msg--typing"; t.innerHTML = "<i></i><i></i><i></i>"; chatLog.appendChild(t); scrollLog();
    setTimeout(function () { t.remove(); answer(query || text); }, 550);
  }
  chatChips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) ask(b.textContent, CHIP_MAP[b.textContent]); });
  $("#chat-form").addEventListener("submit", function (e) { e.preventDefault(); var v = chatInput.value.trim(); if (!v) return; chatInput.value = ""; ask(v); });
  chatLog.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]"); if (!b) return;
    var go = b.getAttribute("data-go");
    var target = { quote: "#quote", builder: "#builder", gallery: "#projects", area: "#area", services: "#services" }[go];
    if (window.innerWidth < 640) closeChat();
    var el = $(target); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
