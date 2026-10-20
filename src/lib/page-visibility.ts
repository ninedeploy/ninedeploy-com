"use client";

import { useSyncExternalStore } from "react";

const subscribe = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const getSnapshot = () => !document.hidden;
const getServerSnapshot = () => true;

/** Timed demonstrations stop while their page is in the background. */
export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
