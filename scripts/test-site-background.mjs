import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/site-background.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function mount({ width = 1440, height = 1080, reduced = false, coarse = false, respectReducedMotion = true } = {}) {
  const targets = [], observers = [], frames = new Map();
  let now = 100, serial = 0;
  const target = () => {
    const events = new Map(); targets.push(events);
    return { addEventListener: (key, fn) => events.set(key, fn), removeEventListener: key => events.delete(key), emit: (key, e) => events.get(key)?.(e) };
  };
  class Element {
    constructor(excluded = false) { this.excluded = excluded; this.children = []; this.attrs = {}; this.style = {}; this.dataset = {}; }
    closest() { return this.excluded; }
    setAttribute(key, value) { this.attrs[key] = value; }
    appendChild(el) { this.children.push(el); }
    replaceChildren() { this.children = []; }
    cloneNode() { const copy = new Element(); copy.attrs = { ...this.attrs }; copy.children = this.children.map(el => el.cloneNode()); return copy; }
  }
  const field = new Element(), effects = new Element(), svg = new Element(), overlay = new Element();
  const highlights = new Element(), pointer = new Element(), trails = new Element();
  svg.clientWidth = width; svg.clientHeight = height;
  svg.querySelector = selector => selector.includes("objects") ? field : effects;
  overlay.querySelector = selector => selector.includes("highlights") ? highlights : selector.includes("pointer") ? pointer : selector.includes("trails") ? trails : effects;
  const doc = { ...target(), hidden: false, createElementNS: () => new Element() };
  const win = { ...target(), scrollY: 0, getSelection: () => ({ toString: () => "" }) };
  const media = { ...target(), matches: reduced };
  const observer = kind => class {
    constructor(fn) { this.fn = fn; this.kind = kind; observers.push(this); }
    observe() {} disconnect() { this.disconnected = true; }
  };
  const exports = {};
  runInNewContext(code, { exports, Element, document: doc, window: win,
    matchMedia: query => query.includes("reduced") ? media : { matches: coarse },
    performance: { now: () => now },
    IntersectionObserver: observer("view"), ResizeObserver: observer("resize"),
    requestAnimationFrame: fn => { frames.set(++serial, fn); return serial; }, cancelAnimationFrame: id => frames.delete(id),
  });
  const cleanup = exports.animateSiteBackground(svg, overlay, respectReducedMotion);
  const step = (dt = 16) => { now += dt; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); };
  const view = value => observers.find(o => o.kind === "view").fn([{ isIntersecting: value }]);
  const event = (x, y, excluded = false) => ({ clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0, pointerType: coarse ? "touch" : "mouse", target: new Element(excluded) });
  const tap = (options = {}) => {
    const x = options.x ?? 500, y = options.y ?? 300;
    doc.emit("pointerdown", event(x, y, options.excluded));
    if (options.swipe) { win.scrollY += 100; win.emit("scroll"); }
    if (options.cancel) doc.emit("pointercancel");
    doc.emit("pointerup", event(x, y, options.excluded));
  };
  return { svg, overlay, field, effects, highlights, pointer, trails, doc, win, media, frames, targets, observers, step, view, tap, cleanup,
    move: (x, y, excluded = false) => doc.emit("pointermove", event(x, y, excluded)),
    resize: (w, h) => { svg.clientWidth = w; svg.clientHeight = h; observers.find(o => o.kind === "resize").fn(); } };
}

test("hidden site pauses, resumes one loop without a time jump, and cleans up", () => {
  const s = mount(); assert.equal(s.frames.size, 0);
  s.view(true); s.step(); assert.equal(s.frames.size, 1);
  const positions = s.field.children.map(el => el.attrs.transform);
  s.doc.hidden = true; s.doc.emit("visibilitychange"); assert.equal(s.frames.size, 0);
  s.doc.hidden = false; s.doc.emit("visibilitychange"); s.step(60000);
  assert.deepEqual(s.field.children.map(el => el.attrs.transform), positions);
  s.view(false); assert.equal(s.frames.size, 0); s.view(true); assert.equal(s.frames.size, 1);
  s.cleanup(); assert.equal(s.frames.size, 0);
  assert.ok(s.targets.every(events => events.size === 0)); assert.ok(s.observers.every(o => o.disconnected));
  assert.equal(s.field.children.length + s.effects.children.length, 0);
  assert.equal(s.highlights.children.length + s.pointer.children.length + s.trails.children.length, 0);
});

const position = el => el?.attrs.transform?.match(/translate\(([-\d.]+) ([-\d.]+)/)?.slice(1).map(Number);

test("explicit enable can override the OS default and still fully clean up active effects", () => {
  const s = mount({ reduced: true, respectReducedMotion: false });
  s.view(true); s.step(); s.move(500, 300); s.tap(); s.step();
  assert.equal(s.svg.dataset.animation, "running");
  assert.equal(s.frames.size, 1);
  s.cleanup();
  assert.equal(s.frames.size, 0);
  assert.ok(s.targets.every(events => events.size === 0));
  assert.equal(s.effects.children.length + s.trails.children.length + s.pointer.children.length, 0);
});

test("vortex eases into an orbit and settles after the pointer leaves", () => {
  const s = mount(), c = mount(); s.view(true); c.view(true); s.step(); c.step();
  const index = s.field.children.findIndex(el => { const p = position(el); return p && p[0] > 120 && p[0] < 1300 && p[1] > 100 && p[1] < 900; });
  const [x, y] = position(s.field.children[index]);
  s.move(x + 35, y); c.move(-1000, -1000); s.step(); c.step();
  let a = position(s.field.children[index]), b = position(c.field.children[index]);
  assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 2, "no first-frame jump");
  for (let n = 0; n < 30; n++) { s.step(); c.step(); }
  a = position(s.field.children[index]); b = position(c.field.children[index]);
  const early = [a[0] - b[0], a[1] - b[1]];
  for (let n = 0; n < 150; n++) { s.step(); c.step(); }
  a = position(s.field.children[index]); b = position(c.field.children[index]);
  const late = [a[0] - b[0], a[1] - b[1]];
  const cross = Math.abs(early[0] * late[1] - early[1] * late[0]);
  assert.ok(cross / (Math.hypot(...early) * Math.hypot(...late)) > 0.3, "stationary pointer produces rotation, not a fixed radial offset");
  s.doc.emit("pointerleave");
  for (let n = 0; n < 220; n++) { s.step(); c.step(); }
  a = position(s.field.children[index]); b = position(c.field.children[index]);
  assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.1, "returns to its ambient path"); s.cleanup(); c.cleanup();
});

test("waves relay between neighbours with bounded pools and expire without cycles", () => {
  const s = mount(); s.view(true); s.step();
  const el = s.field.children.find(el => { const p = position(el); return p && p[0] > 120 && p[0] < 1300 && p[1] > 100 && p[1] < 900; });
  const [x, y] = position(el), count = s.highlights.children.length;
  for (let n = 0; n < 100; n++) s.tap({ x, y });
  let relayed = false, peak = 0;
  for (let n = 0; n < 200; n++) {
    s.step();
    const active = s.highlights.children.filter(el => el.dataset.relay === "active");
    peak = Math.max(peak, active.length); relayed ||= active.length > 0;
    assert.equal(s.highlights.children.length, count);
    for (const link of active) {
      const coordinates = link.attrs.d.match(/[-\d.]+/g).map(Number);
      assert.ok(Math.hypot(coordinates[0] - coordinates[4], coordinates[1] - coordinates[5]) < 280, "no distant cross-page connection");
    }
  }
  assert.ok(relayed, "a hit shape passes its reaction to a neighbour"); assert.ok(peak <= 24, "four clicks, at most six relays each");
  assert.ok(s.highlights.children.every(el => el.dataset.relay !== "active")); assert.equal(s.effects.children.length, 4); s.cleanup();
});

test("organic pointer motion remains consistent at 60 and 120 Hz", () => {
  const run = hz => {
    const s = mount(); s.view(true); s.step(); s.move(220, 210);
    for (let n = 0; n < hz * 2; n++) s.step(1000 / hz);
    const points = s.field.children.map(position); s.cleanup(); return points;
  };
  const slow = run(60), fast = run(120);
  slow.forEach((p, i) => { if (p && fast[i]) assert.ok(Math.hypot(p[0] - fast[i][0], p[1] - fast[i][1]) < 0.8); });
});

test("hover tracking continues over text and interactive content", () => {
  const s = mount(), c = mount(); s.view(true); c.view(true); s.step(); c.step();
  const el = s.field.children.find(el => el.style.display !== "none");
  const [x, y] = el.attrs.transform.match(/translate\(([-\d.]+) ([-\d.]+)/).slice(1).map(Number);
  s.move(x + 20, y + 10, true); c.move(x + 20, y + 10, false);
  for (let n = 0; n < 10; n++) { s.step(); c.step(); }
  assert.deepEqual(s.field.children.map(el => el.attrs.transform), c.field.children.map(el => el.attrs.transform));
  s.cleanup(); c.cleanup();
});

test("scrolling preserves the stationary cursor's reaction", () => {
  const s = mount(), c = mount(); s.view(true); c.view(true); s.step(); c.step();
  const el = s.field.children.find(el => el.style.display !== "none");
  const [x, y] = el.attrs.transform.match(/translate\(([-\d.]+) ([-\d.]+)/).slice(1).map(Number);
  s.move(x + 20, y + 10); c.move(x + 20, y + 10);
  for (let n = 0; n < 10; n++) { s.step(); c.step(); }
  s.win.scrollY = 1; c.win.scrollY = 1; s.win.emit("scroll");
  for (let n = 0; n < 10; n++) { s.step(); c.step(); }
  assert.deepEqual(s.field.children.map(el => el.attrs.transform), c.field.children.map(el => el.attrs.transform));
  s.cleanup(); c.cleanup();
});

test("click waves keep viewport coordinates while scrolling", () => {
  const s = mount(); s.view(true); s.step(); s.tap(); s.step();
  s.win.scrollY = 500; s.win.emit("scroll"); s.step();
  assert.equal(s.effects.children[0].attrs.transform, "translate(500 300)"); s.cleanup();
});

test("reduced motion is static, updates on scroll, and responds to preference changes", () => {
  const s = mount({ reduced: true }); s.view(true);
  assert.equal(s.svg.dataset.animation, "reduced"); assert.equal(s.frames.size, 0);
  const before = s.field.children.map(el => el.attrs.transform);
  s.win.scrollY = 900; s.win.emit("scroll"); assert.notDeepEqual(s.field.children.map(el => el.attrs.transform), before);
  s.tap(); assert.equal(s.svg.dataset.interactions, undefined);
  s.media.matches = false; s.media.emit("change"); assert.equal(s.frames.size, 1);
  s.media.matches = true; s.media.emit("change"); assert.equal(s.frames.size, 0); s.cleanup();
});

test("taps create effects, controls, scrolling, cancellation and selection do not", () => {
  const s = mount({ coarse: true }); s.view(true);
  s.tap({ excluded: true }); s.tap({ swipe: true }); s.tap({ cancel: true });
  assert.equal(s.svg.dataset.interactions, undefined);
  s.win.getSelection = () => ({ toString: () => "selected text" }); s.tap(); assert.equal(s.svg.dataset.interactions, undefined);
  s.win.getSelection = () => ({ toString: () => "" }); s.tap(); assert.equal(s.svg.dataset.interactions, "1"); s.cleanup();
});

test("click and long-scroll stress keep SVG pools bounded, waves expire", () => {
  const s = mount(); s.view(true); s.step();
  const objects = s.field.children.length, bursts = s.effects.children.length;
  const foregroundObjects = s.highlights.children.length, trailObjects = s.trails.children.length;
  for (let n = 0; n < 100; n++) s.tap(); s.step();
  assert.equal(bursts, 4); assert.equal(s.effects.children.length, bursts);
  assert.ok(s.effects.children.some(el => Number(el.attrs.opacity) > 0));
  for (let n = 0; n < 180; n++) { s.win.scrollY = n * 300; s.win.emit("scroll"); s.step(); }
  assert.equal(s.field.children.length, objects); assert.ok(s.effects.children.every(el => el.attrs.opacity === "0"));
  assert.equal(s.highlights.children.length, foregroundObjects); assert.equal(s.trails.children.length, trailObjects);
  assert.ok(s.field.children.some(el => el.style.display === "none")); s.cleanup();
});

test("mobile/4K pools and SVG viewBox stay bounded without raster resolution", () => {
  const s = mount({ width: 375, height: 900 }); assert.equal(s.field.children.length, 20);
  s.resize(3840, 2160); assert.ok(s.field.children.length <= 120);
  assert.equal(s.svg.attrs.viewBox, "0 0 3840 2160"); s.cleanup();
});

test("foreground highlights and cursor fade naturally after leaving, coarse input has no hover", () => {
  const s = mount(); s.view(true); s.step();
  const el = s.field.children.find(el => el.style.display !== "none");
  const [x, y] = el.attrs.transform.match(/translate\(([-\d.]+) ([-\d.]+)/).slice(1).map(Number);
  s.move(x + 20, y + 10, true);
  for (let n = 0; n < 15; n++) { s.step(); s.move(x + 20 + n, y + 10, true); }
  assert.ok(Number(s.pointer.attrs.opacity) > 0.5);
  assert.ok(s.highlights.children.some(el => Number(el.attrs.opacity) > 0.1));
  assert.equal(s.overlay.attrs.viewBox, s.svg.attrs.viewBox);
  s.doc.emit("pointerleave");
  for (let n = 0; n < 140; n++) s.step();
  assert.ok(Number(s.pointer.attrs.opacity) < 0.001);
  assert.ok(s.trails.children.every(el => Number(el.attrs.opacity) === 0)); s.cleanup();
  const mobile = mount({ coarse: true }); mobile.view(true); mobile.step(); mobile.move(500, 300); mobile.step();
  assert.equal(mobile.pointer.attrs.opacity, "0"); mobile.cleanup();
});

test("pointer response is local and refresh rate does not change speed", () => {
  const s = mount(), c = mount(); s.view(true); c.view(true); s.step(); c.step();
  const el = s.field.children.find(el => el.style.display !== "none");
  const [x, y] = el.attrs.transform.match(/translate\(([-\d.]+) ([-\d.]+)/).slice(1).map(Number);
  s.move(x + 20, y + 10); c.move(-1000, -1000);
  for (let n = 0; n < 10; n++) { s.step(); c.step(); }
  const changed = s.field.children.filter((el, i) => el.attrs.transform !== c.field.children[i].attrs.transform).length;
  assert.ok(changed > 0 && changed < s.field.children.length / 2); s.cleanup(); c.cleanup();
  const run = hz => { const f = mount(); f.view(true); f.step(); for (let n = 0; n < hz; n++) f.step(1000 / hz); const p = f.field.children.map(el => el.attrs.transform); f.cleanup(); return p; };
  assert.deepEqual(run(60), run(120));
});
