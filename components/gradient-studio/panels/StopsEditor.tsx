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
import { Slider } from "@/components/ui/slider";
import { Row } from "@/components/ui/Row";

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
  const [localStops, setLocalStops] = useState(stops);
  const [localMeshPoints, setLocalMeshPoints] = useState(meshPoints);

  const timeoutStopsRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutMeshRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => setLocalStops(stops), [stops]);
  useEffect(() => setLocalMeshPoints(meshPoints), [meshPoints]);

  const debouncedSetStops = useCallback(
    (newStops: GradientStop[]) => {
      if (timeoutStopsRef.current) clearTimeout(timeoutStopsRef.current);
      timeoutStopsRef.current = setTimeout(() => setStops(newStops), 16);
    },
    [setStops]
  );

  const debouncedSetMesh = useCallback(
    (newPoints: MeshPoint[]) => {
      if (timeoutMeshRef.current) clearTimeout(timeoutMeshRef.current);
      timeoutMeshRef.current = setTimeout(() => setMeshPoints(newPoints), 16);
    },
    [setMeshPoints]
  );

  const handleMeshColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const newColor = e.target.value;
    const updated = localMeshPoints.map((p, idx) =>
      idx === i ? { ...p, color: newColor } : p
    );
    setLocalMeshPoints(updated);
    debouncedSetMesh(updated);
  };

  const handleStopColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const newColor = e.target.value;
    const updated = localStops.map((s, idx) =>
      idx === i ? { ...s, color: newColor } : s
    );
    setLocalStops(updated);
    debouncedSetStops(updated);
  };

  const handleStopPositionChange = (value: number[], i: number) => {
    const updated = localStops.map((s, idx) =>
      idx === i ? { ...s, position: value[0] } : s
    );
    setLocalStops(updated);
    debouncedSetStops(updated);
  };

  const currentMesh = mode === "mesh" ? localMeshPoints : [];
  const currentStops = mode !== "mesh" ? localStops : [];

  return (
    <div className="space-y-3 pb-4 w-full overflow-x-hidden">
      <div className="max-h-60 overflow-y-auto w-full overflow-x-hidden">
        {/* ---------------- MESH MODE ---------------- */}
        {mode === "mesh" &&
          currentMesh.map((p, i) => {
            return (
              <Row
                key={`mesh-${i}`}
                left={
                  <input
                    type="color"
                    value={p.color}
                    onChange={(e) => handleMeshColorChange(e, i)}
                    className="w-10 h-10 border-none bg-transparent cursor-pointer"
                  />
                }
                right={
                  <div className="flex items-center gap-2 justify-end w-full">
                    <div
                      className="cursor-pointer text-[#AAAAAA] font-extralight px-2 py-1"
                      onClick={() =>
                        setSelectedPoint({ type: "mesh", index: i })
                      }
                    >
                      Point {i + 1}
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => removeMeshPoint(i)}
                      disabled={currentMesh.length <= 2}
                      className="
                        w-8 h-8 p-0 flex items-center justify-center 
                        text-zinc-400 
                        hover:bg-red-700 hover:text-white
                      "
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                }
              />
            );
          })}

        {/* ---------------- STOP MODE ---------------- */}
        {mode !== "mesh" &&
          currentStops.map((s, i) => (
            <Row
              key={`stop-${i}`}
              left={
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => handleStopColorChange(e, i)}
                  className="w-10 h-10 border-none bg-transparent cursor-pointer"
                />
              }
              right={
                <div className="flex items-center w-full gap-2 justify-end">
                  <Slider
                    value={[s.position]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(v) => handleStopPositionChange(v, i)}
                    className="w-full h-1.5 py-0"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => removeStop(i)}
                    disabled={currentStops.length <= 2}
                    className="
                      w-10 h-10 p-0 flex items-center justify-center 
                      text-zinc-400 
                      hover:bg-red-700 hover:text-white
                    "
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              }
            />
          ))}
      </div>

      <div className="flex gap-2 pt-2 px-2">
        <Button
          size="sm"
          onClick={mode === "mesh" ? addMeshPoint : addStop}
          disabled={
            mode === "mesh"
              ? currentMesh.length >= MAX_STOPS
              : currentStops.length >= MAX_STOPS
          }
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
