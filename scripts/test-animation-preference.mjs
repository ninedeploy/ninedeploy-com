import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/animation-preference.ts", import.meta.url), "utf8");
const exports = {};
runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
const { createAnimationPreference, ANIMATION_STORAGE_KEY: key } = exports;

function browser({ value = null, reduced = false, denied = false } = {}) {
  const events = new Map(), mediaEvents = new Map(), storage = new Map();
  if (value !== null) storage.set(key, value);
  const media = { matches: reduced, addEventListener: (k, fn) => mediaEvents.set(k, fn), removeEventListener: k => mediaEvents.delete(k) };
  const win = {
    matchMedia: () => media,
    localStorage: {
      getItem: k => { if (denied) throw Error("denied"); return storage.get(k) ?? null; },
      setItem: (k, v) => { if (denied) throw Error("denied"); storage.set(k, v); },
    },
    addEventListener: (k, fn) => events.set(k, fn), removeEventListener: k => events.delete(k),
  };
  return { win, media, events, mediaEvents, storage };
}

test("OS preference is the first-visit default; explicit choices survive reload and override it", () => {
  for (const reduced of [false, true]) {
    const b = browser({ reduced }), s = createAnimationPreference(b.win);
    assert.equal(s.getSnapshot(), !reduced);
    s.setEnabled(reduced);
    assert.equal(s.getSnapshot(), reduced);
    assert.equal(b.storage.get(key), reduced ? "on" : "off");
    assert.equal(createAnimationPreference(b.win).getSnapshot(), reduced);
  }
  assert.equal(createAnimationPreference(browser({ value: "invalid", reduced: true }).win).getSnapshot(), false);
});

test("subscribers share changes, follow OS only without an explicit choice, and release listeners", () => {
  const b = browser(), s = createAnimationPreference(b.win);
  let changes = 0;
  const unA = s.subscribe(() => changes++), unB = s.subscribe(() => changes++);
  b.media.matches = true; b.mediaEvents.get("change")();
  assert.equal(s.getSnapshot(), false); assert.equal(changes, 2);
  s.setEnabled(true); assert.equal(changes, 4);
  b.mediaEvents.get("change")(); assert.equal(changes, 4);
  unA(); assert.equal(b.events.size, 1);
  unB(); assert.equal(b.events.size + b.mediaEvents.size, 0);
});

test("cross-tab changes and storage clearing synchronize without unrelated storage interference", () => {
  const b = browser(), s = createAnimationPreference(b.win);
  const unsubscribe = s.subscribe(() => {});
  const emit = event => b.events.get("storage")({ storageArea: b.win.localStorage, ...event });
  emit({ key, newValue: "off" }); assert.equal(s.getSnapshot(), false);
  emit({ key: "nd-theme", newValue: "on" }); assert.equal(s.getSnapshot(), false);
  emit({ key, newValue: "on", storageArea: {} }); assert.equal(s.getSnapshot(), false);
  emit({ key, newValue: "on" }); assert.equal(s.getSnapshot(), true);
  b.media.matches = true;
  emit({ key: null, newValue: null }); assert.equal(s.getSnapshot(), false);
  unsubscribe();
});

test("unavailable storage still permits toggling for this visit", () => {
  const s = createAnimationPreference(browser({ reduced: true, denied: true }).win);
  assert.equal(s.getSnapshot(), false);
  s.setEnabled(true); assert.equal(s.getSnapshot(), true);
  s.setEnabled(false); assert.equal(s.getSnapshot(), false);
});
