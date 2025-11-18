import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  // --- UI STATE ---
  const [isOpen, setIsOpen] = useState(true);

  // --- LOGIC (Kept exactly as provided - rAF loop) ---
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

  // --- RENDER (Updated with Animation & Icon) ---
  return (
    <div className="w-full">
      {/* HEADER / TRIGGER */}
      <div
        className="flex items-center justify-between gap-4 px-4 py-2 cursor-pointer select-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-sm font-semibold group-hover:text-zinc-300 transition-colors">
          Color Stops
        </h4>

        <Button variant="ghost" size="icon" className="size-8 text-zinc-400">
          {/* CUSTOM ANIMATED ICON (+ to -) */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Horizontal line (Always visible) */}
            <line x1="5" y1="12" x2="19" y2="12" />

            {/* Vertical line (Collapses when Open to make a Minus) */}
            <motion.line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
              initial={false}
              animate={{ scaleY: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.svg>
          <span className="sr-only">Toggle</span>
        </Button>
      </div>

      {/* ANIMATED CONTENT */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-4 w-full">
              <div className="w-full">
                {mode === "mesh" &&
                  currentMesh.map((p, i) => (
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
                  ))}

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
                            onValueChange={(v) =>
                              handleStopPositionChange(v, i)
                            }
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
