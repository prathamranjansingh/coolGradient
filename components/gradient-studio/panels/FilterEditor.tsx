import React from "react";
import { Filters } from "@/lib/type";
import { Collapsible } from "@/components/ui/collapsible";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function FilterEditor({ filters, setFilters }: Props) {
  const updateFilter = (key: keyof Filters, value: number[]) => {
    setFilters((prev) => ({ ...prev, [key]: value[0] }));
  };

  return (
    <Collapsible title="Filters">
      <div className="space-y-4">
        {filters &&
          Object.keys(filters).map((k) => {
            const key = k as keyof Filters;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-zinc-300 text-sm">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <span className="w-10 text-xs text-zinc-400 text-right">
                    {filters[key].toFixed(2)}
                  </span>
                </div>
                <Slider
                  id={key}
                  value={[filters[key]]} // Pass value as an array
                  min={key === "noise" ? 0 : -1}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => updateFilter(key, value)} // Use onValueChange
                  className="py-1"
                />
              </div>
            );
          })}
      </div>
    </Collapsible>
  );
}
