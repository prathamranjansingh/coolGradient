import { useRef, useCallback } from "react";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  RadialPoints,
  SelectedPoint,
} from "@/lib/type";

type OverlayState = {
  mode: GradientMode;
  stops: GradientStop[];
  sortedStops: GradientStop[];
  meshPoints: MeshPoint[];
  radialPoints: RadialPoints;
  selectedPoint: SelectedPoint | null;
};

export function useOverlayRenderer() {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const drawOverlay = useCallback((state: OverlayState) => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    const container = overlay.parentElement?.getBoundingClientRect();
    if (!container || container.width === 0) return;

    // --- START: CLEAR CANVAS LOGIC ---
    // 1. Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 2. Clear entire physical canvas
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // 3. Set transform for high-DPI
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // --- END: CLEAR CANVAS LOGIC ---

    // --- FIX: ADD CANVAS CLIPPING ---
    // 1. Save the current state (which is just the transform)
    ctx.save();

    // 2. Define a clipping path that matches the canvas boundaries
    ctx.beginPath();
    // Use logical container size, since context is scaled by DPR
    ctx.rect(0, 0, container.width, container.height);

    // 3. Apply the clip. Nothing will be drawn outside this rect.
    ctx.clip();
    // --- END: FIX ---

    // Destructure state
    const {
      mode,
      stops,
      sortedStops,
      meshPoints,
      radialPoints,
      selectedPoint,
    } = state;

    // Helper functions (these are correct)
    const toX = (x: number) => x * container.width;
    const toY = (y: number) => y * container.height;

    ctx.lineWidth = 2;
    ctx.font = "11px sans-serif";

    // --- ALL DRAWING LOGIC (NOW CLIPPED) ---

    if (mode === "linear") {
      const start = sortedStops[0];
      const end = sortedStops[sortedStops.length - 1];
      if (!start || !end) return;

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(toX(start.x), toY(start.y));
      ctx.lineTo(toX(end.x), toY(end.y));
      ctx.stroke();
      ctx.setLineDash([]);

      const dir = { x: end.x - start.x, y: end.y - start.y };
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        const px = start.x + dir.x * s.position;
        const py = start.y + dir.y * s.position;
        const cx = toX(px);
        const cy = toY(py);
        const isSel =
          (selectedPoint?.type === "linear-stop" ||
            selectedPoint?.type === "linear") &&
          selectedPoint?.index === i;
        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      }
    } else if (mode === "radial") {
      const c = radialPoints.center;
      const f = radialPoints.focus;
      const centerX = toX(c.x);
      const centerY = toY(c.y);
      const maxRpx =
        Math.hypot(
          (f.x - c.x) * container.width,
          (f.y - c.y) * container.height
        ) * 2.5;

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      // This arc is now clipped and will not draw outside the canvas
      ctx.arc(centerX, centerY, Math.max(6, maxRpx), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        const r = s.position * maxRpx;
        const cx = centerX + r;
        const cy = centerY;
        const isSel =
          selectedPoint?.type === "radial-stop" && selectedPoint?.index === i;
        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      }

      ["center", "focus"].forEach((k) => {
        const p = radialPoints[k as keyof typeof radialPoints];
        const cx = toX(p.x);
        const cy = toY(p.y);
        const isSel =
          selectedPoint?.type === "radial" && selectedPoint?.point === k;
        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle =
          k === "center"
            ? sortedStops[0]?.color ?? "#fff"
            : sortedStops[sortedStops.length - 1]?.color ?? "#fff";
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      });
    } else if (mode === "mesh") {
      meshPoints.forEach((p, i) => {
        const cx = toX(p.x);
        const cy = toY(p.y);
        const rpx = p.radius * Math.min(container.width, container.height);
        const isSel =
          selectedPoint?.type === "mesh" && selectedPoint?.index === i;

        ctx.beginPath();
        // This arc is also clipped
        ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      });
    }
    ctx.restore();
  }, []);

  return { overlayRef, drawOverlay };
}
