type Props = {
  hasSelection: boolean;
  onReturn: () => void;
};

export function Hud({ hasSelection, onReturn }: Props) {
  return (
    <header className="hud">
      <button type="button" className="mark" onClick={onReturn}>
        KS
      </button>
      <p className="hud-hint">
        {hasSelection ? "Return to the network" : "Click a star or a link"}
      </p>
      <div className="hud-actions">
        {hasSelection && (
          <button type="button" className="ghost" onClick={onReturn}>
            Return
          </button>
        )}
        <a className="ghost" href="https://github.com/kobesin322" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}
