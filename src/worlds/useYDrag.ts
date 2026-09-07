import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Plane, Vector3 } from "three";

type OrbitLock = { enabled: boolean };

export function useYDrag(onY: (worldY: number) => void) {
  const dragging = useRef(false);
  const plane = useRef(new Plane());
  const hit = useRef(new Vector3());
  const normal = useRef(new Vector3());
  const onYRef = useRef(onY);
  onYRef.current = onY;

  const { camera, pointer, raycaster, controls } = useThree();
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  const setOrbit = (enabled: boolean) => {
    const rig = controlsRef.current as OrbitLock | null;
    if (rig) rig.enabled = enabled;
  };

  useFrame(() => {
    if (!dragging.current) return;
    normal.current.set(camera.position.x, 0, camera.position.z);
    if (normal.current.lengthSq() < 0.0001) normal.current.set(0, 0, 1);
    normal.current.normalize();
    plane.current.setFromNormalAndCoplanarPoint(normal.current, hit.current.set(0, 1, 0));
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane.current, hit.current)) {
      onYRef.current(hit.current.y);
    }
  });

  const begin = useCallback(() => {
    dragging.current = true;
    setOrbit(false);
    document.body.style.cursor = "ns-resize";
  }, []);

  const end = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setOrbit(true);
    document.body.style.cursor = "auto";
  }, []);

  useEffect(() => {
    const up = () => end();
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [end]);

  return { begin, end, dragging };
}

export function lockOrbit(controls: unknown, enabled: boolean) {
  const rig = controls as OrbitLock | null;
  if (rig) rig.enabled = enabled;
}
