import React from "react";
import { Download } from "lucide-react";
import { exportPresets } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  // FIX: Add a guard clause. If props aren't ready, don't render.
  if (!exportSize) {
    return null;
  }

  const handleValueChange = (value: string) => {
    const [width, height] = value.split("x").map(Number);
    setExportSize({ width, height });
  };

  const currentValue = `${exportSize.width}x${exportSize.height}`;

  return (
    <div className="space-y-4 px-2 sm:px-4 pb-4 w-full overflow-x-hidden">
      <div className="space-y-2 w-full min-w-0">
        <Label className="text-sm text-zinc-300">Preset</Label>
        <Select
          value={currentValue}
          onValueChange={handleValueChange}
          disabled={isExporting}
        >
          <SelectTrigger className="w-full min-w-0">
            <SelectValue placeholder="Select export size" />
          </SelectTrigger>
          <SelectContent
            className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-1rem)]"
            position="popper"
            align="start"
            sideOffset={4}
            collisionPadding={8}
          >
            {exportPresets.map((p) => (
              <SelectItem
                key={p.name}
                value={`${p.width}x${p.height}`}
                className="min-w-0"
              >
                <span className="block truncate">
                  {p.name} ({p.width}x{p.height})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onExport}
        className="w-full"
        disabled={!glOK || isExporting}
      >
        <Download size={16} className="mr-2" />
        {isExporting ? "Exporting..." : "Export PNG"}
      </Button>
    </div>
  );
}
