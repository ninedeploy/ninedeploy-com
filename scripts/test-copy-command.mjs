import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/components/copy-command.tsx", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;

function mountCopy() {
  const slots = [], effects = [], timers = new Map(), requests = [];
  let cursor = 0, now = 0, serial = 0, unmounted = false, lateUpdates = 0, text = "install command";
  const exports = {};
  const modules = {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], value => { if (unmounted) lateUpdates++; slots[index] = value; }];
      },
      useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
      useEffect(effect, deps) {
        const index = cursor++, previous = slots[index];
        if (!previous || deps.some((value, i) => value !== previous.deps[i])) effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { deps, cleanup: effect() };
        });
      },
    },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "lucide-react": {},
  };
  runInNewContext(code, {
    exports, require: name => { assert.ok(name in modules, name); return modules[name]; },
    navigator: { clipboard: { writeText: text => new Promise((resolve, reject) => requests.push({ text, resolve, reject })) } },
    setTimeout: (fn, delay) => { timers.set(++serial, { fn, due: now + delay }); return serial; },
    clearTimeout: id => timers.delete(id),
  });
  const render = () => {
    cursor = 0;
    const tree = exports.CopyButton({ text });
    effects.splice(0).forEach(effect => effect());
    return tree;
  };
  let button = render();
  return {
    requests, timers,
    click: () => button.props.onClick(),
    label: () => (button = render()).props["aria-label"],
    changeText(value) { text = value; button = render(); },
    get lateUpdates() { return lateUpdates; },
    tick(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) if (timer.due <= now) { timers.delete(id); timer.fn(); }
    },
    cleanup() { unmounted = true; slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test("a single successful copy shows confirmation for 1600ms", async () => {
  const s = mountCopy(), pending = s.click();
  assert.equal(s.requests[0].text, "install command");
  s.requests[0].resolve(); await pending;
  assert.equal(s.label(), "Copied");
  s.tick(1599); assert.equal(s.label(), "Copied");
  s.tick(1); assert.equal(s.label(), "Copy command"); s.cleanup();
});

test("a repeated copy gets a full confirmation window with one timer", async () => {
  const s = mountCopy();
  let pending = s.click(); s.requests[0].resolve(); await pending;
  s.tick(1000);
  pending = s.click(); s.requests[1].resolve(); await pending;
  assert.equal(s.timers.size, 1);
  s.tick(600); assert.equal(s.label(), "Copied");
  s.tick(1000); assert.equal(s.label(), "Copy command"); s.cleanup();
});

test("unmount clears confirmation timers", async () => {
  const s = mountCopy(), pending = s.click(); s.requests[0].resolve(); await pending;
  s.cleanup(); assert.equal(s.timers.size, 0);
  s.tick(2000); assert.equal(s.lateUpdates, 0);
});

test("clipboard completion after unmount cannot update state or schedule work", async () => {
  const s = mountCopy(), pending = s.click(); s.cleanup();
  s.requests[0].resolve(); await pending;
  assert.equal(s.lateUpdates, 0); assert.equal(s.timers.size, 0);
});

test("an older clipboard response cannot overwrite the latest result", async () => {
  const s = mountCopy(), older = s.click(), latest = s.click();
  s.requests[1].reject(new Error("denied")); await latest;
  const label = s.label();
  s.requests[0].resolve(); await older;
  assert.equal(s.label(), label); assert.equal(s.timers.size, 0); s.cleanup();
});

test("clipboard failure gives actionable feedback and can be retried", async () => {
  const s = mountCopy();
  let pending = s.click(); s.requests[0].reject(new Error("denied")); await pending;
  assert.match(s.label(), /Copy failed.*Retry/);
  pending = s.click(); s.requests[1].resolve(); await pending;
  assert.equal(s.label(), "Copied"); s.cleanup();
});

test("switching commands cannot leave an old confirmation stuck on screen", async () => {
  const s = mountCopy(), pending = s.click(); s.requests[0].resolve(); await pending;
  assert.equal(s.label(), "Copied");
  s.tick(800); s.changeText("other command"); assert.equal(s.label(), "Copy command");
  s.tick(800); s.changeText("install command"); assert.equal(s.label(), "Copy command"); s.cleanup();
});
