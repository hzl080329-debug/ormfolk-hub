"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollPreserver({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollPositions = useRef<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Save scroll before navigation
  useEffect(() => {
    const prev = scrollPositions.current[pathname] || 0;

    const handleBeforeNav = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };

    window.addEventListener("beforeunload", handleBeforeNav);
    return () => window.removeEventListener("beforeunload", handleBeforeNav);
  }, [pathname]);

  // Restore scroll after re-render
  useEffect(() => {
    const saved = scrollPositions.current[pathname];
    if (saved > 0) {
      // Small delay to let React finish rendering
      requestAnimationFrame(() => {
        window.scrollTo(0, saved);
      });
    }
  });

  // Save scroll on scroll events
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          scrollPositions.current[pathname] = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Disable browser auto-scroll-restoration
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  return <>{children}</>;
}
