// src/hooks/useGradientState.ts

import { useReducer, Dispatch } from "react";
import {
  GradientState,
  GradientActions,
  ActionType,
  ColorStop,
} from "@/types/gradient";
import { getRandomComplementaryColors } from "@/lib/color";

const getInitialState = (): GradientState => {
  const firstStopId = crypto.randomUUID();
  return {
    stops: [
      { id: firstStopId, color: "#FF8A00", alpha: 1, position: 0 },
      { id: crypto.randomUUID(), color: "#E52E71", alpha: 1, position: 100 },
    ],
    activeStopId: firstStopId,
    angle: 90,
    type: "linear",
    repeating: false,
    filters: {
      blur: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
    },
    vignette: {
      strength: 0,
      size: 70,
    },
    noise: {
      opacity: 0.1,
      blendMode: "overlay",
    },
  };
};

export const initialState = getInitialState();

export const gradientReducer = (
  state: GradientState,
  action: GradientActions
): GradientState => {
  switch (action.type) {
    case ActionType.ADD_STOP:
      if (state.stops.length >= 12) return state;
      return {
        ...state,
        stops: [...state.stops, action.payload.newStop],
        activeStopId: action.payload.newStop.id,
      };

    case ActionType.REMOVE_STOP:
      if (state.stops.length <= 2) return state;
      const newStops = state.stops.filter(
        (stop) => stop.id !== action.payload.id
      );
      let newActiveId = state.activeStopId;
      if (state.activeStopId === action.payload.id) {
        newActiveId = newStops[0]?.id || null;
      }
      return {
        ...state,
        stops: newStops,
        activeStopId: newActiveId,
      };

    case ActionType.UPDATE_STOP:
      return {
        ...state,
        stops: state.stops.map((stop) =>
          stop.id === action.payload.id
            ? { ...stop, [action.payload.key]: action.payload.value }
            : stop
        ),
      };

    case ActionType.SELECT_STOP:
      return { ...state, activeStopId: action.payload.id };

    case ActionType.UPDATE_STOP_POSITION:
      return {
        ...state,
        stops: state.stops.map((stop) =>
          stop.id === action.payload.id
            ? {
                ...stop,
                position: Math.max(0, Math.min(100, action.payload.position)),
              }
            : stop
        ),
      };

    case ActionType.SET_TYPE:
      return { ...state, type: action.payload.type };

    case ActionType.SET_ANGLE:
      return { ...state, angle: action.payload.angle };

    case ActionType.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionType.SET_VIGNETTE:
      return {
        ...state,
        vignette: {
          ...state.vignette,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionType.SET_NOISE:
      return {
        ...state,
        noise: { ...state.noise, [action.payload.key]: action.payload.value },
      };

    case ActionType.RESET_EFFECTS:
      return {
        ...state,
        filters: initialState.filters,
        vignette: initialState.vignette,
      };

    case ActionType.RANDOMIZE:
      const [color1, color2] = getRandomComplementaryColors();
      const newStopsRand: ColorStop[] = [
        { id: crypto.randomUUID(), color: color1, alpha: 1, position: 0 },
        { id: crypto.randomUUID(), color: color2, alpha: 1, position: 100 },
      ];
      return {
        ...state,
        stops: newStopsRand,
        activeStopId: newStopsRand[0].id,
        angle: Math.floor(Math.random() * 360),
        type: Math.random() > 0.5 ? "linear" : "radial",
      };

    default:
      return state;
  }
};

export const useGradientState = (): [
  GradientState,
  Dispatch<GradientActions>
] => {
  return useReducer(gradientReducer, initialState);
};
