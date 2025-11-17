import React, { useState, useEffect, useRef } from "react";
// 1. ADDED ChevronsUpDown HERE
import { Plus, Trash2, ChevronsUpDown } from "lucide-react";
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

// 2. ADDED these imports from your example
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  // State for the collapsible
  const [isOpen, setIsOpen] = useState(true);

  // All your existing logic (unchanged)
  const [localStops, setLocalStops] = useState(stops);
  const [localMeshPoints, setLocalMeshPoints] = useState(meshPoints);

  const animFrameStopsRef = useRef<number | null>(null);
  const animFrameMeshRef = useRef<number | null>(null);

  const latestStopsToSet = useRef<GradientStop[] | null>(null);
  const latestMeshToSet = useRef<MeshPoint[] | null>(null);

  useEffect(() => setLocalStops(stops), [stops]);
  useEffect(() => setLocalMeshPoints(meshPoints), [meshPoints]);

  useEffect(() => {
    const runStopsUpdate = () => {
      if (latestStopsToSet.current) {
        setStops(latestStopsToSet.current);
        latestStopsToSet.current = null;
      }
      animFrameStopsRef.current = requestAnimationFrame(runStopsUpdate);
    };

    const runMeshUpdate = () => {
      if (latestMeshToSet.current) {
        setMeshPoints(latestMeshToSet.current);
        latestMeshToSet.current = null;
      }
      animFrameMeshRef.current = requestAnimationFrame(runMeshUpdate);
    };

    animFrameStopsRef.current = requestAnimationFrame(runStopsUpdate);
    animFrameMeshRef.current = requestAnimationFrame(runMeshUpdate);

    return () => {
      if (animFrameStopsRef.current) {
        cancelAnimationFrame(animFrameStopsRef.current);
      }
      if (animFrameMeshRef.current) {
        cancelAnimationFrame(animFrameMeshRef.current);
      }
    };
  }, [setStops, setMeshPoints]);

  const handleMeshColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const newColor = e.target.value;
    const updated = localMeshPoints.map((p, idx) =>
      idx === i ? { ...p, color: newColor } : p
    );
    setLocalMeshPoints(updated);
    latestMeshToSet.current = updated;
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
    latestStopsToSet.current = updated;
  };

  const handleStopPositionChange = (value: number[], i: number) => {
    const updated = localStops.map((s, idx) =>
      idx === i ? { ...s, position: value[0] } : s
    );
    setLocalStops(updated);
    latestStopsToSet.current = updated;
  };

  const currentMesh = mode === "mesh" ? localMeshPoints : [];
  const currentStops = mode !== "mesh" ? localStops : [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      {/* 3. THIS IS THE HEADER/TRIGGER DIV YOU WERE LOOKING FOR */}
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <h4 className="text-sm font-semibold">Color Stops</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="space-y-3 pb-4 w-full">
          <div className="w-full">
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

          <div className="flex items-center justify-center gap-2 pt-2 px-2">
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

            <Button size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
