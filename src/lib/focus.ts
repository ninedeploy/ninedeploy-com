/** Visible controls only; inert and collapsed content never participates. */
export function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
  )).filter(el => el.tabIndex >= 0 && !el.closest('[inert]') && el.getClientRects().length > 0);
}

/** Keep Tab inside a modal scope, while allowing a separate, higher dialog. */
export function containTab(event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">, root: HTMLElement) {
  if (event.key !== "Tab" || !root.contains(document.activeElement)) return;
  const controls = focusableElements(root);
  const first = controls[0], last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
}
