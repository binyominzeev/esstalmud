"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Tractate } from "@/lib/tractates";
import { sefariaRef, type Segment } from "@/lib/talmud";
import QuestionMap from "./QuestionMap";

interface Props {
  tractate: Tractate;
  daf: string;
  prev: string | null;
  next: string | null;
  allDafim: string[];
  segments: Segment[] | null;
  error: string | null;
  initialSegment: number | null;
}

export default function DafView({ tractate, daf, prev, next, allDafim, segments, error, initialSegment }: Props) {
  const [active, setActive] = useState<number | null>(initialSegment);
  const [panelOpen, setPanelOpen] = useState(initialSegment !== null);
  const [aiDone, setAiDone] = useState<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const base = `/${tractate.slug}`;

  useEffect(() => {
    if (initialSegment !== null) {
      document.getElementById(`seg-${initialSegment}`)?.scrollIntoView({ block: "center" });
    }
  }, [initialSegment]);

  // Segments that already have an AI summary get a marker; extended whenever a map finishes.
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
    fetch(`${api}/maps`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { done: string[] } | null) => {
        if (d) setAiDone((prev) => new Set([...prev, ...d.done]));
      })
      .catch(() => {});
  }, []);

  const markAiDone = useCallback((ref: string) => {
    setAiDone((prev) => (prev.has(ref) ? prev : new Set(prev).add(ref)));
  }, []);

  function select(n: number) {
    setActive(n);
    setPanelOpen(true);
    window.history.replaceState(null, "", `${base}/${daf}/${n}`);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  return (
    <>
      <div id="daf-bar">
        {prev ? (
          <Link className="nav-btn" href={`${base}/${prev}`} aria-label="Előző oldal">‹</Link>
        ) : (
          <span className="nav-btn disabled">‹</span>
        )}
        <button type="button" className="daf-picker" onClick={() => dialogRef.current?.showModal()}>
          {tractate.title} {daf} <span aria-hidden>▾</span>
        </button>
        {next ? (
          <Link className="nav-btn" href={`${base}/${next}`} aria-label="Következő oldal">›</Link>
        ) : (
          <span className="nav-btn disabled">›</span>
        )}
      </div>

      <dialog
        ref={dialogRef}
        id="daf-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="dialog-head">
          <strong>
            {tractate.title} <span className="he-name">{tractate.heTitle}</span>
          </strong>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Bezár">✕</button>
        </div>
        <div className="daf-grid">
          {allDafim.map((d) => (
            <Link
              key={d}
              href={`${base}/${d}`}
              className={d === daf ? "current" : ""}
              onClick={() => dialogRef.current?.close()}
            >
              {d}
            </Link>
          ))}
        </div>
      </dialog>

      <main className="content">
        {error || !segments ? (
          <div className="welcome">A Sefaria nem érhető el most ({error}). Próbáld újra később.</div>
        ) : (
          <table className="bilingual-table">
            <tbody>
              {segments.map((s, i) => {
                const n = i + 1;
                return (
                  <tr
                    key={n}
                    id={`seg-${n}`}
                    className={`segment-row${active === n ? " active-row" : ""}${aiDone.has(sefariaRef(tractate, daf, n)) ? " has-ai" : ""}`}
                    onClick={() => select(n)}
                  >
                    <td className="he" dangerouslySetInnerHTML={{ __html: s.he }} />
                    <td className="en" dangerouslySetInnerHTML={{ __html: s.en }} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>

      <aside className={`commentary-container${panelOpen ? " open" : ""}`}>
        <button type="button" className="panel-close" onClick={closePanel} aria-label="Panel bezárása" />
        {active === null ? (
          <p className="panel-empty">Kattints egy szakaszra a Sefaria-hivatkozáshoz és az összefoglalóhoz.</p>
        ) : (
          <div id="sefaria-box">
            <h3>
              {tractate.title} {daf}:{active}
            </h3>
            <a
              className="btn"
              href={`https://www.sefaria.org/${sefariaRef(tractate, daf, active)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Megnyitás a Sefarián ↗
            </a>
            <QuestionMap mapRef={sefariaRef(tractate, daf, active)} onDone={markAiDone} />
          </div>
        )}
      </aside>
    </>
  );
}
