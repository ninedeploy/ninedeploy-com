import type { SVGProps } from "react";

/** The NineDeploy mark: a hex shell holding a terminal with four blue-green tiles. */
export function NineMark({ title = "NineDeploy", ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={title} {...props}>
      <defs>
        <linearGradient id="nd-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A3B52" />
          <stop offset="1" stopColor="#16202E" />
        </linearGradient>
        <linearGradient id="nd-gloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7CE4DC" />
          <stop offset="1" stopColor="#4ECDC4" />
        </linearGradient>
        <linearGradient id="nd-dim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4ECDC4" />
          <stop offset="1" stopColor="#17948A" />
        </linearGradient>
      </defs>
      <polygon
        points="24,3 43,14 43,34 24,45 5,34 5,14"
        fill="url(#nd-shell)"
        stroke="#16202E"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 4.4 41.8 14.6 M24 4.4 6.2 14.6"
        fill="none"
        stroke="#4ECDC4"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <rect x="11" y="12" width="26" height="22" rx="3.5" fill="#FFFFFF" />
      <path d="M11 15.5 A3.5 3.5 0 0 1 14.5 12 H33.5 A3.5 3.5 0 0 1 37 15.5 V17.5 H11 Z" fill="#1E2A3A" />
      <circle cx="14.6" cy="14.8" r="1.15" fill="#FF5C87" />
      <circle cx="18.1" cy="14.8" r="1.15" fill="#FFB454" />
      <circle cx="21.6" cy="14.8" r="1.15" fill="#4ECDC4" />
      <rect x="13.5" y="20" width="2.2" height="11" rx="1.1" fill="#22324E" opacity="0.85" />
      <rect x="17.8" y="20" width="8.1" height="4.9" rx="1.3" fill="url(#nd-gloss)" />
      <rect x="27.6" y="20" width="8.1" height="4.9" rx="1.3" fill="url(#nd-dim)" />
      <rect x="17.8" y="26.2" width="8.1" height="4.9" rx="1.3" fill="url(#nd-dim)" />
      <rect x="27.6" y="26.2" width="8.1" height="4.9" rx="1.3" fill="url(#nd-gloss)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <NineMark className="size-8 shrink-0" title="" aria-hidden />
      <span className="heading text-[1.35rem] leading-none tracking-tight">
        Nine<span className="text-green">Deploy</span>
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
