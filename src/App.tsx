import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { parseSelectionHash } from "./data/constellation";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { Hud } from "./overlay/Hud";
import { StarPanel } from "./overlay/StarPanel";
import { Experience } from "./scene/Experience";
import type { Selection } from "./types";

function writeHash(selection: Selection) {
  const next =
    selection.kind === "none" ? window.location.pathname : `#${selection.id}`;
  window.history.replaceState(null, "", next);
}

export default function App() {
  const reduceMotion = usePrefersReducedMotion();
  const [selection, setSelection] = useState<Selection>(() => {
    if (typeof window === "undefined") return { kind: "none" };
    return parseSelectionHash(window.location.hash) ?? { kind: "none" };
  });

  const select = useCallback((next: Selection) => {
    setSelection(next);
    writeHash(next);
  }, []);

  const clear = useCallback(() => {
    select({ kind: "none" });
  }, [select]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") clear();
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
  }, [clear, select]);

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="canvas-wrap">
        <Canvas
          camera={{ position: [0, 2.2, 13], fov: 45, near: 0.1, far: 80 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#0b0c0a");
          }}
        >
          <Experience selection={selection} onSelect={select} reduceMotion={reduceMotion} />
        </Canvas>
      </div>
      <Hud hasSelection={selection.kind !== "none"} onReturn={clear} />
      <StarPanel selection={selection} onClose={clear} />
    </>
  );
}
