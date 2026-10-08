import type { KeyboardEvent } from "react";

/**
 * Arrow/Home/End handling for a role="tablist" (WAI-ARIA tabs pattern with
 * automatic activation). Put it on the tablist and give the selected tab
 * tabIndex 0 and every other tab -1.
 */
export function tabListKeys(count: number, index: number, select: (i: number) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % count;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else return;
    e.preventDefault();
    select(next);
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };
}
