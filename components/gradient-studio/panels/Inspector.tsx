import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  SelectedPoint,
  GradientStop,
  MeshPoint,
  RadialPoints,
} from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Crosshair, ChevronDown, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
      if (selectedPoint.type === "mesh")
        return data.meshPoints[selectedPoint.index];

      // Linear endpoints AND stops
      if (
        selectedPoint.type === "linear" ||
        selectedPoint.type === "linear-stop"
      )
        return data.stops[selectedPoint.index];

      // Radial stops
      if (selectedPoint.type === "radial-stop")
        return data.stops[selectedPoint.index];

      // Radial control points (center/focus)
      if (selectedPoint.type === "radial")
        return (data.radialPoints as any)[selectedPoint.point];
    } catch (e) {
      return null;
    }
    return null;
  }, [selectedPoint, data]);

  const [localData, setLocalData] = useState<any>(getSelectedData());

  // Sync state when selection changes
  useEffect(() => {
    const newData = getSelectedData();
    setLocalData(newData);
    if (newData) setIsOpen(true);
  }, [getSelectedData, selectedPoint]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateProp = (key: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [key]: value }));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onUpdate(key, value), 16);
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
  if (!selectedPoint || !localData) {
    return (
      <div className="border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20">
          <span className="panel-header mb-0 text-zinc-500">
            Node Inspector
          </span>
          <span className="text-[10px] uppercase text-zinc-600 tracking-wider">
            Idle
          </span>
        </div>
        <div className="h-32 flex flex-col items-center justify-center p-4 bg-black">
          <Crosshair className="text-zinc-800 mb-2" size={24} />
          <span className="text-[10px] font-mono text-zinc-600">
            Select a node to edit properties
          </span>
        </div>
      </div>
    );
  }

  const getLabel = () => {
    if (selectedPoint.type === "mesh")
      return `Mesh Point ${selectedPoint.index + 1}`;
    if (selectedPoint.type === "radial")
      return `Radial ${
        selectedPoint.point.charAt(0).toUpperCase() +
        selectedPoint.point.slice(1)
      }`;
    if (selectedPoint.type === "linear")
      return `Gradient End ${selectedPoint.index + 1}`;
    return `Stop ${selectedPoint.index + 1}`;
  };

  const showCoordinates =
    selectedPoint.type === "mesh" ||
    selectedPoint.type === "radial" ||
    selectedPoint.type === "linear";
  const showPosition =
    selectedPoint.type === "linear-stop" ||
    selectedPoint.type === "radial-stop";

  return (
    <div className="w-full bg-black border-b border-zinc-800">
      {/* Header - Improved Layout */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/30 border-b border-zinc-800/50">
        {/* Left: Toggle & Info (Click to Collapse) */}
        <div
          className="flex items-center gap-3 cursor-pointer group select-none flex-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Chevron */}
          <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {/* Color & Label */}
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 border border-zinc-600 rounded-[1px]"
              style={{ backgroundColor: localData.color || "#000" }}
            />
            <span className="text-xs font-bold font-mono tracking-wider text-zinc-300 group-hover:text-white transition-colors">
              {getLabel()}
            </span>
          </div>
        </div>

        {/* Right: Distinct Close Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeselect();
          }}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-500/10 hover:text-red-500 text-zinc-500 transition-colors"
          title="Deselect Node"
        >
          <X size={14} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* 1. Color Section */}
              {"color" in localData && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-zinc-500 font-mono">
                    Fill Color
                  </Label>
                  <div className="flex gap-2 h-10">
                    <div className="relative flex-1 border border-zinc-800 hover:border-zinc-600 transition-colors group overflow-hidden bg-zinc-900">
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
                          className="font-mono text-xs font-bold shadow-sm"
                          style={{ color: getContrastColor(localData.color) }}
                        >
                          {localData.color.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Coordinates Grid */}
              {showCoordinates && "x" in localData && "y" in localData && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] uppercase text-zinc-500 font-mono">
                        Position X
                      </Label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {localData.x.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[localData.x]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(v) => updateProp("x", v[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] uppercase text-zinc-500 font-mono">
                        Position Y
                      </Label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {localData.y.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[localData.y]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(v) => updateProp("y", v[0])}
                    />
                  </div>
                </div>
              )}

              {/* 3. Position Slider */}
              {showPosition && "position" in localData && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-[10px] uppercase text-zinc-500 font-mono">
                      Offset
                    </Label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {(localData.position * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[localData.position]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(v) => updateProp("position", v[0])}
                  />
                </div>
              )}

              {/* 4. Radius & Intensity */}
              <div className="space-y-4 pt-2 border-t border-zinc-900">
                {"radius" in localData && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] uppercase text-zinc-500 font-mono">
                        Radius
                      </Label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {localData.radius.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[localData.radius]}
                      min={0.01}
                      max={1.5}
                      step={0.01}
                      onValueChange={(v) => updateProp("radius", v[0])}
                    />
                  </div>
                )}

                {"intensity" in localData && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] uppercase text-zinc-500 font-mono">
                        Intensity
                      </Label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {localData.intensity.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[localData.intensity]}
                      min={0}
                      max={2}
                      step={0.05}
                      onValueChange={(v) => updateProp("intensity", v[0])}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
