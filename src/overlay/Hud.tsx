import type { Selection } from "../types";
import { getStar } from "../data/constellation";

type Props = {
  selection: Selection;
  onHome: () => void;
  onBack: () => void;
};

function hint(selection: Selection): string {
  if (selection.kind === "gallery") return "Swipe the prints · drag, wheel, or arrows";
  if (selection.kind === "world") {
    if (selection.id === "photography") return "Click the camera for the print gallery · orbit the studio";
    return "Orbit the pit · drag stop, entry, target";
  }
  if (selection.kind === "star") {
    const star = getStar(selection.id);
    if (star.world === "photography") return "Click the camera again to go inside";
    if (star.world) return "Click the star again to go inside";
    return "Return to the network";
  }
  if (selection.kind === "edge") return "Return to the network";
  return "Drag to orbit · click a craft or a beam";
}

export function Hud({ selection, onHome, onBack }: Props) {
  const away = selection.kind !== "none";
  return (
    <header className="hud">
      <button type="button" className="mark" onClick={onHome}>
        KS
      </button>
      <p className="hud-hint">{hint(selection)}</p>
      <div className="hud-actions">
        {away && (
          <button type="button" className="ghost" onClick={onBack}>
            {selection.kind === "gallery"
              ? "Leave gallery"
              : selection.kind === "world"
                ? "Leave world"
                : "Return"}
          </button>
        )}
        <a className="ghost" href="https://github.com/kobesin322" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}
