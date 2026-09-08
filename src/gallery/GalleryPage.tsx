import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_PRINTS } from "./prints";

type Props = {
  reduceMotion: boolean;
};

const SWIPE_PX = 64;

export function GalleryPage({ reduceMotion }: Props) {
  const count = GALLERY_PRINTS.length;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; start: number } | null>(null);
  const live = useRef(index);
  live.current = index;

  const go = useCallback(
    (next: number) => {
      const wrapped = ((next % count) + count) % count;
      setIndex(wrapped);
    },
    [count],
  );

  const snapFromDrag = useCallback(
    (dx: number) => {
      if (dx <= -SWIPE_PX) go(live.current + 1);
      else if (dx >= SWIPE_PX) go(live.current - 1);
      setDrag(0);
      setDragging(false);
    },
    [go],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        go(live.current + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        go(live.current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        go(0);
      } else if (event.key === "End") {
        event.preventDefault();
        go(count - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, count]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    pointer.current = { id: event.pointerId, start: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const hold = pointer.current;
    if (!hold || hold.id !== event.pointerId) return;
    setDrag(event.clientX - hold.start);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const hold = pointer.current;
    if (!hold || hold.id !== event.pointerId) return;
    pointer.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    snapFromDrag(event.clientX - hold.start);
  };

  const wheelLock = useRef(0);
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 10) return;
    const now = performance.now();
    if (now - wheelLock.current < 420) return;
    wheelLock.current = now;
    go(live.current + (delta > 0 ? 1 : -1));
  };

  const print = GALLERY_PRINTS[index];
  const width = stage.current?.clientWidth ?? 720;
  const frac = dragging ? drag / Math.max(280, width * 0.42) : 0;

  return (
    <section className="gallery" aria-label="Print gallery">
      <div className="gallery-glow" aria-hidden="true" />
      <div
        ref={stage}
        className={`gallery-stage${dragging ? " is-dragging" : ""}${reduceMotion ? " is-flat" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div className="gallery-track">
          {GALLERY_PRINTS.map((item, i) => {
            const delta = i - index - frac;
            const abs = Math.abs(delta);
            const hidden = abs > 2.6;
            const rot = reduceMotion ? 0 : Math.max(-62, Math.min(62, delta * 50));
            const x = delta * (reduceMotion ? 108 : 56);
            const z = reduceMotion ? 0 : -Math.abs(delta) * 210;
            const y = reduceMotion ? 0 : abs * 10;
            return (
              <article
                key={item.id}
                className={`gallery-card${i === index ? " is-current" : ""}`}
                style={{
                  ["--p0" as string]: item.palette[0],
                  ["--p1" as string]: item.palette[1],
                  ["--p2" as string]: item.palette[2],
                  transform: `translate(-50%, -50%) translateX(${x}%) translateY(${y}px) translateZ(${z}px) rotateY(${-rot}deg)`,
                  zIndex: 40 - Math.round(abs * 8),
                  opacity: hidden ? 0 : abs > 1.85 ? 0.35 : 1,
                  pointerEvents: hidden ? "none" : "auto",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (Math.abs(drag) > 12) return;
                  if (i !== index) go(i);
                }}
                aria-hidden={i !== index}
              >
                <div className="gallery-matte">
                  <div className={`print-art print--${item.id}`}>
                    <span className="print-art-a" />
                    <span className="print-art-b" />
                    <span className="print-art-c" />
                    <span className="print-art-grain" />
                  </div>
                </div>
                {!reduceMotion && (
                  <div className="gallery-reflection" aria-hidden="true">
                    <div className="gallery-matte">
                      <div className={`print-art print--${item.id}`}>
                        <span className="print-art-a" />
                        <span className="print-art-b" />
                        <span className="print-art-c" />
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="gallery-copy">
        <p className="kicker gallery-kicker">
          <span className="dot" />
          {print.kicker}
        </p>
        <h2 className="serif gallery-title">{print.title}</h2>
        <p className="gallery-note">{print.note}</p>
        <p className="gallery-meta">{print.meta}</p>
      </div>

      <div className="gallery-nav">
        <button type="button" className="ghost gallery-arrow" onClick={() => go(index - 1)} aria-label="Previous print">
          ←
        </button>
        <ol className="gallery-dots" aria-label="Prints">
          {GALLERY_PRINTS.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className={`gallery-dot${i === index ? " is-on" : ""}`}
                onClick={() => go(i)}
                aria-label={item.title}
                aria-current={i === index}
              />
            </li>
          ))}
        </ol>
        <button type="button" className="ghost gallery-arrow" onClick={() => go(index + 1)} aria-label="Next print">
          →
        </button>
        <p className="gallery-count" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
