"use client";

import { useEffect, useId, useRef } from "react";
import { animateSiteBackground } from "@/lib/site-background";

export function SiteBackground() {
  const ref = useRef<SVGSVGElement>(null);
  const overlay = useRef<SVGSVGElement>(null);
  const glow = useId();
  useEffect(() => {
    if (ref.current && overlay.current) return animateSiteBackground(ref.current, overlay.current);
  }, []);
  return (
    <>
      <svg ref={ref} className="site-background" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="0.8">
        <g data-field-objects="" />
      </svg>
      <svg ref={overlay} className="site-interactions" data-glow-id={glow} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.2">
        <defs>
          <radialGradient id={glow}>
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.14" />
            <stop offset="45%" stopColor="var(--blue)" stopOpacity="0.07" />
            <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g data-field-highlights="" />
        <g data-field-trails="" />
        <g data-field-pointer="" opacity="0" />
        <g data-field-effects="" />
      </svg>
    </>
  );
}
