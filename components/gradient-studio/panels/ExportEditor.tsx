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
  if (!exportSize) return null;

  const handleValueChange = (value: string) => {
    const [width, height] = value.split("x").map(Number);
    setExportSize({ width, height });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <span className="panel-header block">Output_Resolution</span>
        <Select
          value={`${exportSize.width}x${exportSize.height}`}
          onValueChange={handleValueChange}
          disabled={isExporting}
        >
          <SelectTrigger className="w-full rounded-none border-zinc-800 bg-black text-xs font-mono h-9 text-zinc-300 focus:ring-0 focus:border-zinc-500">
            <SelectValue placeholder="Select Size" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-zinc-800 bg-black text-zinc-300">
            {exportPresets.map((p) => (
              <SelectItem
                key={p.name}
                value={`${p.width}x${p.height}`}
                className="text-xs font-mono focus:bg-zinc-900 focus:text-white rounded-none cursor-pointer"
              >
                {p.name}{" "}
                <span className="text-zinc-600 ml-2">
                  [{p.width}x{p.height}]
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onExport}
        disabled={!glOK || isExporting}
        className="w-full rounded-none bg-white text-black hover:bg-zinc-200 h-10 font-mono text-xs uppercase tracking-widest"
      >
        {isExporting ? (
          <span className="animate-pulse">Rendering...</span>
        ) : (
          <span className="flex items-center gap-2">
            <Download size={14} /> Export_PNG
          </span>
        )}
      </Button>
    </div>
  );
}
