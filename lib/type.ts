export type GradientMode = "linear" | "radial" | "mesh";

export type GradientStop = {
  id: string;
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
};

export type Filters = {
  noise: number;
  tint: number;
  temperature: number;
  contrast: number;
  saturation: number;
  brightness: number;
};

export type SelectedPoint =
  | { type: "linear"; index: number }
  | { type: "linear-stop"; index: number }
  | { type: "radial-stop"; index: number }
  | { type: "mesh"; index: number }
  | { type: "radial"; point: "center" | "focus" }
  | null;

export type InteractionPoint = SelectedPoint;
