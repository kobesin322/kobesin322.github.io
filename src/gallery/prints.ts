export type GalleryPrint = {
  id: string;
  title: string;
  kicker: string;
  note: string;
  meta: string;
  palette: [string, string, string];
};

export const GALLERY_PRINTS: GalleryPrint[] = [
  {
    id: "harbor",
    title: "Harbor grain",
    kicker: "Victoria Harbour",
    note: "Lights hold on the water longer than the ships do. The frame is the wait.",
    meta: "f/2.8 · 1/30 · HP5",
    palette: ["#1a2430", "#c4a574", "#e8ddd0"],
  },
  {
    id: "room",
    title: "Room light",
    kicker: "Tungsten · interior",
    note: "One window. The rest of the room is a decision about what to leave dark.",
    meta: "f/2 · 1/60 · Portra",
    palette: ["#241812", "#d46a3a", "#f0d8b8"],
  },
  {
    id: "figure",
    title: "Figure",
    kicker: "Studio · available light",
    note: "A person is an edge against the wall. Cut until the stance is the sentence.",
    meta: "f/4 · 1/125 · Tri-X",
    palette: ["#121418", "#8a8f96", "#ece6d8"],
  },
  {
    id: "street",
    title: "Street wet",
    kicker: "After rain",
    note: "Reflections do the drawing. The street is only there to hold the sky.",
    meta: "f/2.8 · 1/15 · Cinestill",
    palette: ["#0e1c22", "#4aa8b8", "#dce8ea"],
  },
  {
    id: "market",
    title: "Night market",
    kicker: "Neon · stall light",
    note: "Color is the subject. Faces pass through it; the signs stay.",
    meta: "f/1.4 · 1/40 · Superia",
    palette: ["#1a0c14", "#c41e3a", "#f0c090"],
  },
  {
    id: "peak",
    title: "Peak haze",
    kicker: "Ridgeline",
    note: "Distance is a stack of blues. Keep the ridge, lose the legend.",
    meta: "f/8 · 1/250 · Delta",
    palette: ["#121820", "#6ba3ff", "#d8e4ea"],
  },
  {
    id: "chair",
    title: "Empty chair",
    kicker: "Still · tungsten",
    note: "Someone just left. The print has to hold the heat of that.",
    meta: "f/2.8 · 1/20 · Portra",
    palette: ["#1c1410", "#d4a017", "#efe4d0"],
  },
  {
    id: "last",
    title: "Last frame",
    kicker: "Leader · rebate",
    note: "The last exposure is a cut. What stays in is the only evidence.",
    meta: "f/5.6 · 1/60 · HP5",
    palette: ["#0e0c0a", "#c5ccd4", "#d8c2a4"],
  },
];
