"use client";

import { useEffect, useState } from "react";

/**
 * Every reason the companion should hold still, in one place.
 *
 * Reduced motion, a hidden tab, an open dialog or mobile menu. Each listener
 * is removed on unmount, so nothing survives a navigation.
 */
export function useCompanionSuspension() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sync = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // A modal dialog or an open mobile menu both lock body scrolling, which is
  // the one signal that catches every overlay on the site without each of
  // them having to know the companion exists.
  useEffect(() => {
    const check = () => {
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
      const locked = document.body.style.overflow === "hidden";
      setOverlayOpen(Boolean(modal) || locked);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return { reducedMotion, tabVisible, overlayOpen };
}
