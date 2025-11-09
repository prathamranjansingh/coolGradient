// src/components/gradient/ColorStopEditor.tsx

import React, { FC } from "react";
import { ColorStop } from "@/types/gradient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep for hex color text input
import { ControlInput } from "./ControlInput"; // ✅ Import ControlInput
import { Trash2 } from "lucide-react";

interface ColorStopEditorProps {
  stop: ColorStop | null;
  onChange: (id: string, key: keyof ColorStop, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const ColorStopEditor: FC<ColorStopEditorProps> = ({
  stop,
  onChange,
  onRemove,
  canRemove,
}) => {
  if (!stop) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
        Select a stop to edit or click on the rail to add one.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
      {/* Hex color input (using default Input for now, could be ControlInput too) */}
      <label
        htmlFor="stopColor"
        className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
        style={{ backgroundColor: stop.color, opacity: stop.alpha }}
      >
        <input
          id="stopColor"
          type="color"
          value={stop.color}
          onChange={(e) => onChange(stop.id, "color", e.target.value)}
          className="sr-only"
        />
      </label>

      <div className="flex flex-col gap-3">
        {/* Hex Text Input */}
        <Input
          type="text"
          value={stop.color}
          onChange={(e) => onChange(stop.id, "color", e.target.value)}
          className="font-mono text-sm"
          aria-label="Color Hex"
        />
        {/* Position Input */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">@</span>
          <ControlInput // ✅ Use ControlInput for position (type number)
            label="Position" // Label inside ControlInput will not be used if type is not slider
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(stop.position)}
            onValueChange={(val) =>
              onChange(stop.id, "position", parseFloat(val as string))
            }
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <div className="col-span-2">
        {/* Alpha Slider */}
        <ControlInput // ✅ Use ControlInput for alpha (type slider)
          label="Alpha"
          min={0}
          max={1}
          step={0.01}
          value={stop.alpha}
          onValueChange={(val) =>
            onChange(stop.id, "alpha", (val as number[])[0])
          }
          type="slider"
        />
      </div>

      <div className="col-span-2 mt-2">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onRemove(stop.id)}
          disabled={!canRemove}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Stop
        </Button>
      </div>
    </div>
  );
};
