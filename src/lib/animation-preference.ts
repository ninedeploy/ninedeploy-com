export const ANIMATION_STORAGE_KEY = "nd-animations";

/** One shared preference for the header and background, including other tabs. */
export function createAnimationPreference(browser: Pick<Window, "localStorage" | "matchMedia" | "addEventListener" | "removeEventListener">) {
  const media = browser.matchMedia("(prefers-reduced-motion: reduce)");
  let explicit: boolean | undefined;
  const listeners = new Set<() => void>();
  const parse = (value: string | null) => value === "on" ? true : value === "off" ? false : undefined;
  try { explicit = parse(browser.localStorage.getItem(ANIMATION_STORAGE_KEY)); } catch { /* Storage may be unavailable. */ }
  const getSnapshot = () => explicit ?? !media.matches;
  const notify = () => listeners.forEach(listener => listener());
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== ANIMATION_STORAGE_KEY) return;
    if (event.storageArea && event.storageArea !== browser.localStorage) return;
    explicit = parse(event.newValue);
    notify();
  };
  const onMotion = () => { if (explicit === undefined) notify(); };
  return {
    getSnapshot,
    setEnabled(enabled: boolean) {
      explicit = enabled;
      try { browser.localStorage.setItem(ANIMATION_STORAGE_KEY, enabled ? "on" : "off"); } catch { /* Keep the choice for this visit. */ }
      notify();
    },
    subscribe(listener: () => void) {
      if (!listeners.size) {
        browser.addEventListener("storage", onStorage);
        media.addEventListener("change", onMotion);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          browser.removeEventListener("storage", onStorage);
          media.removeEventListener("change", onMotion);
        }
      };
    },
  };
}
