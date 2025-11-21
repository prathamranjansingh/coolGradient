export type GradientMode = "linear" | "radial" | "mesh";

export type GradientStop = {
  position: number;
  color: string;
  x: number;
  y: number;
  intensity: number;
};

export type MeshPoint = {
  x: number;
  y: number;
  color: string;
  radius: number;
  intensity: number;
};

export type RadialPoints = {
  center: MeshPoint;
  focus: MeshPoint;
  [key: string]: MeshPoint;
};

export type Filters = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  noise: number;
  pixelate: number;
  bloom: number;
};

export type SelectedPoint =
  | { type: "linear"; index: number }
  | { type: "linear-stop"; index: number }
  | { type: "radial"; point: "center" | "focus" }
  | { type: "radial-stop"; index: number }
  | { type: "mesh"; index: number };

export type InteractionPoint = SelectedPoint | null;
