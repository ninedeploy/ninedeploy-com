import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/components/home/interfaces.tsx", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;

function mountInterfaces({ visible = true, pageVisible = true, reduced = false } = {}) {
  const effects = [], timers = new Map();
  let serial = 0, updates = 0;
  const exports = {};
  const modules = {
    "react": { useState: value => [typeof value === "function" ? value() : value, () => updates++], useEffect: effect => effects.push(effect), useRef: value => ({ current: value }) },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "motion/react": { motion: {}, AnimatePresence: "presence", useInView: () => visible, useReducedMotion: () => reduced },
    "lucide-react": {},
    "@/components/code": { highlight: () => [] },
    "@/lib/tabs": { tabListKeys: () => () => {} },
    "@/lib/site": { site: { stats: { mcpTools: 62 } } },
    "@/lib/page-visibility": { usePageVisible: () => pageVisible },
  };
  runInNewContext(code, { exports, require: name => { assert.ok(name in modules, `unexpected import ${name}`); return modules[name]; },
    setTimeout: fn => { timers.set(++serial, fn); return serial; }, clearTimeout: id => timers.delete(id) });
  exports.Interfaces();
  const cleanups = effects.map(effect => effect());
  return { timers, get updates() { return updates; }, tick: () => { const fns = [...timers.values()]; timers.clear(); fns.forEach(fn => fn()); }, cleanup: () => cleanups.forEach(fn => fn?.()) };
}

test("visible interface demonstration schedules one transition and cleans up", () => {
  const s = mountInterfaces(); assert.equal(s.timers.size, 1); s.cleanup(); assert.equal(s.timers.size, 0);
});
test("offscreen interface demonstration does not advance hidden content", () => {
  const s = mountInterfaces({ visible: false }); s.tick(); assert.equal(s.updates, 0); s.cleanup();
});
test("hidden page and reduced motion never autoplay interface content", () => {
  for (const options of [{ pageVisible: false }, { reduced: true }]) {
    const s = mountInterfaces(options); s.tick(); assert.equal(s.updates, 0); s.cleanup();
  }
});

const focusSource = await readFile(new URL("../src/lib/focus.ts", import.meta.url), "utf8");
const focusCode = ts.transpileModule(focusSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
test("modal focus wraps at both ends, ignores hidden controls and leaves other dialogs alone", () => {
  const doc = { activeElement: null }, exports = {};
  runInNewContext(focusCode, { exports, document: doc });
  const element = (visible = true, inert = false) => ({ tabIndex: 0, closest: () => inert ? {} : null,
    getClientRects: () => visible ? [{}] : [], focus() { doc.activeElement = this; } });
  const first = element(), hidden = element(false), middle = element(), inert = element(true, true), last = element(), portal = element();
  const controls = [first, hidden, middle, inert, last];
  const root = { querySelectorAll: () => controls, contains: el => controls.includes(el) };
  const press = (el, shiftKey = false, key = "Tab") => {
    let prevented = false; doc.activeElement = el;
    exports.containTab({ key, shiftKey, preventDefault: () => { prevented = true; } }, root);
    return prevented;
  };
  assert.equal(press(last), true); assert.equal(doc.activeElement, first);
  assert.equal(press(first, true), true); assert.equal(doc.activeElement, last);
  assert.equal(press(middle), false); assert.equal(doc.activeElement, middle);
  assert.equal(press(portal), false); assert.equal(doc.activeElement, portal);
  assert.equal(press(first, true, "Escape"), false);
});

const navSource = await readFile(new URL("../src/components/docs-nav.tsx", import.meta.url), "utf8");
const navCode = ts.transpileModule(navSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
test("documentation marks the current page with and without a trailing slash", () => {
  for (const pathname of ["/docs/installation", "/docs/installation/"]) {
    const exports = {};
    const modules = {
      "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
      "react": {}, "lucide-react": {}, "next/link": { default: "a" },
      "next/navigation": { usePathname: () => pathname },
      "motion/react": { motion: { span: "span" } },
    };
    runInNewContext(navCode, { exports, require: name => {
      if (name === "@/lib/navigation") {
        const loaded = {};
        runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/navigation.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: loaded });
        return loaded;
      }
      assert.ok(name in modules, `unexpected import ${name}`); return modules[name];
    } });
    const tree = exports.DocsNav({ groups: [{ name: "Start", docs: [{ slug: "installation", title: "Installation" }, { slug: "mcp", title: "MCP" }] }] });
    const links = [];
    const walk = node => { if (Array.isArray(node)) return node.forEach(walk); if (!node?.props) return; if (node.props.href) links.push(node.props); walk(node.props.children); };
    walk(tree);
    assert.equal(links.find(link => link.href === "/docs/installation")["aria-current"], "page", pathname);
    assert.equal(links.find(link => link.href === "/docs/mcp")["aria-current"], undefined);
  }
});

const themeSource = await readFile(new URL("../src/components/theme.tsx", import.meta.url), "utf8");
const themeCode = ts.transpileModule(themeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
test("theme Escape consumes the event before parent navigation and restores focus", () => {
  const exports = {}, effects = [], listeners = new Map();
  let refs = 0, focused = 0, closed = 0;
  const modules = {
    react: {
      useState: () => [true, value => { if (value === false) closed++; }],
      useRef: () => ({ current: refs++ === 0 ? { querySelector: () => ({ focus() {} }) } : { focus: () => focused++ } }),
      useEffect: effect => effects.push(effect), useId: () => "theme-test", useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
    },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "lucide-react": {}, "motion/react": {}, "next-themes": { useTheme: () => ({ theme: "system" }) },
  };
  runInNewContext(themeCode, { exports, require: name => { assert.ok(name in modules, name); return modules[name]; },
    document: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) } });
  exports.ThemePicker();
  const cleanups = effects.map(effect => effect());
  let prevented = false;
  listeners.get("keydown")({ key: "ArrowRight", preventDefault: () => { prevented = true; } });
  assert.equal(closed, 0); assert.equal(prevented, false);
  listeners.get("keydown")({ key: "Escape", preventDefault: () => { prevented = true; } });
  assert.equal(closed, 1); assert.equal(focused, 1); assert.equal(prevented, true);
  cleanups.forEach(fn => fn?.()); assert.equal(listeners.size, 0);
});
