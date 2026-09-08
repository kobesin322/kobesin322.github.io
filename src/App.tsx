import { Canvas } from "@react-three/fiber";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { parseSelectionHash } from "./data/constellation";
import { GalleryPage } from "./gallery/GalleryPage";
import { INTRO_POSITION } from "./lib/camera";
import { usePageVisible } from "./hooks/usePageVisible";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { Hud } from "./overlay/Hud";
import { StarPanel } from "./overlay/StarPanel";
import { Experience } from "./scene/Experience";
import type { Selection } from "./types";
import { isWorldId, loadWorld } from "./worlds/loadWorld";

const TradingScene = lazy(() =>
  import("./worlds/TradingScene").then((mod) => ({ default: mod.TradingScene })),
);
const PhotographyScene = lazy(() =>
  import("./worlds/PhotographyScene").then((mod) => ({ default: mod.PhotographyScene })),
);

function writeHash(selection: Selection) {
  if (selection.kind === "none") {
    window.history.replaceState(null, "", window.location.pathname);
    return;
  }
  const next =
    selection.kind === "world"
      ? `#world/${selection.id}`
      : selection.kind === "gallery"
        ? "#gallery"
        : `#${selection.id}`;
  window.history.replaceState(null, "", next);
}

function warmupWorld(id: string) {
  void loadWorld(id);
}

export default function App() {
  const reduceMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const [selection, setSelection] = useState<Selection>(() => {
    if (typeof window === "undefined") return { kind: "none" };
    return parseSelectionHash(window.location.hash) ?? { kind: "none" };
  });
  const [worldReady, setWorldReady] = useState(false);
  const [snapCamera, setSnapCamera] = useState(false);
  const [exitVeil, setExitVeil] = useState(false);
  const [enterVeil, setEnterVeil] = useState(false);
  const veilTimer = useRef(0);
  const enterTimer = useRef(0);
  const skipWorldIntro = useRef(false);

  const select = useCallback((next: Selection) => {
    setSelection(next);
    writeHash(next);
  }, []);

  const onSnapApplied = useCallback(() => {
    setSnapCamera(false);
  }, []);

  const coverExit = useCallback(() => {
    setSnapCamera(true);
    setExitVeil(true);
    window.clearTimeout(veilTimer.current);
    veilTimer.current = window.setTimeout(() => setExitVeil(false), 280);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(veilTimer.current);
      window.clearTimeout(enterTimer.current);
    },
    [],
  );

  const home = useCallback(() => {
    if (selection.kind === "world") coverExit();
    select({ kind: "none" });
  }, [coverExit, select, selection.kind]);

  const back = useCallback(() => {
    if (selection.kind === "gallery") {
      skipWorldIntro.current = true;
      select({ kind: "world", id: "photography" });
      return;
    }
    if (selection.kind === "world") {
      coverExit();
      select({ kind: "star", id: selection.id });
      return;
    }
    select({ kind: "none" });
  }, [coverExit, select, selection]);

  useEffect(() => {
    if (selection.kind === "star" && isWorldId(selection.id)) warmupWorld(selection.id);
  }, [selection]);

  useEffect(() => {
    if (selection.kind === "gallery") return;
    if (selection.kind !== "world") {
      setWorldReady(false);
      return;
    }
    let cancelled = false;
    let timeout = 0;
    const started = performance.now();
    const skip = skipWorldIntro.current;
    void loadWorld(selection.id).then(() => {
      if (cancelled) return;
      const remain = reduceMotion || skip ? 0 : Math.max(0, 1100 - (performance.now() - started));
      timeout = window.setTimeout(() => {
        if (!cancelled) setWorldReady(true);
      }, remain);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [selection, reduceMotion]);

  useEffect(() => {
    if (!(worldReady && selection.kind === "world")) {
      setEnterVeil(false);
      return;
    }
    if (skipWorldIntro.current) {
      skipWorldIntro.current = false;
      setEnterVeil(false);
      return;
    }
    setEnterVeil(true);
    window.clearTimeout(enterTimer.current);
    enterTimer.current = window.setTimeout(() => setEnterVeil(false), 240);
  }, [worldReady, selection.kind]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") back();
    };
    const onHash = () => {
      select(parseSelectionHash(window.location.hash) ?? { kind: "none" });
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [back, select]);

  const worldId = selection.kind === "world" ? selection.id : null;
  const insideWorld = worldReady && worldId !== null && isWorldId(worldId);
  const insideGallery = selection.kind === "gallery";
  const diving =
    (selection.kind === "world" && !worldReady) || enterVeil || exitVeil;
  const photoVeil =
    insideGallery ||
    (selection.kind === "world" && selection.id === "photography") ||
    (selection.kind === "star" && selection.id === "photography" && (enterVeil || exitVeil));

  return (
    <>
      <div className="noise" aria-hidden="true" />
      {insideGallery ? (
        <GalleryPage reduceMotion={reduceMotion} />
      ) : (
        <div className="canvas-wrap">
          <Canvas
            frameloop={pageVisible ? "always" : "never"}
            camera={{ position: INTRO_POSITION, fov: 52, near: 0.1, far: 80 }}
            dpr={reduceMotion ? [1, 1] : [1, 1.15]}
            gl={{
              antialias: false,
              alpha: false,
              toneMapping: ACESFilmicToneMapping,
              outputColorSpace: SRGBColorSpace,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
            onCreated={({ gl }) => {
              gl.setClearColor("#05070c");
              gl.toneMappingExposure = 1.0;
            }}
          >
            {insideWorld && worldId === "trading" ? (
              <Suspense fallback={null}>
                <TradingScene reduceMotion={reduceMotion} />
              </Suspense>
            ) : insideWorld && worldId === "photography" ? (
              <Suspense fallback={null}>
                <PhotographyScene
                  reduceMotion={reduceMotion}
                  onOpenGallery={() => {
                    skipWorldIntro.current = true;
                    select({ kind: "gallery" });
                  }}
                />
              </Suspense>
            ) : (
              <Experience
                selection={selection}
                onSelect={select}
                reduceMotion={reduceMotion}
                snapCamera={snapCamera}
                onSnapApplied={onSnapApplied}
              />
            )}
          </Canvas>
        </div>
      )}
      <div
        className={`veil${diving ? " is-on" : ""}${photoVeil ? " is-photo" : ""}`}
        aria-hidden="true"
      />
      <Hud selection={selection} onHome={home} onBack={back} />
      {!insideWorld && !insideGallery && selection.kind !== "world" && (
        <StarPanel
          selection={selection}
          onClose={back}
          onEnterWorld={(id) => select({ kind: "world", id })}
        />
      )}
    </>
  );
}
