// src/components/gradient/panels/GradientPanel.tsx

import React, { FC, Dispatch, useCallback } from "react";
import {
  GradientState,
  GradientActions,
  ActionType,
  ColorStop,
} from "@/types/gradient";
import { Label } from "@/components/ui/label";
import { GradientRail } from "../GradientRail";
import { ColorStopEditor } from "../ColorStopEditor";
import { ControlInput } from "../ControlInput";

interface GradientPanelProps {
  state: GradientState;
  dispatch: Dispatch<GradientActions>;
  sortedStops: ColorStop[];
  railGradientCss: string;
}

export const GradientPanel: FC<GradientPanelProps> = ({
  state,
  dispatch,
  sortedStops,
  railGradientCss,
}) => {
  const { type, angle, stops, activeStopId } = state;
  const activeStop = stops.find((s) => s.id === activeStopId) || null;

  const handleAddStop = useCallback(
    (position?: number) => {
      // ... (existing logic) ...
      let insertPos = position;
      if (insertPos === undefined) {
        const sorted = [...stops].sort((a, b) => a.position - b.position);
        let maxGap = 0,
          pos = 50,
          prevPos = 0;
        for (const stop of sorted) {
          const gap = stop.position - prevPos;
          if (gap > maxGap) {
            maxGap = gap;
            pos = prevPos + gap / 2;
          }
          prevPos = stop.position;
        }
        const lastGap = 100 - prevPos;
        if (lastGap > maxGap) {
          pos = prevPos + lastGap / 2;
        }
        insertPos = pos;
      }

      const newStop: ColorStop = {
        id: crypto.randomUUID(),
        color:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0"),
        alpha: 1,
        position: Math.round(insertPos),
      };
      dispatch({
        type: ActionType.ADD_STOP,
        payload: { position: insertPos, newStop },
      });
    },
    [dispatch, stops]
  );

  const handleRemoveStop = useCallback(
    (id: string) => dispatch({ type: ActionType.REMOVE_STOP, payload: { id } }),
    [dispatch]
  );

  const handleSelectStop = useCallback(
    (id: string) => dispatch({ type: ActionType.SELECT_STOP, payload: { id } }),
    [dispatch]
  );

  const handleUpdateStopPosition = useCallback(
    (id: string, position: number) =>
      dispatch({
        type: ActionType.UPDATE_STOP_POSITION,
        payload: { id, position },
      }),
    [dispatch]
  );

  const handleStopChange = useCallback(
    (id: string, key: keyof ColorStop, value: any) =>
      dispatch({ type: ActionType.UPDATE_STOP, payload: { id, key, value } }),
    [dispatch]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          {/* Radio buttons for Linear/Radial */}
          <label className="flex-1">
            <input
              type="radio"
              name="type"
              value="linear"
              checked={type === "linear"}
              onChange={() =>
                dispatch({
                  type: ActionType.SET_TYPE,
                  payload: { type: "linear" },
                })
              }
              className="sr-only peer"
            />
            <span className="block w-full text-center px-4 py-2 rounded-md bg-muted text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground cursor-pointer text-sm font-medium">
              Linear
            </span>
          </label>
          <label className="flex-1">
            <input
              type="radio"
              name="type"
              value="radial"
              checked={type === "radial"}
              onChange={() =>
                dispatch({
                  type: ActionType.SET_TYPE,
                  payload: { type: "radial" },
                })
              }
              className="sr-only peer"
            />
            <span className="block w-full text-center px-4 py-2 rounded-md bg-muted text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground cursor-pointer text-sm font-medium">
              Radial
            </span>
          </label>
        </div>
      </div>

      {type === "linear" && (
        // ✅ Use ControlInput with type="slider"
        <ControlInput
          label="Angle"
          min={0}
          max={360}
          step={1}
          unit="°"
          value={angle}
          onValueChange={(val) =>
            dispatch({
              type: ActionType.SET_ANGLE,
              payload: { angle: (val as number[])[0] },
            })
          }
          type="slider"
        />
      )}

      <div className="space-y-2">
        <Label>Color Stops</Label>
        <GradientRail
          stops={sortedStops}
          gradientCss={railGradientCss}
          activeStopId={activeStopId}
          onAddStop={() => handleAddStop(undefined)}
          onSelectStop={handleSelectStop}
          onUpdateStopPosition={handleUpdateStopPosition}
        />
      </div>

      <ColorStopEditor
        stop={activeStop}
        onChange={handleStopChange}
        onRemove={handleRemoveStop}
        canRemove={stops.length > 2}
      />
    </div>
  );
};
