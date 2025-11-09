// src/components/gradient/panels/EffectsPanel.tsx

import React, { FC, Dispatch, useCallback } from "react";
import { GradientState, GradientActions, ActionType } from "@/types/gradient";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ControlInput } from "../ControlInput"; // ✅ Import ControlInput
import { CollapsibleSection } from "../CollapsibleSection";
import { RotateCcw } from "lucide-react";

interface EffectsPanelProps {
  state: GradientState;
  dispatch: Dispatch<GradientActions>;
}

export const EffectsPanel: FC<EffectsPanelProps> = ({ state, dispatch }) => {
  const { filters, vignette, noise } = state;

  const handleSliderChange = (
    group: "filters" | "vignette" | "noise",
    name: string
  ) => {
    return (value: number[] | string) => {
      // Ensure it's a number array for sliders
      const numValue =
        typeof value === "string" ? parseFloat(value) : (value as number[])[0];

      const actionType =
        group === "filters"
          ? ActionType.SET_FILTER
          : group === "vignette"
          ? ActionType.SET_VIGNETTE
          : ActionType.SET_NOISE;
      dispatch({ type: actionType, payload: { key: name, value: numValue } });
    };
  };

  const handleSelectChange = (name: string) => {
    return (value: string) => {
      dispatch({ type: ActionType.SET_NOISE, payload: { key: name, value } });
    };
  };

  const resetEffects = useCallback(
    () => dispatch({ type: ActionType.RESET_EFFECTS }),
    [dispatch]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pr-4">
        <h3 className="text-lg font-semibold">Effects</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetEffects}
          title="Reset Effects"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <CollapsibleSection title="Filters" defaultOpen>
        <div className="space-y-6">
          <ControlInput // ✅ Use ControlInput for filters
            label="Blur"
            min={0}
            max={20}
            step={0.1}
            unit="px"
            value={filters.blur}
            onValueChange={handleSliderChange("filters", "blur")}
            type="slider"
          />
          <ControlInput
            label="Brightness"
            min={0}
            max={200}
            step={1}
            unit="%"
            value={filters.brightness}
            onValueChange={handleSliderChange("filters", "brightness")}
            type="slider"
          />
          <ControlInput
            label="Contrast"
            min={0}
            max={200}
            step={1}
            unit="%"
            value={filters.contrast}
            onValueChange={handleSliderChange("filters", "contrast")}
            type="slider"
          />
          <ControlInput
            label="Saturation"
            min={0}
            max={200}
            step={1}
            unit="%"
            value={filters.saturation}
            onValueChange={handleSliderChange("filters", "saturation")}
            type="slider"
          />
          <ControlInput
            label="Hue"
            min={0}
            max={360}
            step={1}
            unit="°"
            value={filters.hueRotate}
            onValueChange={handleSliderChange("filters", "hueRotate")}
            type="slider"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Vignette">
        <div className="space-y-6">
          <ControlInput // ✅ Use ControlInput for vignette
            label="Strength"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={vignette.strength}
            onValueChange={handleSliderChange("vignette", "strength")}
            type="slider"
          />
          <ControlInput
            label="Size"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={vignette.size}
            onValueChange={handleSliderChange("vignette", "size")}
            type="slider"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Noise">
        <div className="space-y-6">
          <ControlInput // ✅ Use ControlInput for noise opacity
            label="Opacity"
            min={0}
            max={1}
            step={0.01}
            value={noise.opacity}
            onValueChange={handleSliderChange("noise", "opacity")}
            type="slider"
          />
          <div className="space-y-2">
            <Label htmlFor="noiseBlendMode">Blend Mode</Label>
            <Select
              value={noise.blendMode}
              onValueChange={handleSelectChange("blendMode")}
            >
              <SelectTrigger id="noiseBlendMode">
                <SelectValue placeholder="Select blend mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overlay">Overlay</SelectItem>
                <SelectItem value="soft-light">Soft Light</SelectItem>
                <SelectItem value="multiply">Multiply</SelectItem>
                <SelectItem value="screen">Screen</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
