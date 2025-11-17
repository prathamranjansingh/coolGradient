import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  SelectedPoint,
  GradientStop,
  MeshPoint,
  RadialPoints,
} from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Row } from "@/components/ui/Row";

type Props = {
  selectedPoint: SelectedPoint | null;
  data: {
    stops: GradientStop[];
    meshPoints: MeshPoint[];
    radialPoints: RadialPoints;
  };
  onUpdate: (key: string, value: any) => void;
  onDeselect: () => void;
};

type SelectedData =
  | MeshPoint
  | GradientStop
  | RadialPoints[keyof RadialPoints]
  | null;

export function Inspector({
  selectedPoint,
  data,
  onUpdate,
  onDeselect,
}: Props) {
  if (!data || !data.stops || !data.meshPoints || !data.radialPoints) {
    return (
      <div className="p-4 text-sm text-zinc-400 h-24 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const getSelectedData = useCallback((): SelectedData => {
    if (!selectedPoint) return null;
    if (selectedPoint.type === "mesh")
      return data.meshPoints[selectedPoint.index];
    if (
      selectedPoint.type === "linear" ||
      selectedPoint.type === "linear-stop" ||
      selectedPoint.type === "radial-stop"
    )
      return data.stops[selectedPoint.index];
    if (selectedPoint.type === "radial")
      return data.radialPoints[selectedPoint.point];
    return null;
  }, [selectedPoint, data]);

  const [localData, setLocalData] = useState<SelectedData>(getSelectedData());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalData(getSelectedData());
  }, [getSelectedData]);

  const updateProp = useCallback(
    (key: string, value: any) => {
      setLocalData((prev) => (prev ? { ...prev, [key]: value } : null));

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        onUpdate(key, value);
      }, 16);
    },
    [onUpdate]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSliderUpdate = (key: string, value: number[]) => {
    updateProp(key, value[0]);
  };

  const handleColorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProp("color", e.target.value);
  };

  if (!selectedPoint || !localData) {
    return (
      <div className="p-4 text-sm text-zinc-400 h-24 flex items-center justify-center">
        No point selected.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <h3 className="text-sm font-semibold mb-1">Selected Point</h3>

      {/* COLOR ROW */}
      {"color" in localData && (
        <Row
          left={<Label className="text-sm text-zinc-300">Color</Label>}
          right={
            <div className="flex items-center w-full gap-2">
              <input
                type="color"
                value={localData.color}
                onChange={handleColorUpdate}
                className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer"
              />
            </div>
          }
        />
      )}

      {/* X ROW */}
      {"x" in localData && (
        <Row
          left={
            <Label
              htmlFor="x-slider"
              className="text-[#AAAAAA] font-extralight"
            >
              X
            </Label>
          }
          right={
            <div className="flex items-center w-full gap-2">
              <Slider
                id="x-slider"
                value={[localData.x]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(v) => handleSliderUpdate("x", v)}
                className="flex-grow h-1.5 py-0"
              />
              <span className="w-10 text-xs text-zinc-400 text-right">
                {localData.x.toFixed(2)}
              </span>
            </div>
          }
        />
      )}

      {/* Y ROW */}
      {"y" in localData && (
        <Row
          left={
            <Label htmlFor="y-slider" className="text-[#AAA] font-extralight">
              Y
            </Label>
          }
          right={
            <div className="flex items-center w-full gap-2">
              <Slider
                id="y-slider"
                value={[localData.y]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(v) => handleSliderUpdate("y", v)}
                className="flex-grow h-1.5 py-0"
              />
              <span className="w-10 text-xs text-zinc-400 text-right">
                {localData.y.toFixed(2)}
              </span>
            </div>
          }
        />
      )}

      {/* RADIUS ROW */}
      {"radius" in localData && (
        <Row
          left={
            <Label
              htmlFor="radius-slider"
              className="text-[#AAA] font-extralight"
            >
              Radius
            </Label>
          }
          right={
            <div className="flex items-center w-full gap-2">
              <Slider
                id="radius-slider"
                value={[localData.radius]}
                min={0.01}
                max={1}
                step={0.01}
                onValueChange={(v) => handleSliderUpdate("radius", v)}
                className="flex-grow h-1.5 py-0"
              />
              <span className="w-10 text-xs text-zinc-400 text-right">
                {localData.radius.toFixed(2)}
              </span>
            </div>
          }
        />
      )}

      {/* INTENSITY ROW */}
      {"intensity" in localData && (
        <Row
          left={
            <Label
              htmlFor="intensity-slider"
              className="text-[#AAA] font-extralight"
            >
              Intensity
            </Label>
          }
          right={
            <div className="flex items-center w-full gap-2">
              <Slider
                id="intensity-slider"
                value={[localData.intensity]}
                min={0}
                max={2}
                step={0.01}
                onValueChange={(v) => handleSliderUpdate("intensity", v)}
                className="flex-grow h-1.5 py-0"
              />
              <span className="w-10 text-xs text-zinc-400 text-right">
                {localData.intensity.toFixed(2)}
              </span>
            </div>
          }
        />
      )}

      <Button onClick={onDeselect} size="sm" className="mt-2">
        Deselect
      </Button>
    </div>
  );
}
