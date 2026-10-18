// CSS pixels and seconds. Shared by the SVG renderer and its lifecycle tests.
export const backgroundConfig = {
  tileHeight: 720,
  desktopObjects: 18,
  mobileObjects: 5,
  maxObjects: 120,
  pointerRadius: 270,
  pointerForce: 64,
  pointerAttraction: 0.65,
  pointerSwirl: 0.22,
  pulseRadius: 320,
  pulseForce: 48,
  pulseLife: 1.8,
  maxPulses: 4,
  particlesPerPulse: 8,
  idleAfter: 4,
  tapSlop: 9,
  maxTrails: 14,
  trailLife: 0.65,
  glowRadius: 210,
} as const;

const ns = "http://www.w3.org/2000/svg";
const controls = "a,button,input,select,textarea,summary,[role='button'],[role='tab'],[role='dialog'],[contenteditable='true'],[data-field-ignore]";
type Pulse = { x: number; y: number; age: number; variant: number };
type Trail = { x: number; y: number; age: number };
type Shape = { el: SVGGElement; highlight: SVGGElement; link: SVGElement; depth: number; slot: number; column: number };
const seed = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

/** Mount once; the root SVG persists across App Router navigations. */
export function animateSiteBackground(svg: SVGSVGElement, overlay: SVGSVGElement) {
  const config = backgroundConfig;
  const field = svg.querySelector<SVGGElement>("[data-field-objects]")!;
  const effects = overlay.querySelector<SVGGElement>("[data-field-effects]")!;
  const highlights = overlay.querySelector<SVGGElement>("[data-field-highlights]")!;
  const cursor = overlay.querySelector<SVGGElement>("[data-field-pointer]")!;
  const trailLayer = overlay.querySelector<SVGGElement>("[data-field-trails]")!;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)");
  let width = 0, height = 0, frame = 0, last = 0, clock = 0, drift = 0, activity = -10;
  let visible = false, disposed = false, reduced = media.matches;
  let shapes: Shape[] = [], pulses: Pulse[] = [];
  let trails: Trail[] = [];
  let lastTrail = -1;
  let pointer = { x: -1000, y: -1000, strength: 0, inside: false };
  let down: { x: number; y: number; scroll: number; id: number; at: number } | null = null;
  let interactions = 0;
  const create = (name: string, attributes: Record<string, string | number>, parent: SVGElement) => {
    const el = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
    parent.appendChild(el);
    return el;
  };
  create("circle", { r: config.glowRadius, fill: `url(#${overlay.dataset.glowId})`, stroke: "none" }, cursor);
  const orbit = create("circle", { r: 46, stroke: "var(--green)", "stroke-width": 0.8, "stroke-dasharray": "28 16 6 16", opacity: 0.5 }, cursor);
  const trailPool = Array.from({ length: config.maxTrails }, () => ({
    dot: create("circle", { r: 3, fill: "var(--green)", stroke: "none", opacity: 0 }, trailLayer),
    line: create("path", { stroke: "var(--blue)", "stroke-width": 1.5, opacity: 0 }, trailLayer),
  }));
  // Fixed pools; clicks reuse these nodes instead of appending to the DOM.
  const bursts = Array.from({ length: config.maxPulses }, () => {
    const group = create("g", { opacity: 0 }, effects);
    const ring = create("circle", { fill: "none", "stroke-width": 2, r: 0 }, group);
    const echo = create("circle", { fill: "none", "stroke-width": 0.8, r: 0, opacity: 0.65 }, group);
    const dots = Array.from({ length: config.particlesPerPulse }, () =>
      create("rect", { width: 3, height: 3, rx: 1, fill: "currentColor", stroke: "none" }, group));
    return { group, ring, echo, dots };
  });
  const paint = (dt: number) => {
    clock += dt;
    const speed = clock - activity > config.idleAfter ? 0.4 : 1;
    if (!reduced) drift += dt * speed;
    pointer.strength += ((pointer.inside && !reduced ? 1 : 0) - pointer.strength) * Math.min(1, dt * 6);
    const scroll = window.scrollY;
    pulses = pulses.filter(p => (p.age += dt) < config.pulseLife);
    trails = trails.filter(p => (p.age += dt) < config.trailLife);
    cursor.setAttribute("transform", `translate(${pointer.x} ${pointer.y})`);
    cursor.setAttribute("opacity", String(pointer.strength));
    orbit.setAttribute("transform", `rotate(${drift * 12})`);
    trailPool.forEach((item, i) => {
      const p = trails[i], next = trails[i + 1];
      const alpha = p ? (1 - p.age / config.trailLife) ** 2 : 0;
      item.dot.setAttribute("opacity", String(alpha * 0.65));
      item.line.setAttribute("opacity", String(next ? alpha * 0.6 : 0));
      if (!p) return;
      item.dot.setAttribute("cx", String(p.x)); item.dot.setAttribute("cy", String(p.y));
      if (next) item.line.setAttribute("d", `M${p.x} ${p.y}L${next.x} ${next.y}`);
    });
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
      shape.highlight.style.display = onScreen ? "" : "none";
      shape.link.style.display = onScreen ? "" : "none";
      if (!onScreen) continue;
      active++;
      let px = x + Math.sin(drift * 0.16 + id) * 14 * shape.depth;
      let py = y + Math.cos(drift * 0.12 + id) * 18 * shape.depth;
      const dx = px - pointer.x, dy = py - pointer.y, distance = Math.hypot(dx, dy);
      const force = Math.max(0, 1 - distance / config.pointerRadius) ** 2 * config.pointerForce * pointer.strength;
      const direction = shape.column % 3 === 0 ? -config.pointerAttraction : 1;
      if (distance > 0) {
        px += (dx - dy * config.pointerSwirl) / distance * force * direction;
        py += (dy + dx * config.pointerSwirl) / distance * force * direction;
      }
      let pulseLight = 0;
      for (const p of pulses) {
        const cy = p.y;
        const d = Math.hypot(px - p.x, py - cy);
        const radius = config.pulseRadius * (1 - (1 - p.age / config.pulseLife) ** 2);
        const wave = Math.max(0, 1 - Math.abs(d - radius) / 70) * (1 - p.age / config.pulseLife);
        const push = wave * config.pulseForce;
        pulseLight = Math.max(pulseLight, wave);
        if (d > 0) { px += (px - p.x) / d * push; py += (py - cy) / d * push; }
      }
      const edge = Math.max(0, Math.min(1, (py + 50) / 100, (height + 50 - py) / 100));
      const quiet = 0.42 + 0.58 * Math.min(1, Math.abs(x - width / 2) / (width / 2)) ** 1.5;
      shape.el.setAttribute("opacity", String(edge * quiet * (0.45 + shape.depth * 0.3)));
      const transform = `translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(Math.sin(drift * 0.08 + id) * 9).toFixed(2)})`;
      shape.el.setAttribute("transform", transform);
      const proximity = Math.max(0, 1 - distance / config.pointerRadius) ** 1.5 * pointer.strength;
      // Foreground highlights use only radial falloff: no content rectangles/masks.
      shape.highlight.setAttribute("transform", transform);
      shape.highlight.setAttribute("opacity", String(edge * Math.max(proximity * 0.85, pulseLight * 0.8)));
      shape.link.setAttribute("opacity", String(proximity * 0.28 * edge));
      shape.link.setAttribute("d", `M${pointer.x} ${pointer.y}L${px} ${py}`);
    }
    bursts.forEach((burst, i) => {
      const p = pulses[i];
      if (!p) { burst.group.setAttribute("opacity", "0"); return; }
      const progress = p.age / config.pulseLife;
      const radius = config.pulseRadius * (1 - (1 - progress) ** 2);
      const y = p.y;
      burst.group.setAttribute("transform", `translate(${p.x} ${y})`);
      burst.group.setAttribute("color", p.variant % 2 ? "var(--green)" : "var(--blue)");
      burst.group.setAttribute("opacity", String(Math.min(1, progress * 9) * (1 - progress) ** 2));
      burst.ring.setAttribute("r", String(radius));
      burst.echo.setAttribute("r", String(radius * (p.variant % 2 ? 0.7 : 0.86)));
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
    if (!visible || document.hidden) { pulses = []; trails = []; down = null; pointer.inside = false; pointer.strength = 0; }
    svg.dataset.animation = reduced ? "reduced" : visible && !document.hidden ? "running" : "paused";
    if (visible && !document.hidden) {
      if (reduced) paint(0);
      else frame = requestAnimationFrame(tick);
    }
  };
  const resize = () => {
    width = svg.clientWidth; height = svg.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const columns = width < 768 ? config.mobileObjects : Math.min(24, Math.max(10, Math.round(width / 1440 * config.desktopObjects)));
    const slots = Math.ceil(height / config.tileHeight) + 2;
    field.replaceChildren(); highlights.replaceChildren(); shapes = [];
    for (let slot = 0; slot < slots; slot++) {
      for (let column = 0; column < columns && shapes.length < config.maxObjects; column++) {
        const el = create("g", { color: column % 2 ? "var(--green)" : "var(--blue)" }, field) as SVGGElement;
        const depth = 0.4 + column % 3 * 0.3;
        create("path", { d: "M-52 0H-22L-10 -12H18L30 0H64", opacity: 0.45 }, el);
        if (column % 3 === 0) create("rect", { x: -7, y: -7, width: 14, height: 14, rx: 3 }, el);
        else if (column % 3 === 1) create("path", { d: "M0 -10L9 -5V5L0 10L-9 5V-5Z" }, el);
        else create("circle", { r: 6 }, el);
        create("circle", { cx: 30, cy: 0, r: 1.8, fill: "currentColor", stroke: "none" }, el);
        const highlight = el.cloneNode(true) as SVGGElement;
        highlight.setAttribute("opacity", "0"); highlights.appendChild(highlight);
        const link = create("path", { stroke: column % 2 ? "var(--green)" : "var(--blue)", opacity: 0 }, highlights);
        shapes.push({ el, highlight, link, depth, slot, column });
      }
    }
    svg.dataset.objects = String(shapes.length);
    sync();
  };
  const excluded = (e: PointerEvent) => e.target instanceof Element && !!e.target.closest(controls);
  const move = (e: PointerEvent) => {
    if (coarse.matches || e.pointerType === "touch") return;
    const distance = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y);
    if (!reduced && clock - lastTrail > 0.025 && distance > 8) {
      if (distance > config.pointerRadius) trails = [];
      trails = [...trails.slice(-(config.maxTrails - 1)), { x: e.clientX, y: e.clientY, age: 0 }];
      lastTrail = clock;
    }
    pointer = { x: e.clientX, y: e.clientY, strength: pointer.strength, inside: true };
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
    pulses = [...pulses.slice(-(config.maxPulses - 1)), { x: e.clientX, y: e.clientY, age: 0, variant: interactions++ % 3 }];
    svg.dataset.interactions = String(interactions);
  };
  const preference = () => { reduced = media.matches; pulses = []; trails = []; pointer.inside = false; pointer.strength = 0; sync(); };
  const scroll = () => { down = null; if (reduced && visible && !document.hidden) paint(0); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(svg);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(svg);
  document.addEventListener("pointermove", move, { passive: true, capture: true });
  document.addEventListener("pointerleave", leave);
  document.addEventListener("pointerdown", press, { passive: true, capture: true });
  document.addEventListener("pointerup", release, { passive: true, capture: true });
  document.addEventListener("pointercancel", leave);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("scroll", scroll, { passive: true });
  media.addEventListener("change", preference);
  resize();
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
    document.removeEventListener("pointermove", move, true); document.removeEventListener("pointerleave", leave);
    document.removeEventListener("pointerdown", press, true); document.removeEventListener("pointerup", release, true);
    document.removeEventListener("pointercancel", leave); document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("scroll", scroll); media.removeEventListener("change", preference);
    field.replaceChildren(); effects.replaceChildren(); highlights.replaceChildren(); cursor.replaceChildren(); trailLayer.replaceChildren();
  };
}
