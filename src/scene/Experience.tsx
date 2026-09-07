import type { Selection } from "../types";
import { CameraRig } from "./CameraRig";
import { Constellation } from "./Constellation";
import { SpaceBackdrop } from "./SpaceBackdrop";

type Props = {
  selection: Selection;
  onSelect: (selection: Selection) => void;
  reduceMotion: boolean;
};

export function Experience({ selection, onSelect, reduceMotion }: Props) {
  return (
    <>
      <SpaceBackdrop />
      <CameraRig selection={selection} reduceMotion={reduceMotion} />
      <Constellation selection={selection} onSelect={onSelect} />
    </>
  );
}
