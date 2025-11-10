// src/types/gradient.ts
export interface ColorStop {
  id: string;
  color: string;
  alpha: number;
  position: number;
}

export interface FilterState {
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
}

export interface VignetteState {
  strength: number;
  size: number;
}

export interface NoiseState {
  opacity: number;
  blendMode: "overlay" | "soft-light" | "multiply" | "screen" | "normal";
}

export interface GradientState {
  stops: ColorStop[];
  activeStopId: string | null;
  angle: number;
  type: "linear" | "radial";
  repeating: boolean;
  filters: FilterState;
  vignette: VignetteState;
  noise: NoiseState;
}

export enum ActionType {
  ADD_STOP = "ADD_STOP",
  REMOVE_STOP = "REMOVE_STOP",
  UPDATE_STOP = "UPDATE_STOP",
  SELECT_STOP = "SELECT_STOP",
  UPDATE_STOP_POSITION = "UPDATE_STOP_POSITION",
  SET_TYPE = "SET_TYPE",
  SET_ANGLE = "SET_ANGLE",
  SET_FILTER = "SET_FILTER",
  SET_VIGNETTE = "SET_VIGNETTE",
  SET_NOISE = "SET_NOISE",
  // SET_PATTERN is fully removed
  RESET_EFFECTS = "RESET_EFFECTS",
  RANDOMIZE = "RANDOMIZE",
}

export type GradientActions =
  | {
      type: ActionType.ADD_STOP;
      payload: { position: number; newStop: ColorStop };
    }
  | { type: ActionType.REMOVE_STOP; payload: { id: string } }
  | {
      type: ActionType.UPDATE_STOP;
      payload: { id: string; key: keyof ColorStop; value: any };
    }
  | { type: ActionType.SELECT_STOP; payload: { id: string } }
  | {
      type: ActionType.UPDATE_STOP_POSITION;
      payload: { id: string; position: number };
    }
  | { type: ActionType.SET_TYPE; payload: { type: "linear" | "radial" } }
  | { type: ActionType.SET_ANGLE; payload: { angle: number } }
  | {
      type: ActionType.SET_FILTER;
      payload: { key: keyof FilterState; value: number };
    }
  | {
      type: ActionType.SET_VIGNETTE;
      payload: { key: keyof VignetteState; value: number };
    }
  | {
      type: ActionType.SET_NOISE;
      payload: { key: keyof NoiseState; value: any };
    }
  // SET_PATTERN action type is fully removed
  | { type: ActionType.RESET_EFFECTS }
  | {
      type: ActionType.RANDOMIZE;
      payload: { newState: Partial<GradientState> };
    };
