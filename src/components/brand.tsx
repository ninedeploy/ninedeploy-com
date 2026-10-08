import type { SVGProps } from "react";

/*
 * The NineDeploy mark: a "9" drawn as one open loop with a pin-like tail, a
 * teal core, and two teal base lines. The loop takes the text colour so it
 * works on both themes; the teal stays fixed.
 */
export const LOGO_TEAL = "#7fbcb3";
export const LOGO_INK = "#333d4d";

const LOOP = "M19.3 31 A13 13 0 1 1 29.2 27.2 L18.4 37.6";

export function NineMark({ title = "NineDeploy", ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 40 52" fill="none" role={title ? "img" : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true} {...props}>
      <path d={LOOP} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="18" r="2.6" fill={LOGO_TEAL} />
      <path d="M12.5 43.5h15M12.5 48.5h15" stroke={LOGO_TEAL} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

/** Mark plus the lowercase rounded "nine deploy" wordmark. */
export function Wordmark({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center ${lg ? "gap-3" : "gap-2"} ${className}`}>
      <NineMark className={`${lg ? "h-14" : "h-8 sm:h-10"} w-auto shrink-0 text-ink`} title="" />
      <span className={`font-logo font-medium leading-none tracking-[0.01em] text-ink ${lg ? "text-[1.9rem]" : "text-[1.2rem] sm:text-[1.45rem]"}`}>
        nine deploy
      </span>
    </span>
  );
}

/**
 * The OXOGNET symbol, redrawn from oxog.net. `draw` animates the strokes in
 * once, the way a signature is written.
 */
export function OxogMark({ draw = false, className = "" }: { draw?: boolean; className?: string }) {
  const stroke = (delay: number) =>
    draw
      ? {
          strokeDasharray: 400,
          strokeDashoffset: 400,
          animation: `draw 1.6s ${delay}s cubic-bezier(.6,.1,.2,1) forwards`,
        }
      : undefined;
  return (
    <svg viewBox="0 0 200 130" fill="none" aria-hidden className={className}>
      <path d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103" stroke="#ed0878" strokeWidth="12" style={stroke(0)} />
      <path
        d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
        stroke="#ed0878"
        strokeWidth="12"
        style={stroke(0.25)}
      />
      <path
        d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
        className="stroke-[#692d91] dark:stroke-[#a35adb]"
        strokeWidth="15"
        strokeLinecap="round"
        style={stroke(0.5)}
      />
      <path d="m74 87 54-51" stroke="#ed0878" strokeWidth="12" strokeLinecap="square" style={stroke(0.9)} />
    </svg>
  );
}

export function OxogWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      oxog<span className="font-normal opacity-60">net</span>
      <span className="text-[#ed0878]">.</span>
    </span>
  );
}
