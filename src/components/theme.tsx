"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="nd-theme" disableTransitionOnChange>
      <ThemeColor />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}

/** Keeps the browser UI colour on the site's theme rather than the OS one. */
function ThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = resolvedTheme === "light" ? "#f2f4f7" : "#0a101b";
  }, [resolvedTheme]);
  return null;
}

const noop = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

const choices = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected = mounted ? theme : "system";
  const current = choices.find((choice) => choice.value === selected) ?? choices[2];
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    picker.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    const dismiss = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !picker.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={picker}>
      <button
        ref={trigger}
        type="button"
        className="theme-trigger"
        aria-label={`Color theme: ${current.label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon className="size-[18px]" aria-hidden />
        <span className="theme-trigger-label">{current.label}</span>
        <ChevronDown className={`theme-trigger-chevron size-3.5 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div id={id} role="dialog" aria-label="Appearance" className="theme-panel">
          <p className="font-semibold">Appearance</p>
          <p className="mt-1 text-xs text-muted">Your space, your style.</p>
          <fieldset className="theme-options">
            <legend className="sr-only">Color theme</legend>
            {choices.map(({ value, label, icon: ChoiceIcon }) => (
              <label key={value} className="theme-option">
                <input type="radio" name={`${id}-theme`} value={value} checked={selected === value} onChange={() => setTheme(value)} />
                <span className={`theme-preview theme-preview-${value}`} aria-hidden>
                  <span className="theme-preview-window">
                    <span className="theme-preview-sidebar" />
                    <span className="theme-preview-content"><i /><i /><i /></span>
                  </span>
                  <span className="theme-choice-icon"><ChoiceIcon className="size-3.5" /></span>
                  <span className="theme-choice-check"><Check className="size-3" /></span>
                </span>
                <span className="theme-option-label">{label}</span>
              </label>
            ))}
          </fieldset>
          <p className="theme-panel-status" aria-live="polite">
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {selected === "system" ? "Matches your device’s appearance." : `${current.label} mode, just how you like it.`}
          </p>
        </div>
      )}
    </div>
  );
}
