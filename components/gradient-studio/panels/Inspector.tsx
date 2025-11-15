import React, { useCallback, useRef, useState, useEffect } from "react";
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

type SelectedData =
  | MeshPoint
  | GradientStop
  | RadialPoints[keyof RadialPoints]
  | null;

export function Inspector({
  selectedPoint,
  data,
  onUpdate,
  onDeselect,
}: Props) {
  // Guard clause for initial load / hydration errors
  if (!data || !data.stops || !data.meshPoints || !data.radialPoints) {
    return (
      <div className="p-4 text-sm text-zinc-400 h-24 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Helper to get the currently selected data object
  const getSelectedData = useCallback((): SelectedData => {
    if (!selectedPoint) return null;
    // These are safe to access because of the guard clause above
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
  }, [selectedPoint, data]);

  // --- START: PERFORMANCE FIX ---

  // 1. Local state for immediate UI updates
  const [localData, setLocalData] = useState<SelectedData>(getSelectedData());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Sync local state when the *selected point changes* from the parent
  useEffect(() => {
    setLocalData(getSelectedData());
  }, [getSelectedData]);

  // 3. Debounced update function
  const updateProp = useCallback(
    (key: string, value: any) => {
      // Update local state immediately for smooth UI
      setLocalData((prev) => {
        if (!prev) return null;
        return { ...prev, [key]: value };
      });

      // Debounce the actual parent state update to reduce re-renders
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onUpdate(key, value); // Call the "expensive" prop function
      }, 16); // ~60fps update rate
    },
    [onUpdate]
  );

  // 4. Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 5. Handlers for different input types
  const handleSliderUpdate = (key: string, value: number[]) => {
    updateProp(key, value[0]);
  };

  const handleColorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProp("color", e.target.value);
  };

  // --- END: PERFORMANCE FIX ---

  // Use localData for rendering
  if (!selectedPoint || !localData) {
    return (
      <div className="p-4 text-sm text-zinc-400 h-24 flex items-center justify-center">
        No point selected.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold mb-1">Selected Point</h3>

      {/* All inputs below now use localData and handleSliderUpdate/handleColorUpdate */}

      {"color" in localData && (
        <div className="flex items-center gap-3">
          <Label className="text-sm text-zinc-300">Color</Label>
          <input
            type="color"
            value={localData.color}
            onChange={handleColorUpdate}
            className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer"
          />
        </div>
      )}

      {"x" in localData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="x-slider" className="text-zinc-300 text-sm">
              X
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {localData.x.toFixed(2)}
            </span>
          </div>
          <Slider
            id="x-slider"
            value={[localData.x]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("x", val)}
            className="py-1"
          />
        </div>
      )}

      {"y" in localData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="y-slider" className="text-zinc-300 text-sm">
              Y
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {localData.y.toFixed(2)}
            </span>
          </div>
          <Slider
            id="y-slider"
            value={[localData.y]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("y", val)}
            className="py-1"
          />
        </div>
      )}

      {"radius" in localData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="radius-slider" className="text-zinc-300 text-sm">
              Radius
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {localData.radius.toFixed(2)}
            </span>
          </div>
          <Slider
            id="radius-slider"
            value={[localData.radius]}
            min={0.01}
            max={1}
            step={0.01}
            onValueChange={(val) => handleSliderUpdate("radius", val)}
            className="py-1"
          />
        </div>
      )}

      {"intensity" in localData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="intensity-slider" className="text-zinc-300 text-sm">
              Intensity
            </Label>
            <span className="w-10 text-xs text-zinc-400 text-right">
              {localData.intensity.toFixed(2)}
            </span>
          </div>
          <Slider
            id="intensity-slider"
            value={[localData.intensity]}
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
