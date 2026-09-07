import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import { INTRO_POSITION, INTRO_TARGET, lookAtForSelection } from "../lib/camera";
import type { Selection } from "../types";

type Props = {
  selection: Selection;
  reduceMotion: boolean;
};

export function CameraRig({ selection, reduceMotion }: Props) {
  const controls = useRef<CameraControlsImpl>(null);
  const didIntro = useRef(false);

  useEffect(() => {
    const rig = controls.current;
    if (!rig) return;
    let cancelled = false;

    const fly = (
      position: [number, number, number],
      target: [number, number, number],
      animate: boolean,
    ) =>
      rig.setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        animate,
      );

    if (selection.kind !== "none") {
      const { position, target } = lookAtForSelection(selection);
      void fly(position, target, !reduceMotion);
      return;
    }

    const overview = lookAtForSelection({ kind: "none" });
    if (!didIntro.current && !reduceMotion) {
      didIntro.current = true;
      void fly(INTRO_POSITION, INTRO_TARGET, false);
      const id = window.requestAnimationFrame(() => {
        if (!cancelled) void fly(overview.position, overview.target, true);
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(id);
      };
    }

    didIntro.current = true;
    void fly(overview.position, overview.target, !reduceMotion);
  }, [selection, reduceMotion]);

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
