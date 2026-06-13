"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    // Apply saved theme
    try {
      const t = localStorage.getItem("theme");
      const d = document.documentElement;
      if (t === "dark") {
        d.classList.add("dark");
        d.classList.remove("light");
      } else if (t === "light") {
        d.classList.add("light");
        d.classList.remove("dark");
      } else if (matchMedia("(prefers-color-scheme:dark)").matches) {
        d.classList.add("dark");
      }
    } catch {}
    // Disable browser scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  return null;
}
