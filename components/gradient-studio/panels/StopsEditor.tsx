import React from "react";
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
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {mode === "mesh"
          ? // FIX: Added guard clause
            meshPoints &&
            meshPoints.map((p, i) => (
              <div
                key={`mesh-${i}`}
                className={`flex items-center gap-2 p-2 rounded transition-colors ${
                  selectedPoint?.type === "mesh" && selectedPoint.index === i
                    ? "bg-zinc-700"
                    : "bg-zinc-800/50 hover:bg-zinc-800"
                }`}
              >
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) =>
                    setMeshPoints((prev) =>
                      prev.map((point, idx) =>
                        idx === i ? { ...point, color: e.target.value } : point
                      )
                    )
                  }
                  className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer"
                />
                <div
                  className="text-sm flex-1 cursor-pointer"
                  onClick={() => setSelectedPoint({ type: "mesh", index: i })}
                >
                  Point {i + 1}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMeshPoint(i)}
                  className="size-7 text-zinc-400 hover:bg-red-700 hover:text-white"
                  disabled={meshPoints.length <= 2}
                  aria-label={`Remove point ${i + 1}`}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))
          : // FIX: Added guard clause
            stops &&
            stops.map((s, i) => (
              <div
                key={`stop-${i}`}
                className={`flex items-center gap-2 p-2 rounded transition-colors ${
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
                  value={s.color}
                  onChange={(e) =>
                    setStops((prev) =>
                      prev.map((st, idx) =>
                        idx === i ? { ...st, color: e.target.value } : st
                      )
                    )
                  }
                  className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer"
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={s.position}
                  onChange={(e) =>
                    setStops((prev) =>
                      prev.map((st, idx) =>
                        idx === i
                          ? {
                              ...st,
                              position: Number(e.target.value),
                            }
                          : st
                      )
                    )
                  }
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStop(i)}
                  className="size-7 text-zinc-400 hover:bg-red-700 hover:text-white"
                  disabled={stops.length <= 2}
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
              ? meshPoints?.length >= MAX_STOPS
              : stops?.length >= MAX_STOPS
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
