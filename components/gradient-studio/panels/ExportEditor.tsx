import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mocking the presets based on your original code's usage
const exportPresets = [
  { name: "HD (1280x720)", width: 1280, height: 720 },
  { name: "Full HD (1920x1080)", width: 1920, height: 1080 },
  { name: "4K (3840x2160)", width: 3840, height: 2160 },
  { name: "Instagram Post (1080x1080)", width: 1080, height: 1080 },
  { name: "Instagram Story (1080x1920)", width: 1080, height: 1920 },
  { name: "Dribbble Shot (1600x1200)", width: 1600, height: 1200 },
];

type Props = {
  isExporting: boolean;
  exportSize: { width: number; height: number };
  setExportSize: (size: { width: number; height: number }) => void;
  onExport: () => void;
  glOK: boolean;
};

export function ExportEditor({
  isExporting,
  exportSize,
  setExportSize,
  onExport,
  glOK,
}: Props) {
  // Guard clause. If props aren't ready, don't render.
  if (!exportSize) {
    return null;
  }

  const handleValueChange = (value: string) => {
    const [width, height] = value.split("x").map(Number);
    setExportSize({ width, height });
  };

  const currentValue = `${exportSize.width}x${exportSize.height}`;

  return (
    // 1. Use CSS Grid for the layout. This is more robust than flex.
    // `grid-cols-[1fr_auto]` makes the first column (select) shrinkable
    // and the second (button) fixed to its content size.
    <div className="grid grid-cols-[1fr_auto] w-full items-end gap-4 px-2 sm:px-4 pb-4">
      {/* 2. `min-w-0` on the grid cell is *essential*.
         It tells the grid cell it can shrink to zero,
         which forces the `truncate` on its children to activate.
      */}
      <div className="space-y-2 min-w-0">
        <Label className="text-xs text-zinc-300">Preset</Label>
        <Select
          value={currentValue}
          onValueChange={handleValueChange}
          disabled={isExporting}
        >
          {/* 3. `w-full` + `truncate` on the trigger
             forces it to fill its parent cell and truncate its text.
          */}
          <SelectTrigger className="text-xs w-full truncate">
            <SelectValue placeholder="Select export size" />
          </SelectTrigger>

          {/* 4. --- THIS IS THE FORCEFUL FIX ---
             `collisionPadding={16}` tells the popper (dropdown)
             to *always* stay 16px away from the viewport edge,
             which physically prevents it from causing an overflow.
          */}
          <SelectContent
            position="popper"
            sideOffset={4}
            collisionPadding={16}
            className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]"
          >
            {exportPresets.map((p) => (
              <SelectItem
                key={p.name}
                value={`${p.width}x${p.height}`}
                className="truncate text-xs"
              >
                {p.name} ({p.width}x{p.height})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Column 2: Export Button (no change needed) */}
      <Button
        onClick={onExport}
        disabled={!glOK || isExporting}
        className="flex-shrink-0"
      >
        <Download size={14} className="mr-2" />
        <span className="text-xs">
          {isExporting ? "Exporting..." : "Export PNG"}
        </span>
      </Button>
    </div>
  );
}
