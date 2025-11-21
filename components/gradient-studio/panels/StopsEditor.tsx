import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  SelectedPoint,
} from "@/lib/type";
import { MAX_STOPS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
  const [isOpen, setIsOpen] = useState(true);
  const [localStops, setLocalStops] = useState(stops);
  const [localMeshPoints, setLocalMeshPoints] = useState(meshPoints);

  const latestStopsToSet = useRef<GradientStop[] | null>(null);
  const latestMeshToSet = useRef<MeshPoint[] | null>(null);
  const animFrameStopsRef = useRef<number | null>(null);
  const animFrameMeshRef = useRef<number | null>(null);

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
      if (animFrameStopsRef.current)
        cancelAnimationFrame(animFrameStopsRef.current);
      if (animFrameMeshRef.current)
        cancelAnimationFrame(animFrameMeshRef.current);
    };
  }, [setStops, setMeshPoints]);

  const updateStop = (idx: number, key: string, val: any) => {
    const updated = localStops.map((s, i) =>
      i === idx ? { ...s, [key]: val } : s
    );
    setLocalStops(updated);
    latestStopsToSet.current = updated;
  };

  const updateMesh = (idx: number, key: string, val: any) => {
    const updated = localMeshPoints.map((p, i) =>
      i === idx ? { ...p, [key]: val } : p
    );
    setLocalMeshPoints(updated);
    latestMeshToSet.current = updated;
  };

  const currentItems = mode === "mesh" ? localMeshPoints : localStops;

  return (
    <div className="w-full border-b border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
      >
        <span className="panel-header mb-0 group-hover:text-white transition-colors">
          Color_Nodes [{currentItems.length}]
        </span>
        {isOpen ? (
          <Minus
            size={12}
            className="text-zinc-500 group-hover:text-white transition-colors"
          />
        ) : (
          <Plus
            size={12}
            className="text-zinc-500 group-hover:text-white transition-colors"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3">
              {currentItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="group bg-zinc-950 border border-zinc-800 p-2 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-4 h-4 border border-zinc-600 hover:border-white cursor-pointer transition-colors">
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: item.color }}
                      />
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => {
                          mode === "mesh"
                            ? updateMesh(i, "color", e.target.value)
                            : updateStop(i, "color", e.target.value);
                        }}
                        onClick={(e) => {
                          setSelectedPoint({
                            type: mode === "mesh" ? "mesh" : "linear-stop",
                            index: i,
                          });
                          e.stopPropagation();
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    <span
                      className="text-[10px] text-zinc-500 font-mono cursor-pointer hover:text-white uppercase"
                      onClick={() =>
                        setSelectedPoint({
                          type: mode === "mesh" ? "mesh" : "linear-stop",
                          index: i,
                        })
                      }
                    >
                      NODE_{i.toString().padStart(2, "0")}
                    </span>

                    <button
                      onClick={() =>
                        mode === "mesh" ? removeMeshPoint(i) : removeStop(i)
                      }
                      disabled={currentItems.length <= 2}
                      className="ml-auto text-zinc-600 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {mode !== "mesh" && (
                    <div className="space-y-2 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] uppercase w-6 text-zinc-500">
                          Pos
                        </span>
                        <Slider
                          value={[item.position]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(v) => updateStop(i, "position", v[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={mode === "mesh" ? addMeshPoint : addStop}
                  disabled={currentItems.length >= MAX_STOPS}
                  className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 rounded-none h-8 text-[10px] uppercase"
                >
                  <Plus size={10} className="mr-1" /> Add Node
                </Button>
                <Button
                  onClick={onReset}
                  className="flex-1 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-none h-8 text-[10px] uppercase"
                >
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
