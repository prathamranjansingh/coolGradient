import React from "react";

type Props = {
  glStatus: { ok: boolean; message: string };
};

export function Footer({ glStatus }: Props) {
  return (
    <footer className="w-full flex-shrink-0 border-t border-zinc-800 bg-[#0a0a0a] text-[10px] uppercase tracking-wider text-zinc-500">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-none animate-pulse"></span>
            <span>System_Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <span>WebGL:</span>
            <span className={glStatus.ok ? "text-emerald-500" : "text-red-500"}>
              {glStatus.ok ? "ACTIVE" : "ERROR"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 hidden sm:flex">
          <div className="flex items-center gap-1">
            <span className="bg-zinc-800 px-1 text-zinc-300">R</span>
            <span>Randomize</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-zinc-800 px-1 text-zinc-300">H</span>
            <span>UI Toggle</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
