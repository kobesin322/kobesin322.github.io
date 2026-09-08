import { Vector3 } from "three";
import { getEdge, getStar } from "../data/constellation";
import type { Selection, Vec3 } from "../types";

export const OVERVIEW_POSITION: Vec3 = [8.6, 3.4, 10.2];
export const OVERVIEW_TARGET: Vec3 = [0, 0.15, 0];
export const INTRO_POSITION: Vec3 = [15.5, 6.8, 18];
export const INTRO_TARGET: Vec3 = [0, 0, 0];

export type LookAt = {
  position: Vec3;
  target: Vec3;
};

function toVec3(v: Vector3): Vec3 {
  return [v.x, v.y, v.z];
}

export function lookAtForSelection(selection: Selection): LookAt {
  if (selection.kind === "none") {
    return { position: OVERVIEW_POSITION, target: OVERVIEW_TARGET };
  }

  if (selection.kind === "star") {
    const star = getStar(selection.id);
    const target = new Vector3(...star.position);
    if (star.id === "hub") {
      return { position: [3.5, 1.7, 4.2], target: [0, 0, 0] };
    }
    if (star.id === "photography") {
      const [x, y, z] = star.position;
      return {
        position: [x + 0.95, y + 0.48, z + 1.55],
        target: [x + 0.08, y + 0.05, z + 0.16],
      };
    }
    const radial =
      target.lengthSq() < 0.04 ? new Vector3(0, 0.2, 1) : target.clone().normalize();
    const position = target
      .clone()
      .add(radial.multiplyScalar(3.2))
      .add(new Vector3(0.35, 0.7, 0.4));
    return { position: toVec3(position), target: star.position };
  }

  if (selection.kind === "world") {
    const star = getStar(selection.id);
    const target = new Vector3(...star.position);
    const radial =
      target.lengthSq() < 0.04 ? new Vector3(0, 0.15, 1) : target.clone().normalize();
    const position = target.clone().add(radial.multiplyScalar(0.42));
    return { position: toVec3(position), target: star.position };
  }

  const edge = getEdge(selection.id);
  const a = new Vector3(...getStar(edge.from).position);
  const b = new Vector3(...getStar(edge.to).position);
  const mid = a.clone().lerp(b, 0.5);
  const along = b.clone().sub(a).normalize();
  const up = new Vector3(0, 1, 0);
  let side = new Vector3().crossVectors(along, up);
  if (side.lengthSq() < 0.05) side = new Vector3(1, 0, 0);
  side.normalize();
  const position = mid.clone().add(side.multiplyScalar(2.8)).add(up.multiplyScalar(1.4));
  return { position: toVec3(position), target: toVec3(mid) };
}
