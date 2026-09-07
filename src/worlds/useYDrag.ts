import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Plane, Vector3 } from "three";

type OrbitLock = { enabled: boolean };

export function useYDrag(onY: (worldY: number) => void) {
  const dragging = useRef(false);
  const primed = useRef(false);
  const originY = useRef(0);
  const grabY = useRef(0);
  const plane = useRef(new Plane());
  const hit = useRef(new Vector3());
  const normal = useRef(new Vector3());
  const anchor = useRef(new Vector3(0, 1, 0));
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
    plane.current.setFromNormalAndCoplanarPoint(normal.current, anchor.current);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(plane.current, hit.current)) return;
    if (!primed.current) {
      grabY.current = hit.current.y;
      primed.current = true;
      return;
    }
    onYRef.current(originY.current + (hit.current.y - grabY.current));
  });

  const begin = useCallback((handleY: number) => {
    dragging.current = true;
    primed.current = false;
    originY.current = handleY;
    setOrbit(false);
    document.body.style.cursor = "ns-resize";
  }, []);

  const end = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    primed.current = false;
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
