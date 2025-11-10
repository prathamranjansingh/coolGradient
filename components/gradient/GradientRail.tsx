// src/components/gradient/GradientRail.tsx
import React, {
  FC,
  useRef,
  useCallback,
  useEffect,
  MouseEvent as ReactMouseEvent,
} from "react";
import { ColorStop } from "@/types/gradient";

interface GradientRailProps {
  stops: ColorStop[];
  gradientCss: string;
  activeStopId: string | null;
  onAddStop: (position: number) => void;
  onSelectStop: (id: string) => void;
  onUpdateStopPosition: (id: string, position: number) => void;
}

export const GradientRail: FC<GradientRailProps> = ({
  stops,
  gradientCss,
  activeStopId,
  onAddStop,
  onSelectStop,
  onUpdateStopPosition,
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);

  const handleDragging = useCallback(
    (e: MouseEvent) => {
      if (!railRef.current || !draggingStopId.current) return;
      const rect = railRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      onUpdateStopPosition(draggingStopId.current, position);
    },
    [onUpdateStopPosition]
  );

  const handleDragEnd = useCallback(() => {
    draggingStopId.current = null;
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", handleDragEnd);
  }, [handleDragging]);

  const handleDragStart = (
    e: ReactMouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    draggingStopId.current = id;
    onSelectStop(id);
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleRailClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!railRef.current) return;
    if ((e.target as HTMLElement).dataset.stopHandle) return;

    const rect = railRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    onAddStop(Math.max(0, Math.min(100, position)));
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleDragging);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDragging, handleDragEnd]);

  return (
    <div
      ref={railRef}
      className="w-full h-6 rounded-md border border-border relative cursor-crosshair"
      style={{ background: gradientCss }}
      onClick={handleRailClick}
    >
      {stops.map((stop) => (
        <button
          key={stop.id}
          data-stop-handle="true"
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 rounded-full border-2 border-primary-foreground 
            shadow-md cursor-pointer bg-clip-padding
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background
            ${
              activeStopId === stop.id
                ? "ring-2 ring-ring"
                : "ring-1 ring-muted-foreground"
            }
          `}
          style={{
            left: `${stop.position}%`,
            background: stop.color,
            opacity: stop.alpha,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectStop(stop.id);
          }}
          onMouseDown={(e) => handleDragStart(e, stop.id)}
          aria-label={`Color stop at ${stop.position.toFixed(0)}%`}
        />
      ))}
    </div>
  );
};
