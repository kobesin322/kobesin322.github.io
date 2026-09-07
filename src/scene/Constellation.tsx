import { EDGES, STARS } from "../data/constellation";
import type { Selection } from "../types";
import { Edge } from "./Edge";
import { Star } from "./Star";

type Props = {
  selection: Selection;
  onSelect: (selection: Selection) => void;
};

export function Constellation({ selection, onSelect }: Props) {
  return (
    <group>
      {EDGES.map((edge) => (
        <Edge key={edge.id} edge={edge} selection={selection} onSelect={onSelect} />
      ))}
      {STARS.map((star) => (
        <Star key={star.id} star={star} selection={selection} onSelect={onSelect} />
      ))}
    </group>
  );
}
