import { getEdge, getStar } from "../data/constellation";
import type { Selection } from "../types";

type Props = {
  selection: Selection;
  onClose: () => void;
};

export function StarPanel({ selection, onClose }: Props) {
  const open = selection.kind !== "none";

  return (
    <aside className={`panel${open ? " is-open" : ""}`} aria-hidden={!open}>
      {selection.kind === "star" && <StarBody id={selection.id} onClose={onClose} />}
      {selection.kind === "edge" && <EdgeBody id={selection.id} onClose={onClose} />}
    </aside>
  );
}

function StarBody({ id, onClose }: { id: string; onClose: () => void }) {
  const star = getStar(id);
  const isHub = star.status === "live";

  return (
    <div className="panel-inner" role="dialog" aria-labelledby="panel-title">
      <p className="kicker">
        <span className="dot" />
        {star.kicker ?? (isHub ? "Hub" : "Concept star")}
      </p>
      <h2 id="panel-title" className="serif">
        {star.title}
      </h2>
      <p className="panel-tagline">{star.tagline}</p>
      {star.lede && <p className="lede">{star.lede}</p>}
      {star.meta && (
        <div className="hero-meta">
          {star.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      )}
      {!isHub && <p className="concept-note">Concept — interior later</p>}
      <ul className="panel-bullets">
        {star.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {star.chips && (
        <ul className="chips">
          {star.chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      )}
      {star.stack && (
        <div className="stack">
          {star.stack.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="ghost panel-close" onClick={onClose}>
        Return to network
      </button>
    </div>
  );
}

function EdgeBody({ id, onClose }: { id: string; onClose: () => void }) {
  const edge = getEdge(id);
  const from = getStar(edge.from);
  const to = getStar(edge.to);

  return (
    <div className="panel-inner" role="dialog" aria-labelledby="panel-title">
      <p className="kicker">
        <span className="dot" />
        Link
      </p>
      <h2 id="panel-title" className="serif">
        {from.title} · {to.title}
      </h2>
      <p className="panel-tagline">{edge.label}</p>
      <p className="concept-note">Concept — why these two connect</p>
      <ul className="panel-bullets">
        <li>
          {from.title}: {from.tagline}
        </li>
        <li>
          {to.title}: {to.tagline}
        </li>
      </ul>
      <button type="button" className="ghost panel-close" onClick={onClose}>
        Return to network
      </button>
    </div>
  );
}
