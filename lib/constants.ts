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
