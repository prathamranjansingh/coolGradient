import { GradientStop, MeshPoint, RadialPoints, Filters } from "./type";

export const MAX_STOPS = 16;

export const defaultStops: GradientStop[] = [
  { position: 0, color: "#FF6B6B", x: 0.2, y: 0.5, intensity: 1 },
  { position: 1, color: "#4ECDC4", x: 0.8, y: 0.5, intensity: 1 },
];

export const defaultMesh: MeshPoint[] = [
  { x: 0.25, y: 0.25, color: "#FF6B6B", radius: 0.25, intensity: 1 },
  { x: 0.75, y: 0.25, color: "#4ECDC4", radius: 0.25, intensity: 1 },
  { x: 0.25, y: 0.75, color: "#FFE66D", radius: 0.25, intensity: 1 },
  { x: 0.75, y: 0.75, color: "#A8E6CF", radius: 0.25, intensity: 1 },
];

export const defaultRadialPoints: RadialPoints = {
  center: { x: 0.5, y: 0.5 },
  focus: { x: 0.7, y: 0.5 },
};

export const defaultFilters: Filters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  noise: 0,
};

export const exportPresets = [
  { name: "1080p (FHD)", width: 1920, height: 1080 },
  { name: "720p (HD)", width: 1280, height: 720 },
  { name: "4K (UHD)", width: 3840, height: 2160 },
  { name: "Square (1:1)", width: 2048, height: 2048 },
];
