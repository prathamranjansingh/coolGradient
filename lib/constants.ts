import { GradientStop, MeshPoint, RadialPoints, Filters } from "./type";

export const MAX_STOPS = 16;

export const defaultMesh: MeshPoint[] = [
  { x: 0.25, y: 0.25, color: "#FF6B6B", radius: 0.25, intensity: 1 },
  { x: 0.75, y: 0.25, color: "#4ECDC4", radius: 0.25, intensity: 1 },
  { x: 0.25, y: 0.75, color: "#FFE66D", radius: 0.25, intensity: 1 },
  { x: 0.75, y: 0.75, color: "#A8E6CF", radius: 0.25, intensity: 1 },
];

export const defaultRadialPoints: RadialPoints = {
  center: { x: 0.5, y: 0.5, color: "#ffffff", radius: 0.1, intensity: 1 },
  focus: { x: 1, y: 1, color: "#000000", radius: 1, intensity: 1 },
};

export const defaultLinearStops = [
  { id: "1", position: 0, color: "#ff0000", x: 0.1, y: 0.5, intensity: 1 }, // Start Point
  { id: "2", position: 1, color: "#0000ff", x: 0.9, y: 0.5, intensity: 1 }, // End Point
];

export const defaultRadialStops = [
  { id: "1", position: 0, color: "#e0f2fe", x: 0.1, y: 0.5, intensity: 1 }, // Center color
  { id: "2", position: 0.35, color: "#172554", x: 0.9, y: 0.5, intensity: 1 }, // Outer color
];

export const defaultFilters: Filters = {
  noise: 0.05,
  tint: 0,
  temperature: 0,
  contrast: 0,
  saturation: 0,
  brightness: 0,
};

export const exportPresets = [
  { name: "1080p (FHD)", width: 1920, height: 1080 },
  { name: "720p (HD)", width: 1280, height: 720 },
  { name: "4K (UHD)", width: 3840, height: 2160 },
  { name: "Square (1:1)", width: 2048, height: 2048 },
];

//LANDING PAGE
export const NOISE_SVG_DATA_URI = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E`;

export const GRADIENT_PRESETS = [
  "linear-gradient(45deg, #ff3366, #ffcc33)",
  "radial-gradient(circle, #8e2de2, #4a00e0)",
  "conic-gradient(from 0deg, #00f260, #0575e6)",
  "linear-gradient(to bottom right, #fd746c, #ff9068)",
  "radial-gradient(at top right, #c94b4b, #4b134f)",
  "linear-gradient(90deg, #00d2ff, #3a7bd5)",
  "conic-gradient(from 180deg, #f857a6, #ff5858)",
  "linear-gradient(to top, #09203f, #537895)",
];
