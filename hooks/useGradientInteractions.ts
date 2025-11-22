import { useState, useCallback } from "react";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  RadialPoints,
  SelectedPoint,
  InteractionPoint,
} from "@/lib/type";
import { computeTfromXY, randomColor } from "@/lib/utils";
import { MAX_STOPS } from "@/lib/constants";

type InteractionProps = {
  mode: GradientMode;
  stops: GradientStop[];
  sortedStops: GradientStop[];
  meshPoints: MeshPoint[];
  radialPoints: RadialPoints;
  setStops: React.Dispatch<React.SetStateAction<GradientStop[]>>;
  setMeshPoints: React.Dispatch<React.SetStateAction<MeshPoint[]>>;
  setRadialPoints: React.Dispatch<React.SetStateAction<RadialPoints>>;
  setSelectedPoint: React.Dispatch<React.SetStateAction<SelectedPoint | null>>;
};

const HIT_PADDING = 14;

export function useGradientInteractions({
  mode,
  stops,
  sortedStops,
  meshPoints,
  radialPoints,
  setStops,
  setMeshPoints,
  setRadialPoints,
  setSelectedPoint,
}: InteractionProps) {
  const [dragging, setDragging] = useState<InteractionPoint>(null);
  const [hoverPoint, setHoverPoint] = useState<InteractionPoint>(null);

  const getVisualPosition = useCallback(
    (x: number, y: number, width: number, height: number) => {
      return {
        x: Math.max(HIT_PADDING, Math.min(width - HIT_PADDING, x)),
        y: Math.max(HIT_PADDING, Math.min(height - HIT_PADDING, y)),
      };
    },
    []
  );

  const getPointAtMouse = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>): InteractionPoint => {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      if (!rect) return null;

      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const pxThreshold = 14;

      // --- MESH MODE ---
      if (mode === "mesh") {
        let closestDist = Infinity;
        let hitIndex = -1;
        meshPoints.forEach((p, i) => {
          const rawPx = p.x * width;
          const rawPy = p.y * height;
          const vis = getVisualPosition(rawPx, rawPy, width, height);

          const dist = Math.hypot(vis.x - mouseX, vis.y - mouseY);
          if (dist < pxThreshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
          }
        });
        if (hitIndex !== -1) return { type: "mesh", index: hitIndex };
      }

      // --- RADIAL MODE ---
      else if (mode === "radial") {
        const c = radialPoints.center;
        const f = radialPoints.focus;

        if (c && f) {
          const centerX = c.x * width;
          const centerY = c.y * height;

          const maxRpx =
            Math.hypot((f.x - c.x) * width, (f.y - c.y) * height) * 2.5 ||
            0.001;

          // 1. Check Stops FIRST
          // This is critical: Stops render ON TOP of controls, so we must check them first
          let closestDist = Infinity;
          let hitIndex = -1;

          for (let i = 0; i < stops.length; i++) {
            // Stops are positioned HORIZONTALLY from center (matching renderer)
            const r = stops[i].position * maxRpx;
            const px = centerX + r;
            const py = centerY;

            const vis = getVisualPosition(px, py, width, height);
            const dist = Math.hypot(vis.x - mouseX, vis.y - mouseY);

            if (dist < pxThreshold && dist < closestDist) {
              closestDist = dist;
              hitIndex = i;
            }
          }
          if (hitIndex !== -1) return { type: "radial-stop", index: hitIndex };
        }

        // 2. Check Control Points SECOND
        if (f) {
          const px = f.x * width;
          const py = f.y * height;
          const vis = getVisualPosition(px, py, width, height);
          if (Math.hypot(vis.x - mouseX, vis.y - mouseY) < pxThreshold) {
            return { type: "radial", point: "focus" };
          }
        }

        if (c) {
          const px = c.x * width;
          const py = c.y * height;
          const vis = getVisualPosition(px, py, width, height);
          if (Math.hypot(vis.x - mouseX, vis.y - mouseY) < pxThreshold) {
            return { type: "radial", point: "center" };
          }
        }
      }

      // --- LINEAR MODE ---
      else {
        const start = sortedStops[0];
        const end = sortedStops[sortedStops.length - 1];
        if (!start || !end) return null;

        const startPx = start.x * width;
        const startPy = start.y * height;
        const endPx = end.x * width;
        const endPy = end.y * height;
        const dir = { x: endPx - startPx, y: endPy - startPy };

        let closestDist = Infinity;
        let hitIndex = -1;
        let hitType: "linear" | "linear-stop" = "linear-stop";

        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];

          const px = startPx + dir.x * s.position;
          const py = startPy + dir.y * s.position;

          const vis = getVisualPosition(px, py, width, height);

          const dist = Math.hypot(vis.x - mouseX, vis.y - mouseY);

          if (dist < pxThreshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
            const isStart = stops[i] === start;
            const isEnd = stops[i] === end;
            hitType = isStart || isEnd ? "linear" : "linear-stop";
          }
        }
        if (hitIndex !== -1) return { type: hitType, index: hitIndex };
      }
      return null;
    },
    [mode, meshPoints, radialPoints, stops, sortedStops, getVisualPosition]
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      const hit = getPointAtMouse(e);
      if (hit) {
        setDragging(hit);
        setSelectedPoint(hit);
        e.stopPropagation();
        return;
      }
      setSelectedPoint(null);

      if (mode === "mesh" && e.shiftKey && meshPoints.length < MAX_STOPS) {
        const rect = (e.currentTarget as Element).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMeshPoints((prev) => [
          ...prev,
          { x, y, color: randomColor(), radius: 0.25, intensity: 1 },
        ]);
      }
    },
    [getPointAtMouse, mode, meshPoints.length, setMeshPoints, setSelectedPoint]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      if (!rect) return;

      const width = rect.width;
      const height = rect.height;
      const xRaw = (e.clientX - rect.left) / width;
      const yRaw = (e.clientY - rect.top) / height;

      const xClamped = Math.max(0, Math.min(1, xRaw));
      const yClamped = Math.max(0, Math.min(1, yRaw));

      if (!dragging) {
        setHoverPoint(getPointAtMouse(e));
        return;
      }

      if (dragging.type === "mesh") {
        setMeshPoints((prev) =>
          prev.map((p, i) =>
            i === dragging.index ? { ...p, x: xClamped, y: yClamped } : p
          )
        );
      } else if (dragging.type === "radial") {
        setRadialPoints((prev) => {
          const currentPoint = prev[dragging.point];
          if (!currentPoint) return prev;
          return {
            ...prev,
            [dragging.point]: {
              ...currentPoint,
              x: xRaw,
              y: yRaw,
            },
          };
        });
      } else if (dragging.type === "linear") {
        setStops((prev) => {
          const sorted = [...prev].sort((a, b) => a.position - b.position);
          const start = sorted[0];
          const end = sorted[sorted.length - 1];

          // Find which endpoint we're dragging
          const isDraggingStart = prev[dragging.index] === start;
          const isDraggingEnd = prev[dragging.index] === end;

          if (isDraggingStart) {
            // Moving start point - update all stops' x,y based on new line
            const oldStartX = start.x;
            const oldStartY = start.y;
            const deltaX = xRaw - oldStartX;
            const deltaY = yRaw - oldStartY;

            return prev.map((s) => {
              if (s === start) {
                return { ...s, x: xRaw, y: yRaw };
              }
              // Recalculate intermediate stops along new line
              const newX = end.x + (s.x - end.x) + deltaX * (1 - s.position);
              const newY = end.y + (s.y - end.y) + deltaY * (1 - s.position);
              return { ...s, x: newX, y: newY };
            });
          } else if (isDraggingEnd) {
            // Moving end point - update all stops' x,y based on new line
            const oldEndX = end.x;
            const oldEndY = end.y;
            const deltaX = xRaw - oldEndX;
            const deltaY = yRaw - oldEndY;

            return prev.map((s) => {
              if (s === end) {
                return { ...s, x: xRaw, y: yRaw };
              }
              // Recalculate intermediate stops along new line
              const newX = start.x + (s.x - start.x) + deltaX * s.position;
              const newY = start.y + (s.y - start.y) + deltaY * s.position;
              return { ...s, x: newX, y: newY };
            });
          }

          return prev;
        });
      } else if (dragging.type === "linear-stop") {
        setStops((prev) => {
          const sorted = [...prev].sort((a, b) => a.position - b.position);
          const start = sorted[0];
          const end = sorted[sorted.length - 1];
          const t = computeTfromXY(xRaw, yRaw, start, end);
          const newPos = Math.max(0, Math.min(1, t));

          return prev.map((s, i) =>
            i === dragging.index
              ? {
                  ...s,
                  position: newPos,
                  x: start.x + (end.x - start.x) * newPos,
                  y: start.y + (end.y - start.y) * newPos,
                }
              : s
          );
        });
      } else if (dragging.type === "radial-stop") {
        setStops((prev) => {
          const c = radialPoints.center;
          const f = radialPoints.focus;
          if (!c || !f) return prev;

          const centerX = c.x * width;

          const maxRpx =
            Math.hypot((f.x - c.x) * width, (f.y - c.y) * height) * 2.5 ||
            0.001;

          // Project mouse position onto HORIZONTAL line from center
          const mouseXpx = xRaw * width;
          const deltaX = mouseXpx - centerX;

          // Calculate position as fraction of max radius
          const t = maxRpx > 0 ? deltaX / maxRpx : 0;
          const newPos = Math.max(0, Math.min(1.2, t));

          return prev.map((s, i) =>
            i === dragging.index ? { ...s, position: newPos } : s
          );
        });
      }
    },
    [
      dragging,
      getPointAtMouse,
      radialPoints,
      setMeshPoints,
      setRadialPoints,
      setStops,
    ]
  );

  const getCursor = () => {
    if (dragging) return "grabbing";
    if (hoverPoint) return "grab";
    return "default";
  };

  const interactionHandlers = {
    onMouseDown: handlePointerDown,
    onMouseMove: handlePointerMove,
    onMouseUp: handlePointerUp,
    onMouseLeave: handlePointerUp,
  };

  return { interactionHandlers, getCursor };
}
