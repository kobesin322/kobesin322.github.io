import type { Selection } from "../types";
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
  return (
    <>
      <SpaceBackdrop />
      <CameraRig
        selection={selection}
        reduceMotion={reduceMotion}
        snap={snapCamera}
        onSnapApplied={onSnapApplied}
      />
      <Constellation selection={selection} onSelect={onSelect} />
      <Effects />
    </>
  );
}
