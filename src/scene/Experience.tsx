import type { Selection } from "../types";
import { lodFor } from "../lib/sceneLod";
import { CameraRig } from "./CameraRig";
import { Constellation } from "./Constellation";
import { Effects } from "./Effects";
import { SpaceBackdrop } from "./SpaceBackdrop";

type Props = {
  selection: Selection;
  onSelect: (selection: Selection) => void;
  reduceMotion: boolean;
  snapCamera?: boolean;
  onSnapApplied?: () => void;
};

export function Experience({
  selection,
  onSelect,
  reduceMotion,
  snapCamera = false,
  onSnapApplied,
}: Props) {
  const lod = lodFor(selection);

  return (
    <>
      <SpaceBackdrop lod={lod} />
      <CameraRig
        selection={selection}
        reduceMotion={reduceMotion}
        snap={snapCamera}
        onSnapApplied={onSnapApplied}
      />
      <Constellation selection={selection} onSelect={onSelect} />
      {lod !== "dive" && <Effects quality={lod === "overview" ? "full" : "lean"} />}
    </>
  );
}
