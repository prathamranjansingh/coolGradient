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

  const getPointAtMouse = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>): InteractionPoint => {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      if (!rect) return null;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const threshold = 0.035;
      const pxThreshold = 12;

      if (mode === "mesh") {
        let closestDist = Infinity;
        let hitIndex = -1;
        meshPoints.forEach((p, i) => {
          const dist = Math.hypot(p.x - x, p.y - y);
          if (dist < threshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
          }
        });
        if (hitIndex !== -1) return { type: "mesh", index: hitIndex };
      } else if (mode === "radial") {
        if (
          Math.hypot(radialPoints.center.x - x, radialPoints.center.y - y) <
          threshold
        )
          return { type: "radial", point: "center" };
        if (
          Math.hypot(radialPoints.focus.x - x, radialPoints.focus.y - y) <
          threshold
        )
          return { type: "radial", point: "focus" };

        const c = radialPoints.center;
        const f = radialPoints.focus;
        const centerX = c.x * rect.width;
        const centerY = c.y * rect.height;
        const maxRpx =
          Math.hypot((f.x - c.x) * rect.width, (f.y - c.y) * rect.height) *
            2.5 || 0.001;

        let closestDist = Infinity;
        let hitIndex = -1;
        for (let i = 0; i < stops.length; i++) {
          const r = stops[i].position * maxRpx;
          const sx = centerX + r;
          const sy = centerY;
          const dx = e.clientX - rect.left - sx;
          const dy = e.clientY - rect.top - sy;
          const dist = Math.hypot(dx, dy);
          if (dist < pxThreshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
          }
        }
        if (hitIndex !== -1) return { type: "radial-stop", index: hitIndex };
      } else {
        const start = sortedStops[0];
        const end = sortedStops[sortedStops.length - 1];
        if (!start || !end) return null;
        const dir = { x: end.x - start.x, y: end.y - start.y };

        let closestDist = Infinity;
        let hitIndex = -1;
        let hitType: "linear" | "linear-stop" = "linear-stop";

        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          const px = start.x + dir.x * s.position;
          const py = start.y + dir.y * s.position;
          const dist = Math.hypot(px - x, py - y);

          if (dist < threshold && dist < closestDist) {
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
    [mode, meshPoints, radialPoints, stops, sortedStops]
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      const hit = getPointAtMouse(e);
      if (hit) {
        setDragging(hit);
        setSelectedPoint(hit);
        return;
      }
      setSelectedPoint(null); // Deselect if clicking empty space

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
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      if (!dragging) {
        setHoverPoint(getPointAtMouse(e));
        return;
      }

      if (dragging.type === "mesh") {
        setMeshPoints((prev) =>
          prev.map((p, i) => (i === dragging.index ? { ...p, x, y } : p))
        );
      } else if (dragging.type === "radial") {
        setRadialPoints((prev) => ({ ...prev, [dragging.point]: { x, y } }));
      } else if (dragging.type === "linear") {
        setStops((prev) =>
          prev.map((s, i) => (i === dragging.index ? { ...s, x, y } : s))
        );
      } else if (dragging.type === "linear-stop") {
        setStops((prev) => {
          const sorted = [...prev].sort((a, b) => a.position - b.position);
          const start = sorted[0];
          const end = sorted[sorted.length - 1];
          const t = computeTfromXY(x, y, start, end);
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
          const maxR =
            Math.hypot((f.x - c.x) * rect.width, (f.y - c.y) * rect.height) *
              2.5 || rect.width * 0.5;
          const dx = (x - c.x) * rect.width;
          const dy = (y - c.y) * rect.height;
          const r = Math.hypot(dx, dy);
          const t = Math.max(0, Math.min(1, r / maxR));
          return prev.map((s, i) =>
            i === dragging.index ? { ...s, position: t } : s
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
