import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import { Vector3 } from "three";
import {
  INTRO_POSITION,
  INTRO_TARGET,
  lookAtForSelection,
} from "../lib/camera";
import type { Selection } from "../types";

type Props = {
  selection: Selection;
  reduceMotion: boolean;
};

const scratch = new Vector3();

export function CameraRig({ selection, reduceMotion }: Props) {
  const controls = useRef<CameraControlsImpl>(null);
  const didIntro = useRef(false);

  useEffect(() => {
    const rig = controls.current;
    if (!rig) return;
    let cancelled = false;

    const look = (position: [number, number, number], target: [number, number, number], animate: boolean) =>
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
      void look(position, target, !reduceMotion);
      return;
    }

    const overview = lookAtForSelection({ kind: "none" });
    if (!didIntro.current && !reduceMotion) {
      didIntro.current = true;
      void look(INTRO_POSITION, INTRO_TARGET, false);
      const id = window.requestAnimationFrame(() => {
        if (!cancelled) void look(overview.position, overview.target, true);
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(id);
      };
    }

    didIntro.current = true;
    if (reduceMotion) {
      void look(overview.position, overview.target, false);
      return;
    }

    rig.getPosition(scratch);
    const lift: [number, number, number] = [
      scratch.x * 0.55 + overview.position[0] * 0.45,
      Math.max(scratch.y, 6.5) + 2.4,
      scratch.z * 0.55 + overview.position[2] * 0.45,
    ];
    void look(lift, [0, 2.2, 0], true).then(() => {
      if (!cancelled) void look(overview.position, overview.target, true);
    });
    return () => {
      cancelled = true;
    };
  }, [selection, reduceMotion]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.8}
      maxDistance={42}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI - 0.35}
      smoothTime={0.7}
      draggingSmoothTime={0.16}
    />
  );
}
