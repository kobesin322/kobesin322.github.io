import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import { lookAtForSelection } from "../lib/camera";
import type { Selection } from "../types";

type Props = {
  selection: Selection;
  reduceMotion: boolean;
};

export function CameraRig({ selection, reduceMotion }: Props) {
  const controls = useRef<CameraControlsImpl>(null);

  useEffect(() => {
    const rig = controls.current;
    if (!rig) return;
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
  }, [selection, reduceMotion]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={3.2}
      maxDistance={22}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI - 0.45}
      smoothTime={0.55}
      draggingSmoothTime={0.18}
    />
  );
}
