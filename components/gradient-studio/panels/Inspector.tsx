import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  SelectedPoint,
  GradientStop,
  MeshPoint,
  RadialPoints,
} from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { Crosshair, Plus, Minus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isOpen, setIsOpen] = useState(true);

  // Helper to safely extract data based on selection type
  const getSelectedData = useCallback(() => {
    if (!selectedPoint) return null;
    try {
      // Mesh Points
      if (selectedPoint.type === "mesh") {
        return data.meshPoints[selectedPoint.index];
      }

      // Linear Endpoints (gradient start/end)
      // These map directly to stops (Start = Stop 0, End = Last Stop), so we allow editing.
      if (selectedPoint.type === "linear") {
        return data.stops[selectedPoint.index];
      }

      // Linear Stops (intermediate stops)
      if (selectedPoint.type === "linear-stop") {
        return data.stops[selectedPoint.index];
      }

      // Radial Stops
      if (selectedPoint.type === "radial-stop") {
        return data.stops[selectedPoint.index];
      }

      // FIX: Removed "radial" type check.
      // Even if the Center or Radius Handle is "selected" for dragging purposes,
      // we do not want to show their properties in the Inspector.
      // This prevents the "Radius Point" from being editable as a color stop.
    } catch (e) {
      console.error("Error getting selected data:", e);
      return null;
    }
    return null;
  }, [selectedPoint, data]);

  const [localData, setLocalData] = useState<any>(getSelectedData());

  // Sync state when selection changes
  useEffect(() => {
    const newData = getSelectedData();
    setLocalData(newData);
    // Only open if we actually found data (don't open for geometry handles)
    if (newData) setIsOpen(true);
  }, [getSelectedData, selectedPoint]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateProp = (key: string, value: any) => {
    // Immediately update local state for responsive UI
    setLocalData((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });

    // Debounce the actual update to parent
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onUpdate(key, value);
    }, 16);
  };

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return "#ffffff";
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  // --- EMPTY STATE ---
  // This triggers when getSelectedData returns null (e.g. for Radius Handle)
  if (!selectedPoint || !localData) {
    return (
      <div className="w-full border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20">
          <span className="panel-header mb-0 text-zinc-500">
            Node_Inspector
          </span>
          <span className="text-[10px] uppercase text-zinc-600 tracking-wider">
            Idle
          </span>
        </div>
        <div className="h-32 flex flex-col items-center justify-center p-4 bg-black">
          <Crosshair className="text-zinc-800 mb-2" size={24} />
          <span className="text-[10px] font-mono text-zinc-600">
            Select a stop to edit properties
          </span>
        </div>
      </div>
    );
  }

  const getLabel = () => {
    if (selectedPoint.type === "mesh")
      return `Mesh_Point_${selectedPoint.index + 1}`;
    // Fallback for radial geometry if logic changes in future
    if (selectedPoint.type === "radial") return `Radial_Geometry`;
    if (selectedPoint.type === "linear")
      return `Gradient_End_${selectedPoint.index + 1}`;
    return `Stop_${selectedPoint.index + 1}`;
  };

  const showCoordinates =
    selectedPoint.type === "mesh" || selectedPoint.type === "linear";

  const showPosition =
    selectedPoint.type === "linear-stop" ||
    selectedPoint.type === "radial-stop";

  return (
    <div className="w-full border-b border-zinc-800">
      {/* Header - Matching FilterEditor Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 border border-zinc-600 rounded-[1px] transition-colors group-hover:border-zinc-400"
            style={{ backgroundColor: localData.color || "#000" }}
          />
          <span className="panel-header mb-0 group-hover:text-white transition-colors">
            {getLabel()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeselect();
            }}
            className="p-1 rounded hover:bg-red-500/10 hover:text-red-500 text-zinc-500 transition-colors mr-1"
            title="Deselect Node"
          >
            <X size={12} />
          </button>
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
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 space-y-5 pt-2">
              {/* Color Section - Matching FilterEditor Layout */}
              {"color" in localData && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                    Color
                  </div>
                  <div className="flex-1 relative h-9 border border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden bg-zinc-900">
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: localData.color }}
                    />
                    <input
                      type="color"
                      value={localData.color}
                      onChange={(e) => updateProp("color", e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span
                        className="font-mono text-[10px] font-bold shadow-sm"
                        style={{ color: getContrastColor(localData.color) }}
                      >
                        {localData.color.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Position X */}
              {showCoordinates && "x" in localData && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                    Position X
                  </div>
                  <div className="flex-1">
                    <Slider
                      value={[localData.x]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(v) => updateProp("x", v[0])}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-mono text-zinc-300">
                    {localData.x.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Position Y */}
              {showCoordinates && "y" in localData && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                    Position Y
                  </div>
                  <div className="flex-1">
                    <Slider
                      value={[localData.y]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(v) => updateProp("y", v[0])}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-mono text-zinc-300">
                    {localData.y.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Position/Offset Slider */}
              {showPosition && "position" in localData && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                    Offset
                  </div>
                  <div className="flex-1">
                    <Slider
                      value={[localData.position]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(v) => updateProp("position", v[0])}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-mono text-zinc-300">
                    {(localData.position * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              {/* Radius - Mostly for Mesh */}
              {"radius" in localData && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                    Radius
                  </div>
                  <div className="flex-1">
                    <Slider
                      value={[localData.radius]}
                      min={0.01}
                      max={1.5}
                      step={0.01}
                      onValueChange={(v) => updateProp("radius", v[0])}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-mono text-zinc-300">
                    {localData.radius.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Intensity - Mostly for Mesh */}
              {"intensity" in localData && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                    Intensity
                  </div>
                  <div className="flex-1">
                    <Slider
                      value={[localData.intensity]}
                      min={0}
                      max={2}
                      step={0.05}
                      onValueChange={(v) => updateProp("intensity", v[0])}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-mono text-zinc-300">
                    {localData.intensity.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
