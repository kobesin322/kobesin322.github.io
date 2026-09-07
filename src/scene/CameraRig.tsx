import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
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

export function CameraRig({ selection, reduceMotion }: Props) {
  const controls = useRef<CameraControlsImpl>(null);
  const didIntro = useRef(false);

  useEffect(() => {
    const rig = controls.current;
    if (!rig) return;

    if (selection.kind !== "none") {
      const { position, target } = lookAtForSelection(selection);
      void rig.setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        !reduceMotion,
      );
      return;
    }

    const overview = lookAtForSelection({ kind: "none" });
    if (!didIntro.current && !reduceMotion) {
      didIntro.current = true;
      void rig.setLookAt(
        INTRO_POSITION[0],
        INTRO_POSITION[1],
        INTRO_POSITION[2],
        INTRO_TARGET[0],
        INTRO_TARGET[1],
        INTRO_TARGET[2],
        false,
      );
      const id = window.requestAnimationFrame(() => {
        void rig.setLookAt(
          overview.position[0],
          overview.position[1],
          overview.position[2],
          overview.target[0],
          overview.target[1],
          overview.target[2],
          true,
        );
      });
      return () => window.cancelAnimationFrame(id);
    }

    didIntro.current = true;
    void rig.setLookAt(
      overview.position[0],
      overview.position[1],
      overview.position[2],
      overview.target[0],
      overview.target[1],
      overview.target[2],
      !reduceMotion,
    );
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
