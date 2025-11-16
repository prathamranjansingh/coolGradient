import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  SelectedPoint,
} from "@/lib/type";
import { MAX_STOPS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type Props = {
  mode: GradientMode;
  stops: GradientStop[];
  meshPoints: MeshPoint[];
  selectedPoint: SelectedPoint | null;
  setStops: React.Dispatch<React.SetStateAction<GradientStop[]>>;
  setMeshPoints: React.Dispatch<React.SetStateAction<MeshPoint[]>>;
  setSelectedPoint: React.Dispatch<React.SetStateAction<SelectedPoint | null>>;
  addStop: () => void;
  addMeshPoint: () => void;
  removeStop: (index: number) => void;
  removeMeshPoint: (index: number) => void;
  onReset: () => void;
};

export function StopsEditor({
  mode,
  stops,
  meshPoints,
  selectedPoint,
  setStops,
  setMeshPoints,
  setSelectedPoint,
  addStop,
  addMeshPoint,
  removeStop,
  removeMeshPoint,
  onReset,
}: Props) {
  // --- START: PERFORMANCE FIX ---

  // 1. Local state for immediate UI updates
  const [localStops, setLocalStops] = useState(stops);
  const [localMeshPoints, setLocalMeshPoints] = useState(meshPoints);

  const timeoutStopsRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutMeshRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Sync local state when parent props change
  useEffect(() => {
    setLocalStops(stops);
  }, [stops]);

  useEffect(() => {
    setLocalMeshPoints(meshPoints);
  }, [meshPoints]);

  // 3. Debounced updaters for parent state
  const debouncedSetStops = useCallback(
    (newStops: GradientStop[]) => {
      if (timeoutStopsRef.current) {
        clearTimeout(timeoutStopsRef.current);
      }
      timeoutStopsRef.current = setTimeout(() => {
        setStops(newStops);
      }, 16); // ~60fps
    },
    [setStops]
  );

  const debouncedSetMeshPoints = useCallback(
    (newMeshPoints: MeshPoint[]) => {
      if (timeoutMeshRef.current) {
        clearTimeout(timeoutMeshRef.current);
      }
      timeoutMeshRef.current = setTimeout(() => {
        setMeshPoints(newMeshPoints);
      }, 16);
    },
    [setMeshPoints]
  );

  // 4. Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutStopsRef.current) clearTimeout(timeoutStopsRef.current);
      if (timeoutMeshRef.current) clearTimeout(timeoutMeshRef.current);
    };
  }, []);

  // 5. Handlers that update local state first, then call debounced parent updater
  const handleMeshColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newColor = e.target.value;
    const newMeshPoints = localMeshPoints.map((point, idx) =>
      idx === index ? { ...point, color: newColor } : point
    );
    setLocalMeshPoints(newMeshPoints); // Update local state instantly
    debouncedSetMeshPoints(newMeshPoints); // Update parent (debounced)
  };

  const handleStopColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newColor = e.target.value;
    const newStops = localStops.map((st, idx) =>
      idx === index ? { ...st, color: newColor } : st
    );
    setLocalStops(newStops);
    debouncedSetStops(newStops);
  };

  const handleStopPositionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newPosition = Number(e.target.value);
    const newStops = localStops.map((st, idx) =>
      idx === index ? { ...st, position: newPosition } : st
    );
    setLocalStops(newStops);
    debouncedSetStops(newStops);
  };

  // --- END: PERFORMANCE FIX ---

  // Use local state for rendering lists
  const currentMeshPoints = mode === "mesh" ? localMeshPoints : [];
  const currentStops = mode !== "mesh" ? localStops : [];

  return (
    <div className="space-y-3 px-2 sm:px-4 pb-4 w-full overflow-x-hidden">
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 w-full overflow-x-hidden">
        {mode === "mesh"
          ? // FIX: Added guard clause and map over local state
            currentMeshPoints &&
            currentMeshPoints.map((p, i) => (
              <div
                key={`mesh-${i}`}
                className={`flex items-center gap-2 p-2 rounded transition-colors w-full min-w-0 ${
                  selectedPoint?.type === "mesh" && selectedPoint.index === i
                    ? "bg-zinc-700"
                    : "bg-zinc-800/50 hover:bg-zinc-800"
                }`}
              >
                <input
                  type="color"
                  value={p.color} // Read from local state
                  onChange={(e) => handleMeshColorChange(e, i)} // Use new handler
                  className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer flex-shrink-0"
                />
                <div
                  className="text-sm flex-1 cursor-pointer min-w-0 truncate"
                  onClick={() => setSelectedPoint({ type: "mesh", index: i })}
                >
                  Point {i + 1}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMeshPoint(i)}
                  className="size-7 text-zinc-400 hover:bg-red-700 hover:text-white"
                  disabled={currentMeshPoints.length <= 2}
                  aria-label={`Remove point ${i + 1}`}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))
          : // FIX: Added guard clause and map over local state
            currentStops &&
            currentStops.map((s, i) => (
              <div
                key={`stop-${i}`}
                className={`flex items-center gap-2 p-2 rounded transition-colors w-full min-w-0 ${
                  (selectedPoint?.type === "linear-stop" ||
                    selectedPoint?.type === "linear" ||
                    selectedPoint?.type === "radial-stop") &&
                  selectedPoint.index === i
                    ? "bg-zinc-700"
                    : "bg-zinc-800/50 hover:bg-zinc-800"
                }`}
              >
                <input
                  type="color"
                  value={s.color} // Read from local state
                  onChange={(e) => handleStopColorChange(e, i)} // Use new handler
                  className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer flex-shrink-0"
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={s.position} // Read from local state
                  onChange={(e) => handleStopPositionChange(e, i)} // Use new handler
                  className="flex-1 min-w-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStop(i)}
                  className="size-7 text-zinc-400 hover:bg-red-700 hover:text-white"
                  disabled={currentStops.length <= 2}
                  aria-label={`Remove stop ${i + 1}`}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={mode === "mesh" ? addMeshPoint : addStop}
          disabled={
            mode === "mesh"
              ? currentMeshPoints?.length >= MAX_STOPS
              : currentStops?.length >= MAX_STOPS
          }
          aria-label="Add point or stop"
        >
          <Plus size={16} className="mr-1" /> Add
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
