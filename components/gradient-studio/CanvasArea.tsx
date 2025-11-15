import React from "react";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  overlayRef: React.RefObject<HTMLCanvasElement>;
  interactionHandlers: {
    onMouseDown: (e: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseMove: (e: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  getCursor: () => string;
  isExporting: boolean;
  glStatus: { ok: boolean; message: string };
};

export function CanvasArea({
  canvasRef,
  overlayRef,
  interactionHandlers,
  getCursor,
  isExporting,
  glStatus,
}: Props) {
  return (
    <div className="p-4 rounded-lg w-full">
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded border border-zinc-700 block absolute top-0 left-0"
          aria-label="gradient canvas"
        />
        <canvas
          ref={overlayRef}
          className="absolute left-0 top-0 w-full h-full pointer-events-none rounded"
          // This canvas needs explicit dimensions to match the GL canvas
          // The resize handler in GradientStudio.tsx will set this
        />
        <div
          className="absolute inset-0 z-20"
          role="application"
          aria-label="gradient editor interaction layer"
          {...interactionHandlers}
          style={{ cursor: getCursor() }}
        />

        {!glStatus.ok && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-zinc-900/80 rounded">
            <div className="bg-red-900/80 backdrop-blur-sm border border-red-700 text-sm p-3 rounded text-center">
              <strong>WebGL Error</strong>
              <div className="mt-2 text-xs text-red-200">
                {glStatus.message ||
                  "WebGL unavailable or initialization failed."}
              </div>
            </div>
          </div>
        )}

        {isExporting && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-zinc-900/80 rounded z-30">
            <div className="text-white text-lg font-semibold">Exporting...</div>
          </div>
        )}
      </div>
    </div>
  );
}
