import React from "react";
import { Shuffle, Eye, EyeOff } from "lucide-react";
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
  const modes: GradientMode[] = ["linear", "radial", "mesh"];

  return (
    <div className="flex flex-col w-full border-b border-zinc-800">
      <div className="flex w-full border-b border-zinc-800">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`
                        flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors
                        ${
                          mode === m
                            ? "bg-white text-black"
                            : "bg-black text-zinc-500 hover:text-white hover:bg-zinc-900"
                        }
                        border-r border-zinc-800 last:border-r-0
                    `}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex justify-between px-4 py-2 bg-[#080808]">
        <button
          onClick={onRandomize}
          className="text-[10px] uppercase text-zinc-500 hover:text-white flex items-center gap-1"
        >
          <Shuffle size={10} /> Randomize
        </button>
        <button
          onClick={onToggleUI}
          className="text-[10px] uppercase text-zinc-500 hover:text-white flex items-center gap-1"
        >
          {showUI ? <EyeOff size={10} /> : <Eye size={10} />}{" "}
          {showUI ? "Hide_UI" : "Show_UI"}
        </button>
      </div>
    </div>
  );
}
