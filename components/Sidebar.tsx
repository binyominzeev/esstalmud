"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Tractate } from "@/lib/tractates";

export interface SederGroup {
  seder: string;
  tractates: Tractate[];
}

export default function Sidebar({ groups }: { groups: SederGroup[] }) {
  const pathname = usePathname();
  const activeSlug = pathname.split("/").filter(Boolean)[0] ?? "";
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (window.matchMedia("(max-width: 980px)").matches) setOpen(true);
    } else {
      setOpen(false);
    }
    const owner = groups.find((g) => g.tractates.some((t) => t.slug === activeSlug));
    if (owner) setOpenGroups((prev) => (prev.has(owner.seder) ? prev : new Set(prev).add(owner.seder)));
  }, [activeSlug, groups]);

  function toggle(name: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <>
      <button id="menu-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menü">
        ☰
      </button>
      <div id="sidebar-overlay" className={open ? "open" : ""} onClick={() => setOpen(false)} />
      <div id="sidebar" className={open ? "open" : ""}>
        <h2>
          <Link href="/">EssTalmud</Link>
        </h2>
        <ul>
          {groups.map((g) => (
            <li key={g.seder} className={openGroups.has(g.seder) ? "open" : ""}>
              <span className="book-toggle" onClick={() => toggle(g.seder)}>
                {g.seder}
              </span>
              <ul>
                {g.tractates.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/${t.slug}/2a`} className={t.slug === activeSlug ? "active" : ""}>
                      {t.title} <span className="he-name">{t.heTitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
