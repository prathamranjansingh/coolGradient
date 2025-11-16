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
import { Button } from "../ui/button";

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
    <div className="border-t border-b border-[#222222] p-2 sm:p-4 w-full overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 w-full">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setMode("linear")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              mode === "linear"
                ? "bg-[#0077FF] text-white hover:bg-[#0077FF]"
                : ""
            }`}
          >
            <ArrowUpDown size={16} /> Linear
          </Button>
          <Button
            onClick={() => setMode("radial")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              mode === "radial"
                ? "bg-[#0077FF] text-white hover:bg-[#0077FF]"
                : ""
            }`}
          >
            <Circle size={16} /> Radial
          </Button>
          <Button
            onClick={() => setMode("mesh")}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              mode === "mesh"
                ? "bg-[#0077FF] text-white hover:bg-[#0077FF]"
                : ""
            }`}
          >
            <Grid3x3 size={16} /> Mesh
          </Button>

          <Button
            onClick={onRandomize}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm  transition-colors"
          >
            <Shuffle size={16} /> Random
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={onToggleUI}
            className=" flex items-center gap-2 px-3 py-2 rounded text-sm"
          >
            {showUI ? <EyeOff size={16} /> : <Eye size={16} />}
            {showUI ? "Hide" : "Show"} UI
          </Button>
        </div>
      </div>
    </div>
  );
}
