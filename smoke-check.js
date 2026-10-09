/* Run: node smoke-check.js
   Custom size, required hardware on Recommend for me, and the deadbolt/panic message.
   No network and no quote request row. */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = __dirname;
var fails = [];
function fail(name, detail) {
  fails.push(name + (detail ? ": " + detail : ""));
  console.log("FAIL " + name + (detail ? " — " + detail : ""));
}
function pass(name) { console.log("ok   " + name); }

function loadRules() {
  var ctx = { console: console, self: null, window: null };
  ctx.self = ctx;
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "builder-rules.js"), "utf8"), ctx, { filename: "builder-rules.js" });
  vm.runInContext(fs.readFileSync(path.join(ROOT, "door-spec.js"), "utf8"), ctx, { filename: "door-spec.js" });
  return ctx;
}

function hardwareLine(S, R, door) {
  var res = R.normalize(S.sel(door), { atHardware: true });
  door.hardware = res.sel.hardware.map(function (k) { return R.HW[k] || k; });
  var row = S.rows(door).filter(function (r) { return r[0] === "Hardware"; })[0];
  return row ? row[1] : "";
}

function checkRules() {
  var ctx = loadRules();
  var S = ctx.DoorSpec, R = ctx.BuilderRules;
  if (!S || !S.customOk || !R) { fail("rules load", "DoorSpec missing"); return; }

  var tiny = { type: "hollow", material: "steel", size: "custom", hardware: ["Lever lockset"], cw: "5", ch: "5", qty: 1, loc: "" };
  var ok = { type: "hollow", material: "steel", size: "custom", hardware: ["Lever lockset"], cw: "36", ch: "84", qty: 1, loc: "" };
  var app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  var page = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  if (S.customOk(tiny) || S.isValid(tiny)) fail("custom size", "5 by 5 was accepted");
  else if (!S.customOk(ok) || !S.isValid(ok)) fail("custom size", "36 by 84 was rejected");
  else if (app.indexOf("S.customOk(state)") === -1 || app.indexOf("size-err") === -1) fail("custom size", "builder does not block Next on the size error");
  else if (page.indexOf('id="size-err"') === -1) fail("custom size", "inline error is missing");
  else pass("custom size 12 to 240 blocks Next");

  var fire = hardwareLine(S, R, { type: "fire", material: "steel", size: "single", hardware: ["Recommend for me"], cw: "", ch: "", qty: 1, loc: "" });
  var barn = hardwareLine(S, R, { type: "barn", material: "woodpanel", size: "single", hardware: ["Recommend for me"], cw: "", ch: "", qty: 1, loc: "" });
  if (fire.indexOf("Door closer") === -1) fail("recommend hardware", "fire card: " + fire);
  else if (barn.indexOf("Barn track hardware") === -1) fail("recommend hardware", "barn card: " + barn);
  else pass("Recommend for me keeps the closer and the track");
}

function cls() {
  var list = [];
  return {
    contains: function (c) { return list.indexOf(c) !== -1; },
    add: function (c) { if (list.indexOf(c) === -1) list.push(c); },
    remove: function (c) { var i = list.indexOf(c); if (i !== -1) list.splice(i, 1); },
    toggle: function (c, force) {
      if (force === true) { this.add(c); return true; }
      if (force === false) { this.remove(c); return false; }
      if (this.contains(c)) { this.remove(c); return false; }
      this.add(c); return true;
    }
  };
}

function el(tag, id) {
  var node = {
    tagName: String(tag || "DIV").toUpperCase(), id: id || "", value: "", checked: false,
    hidden: false, disabled: false, children: [], parentElement: null, classList: cls(), textContent: ""
  };
  node.getAttribute = function (k) { return node.attrs ? node.attrs[k] : null; };
  node.setAttribute = function (k, v) { node.attrs = node.attrs || {}; node.attrs[k] = String(v); };
  node.appendChild = function (child) { child.parentElement = node; node.children.push(child); return child; };
  node.closest = function () { return null; };
  node.focus = function () { node._focused = true; };
  node.addEventListener = function (type, fn) { (node._ev = node._ev || {})[type] = (node._ev[type] || []).concat(fn); };
  if (id) node.id = id;
  return node;
}

function treeFind(root, pred, out) {
  out = out || [];
  (root.children || []).forEach(function (child) {
    if (pred(child)) out.push(child);
    treeFind(child, pred, out);
  });
  return out;
}
function byId(root, id) {
  if (root.id === id) return root;
  for (var i = 0; i < (root.children || []).length; i++) {
    var hit = byId(root.children[i], id);
    if (hit) return hit;
  }
  return null;
}
function queryAll(root, sel) {
  var out = [];
  String(sel).split(",").forEach(function (raw) {
    var one = raw.trim();
    if (one.charAt(0) === "#" && one.indexOf(" ") === -1) {
      var hit = byId(root, one.slice(1));
      if (hit) out.push(hit);
      return;
    }
    if (one.charAt(0) === "." && one.indexOf(" ") === -1) {
      treeFind(root, function (node) { return node.classList && node.classList.contains(one.slice(1)); }, out);
      return;
    }
    var bits = one.split(/\s+/);
    if (bits.length === 2 && bits[0].charAt(0) === "#") {
      var id = bits[0].slice(1);
      var checked = bits[1].indexOf(":checked") !== -1;
      var tag = bits[1].replace(":checked", "").toUpperCase();
      treeFind(root, function (node) {
        if (tag && node.tagName !== tag) return false;
        if (checked && !node.checked) return false;
        var p = node;
        while (p) { if (p.id === id) return true; p = p.parentElement; }
        return false;
      }, out);
    }
  });
  return out;
}

function checkStart() {
  var ctx = loadRules();
  var calls = [];
  var body = el("body");
  function add(node) { body.appendChild(node); return node; }
  ["year", "door-custom", "door-hw-err", "door-custom-err", "door-name", "door-phone", "door-email", "door-reach", "door-reach-err", "door-width", "door-height", "shop-list-note"].forEach(function (id) { add(el("div", id)); });
  var typeEl = add(el("select", "door-type"));
  var matEl = add(el("select", "door-material"));
  var steel = el("option");
  steel.value = "steel";
  steel.setAttribute = function (k, v) { steel.attrs = steel.attrs || {}; steel.attrs[k] = v; };
  steel.getAttribute = function (k) { return steel.attrs ? steel.attrs[k] : null; };
  steel.setAttribute("data-for", "hollow fire swing");
  matEl.appendChild(steel);
  matEl.selectedOptions = [steel];
  add(el("select", "door-size"));
  var std = add(el("fieldset", "door-hw-std"));
  var barn = add(el("fieldset", "door-hw-barn"));
  var dead = el("input"); dead.value = "Deadbolt"; std.appendChild(dead);
  var panic = el("input"); panic.value = "Panic / exit device"; std.appendChild(panic);
  var form = add(el("form", "door-form"));
  add(el("form", "flagpole-form"));
  var doc = {
    body: body,
    querySelector: function (sel) { var all = queryAll(body, sel); return all[0] || null; },
    querySelectorAll: function (sel) { return queryAll(body, sel); },
    getElementById: function (id) { return byId(body, id); }
  };
  ctx.document = doc;
  ctx.Date = Date;
  ctx.sessionStorage = { getItem: function () { return null; }, setItem: function () {} };
  ctx.fetch = function () { calls.push(1); return Promise.resolve({ ok: true, status: 201 }); };
  ctx.navigator = { userAgent: "check" };
  ctx.location = { href: "http://local/start.html" };
  typeEl.value = "hollow";
  matEl.value = "steel";
  ctx.document.getElementById("door-size").value = "single";
  ctx.document.getElementById("door-name").value = "Ada";
  ctx.document.getElementById("door-phone").value = "5550100";
  vm.runInContext(fs.readFileSync(path.join(ROOT, "start.js"), "utf8"), ctx, { filename: "start.js" });
  dead.checked = true;
  panic.checked = true;
  (panic._ev.change || []).forEach(function (fn) { fn({}); });
  var err = ctx.document.getElementById("door-hw-err");
  var say = ctx.BuilderRules.byId("panic-plus-deadbolt").say;
  if (!panic.checked || !dead.checked) fail("deadbolt panic", "a box was cleared");
  else if (err.textContent !== say || !err.classList.contains("is-on")) fail("deadbolt panic", err.textContent);
  else {
    (form._ev.submit || []).forEach(function (fn) { fn({ preventDefault: function () {} }); });
    if (calls.length) fail("deadbolt panic", "the form still sent");
    else if (!panic.checked) fail("deadbolt panic", "Panic was dropped on submit");
    else if (err.textContent !== say) fail("deadbolt panic", "submit replaced the message");
    else pass("Deadbolt and Panic keep the builder conflict message");
  }
}

checkRules();
checkStart();
if (fails.length) {
  console.log(fails.length + " failed");
  process.exit(1);
}
console.log("all clear");
