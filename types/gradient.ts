export interface ColorStop {
  id: string;
  color: string;
  alpha: number;
  position: number;
}

export interface GradientState {
  stops: ColorStop[];
  activeStopId: string | null;
  angle: number;
  type: "linear" | "radial";
  repeating: boolean;
  filters: {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
    hueRotate: number;
  };
  vignette: {
    strength: number;
    size: number;
  };
  noise: {
    opacity: number;
    blendMode: "overlay" | "soft-light" | "multiply" | "screen" | "normal";
  };
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

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
  RESET_EFFECTS = "RESET_EFFECTS",
  RANDOMIZE = "RANDOMIZE",
}

type GradientPayload = {
  [ActionType.ADD_STOP]: { position: number; newStop: ColorStop };
  [ActionType.REMOVE_STOP]: { id: string };
  [ActionType.UPDATE_STOP]: { id: string; key: keyof ColorStop; value: any };
  [ActionType.SELECT_STOP]: { id: string };
  [ActionType.UPDATE_STOP_POSITION]: { id: string; position: number };

  [ActionType.SET_TYPE]: { type: "linear" | "radial" };
  [ActionType.SET_ANGLE]: { angle: number };

  [ActionType.SET_FILTER]: { key: string; value: number };
  [ActionType.SET_VIGNETTE]: { key: string; value: number };
  [ActionType.SET_NOISE]: { key: string; value: string | number };

  [ActionType.RESET_EFFECTS]: undefined;
  [ActionType.RANDOMIZE]: { newState: Partial<GradientState> };
};

export type GradientActions =
  ActionMap<GradientPayload>[keyof ActionMap<GradientPayload>];
