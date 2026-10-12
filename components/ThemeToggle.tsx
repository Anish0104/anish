"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import StarWarsToggleSwitch from "@/components/ui/star-wars-toggle-switch";

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  function syncStorage(event: StorageEvent) {
    if (event.key !== "theme" && event.key !== null) return;
    document.documentElement.classList.toggle("dark", event.newValue === "dark");
    onChange();
  }

  window.addEventListener("storage", syncStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", syncStorage);
  };
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTransition = useRef<ViewTransition | null>(null);
  const themeRequest = useRef(0);
  const requestedTheme = useRef<boolean | null>(null);

  useEffect(() => {
    function forwardCapturedClick(event: MouseEvent) {
      // Some browsers retarget clicks to <html> while its snapshot is on
      // screen. Keep this switch responsive at its actual on-screen bounds.
      if (!activeTransition.current || event.target !== document.documentElement) return;
      const toggle = document.querySelector<HTMLInputElement>("[data-theme-toggle] input");
      if (!toggle) return;
      const bounds = toggle.getBoundingClientRect();
      if (
        event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom
      ) {
        toggle.click();
      }
    }

    document.addEventListener("click", forwardCapturedClick);
    return () => {
      document.removeEventListener("click", forwardCapturedClick);
      themeRequest.current += 1;
      activeTransition.current?.skipTransition();
      if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
      delete document.documentElement.dataset.themeTransitioning;
      delete document.documentElement.dataset.themeOrbit;
      document.documentElement.style.removeProperty("--theme-orbit-x");
      document.documentElement.style.removeProperty("--theme-orbit-y");
      document.documentElement.style.removeProperty("--theme-toggle-width");
      document.documentElement.style.removeProperty("--theme-toggle-height");
    };
  }, []);

  function setTheme(checked: boolean, toggle: HTMLInputElement) {
    const root = document.documentElement;
    const request = ++themeRequest.current;
    const interrupted = activeTransition.current !== null;
    // Before a snapshot is ready, React may still show the previous checked
    // state. A second click should reverse the pending request as well.
    const dark = interrupted && requestedTheme.current !== null
      ? !requestedTheme.current
      : checked;
    requestedTheme.current = dark;
    activeTransition.current?.skipTransition();
    activeTransition.current = null;
    if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
    transitionTimer.current = null;
    delete root.dataset.themeTransitioning;
    delete root.dataset.themeOrbit;
    root.style.removeProperty("--theme-orbit-x");
    root.style.removeProperty("--theme-orbit-y");
    root.style.removeProperty("--theme-toggle-width");
    root.style.removeProperty("--theme-toggle-height");

    function applyTheme() {
      // A skipped transition can still run its update callback. Only the
      // latest request may change the theme when someone toggles quickly.
      if (request !== themeRequest.current) return;
      root.classList.toggle("dark", dark);
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch {
        // The switch still works when storage is unavailable.
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || interrupted) {
      applyTheme();
      return;
    }

    function fadeTheme() {
      root.dataset.themeTransitioning = "";
      void window.getComputedStyle(document.body).backgroundColor;
      applyTheme();
      transitionTimer.current = setTimeout(() => {
        delete root.dataset.themeTransitioning;
        transitionTimer.current = null;
      }, 500);
    }

    if (
      typeof document.startViewTransition !== "function" ||
      typeof CSS.registerProperty !== "function" ||
      !CSS.supports("mask-image", "radial-gradient(black, transparent)") ||
      !CSS.supports("mask-composite", "subtract")
    ) {
      fadeTheme();
      return;
    }

    const bounds = toggle.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth, bounds.left + bounds.width / 2));
    const y = Math.max(0, Math.min(innerHeight, bounds.top + bounds.height / 2));
    // A slightly flattened orbit, with enough overscan for its soft edge to
    // clear every corner on tall phones and wide desktop screens.
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y) / 0.88,
    ) + 32;
    root.style.setProperty("--theme-orbit-x", `${x}px`);
    root.style.setProperty("--theme-orbit-y", `${y}px`);
    root.style.setProperty("--theme-toggle-width", `${bounds.width}px`);
    root.style.setProperty("--theme-toggle-height", `${bounds.height}px`);
    root.dataset.themeOrbit = dark ? "dark" : "light";

    try {
      const transition = document.startViewTransition(applyTheme);
      activeTransition.current = transition;
      void transition.ready.then(() => {
        if (request !== themeRequest.current) return;
        root.animate(
          { "--theme-orbit-radius": dark ? ["0px", `${radius}px`] : [`${radius}px`, "0px"] },
          {
            duration: 680,
            easing: "cubic-bezier(0.22, 0.8, 0.25, 1)",
            fill: "both",
            pseudoElement: dark ? "::view-transition-new(root)" : "::view-transition-old(root)",
          },
        );
      }).catch(() => transition.skipTransition());

      function finishTransition() {
        if (request !== themeRequest.current) return;
        activeTransition.current = null;
        delete root.dataset.themeOrbit;
        root.style.removeProperty("--theme-orbit-x");
        root.style.removeProperty("--theme-orbit-y");
        root.style.removeProperty("--theme-toggle-width");
        root.style.removeProperty("--theme-toggle-height");
      }
      void transition.finished.then(finishTransition, finishTransition);
    } catch {
      delete root.dataset.themeOrbit;
      fadeTheme();
    }
  }

  return <StarWarsToggleSwitch checked={isDark} onCheckedChange={setTheme} />;
}
