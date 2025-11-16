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
    <div className="p-2 space-y-4 w-full overflow-x-hidden">
      <h3 className="text-sm font-semibold mb-1">Selected Point</h3>

      {/* All inputs below now use localData and handleSliderUpdate/handleColorUpdate */}

      {"color" in localData && (
        <div className="flex items-center gap-3 w-full">
          <Label className="text-sm text-zinc-300 flex-shrink-0">Color</Label>
          <input
            type="color"
            value={localData.color}
            onChange={handleColorUpdate}
            className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer flex-shrink-0"
          />
        </div>
      )}

      {/* --- START: RESPONSIVE LAYOUT FIX FOR SLIDERS --- */}

      {"x" in localData && (
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 border-b border-b-[#222222] w-full min-w-0">
          {/* 1. Label: 40% */}
          <Label
            htmlFor="x-slider"
            className="text-[#AAAAAA] font-extralight flex-shrink-0"
            style={{ flexBasis: "calc(40% - 0.25rem)", minWidth: 0 }}
          >
            X
          </Label>
          {/* 2. Slider + Value: 60% */}
          <div
            className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"
            style={{ flexBasis: "calc(60% - 0.25rem)", minWidth: 0 }}
          >
            <Slider
              id="x-slider"
              value={[localData.x]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(val) => handleSliderUpdate("x", val)}
              className="py-1 flex-grow min-w-0"
            />
            <span className="w-8 sm:w-10 text-xs text-zinc-400 text-right flex-shrink-0">
              {localData.x.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {"y" in localData && (
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 border-b border-b-[#222222] w-full min-w-0">
          {/* 1. Label: 40% */}
          <Label
            htmlFor="y-slider"
            className="text-[#AAAAAA] font-extralight flex-shrink-0"
            style={{ flexBasis: "calc(40% - 0.25rem)", minWidth: 0 }}
          >
            Y
          </Label>
          {/* 2. Slider + Value: 60% */}
          <div
            className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"
            style={{ flexBasis: "calc(60% - 0.25rem)", minWidth: 0 }}
          >
            <Slider
              id="y-slider"
              value={[localData.y]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(val) => handleSliderUpdate("y", val)}
              className="py-1 flex-grow min-w-0"
            />
            <span className="w-8 sm:w-10 text-xs text-zinc-400 text-right flex-shrink-0">
              {localData.y.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {"radius" in localData && (
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 border-b border-b-[#222222] w-full min-w-0">
          {/* 1. Label: 40% */}
          <Label
            htmlFor="radius-slider"
            className="text-[#AAAAAA] font-extralight flex-shrink-0"
            style={{ flexBasis: "calc(40% - 0.25rem)", minWidth: 0 }}
          >
            Radius
          </Label>
          {/* 2. Slider + Value: 60% */}
          <div
            className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"
            style={{ flexBasis: "calc(60% - 0.25rem)", minWidth: 0 }}
          >
            <Slider
              id="radius-slider"
              value={[localData.radius]}
              min={0.01}
              max={1}
              step={0.01}
              onValueChange={(val) => handleSliderUpdate("radius", val)}
              className="py-1 flex-grow min-w-0"
            />
            <span className="w-8 sm:w-10 text-xs text-zinc-400 text-right flex-shrink-0">
              {localData.radius.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {"intensity" in localData && (
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 border-b border-b-[#222222] w-full min-w-0">
          {/* 1. Label: 40% */}
          <Label
            htmlFor="intensity-slider"
            className="text-[#AAAAAA] font-extralight flex-shrink-0"
            style={{ flexBasis: "calc(40% - 0.25rem)", minWidth: 0 }}
          >
            Intensity
          </Label>
          {/* 2. Slider + Value: 60% */}
          <div
            className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"
            style={{ flexBasis: "calc(60% - 0.25rem)", minWidth: 0 }}
          >
            <Slider
              id="intensity-slider"
              value={[localData.intensity]}
              min={0}
              max={2}
              step={0.01}
              onValueChange={(val) => handleSliderUpdate("intensity", val)}
              className="py-1 flex-grow min-w-0"
            />
            <span className="w-8 sm:w-10 text-xs text-zinc-400 text-right flex-shrink-0">
              {localData.intensity.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <Button onClick={onDeselect} size="sm" className="mt-2">
        Deselect
      </Button>
    </div>
  );
}
