import { EDGES, STARS } from "../data/constellation";
import { lodFor } from "../lib/sceneLod";
import type { Selection } from "../types";
import { Edge } from "./Edge";
import { Star } from "./Star";

type Props = {
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

export function Constellation({ selection, onSelect }: Props) {
  const lod = lodFor(selection);
  const diveId = selection.kind === "world" ? selection.id : null;

  return (
    <group>
      {lod !== "dive" &&
        EDGES.map((edge) => (
          <Edge key={edge.id} edge={edge} selection={selection} onSelect={onSelect} />
        ))}
      {STARS.map((star) => {
        if (diveId && star.id !== diveId) return null;
        return <Star key={star.id} star={star} selection={selection} onSelect={onSelect} />;
      })}
    </group>
  );
}
