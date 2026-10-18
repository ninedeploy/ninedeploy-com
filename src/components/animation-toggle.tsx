"use client";

import { useSyncExternalStore } from "react";
import { Mouse, MouseOff } from "lucide-react";
import { createAnimationPreference } from "@/lib/animation-preference";

let preference: ReturnType<typeof createAnimationPreference> | undefined;
const getPreference = () => preference ??= createAnimationPreference(window);
const subscribe = (listener: () => void) => getPreference().subscribe(listener);
const getSnapshot = () => getPreference().getSnapshot();
const getServerSnapshot = () => false;

export function useMouseEffects() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function AnimationToggle() {
  const enabled = useMouseEffects();
  const label = enabled ? "Disable mouse effects" : "Enable mouse effects";
  const Icon = enabled ? Mouse : MouseOff;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      title={label}
      onClick={() => getPreference().setEnabled(!enabled)}
      className={`grid size-10 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green ${
        enabled ? "border-green/40 bg-green/10 text-green hover:bg-green/20" : "border-rail text-muted hover:border-rail-strong hover:bg-panel hover:text-ink"
      }`}
    >
      <Icon aria-hidden="true" className={`size-[18px] ${enabled ? "" : "opacity-60"}`} />
    </button>
  );
}
