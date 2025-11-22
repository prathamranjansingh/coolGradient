import { useRef, useCallback } from "react";

type OverlayState = {
  mode: "linear" | "radial" | "mesh";
  stops: any[];
  sortedStops: any[];
  meshPoints: any[];
  radialPoints: any;
  selectedPoint: any;
};

export function useOverlayRenderer() {
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  const drawOverlay = useCallback((state: OverlayState) => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const {
      mode,
      stops,
      sortedStops,
      meshPoints,
      radialPoints,
      selectedPoint,
    } = state;

    // Helper to draw a point with the correct color
    const drawPoint = (
      x: number,
      y: number,
      color: string,
      isSelected: boolean,
      size: number = 8
    ) => {
      const px = x * width;
      const py = y * height;

      // Outer ring (white or selection color)
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#3b82f6" : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner circle (actual color)
      ctx.beginPath();
      ctx.arc(px, py, size - 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    if (mode === "mesh") {
      // Draw mesh points with their colors
      meshPoints.forEach((p: any, i: number) => {
        const isSelected =
          selectedPoint?.type === "mesh" && selectedPoint?.index === i;
        drawPoint(p.x, p.y, p.color, isSelected, 10);
      });
    } else if (mode === "radial") {
      // Draw radial center and focus with their colors
      const center = radialPoints.center;
      const focus = radialPoints.focus;

      if (center) {
        const isCenterSelected =
          selectedPoint?.type === "radial" && selectedPoint?.point === "center";
        drawPoint(center.x, center.y, center.color, isCenterSelected, 10);
      }

      if (focus) {
        const isFocusSelected =
          selectedPoint?.type === "radial" && selectedPoint?.point === "focus";
        drawPoint(focus.x, focus.y, focus.color, isFocusSelected, 10);
      }

      // Draw radial stops on the radius
      if (center && focus) {
        const centerX = center.x * width;
        const centerY = center.y * height;
        const maxRpx =
          Math.hypot(
            (focus.x - center.x) * width,
            (focus.y - center.y) * height
          ) * 2.5 || 0.001;

        stops.forEach((s: any, i: number) => {
          const r = s.position * maxRpx;
          const sx = centerX + r;
          const sy = centerY;
          const isSelected =
            selectedPoint?.type === "radial-stop" && selectedPoint?.index === i;

          // Convert canvas coordinates back to normalized coordinates for drawPoint
          drawPoint(sx / width, sy / height, s.color, isSelected, 8);
        });

        // Draw radius line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + maxRpx, centerY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // Linear gradient
      const start = sortedStops[0];
      const end = sortedStops[sortedStops.length - 1];

      if (start && end) {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw all stops with their colors
        stops.forEach((s: any, i: number) => {
          const isEndpoint = s === start || s === end;
          const isSelected =
            (selectedPoint?.type === "linear" && selectedPoint?.index === i) ||
            (selectedPoint?.type === "linear-stop" &&
              selectedPoint?.index === i);

          const size = isEndpoint ? 10 : 8;
          drawPoint(s.x, s.y, s.color, isSelected, size);
        });
      }
    }

    ctx.restore();
  }, []);

  return { overlayRef, drawOverlay };
}
