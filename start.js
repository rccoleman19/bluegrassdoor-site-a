/* Plain quote forms. Saved the same way as the door builder and the flagpoles page. */
(function () {
  "use strict";
  var PHONE = "270-780-3235";
  var QUOTE_API = { url: "https://esrwugfaqlwttxmfkpkx.supabase.co/rest/v1/quote_requests", key: "sb_publishable_aOUQv3tbsDOP4eTDjbyA6w_RKZBxx8K" };
  var S = window.DoorSpec;
  var R = window.BuilderRules;
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return [].slice.call((root || document).querySelectorAll(s)); };

  var year = $("#year"); if (year) year.textContent = String(new Date().getFullYear());
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

  function fieldErr(el, bad) {
    var f = el.closest(".field"); if (f) f.classList.toggle("is-invalid", bad);
    el.setAttribute("aria-invalid", bad ? "true" : "false");
  }
  function reachOk(phoneEl, emailEl, setEl, errEl) {
    var pv = phoneEl.value.trim(), ev = emailEl.value.trim(), msg = "";
    var pOk = !pv || pv.replace(/\D/g, "").length >= 7;
    var eOk = !ev || /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(ev);
    if (!pv && !ev) msg = "Please give us a phone number or an email address.";
    else if (!pOk) msg = "Please check the phone number (at least 7 digits).";
    else if (!eOk) msg = "That email address doesn't look quite right.";
    setEl.classList.toggle("is-invalid", !!msg);
    errEl.textContent = msg || "Please give us a phone number or an email address.";
    fieldErr(phoneEl, !!msg && (!pOk || (!pv && !ev)));
    fieldErr(emailEl, !!msg && (!eOk || (!pv && !ev)));
    return !msg;
  }
  function sendErr(id, msg) {
    var box = $(id);
    if (!msg) { box.hidden = true; box.innerHTML = ""; return; }
    box.innerHTML = msg; box.hidden = false;
  }
  function postRow(btn, label, row, onOk) {
    if (btn.disabled) return;
    btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.textContent = "Sending\u2026";
    var tries = 0;
    function once() {
      var retry = tries > 0; tries++;
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(QUOTE_API.url, {
        method: "POST", mode: "cors", credentials: "omit", signal: ctl ? ctl.signal : undefined,
        headers: { "Content-Type": "application/json", apikey: QUOTE_API.key, Prefer: "return=minimal" },
        body: JSON.stringify(row)
      }).then(function (r) {
        clearTimeout(timer);
        if (r.ok || (r.status === 409 && retry)) { onOk(); return; }
        if (r.status === 409) { row.reference = S.newRef(); tries = 0; once(); return; }
        throw new Error("HTTP " + r.status);
      }).catch(function () {
        clearTimeout(timer);
        btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = label;
        sendErr(btn.id === "flag-submit" ? "#flag-send-err" : "#door-send-err",
          "<strong>We couldn't send your quote request just now.</strong> Please try again, or call <a href=\"tel:+12707803235\">" + PHONE + "</a>.");
      });
    }
    once();
  }

  var typeEl = $("#door-type"), matEl = $("#door-material"), sizeEl = $("#door-size");
  function syncDoor() {
    var type = typeEl.value;
    $$("#door-material option").forEach(function (opt) {
      if (!opt.value) { opt.hidden = false; return; }
      var ok = !type || opt.getAttribute("data-for").split(" ").indexOf(type) > -1;
      opt.hidden = !ok;
      opt.disabled = !ok;
    });
    if (matEl.selectedOptions[0] && matEl.selectedOptions[0].disabled) matEl.value = "";
    $("#door-custom").hidden = sizeEl.value !== "custom";
    $("#door-hw-std").hidden = type === "barn";
    $("#door-hw-barn").hidden = type !== "barn";
  }
  typeEl.addEventListener("change", syncDoor);
  sizeEl.addEventListener("change", syncDoor);
  syncDoor();

  function conflictSay() {
    var rule = R && R.byId ? R.byId("panic-plus-deadbolt") : null;
    return rule && rule.say ? rule.say : "A panic bar has to open the door in one push, so it can't be combined with a separate deadbolt.";
  }
  function hardwareConflict() {
    if (typeEl.value === "barn") return false;
    var picked = checkedHardware(typeEl.value);
    return picked.indexOf("Deadbolt") > -1 && picked.indexOf("Panic / exit device") > -1;
  }
  $$("#door-hw-std input, #door-hw-barn input").forEach(function (el) {
    el.addEventListener("change", function () {
      var err = $("#door-hw-err");
      if (hardwareConflict()) { err.textContent = conflictSay(); err.classList.add("is-on"); }
      else if (err.textContent === conflictSay()) err.classList.remove("is-on");
    });
  });

  function showShopList() {
    var el = $("#shop-list-note");
    if (!el) return;
    var n = 0;
    try {
      var raw = sessionStorage.getItem("bgd-shop-quote");
      var parsed = raw ? JSON.parse(raw) : [];
      if (parsed && parsed.length) {
        for (var i = 0; i < parsed.length; i++) {
          if (!parsed[i] || !parsed[i].label) continue;
          var q = parseInt(parsed[i].qty, 10);
          n += isFinite(q) && q > 0 ? q : 1;
        }
      }
    } catch (err) { n = 0; }
    if (!n) { el.hidden = true; el.textContent = ""; return; }
    var word = n === 1 ? "1 item" : n + " items";
    el.innerHTML = "You have " + word + " in your shop quote list. <a href=\"shop.html#quote\">Send them</a>";
    el.hidden = false;
  }
  showShopList();

  function checkedHardware(type) {
    var box = type === "barn" ? "#door-hw-barn" : "#door-hw-std";
    var picked = $$(box + " input:checked").map(function (el) { return el.value; });
    if (picked.indexOf("Recommend for me") > -1) return ["Recommend for me"];
    return picked;
  }

  $("#door-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var typeOk = !!typeEl.value;
    fieldErr(typeEl, !typeOk);
    var matOk = !!matEl.value && S.materialsFor(typeEl.value).some(function (m) { return m[0] === matEl.value; });
    fieldErr(matEl, !matOk);
    var sizeOk = !!sizeEl.value;
    fieldErr(sizeEl, !sizeOk);
    var custom = sizeEl.value === "custom";
    var wNum = Math.round(+$("#door-width").value), hNum = Math.round(+$("#door-height").value);
    var wOk = !custom || (wNum >= 12 && wNum <= 240 && hNum >= 12 && hNum <= 240);
    $("#door-custom-err").classList.toggle("is-on", custom && !wOk);
    var hw = checkedHardware(typeEl.value);
    var conflict = hardwareConflict();
    if (conflict) $("#door-hw-err").textContent = conflictSay();
    else $("#door-hw-err").textContent = "Choose at least one hardware option, or Recommend for me.";
    $("#door-hw-err").classList.toggle("is-on", hw.length === 0 || conflict);
    var nameEl = $("#door-name");
    var nameOk = !!nameEl.value.trim();
    fieldErr(nameEl, !nameOk);
    var reach = reachOk($("#door-phone"), $("#door-email"), $("#door-reach"), $("#door-reach-err"));
    if (!typeOk) { typeEl.focus(); return; }
    if (!matOk) { matEl.focus(); return; }
    if (!sizeOk) { sizeEl.focus(); return; }
    if (custom && !wOk) { $("#door-width").focus(); return; }
    if (!hw.length || conflict) { $(typeEl.value === "barn" ? "#door-hw-barn input" : "#door-hw-std input").focus(); return; }
    if (!nameOk) { nameEl.focus(); return; }
    if (!reach) { $("#door-phone").focus(); return; }

    var qty = parseInt($("#door-qty").value, 10);
    if (!isFinite(qty) || qty < 1) qty = 1;
    if (qty > 500) qty = 500;
    var door = {
      type: typeEl.value, material: matEl.value, size: sizeEl.value, hardware: hw,
      cw: custom ? String(Math.round(+$("#door-width").value)) : "",
      ch: custom ? String(Math.round(+$("#door-height").value)) : "",
      qty: qty, loc: S.cleanText($("#door-loc").value, 60)
    };
    if (R) {
      var norm = R.normalize(S.sel(door), { atHardware: true });
      door.hardware = norm.sel.hardware.map(function (k) { return R.HW[k] || k; });
    }
    if (!S.isValid(door)) {
      var say = "";
      if (R) {
        var block = R.evaluate(S.sel(door)).blocking[0];
        say = block ? block.say : "";
      }
      $("#door-hw-err").textContent = say || "That combination is not one the door builder accepts. Change the hardware, or choose Recommend for me.";
      $("#door-hw-err").classList.add("is-on");
      return;
    }
    var contact = S.unpackContact({
      n: nameEl.value, co: $("#door-company").value, p: $("#door-phone").value, e: $("#door-email").value,
      a: $("#door-addr").value, tl: $("#door-when").value, x: $("#door-notes").value
    });
    var ref = S.newRef();
    var base = location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "");
    var row = {
      reference: ref, name: contact.n, company: contact.co || null, phone: contact.p || null, email: contact.e || null,
      project_location: contact.a || null, timeline: contact.tl || null, notes: contact.x || null,
      doors: [S.record(door, 0)], door_count: 1, total_quantity: door.qty || 1,
      build_link: base + "index.html#build=" + S.encode(S.buildPayload([door], ref)),
      office_link: base + "request.html#b=" + S.encode(S.requestPayload([door], contact, ref, new Date())),
      user_agent: String(navigator.userAgent || "").slice(0, 400)
    };
    postRow($("#door-submit"), "Send my door quote request", row, function () {
      var saved = row.doors[0];
      $("#door-ref").textContent = row.reference;
      $("#door-saved").textContent = saved.type + ", " + saved.material + ", " + saved.size + ". Hardware: " + (saved.hardware.join(", ") || "None selected") + ". Quantity: " + saved.quantity + ".";
      $("#door-ask").hidden = true;
      var done = $("#door-done"); done.hidden = false; done.focus();
    });
  });

  $("#flagpole-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = $("#flag-name");
    var nameOk = !!nameEl.value.trim();
    fieldErr(nameEl, !nameOk);
    var reach = reachOk($("#flag-phone"), $("#flag-email"), $("#flag-reach"), $("#flag-reach-err"));
    if (!nameOk) { nameEl.focus(); return; }
    if (!reach) { $("#flag-phone").focus(); return; }
    var contact = S.unpackContact({
      n: nameEl.value, co: $("#flag-company").value, p: $("#flag-phone").value, e: $("#flag-email").value,
      a: $("#flag-addr").value, tl: $("#flag-when").value, x: $("#flag-notes").value
    });
    var ref = S.newRef();
    var page = location.href.split("#")[0];
    var extra = contact.x ? "\n\n" + contact.x : "";
    var row = {
      reference: ref, name: contact.n, company: contact.co || null, phone: contact.p || null, email: contact.e || null,
      project_location: contact.a || null, timeline: contact.tl || null,
      notes: "Flagpole quote." + extra,
      doors: [{
        door: 1, location: "", quantity: 1, type: "Flagpole", type_id: "flagpole",
        material: "", material_id: "", size: "", size_id: "", custom_size: false,
        width_in: null, height_in: null, width: "", height: "", hardware: [],
        good_to_know: ["This is a flagpole quote."]
      }],
      door_count: 1, total_quantity: 1,
      build_link: page, office_link: page,
      user_agent: String(navigator.userAgent || "").slice(0, 400)
    };
    postRow($("#flag-submit"), "Send my flagpole quote", row, function () {
      $("#flag-ref").textContent = row.reference;
      $("#flag-ask").hidden = true;
      var done = $("#flag-done"); done.hidden = false; done.focus();
    });
  });
})();
