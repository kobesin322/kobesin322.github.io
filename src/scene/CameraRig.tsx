import { useLayoutEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import { INTRO_POSITION, INTRO_TARGET, lookAtForSelection } from "../lib/camera";
import type { Selection } from "../types";

type Props = {
  selection: Selection;
  reduceMotion: boolean;
  snap?: boolean;
  onSnapApplied?: () => void;
};

function selectionKey(selection: Selection): string {
  if (selection.kind === "none" || selection.kind === "gallery" || selection.kind === "backtest") return selection.kind;
  return `${selection.kind}:${selection.id}`;
}

export function CameraRig({
  selection,
  reduceMotion,
  snap = false,
  onSnapApplied,
}: Props) {
  const controls = useRef<CameraControlsImpl>(null);
  const didIntro = useRef(false);
  const lastLook = useRef("");

  useLayoutEffect(() => {
    let cancelled = false;
    let introFrame = 0;
    let retryFrame = 0;

    const fly = (
      position: [number, number, number],
      target: [number, number, number],
      animate: boolean,
    ) => {
      const rig = controls.current;
      if (!rig) return false;
      void rig.setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        animate,
      );
      return true;
    };

    const apply = () => {
      if (cancelled) return true;
      const key = selectionKey(selection);
      if (lastLook.current === key && !snap) return true;

      const animate = !reduceMotion && !snap;

      if (selection.kind !== "none") {
        const { position, target } = lookAtForSelection(selection);
        if (!fly(position, target, animate)) return false;
        didIntro.current = true;
        lastLook.current = key;
        if (snap) {
          queueMicrotask(() => {
            if (!cancelled) onSnapApplied?.();
          });
        }
        return true;
      }

      const overview = lookAtForSelection({ kind: "none" });
      if (!didIntro.current && !reduceMotion && !snap) {
        didIntro.current = true;
        if (!fly(INTRO_POSITION, INTRO_TARGET, false)) return false;
        introFrame = window.requestAnimationFrame(() => {
          if (cancelled) return;
          if (fly(overview.position, overview.target, true)) lastLook.current = key;
        });
        return true;
      }

      if (!fly(overview.position, overview.target, animate)) return false;
      didIntro.current = true;
      lastLook.current = key;
      if (snap) {
        queueMicrotask(() => {
          if (!cancelled) onSnapApplied?.();
        });
      }
      return true;
    };

    if (!apply()) {
      retryFrame = window.requestAnimationFrame(() => {
        apply();
      });
    }

    return () => {
      cancelled = true;
      if (introFrame) window.cancelAnimationFrame(introFrame);
      if (retryFrame) window.cancelAnimationFrame(retryFrame);
    };
  }, [selection, reduceMotion, snap, onSnapApplied]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={selection.kind === "world" ? 0.12 : 2.6}
      maxDistance={28}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI - 0.4}
      smoothTime={1.15}
      draggingSmoothTime={0.22}
    />
  );
}
