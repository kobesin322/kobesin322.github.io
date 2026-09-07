import { Vector3 } from "three";
import { getEdge, getStar } from "../data/constellation";
import type { Selection, Vec3 } from "../types";

export const OVERVIEW_POSITION: Vec3 = [9.4, 4.8, 11.2];
export const OVERVIEW_TARGET: Vec3 = [0, -1.6, 0];
export const INTRO_POSITION: Vec3 = [18.5, 11, 24];
export const INTRO_TARGET: Vec3 = [0, -4.5, -2];

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
      return { position: [4.4, 2.2, 5.2], target: [0, 0.35, 0] };
    }
    const radial =
      target.lengthSq() < 0.04 ? new Vector3(0, 0.2, 1) : target.clone().normalize();
    const position = target
      .clone()
      .add(radial.multiplyScalar(3.5))
      .add(new Vector3(0.4, 0.85, 0.55));
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
  const position = mid.clone().add(side.multiplyScalar(3.1)).add(up.multiplyScalar(1.8));
  return { position: toVec3(position), target: toVec3(mid) };
}
