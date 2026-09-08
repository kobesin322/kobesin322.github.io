import type { Selection } from "../types";

/** How much of the constellation the current camera actually needs. */
export type SceneLod = "overview" | "focus" | "dive";

export function lodFor(selection: Selection): SceneLod {
  if (selection.kind === "world") return "dive";
  if (selection.kind === "none" || selection.kind === "gallery") return "overview";
  return "focus";
}
