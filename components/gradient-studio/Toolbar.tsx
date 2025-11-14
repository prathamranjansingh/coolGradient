import React from "react";
import {
  Download,
  Plus,
  Trash2,
  Shuffle,
  Sliders,
  Grid3x3,
  Circle,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { GradientMode } from "@/lib/type";

type Props = {
  mode: GradientMode;
  setMode: (mode: GradientMode) => void;
  onRandomize: () => void;
  onToggleUI: () => void;
  showUI: boolean;
};

export function Toolbar({
  mode,
  setMode,
  onRandomize,
  onToggleUI,
  showUI,
}: Props) {
  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMode("linear")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              mode === "linear"
                ? "bg-blue-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <ArrowUpDown size={16} /> Linear
          </button>
          <button
            onClick={() => setMode("radial")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              mode === "radial"
                ? "bg-blue-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <Circle size={16} /> Radial
          </button>
          <button
            onClick={() => setMode("mesh")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              mode === "mesh" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <Grid3x3 size={16} /> Mesh
          </button>

          <button
            onClick={onRandomize}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Shuffle size={16} /> Random
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleUI}
            className="px-3 py-2 rounded text-sm bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            {showUI ? <EyeOff size={16} /> : <Eye size={16} />}
            {showUI ? "Hide" : "Show"} UI
          </button>
        </div>
      </div>
    </div>
  );
}
