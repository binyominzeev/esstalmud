"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
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
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [panelDragging, setPanelDragging] = useState(false);
  const [aiDone, setAiDone] = useState<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelDragRef = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    wasExpanded: boolean;
    moved: boolean;
  } | null>(null);
  const suppressHandleClickRef = useRef(false);
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
    setPanelExpanded(false);
    if (panelRef.current) panelRef.current.style.height = "";
  }

  function startPanelDrag(e: PointerEvent<HTMLButtonElement>) {
    if (!e.isPrimary || e.button !== 0 || !panelRef.current) return;

    const panel = panelRef.current;
    panelDragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: panel.getBoundingClientRect().height,
      wasExpanded: panelExpanded,
      moved: false,
    };
    panel.style.height = `${panel.getBoundingClientRect().height}px`;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanelDragging(true);
  }

  function movePanelDrag(e: PointerEvent<HTMLButtonElement>) {
    const drag = panelDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !panelRef.current) return;

    const delta = drag.startY - e.clientY;
    if (Math.abs(delta) > 8) drag.moved = true;
    if (!drag.moved) return;

    const maxHeight = window.innerHeight * 0.9;
    panelRef.current.style.height = `${Math.min(maxHeight, Math.max(120, drag.startHeight + delta))}px`;
  }

  function endPanelDrag(e: PointerEvent<HTMLButtonElement>) {
    const drag = panelDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    panelDragRef.current = null;
    setPanelDragging(false);
    if (panelRef.current) panelRef.current.style.height = "";

    if (!drag.moved) return;

    suppressHandleClickRef.current = true;
    window.setTimeout(() => {
      suppressHandleClickRef.current = false;
    }, 0);

    const delta = drag.startY - e.clientY;
    if (delta > 40) {
      setPanelExpanded(true);
    } else if (delta < -40 && drag.wasExpanded) {
      setPanelExpanded(false);
    } else if (delta < -40) {
      closePanel();
    }
  }

  function cancelPanelDrag(e: PointerEvent<HTMLButtonElement>) {
    if (panelDragRef.current?.pointerId !== e.pointerId) return;
    panelDragRef.current = null;
    setPanelDragging(false);
    if (panelRef.current) panelRef.current.style.height = "";
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

      <aside
        ref={panelRef}
        className={`commentary-container${panelOpen ? " open" : ""}${panelExpanded ? " resized" : ""}${panelDragging ? " dragging" : ""}`}
      >
        <button
          type="button"
          className="panel-close"
          onClick={() => {
            if (!suppressHandleClickRef.current) closePanel();
          }}
          onPointerDown={startPanelDrag}
          onPointerMove={movePanelDrag}
          onPointerUp={endPanelDrag}
          onPointerCancel={cancelPanelDrag}
          aria-label="Alsó panel méretezése vagy bezárása"
          aria-expanded={panelExpanded}
        />
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
