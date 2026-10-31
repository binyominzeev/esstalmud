"use client";

import { useEffect, useState } from "react";

/** Collapses both side panels on desktop. */
export default function PanelsToggle() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("panels-collapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth <= 980 && collapsed) setCollapsed(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [collapsed]);

  const label = collapsed ? "Oldalsávok megnyitása" : "Oldalsávok becsukása";
  return (
    <button id="panels-toggle" type="button" aria-pressed={collapsed} aria-label={label} title={label} onClick={() => setCollapsed((c) => !c)}>
      {collapsed ? "›‹" : "‹›"}
    </button>
  );
}
