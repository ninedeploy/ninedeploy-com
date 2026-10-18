// CSS pixels and seconds. Shared by the SVG renderer and its lifecycle tests.
export const backgroundConfig = {
  tileHeight: 720,
  desktopObjects: 18,
  mobileObjects: 5,
  maxObjects: 120,
  pointerRadius: 180,
  pointerForce: 24,
  pulseRadius: 220,
  pulseLife: 2.2,
  maxPulses: 4,
  particlesPerPulse: 8,
  idleAfter: 4,
  tapSlop: 9,
} as const;

const ns = "http://www.w3.org/2000/svg";
const controls = "a,button,input,select,textarea,summary,[role='button'],[role='tab'],[role='dialog'],[contenteditable='true'],[data-field-ignore],h1,h2,h3,p,pre,code";
type Pulse = { x: number; y: number; scroll: number; age: number; variant: number };
type Shape = { el: SVGGElement; depth: number; slot: number; column: number };
const seed = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

/** Mount once; the root SVG persists across App Router navigations. */
export function animateSiteBackground(svg: SVGSVGElement) {
  const config = backgroundConfig;
  const field = svg.querySelector<SVGGElement>("[data-field-objects]")!;
  const effects = svg.querySelector<SVGGElement>("[data-field-effects]")!;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)");
  let width = 0, height = 0, frame = 0, last = 0, clock = 0, drift = 0, activity = -10;
  let visible = false, disposed = false, reduced = media.matches;
  let shapes: Shape[] = [], pulses: Pulse[] = [];
  let pointer = { x: -1000, y: -1000, strength: 0, inside: false };
  let down: { x: number; y: number; scroll: number; id: number; at: number } | null = null;
  let interactions = 0;
  const create = (name: string, attributes: Record<string, string | number>, parent: SVGElement) => {
    const el = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
    parent.appendChild(el);
    return el;
  };
  // Fixed pools; clicks reuse these nodes instead of appending to the DOM.
  const bursts = Array.from({ length: config.maxPulses }, () => {
    const group = create("g", { opacity: 0 }, effects);
    const ring = create("circle", { fill: "none", "stroke-width": 1.3, r: 0 }, group);
    const dots = Array.from({ length: config.particlesPerPulse }, () =>
      create("rect", { width: 3, height: 3, rx: 1, fill: "currentColor", stroke: "none" }, group));
    return { group, ring, dots };
  });
  const paint = (dt: number) => {
    clock += dt;
    const speed = clock - activity > config.idleAfter ? 0.4 : 1;
    if (!reduced) drift += dt * speed;
    pointer.strength += ((pointer.inside && !reduced ? 1 : 0) - pointer.strength) * Math.min(1, dt * 6);
    const scroll = window.scrollY;
    pulses = pulses.filter(p => (p.age += dt) < config.pulseLife);
    let active = 0;
    for (const shape of shapes) {
      const factor = reduced ? 1 : 1 - shape.depth * 0.055;
      const world = scroll * factor;
      const tile = Math.floor(world / config.tileHeight) + shape.slot - 1;
      const id = tile * 53 + shape.column * 7;
      const x = (0.03 + seed(id) * 0.94) * width;
      const y = (tile + seed(id + 2)) * config.tileHeight - world;
      const onScreen = y > -80 && y < height + 80;
      shape.el.style.display = onScreen ? "" : "none";
      if (!onScreen) continue;
      active++;
      let px = x + Math.sin(drift * 0.16 + id) * 14 * shape.depth;
      let py = y + Math.cos(drift * 0.12 + id) * 18 * shape.depth;
      const dx = px - pointer.x, dy = py - pointer.y, distance = Math.hypot(dx, dy);
      const force = Math.max(0, 1 - distance / config.pointerRadius) ** 2 * config.pointerForce * pointer.strength;
      if (distance > 0) { px += dx / distance * force; py += dy / distance * force; }
      for (const p of pulses) {
        const cy = p.y - (scroll - p.scroll);
        const d = Math.hypot(px - p.x, py - cy);
        const radius = config.pulseRadius * (1 - (1 - p.age / config.pulseLife) ** 2);
        const push = Math.max(0, 1 - Math.abs(d - radius) / 48) * (1 - p.age / config.pulseLife) * 12;
        if (d > 0) { px += (px - p.x) / d * push; py += (py - cy) / d * push; }
      }
      const edge = Math.max(0, Math.min(1, (py + 50) / 100, (height + 50 - py) / 100));
      const quiet = x > width * 0.14 && x < width * 0.86 ? 0.45 : 1;
      shape.el.setAttribute("opacity", String(edge * quiet * (0.45 + shape.depth * 0.3)));
      shape.el.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(Math.sin(drift * 0.08 + id) * 9).toFixed(2)})`);
    }
    bursts.forEach((burst, i) => {
      const p = pulses[i];
      if (!p) { burst.group.setAttribute("opacity", "0"); return; }
      const progress = p.age / config.pulseLife;
      const radius = config.pulseRadius * (1 - (1 - progress) ** 2);
      const y = p.y - (scroll - p.scroll);
      burst.group.setAttribute("transform", `translate(${p.x} ${y})`);
      burst.group.setAttribute("color", p.variant % 2 ? "var(--green)" : "var(--blue)");
      burst.group.setAttribute("opacity", String(Math.min(1, progress * 9) * (1 - progress) ** 2));
      burst.ring.setAttribute("r", String(radius));
      burst.dots.forEach((dot, n) => {
        const angle = n * Math.PI * 2 / config.particlesPerPulse + p.variant * 0.25;
        dot.setAttribute("transform", `translate(${Math.cos(angle) * radius * 0.85} ${Math.sin(angle) * radius * 0.85})`);
      });
    });
    // State is only diagnostic; no React renders or layout reads in the loop.
    if (svg.dataset.active !== String(active)) svg.dataset.active = String(active);
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden || reduced) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now; paint(dt); frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (!visible || document.hidden) { pulses = []; down = null; pointer.inside = false; pointer.strength = 0; }
    svg.dataset.animation = reduced ? "reduced" : visible && !document.hidden ? "running" : "paused";
    if (visible && !document.hidden) {
      if (reduced) paint(0);
      else frame = requestAnimationFrame(tick);
    }
  };
  const resize = () => {
    width = svg.clientWidth; height = svg.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const columns = width < 768 ? config.mobileObjects : Math.min(24, Math.max(10, Math.round(width / 1440 * config.desktopObjects)));
    const slots = Math.ceil(height / config.tileHeight) + 2;
    field.replaceChildren(); shapes = [];
    for (let slot = 0; slot < slots; slot++) {
      for (let column = 0; column < columns && shapes.length < config.maxObjects; column++) {
        const el = create("g", { color: column % 2 ? "var(--green)" : "var(--blue)" }, field) as SVGGElement;
        const depth = 0.4 + column % 3 * 0.3;
        create("path", { d: "M-52 0H-22L-10 -12H18L30 0H64", opacity: 0.45 }, el);
        if (column % 3 === 0) create("rect", { x: -7, y: -7, width: 14, height: 14, rx: 3 }, el);
        else if (column % 3 === 1) create("path", { d: "M0 -10L9 -5V5L0 10L-9 5V-5Z" }, el);
        else create("circle", { r: 6 }, el);
        create("circle", { cx: 30, cy: 0, r: 1.8, fill: "currentColor", stroke: "none" }, el);
        shapes.push({ el, depth, slot, column });
      }
    }
    svg.dataset.objects = String(shapes.length);
    sync();
  };
  const excluded = (e: PointerEvent) => e.target instanceof Element && !!e.target.closest(controls);
  const move = (e: PointerEvent) => {
    if (coarse.matches || e.pointerType === "touch") return;
    pointer = { x: e.clientX, y: e.clientY, strength: pointer.strength, inside: !excluded(e) };
    activity = clock;
  };
  const leave = () => { pointer.inside = false; down = null; };
  const press = (e: PointerEvent) => {
    if (excluded(e) || e.button !== 0 || !e.isPrimary) return;
    down = { x: e.clientX, y: e.clientY, scroll: window.scrollY, id: e.pointerId, at: performance.now() };
  };
  const release = (e: PointerEvent) => {
    const start = down; down = null;
    if (!start || excluded(e) || reduced || start.id !== e.pointerId || performance.now() - start.at > 600) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > config.tapSlop || Math.abs(window.scrollY - start.scroll) > config.tapSlop || window.getSelection()?.toString()) return;
    activity = clock;
    pulses = [...pulses.slice(-(config.maxPulses - 1)), { x: e.clientX, y: e.clientY, scroll: window.scrollY, age: 0, variant: interactions++ % 3 }];
    svg.dataset.interactions = String(interactions);
  };
  const preference = () => { reduced = media.matches; pulses = []; pointer.inside = false; pointer.strength = 0; sync(); };
  const scroll = () => { down = null; pointer.inside = false; if (reduced && visible && !document.hidden) paint(0); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(svg);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(svg);
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerleave", leave);
  document.addEventListener("pointerdown", press, { passive: true });
  document.addEventListener("pointerup", release, { passive: true });
  document.addEventListener("pointercancel", leave);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("scroll", scroll, { passive: true });
  media.addEventListener("change", preference);
  resize();
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
    document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave);
    document.removeEventListener("pointerdown", press); document.removeEventListener("pointerup", release);
    document.removeEventListener("pointercancel", leave); document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("scroll", scroll); media.removeEventListener("change", preference);
    field.replaceChildren(); effects.replaceChildren();
  };
}
