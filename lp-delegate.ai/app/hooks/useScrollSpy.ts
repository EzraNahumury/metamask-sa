"use client";

import { useEffect, useState } from "react";

/**
 * Watch a set of section IDs and return the id of whichever one currently
 * sits closest to the top of the viewport (accounting for a fixed-header
 * offset). Used by the sidebar to highlight the active anchor as the user
 * scrolls the landing page.
 */
export function useScrollSpy(sectionIds: string[], offset = 120) {
  const [active, setActive] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onScroll() {
      const probe = window.scrollY + offset;
      let current = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        if (probe >= top) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds, offset]);

  return active;
}
