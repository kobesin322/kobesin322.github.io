import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { parseSelectionHash } from "./data/constellation";
import { INTRO_POSITION } from "./lib/camera";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { Hud } from "./overlay/Hud";
import { StarPanel } from "./overlay/StarPanel";
import { Experience } from "./scene/Experience";
import type { Selection } from "./types";
import { TradingDesk } from "./worlds/TradingDesk";
import { TradingScene } from "./worlds/TradingScene";

function writeHash(selection: Selection) {
  if (selection.kind === "none") {
    window.history.replaceState(null, "", window.location.pathname);
    return;
  }
  const next = selection.kind === "world" ? `#world/${selection.id}` : `#${selection.id}`;
  window.history.replaceState(null, "", next);
}

export default function App() {
  const reduceMotion = usePrefersReducedMotion();
  const [selection, setSelection] = useState<Selection>(() => {
    if (typeof window === "undefined") return { kind: "none" };
    return parseSelectionHash(window.location.hash) ?? { kind: "none" };
  });
  const [worldReady, setWorldReady] = useState(false);

  const select = useCallback((next: Selection) => {
    setSelection(next);
    writeHash(next);
  }, []);

  const home = useCallback(() => {
    select({ kind: "none" });
  }, [select]);

  const back = useCallback(() => {
    if (selection.kind === "world") {
      select({ kind: "star", id: selection.id });
      return;
    }
    select({ kind: "none" });
  }, [select, selection]);

  useEffect(() => {
    if (selection.kind !== "world") {
      setWorldReady(false);
      return;
    }
    if (reduceMotion) {
      setWorldReady(true);
      return;
    }
    const timer = window.setTimeout(() => setWorldReady(true), 1100);
    return () => window.clearTimeout(timer);
  }, [selection, reduceMotion]);

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

  const insideTrading = worldReady && selection.kind === "world" && selection.id === "trading";
  const diving = selection.kind === "world" && !worldReady;

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="canvas-wrap">
        <Canvas
          key={insideTrading ? "world-trading" : "constellation"}
          camera={{ position: INTRO_POSITION, fov: 52, near: 0.1, far: 200 }}
          dpr={[1, 1.25]}
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(insideTrading ? "#041018" : "#05070c");
            gl.toneMappingExposure = 1.0;
          }}
        >
          {insideTrading ? (
            <TradingScene />
          ) : (
            <Experience selection={selection} onSelect={select} reduceMotion={reduceMotion} />
          )}
        </Canvas>
      </div>
      <div className={`veil${diving ? " is-on" : ""}`} aria-hidden="true" />
      <Hud selection={selection} onHome={home} onBack={back} />
      {!insideTrading && selection.kind !== "world" && (
        <StarPanel selection={selection} onClose={back} onEnterWorld={(id) => select({ kind: "world", id })} />
      )}
      {insideTrading && <TradingDesk />}
    </>
  );
}
