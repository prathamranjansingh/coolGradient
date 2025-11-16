import React from "react";

type Props = {
  glStatus: { ok: boolean; message: string };
};

export function Footer({ glStatus }: Props) {
  return (
    <footer className="w-full mx-auto mt-6 p-2 sm:p-4 bg-zinc-900 rounded-lg text-sm text-zinc-400 border border-zinc-800 overflow-x-hidden">
      <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4 w-full">
        <div>
          WebGL status:{" "}
          <span
            className={`font-mono ml-2 ${
              glStatus.ok ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {glStatus.ok ? "OK" : "Error"}
          </span>
          {!glStatus.ok && (
            <span className="text-xs text-rose-300 ml-2">
              {glStatus.message}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 text-xs">
              R
            </kbd>
            <span>Randomize</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 text-xs">
              H
            </kbd>
            <span>Toggle UI</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 text-xs">
              Shift+Click
            </kbd>
            <span>Add Point</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
