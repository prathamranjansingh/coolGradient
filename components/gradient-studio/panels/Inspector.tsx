import React from "react";
import {
  SelectedPoint,
  GradientStop,
  MeshPoint,
  RadialPoints,
} from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  selectedPoint: SelectedPoint | null;
  data: {
    stops: GradientStop[];
    meshPoints: MeshPoint[];
    radialPoints: RadialPoints;
  };
  onUpdate: (key: string, value: any) => void;
  onDeselect: () => void;
};

export function Inspector({
  selectedPoint,
  data,
  onUpdate,
  onDeselect,
}: Props) {
  // FIX: Add a comprehensive guard clause at the top.
  // This checks if the data prop and its nested properties are ready.
  // This is the #1 fix for all hydration-related undefined errors.
  if (!data || !data.stops || !data.meshPoints || !data.radialPoints) {
    return (
      <div className="p-4 text-sm text-zinc-400 h-24 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  type SelectedData =
    | MeshPoint
    | GradientStop
    | RadialPoints[keyof RadialPoints]
    | null;

  const getSelectedData = (): SelectedData => {
    if (!selectedPoint) return null;

    // Because of the guard clause above, all these are now safe to access.
    if (selectedPoint.type === "mesh")
      return data.meshPoints[selectedPoint.index];
    if (
      selectedPoint.type === "linear" ||
      selectedPoint.type === "linear-stop" ||
      selectedPoint.type === "radial-stop"
    )
      return data.stops[selectedPoint.index];
    if (selectedPoint.type === "radial")
      return data.radialPoints[selectedPoint.point];
    return null;
  };

  const selectedData = getSelectedData(); // This call is now safe

  if (!selectedPoint || !selectedData) {
    return (
      <div className="p-4 text-sm text-zinc-400 h-24 flex items-center justify-center">
        No point selected.
      </div>
    );
  }

  // Helper to update state from the slider's array value
  const handleSliderUpdate = (key: string, value: number[]) => {
    onUpdate(key, value[0]);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold mb-1">Selected Point</h3>

      {"color" in selectedData && (
        <div className="flex items-center gap-3">
          <Label className="text-sm text-zinc-300">Color</Label>
          <input
            type="color"
            value={selectedData.color}
            onChange={(e) => onUpdate("color", e.target.value)}
            className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer"
          />
        </div>
      )}

      {"x" in selectedData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="x-slider" className="text-zinc-300 text-sm">
              X
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {selectedData.x.toFixed(2)}
            </span>
          </div>
          <Slider
            id="x-slider"
            value={[selectedData.x]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("x", val)}
            className="py-1"
          />
        </div>
      )}

      {"y" in selectedData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="y-slider" className="text-zinc-300 text-sm">
              Y
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {selectedData.y.toFixed(2)}
            </span>
          </div>
          <Slider
            id="y-slider"
            value={[selectedData.y]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("y", val)}
            className="py-1"
          />
        </div>
      )}

      {"radius" in selectedData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="radius-slider" className="text-zinc-300 text-sm">
              Radius
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {selectedData.radius.toFixed(2)}
            </span>
          </div>
          <Slider
            id="radius-slider"
            value={[selectedData.radius]}
            min={0.01}
            max={1}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("radius", val)}
            className="py-1"
          />
        </div>
      )}

      {"intensity" in selectedData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="intensity-slider" className="text-zinc-300 text-sm">
              Intensity
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {selectedData.intensity.toFixed(2)}
            </span>
          </div>
          <Slider
            id="intensity-slider"
            value={[selectedData.intensity]}
            min={0}
            max={2}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("intensity", val)}
            className="py-1"
          />
        </div>
      )}

      <Button onClick={onDeselect} variant="outline" size="sm" className="mt-2">
        Deselect
      </Button>
    </div>
  );
}
