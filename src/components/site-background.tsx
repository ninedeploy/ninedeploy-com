"use client";

import { useEffect, useRef } from "react";
import { animateSiteBackground } from "@/lib/site-background";

export function SiteBackground() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) return animateSiteBackground(ref.current);
  }, []);
  return (
    <svg ref={ref} className="site-background" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="0.8">
      <g data-field-objects="" />
      <g data-field-effects="" />
    </svg>
  );
}
