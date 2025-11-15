import React, { useCallback, useRef, useState, useEffect } from "react";
import { Filters } from "@/lib/type";
import { Collapsible } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function FilterEditor({ filters, setFilters }: Props) {
  // Local state for immediate UI updates
  const [localFilters, setLocalFilters] = useState(filters);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sync local state when parent filters change (from reset, randomize, etc.)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = useCallback(
    (key: keyof Filters, value: number[]) => {
      const newValue = value[0];

      // Update local state immediately for smooth UI
      setLocalFilters((prev) => ({ ...prev, [key]: newValue }));

      // Debounce the actual state update to reduce re-renders
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [key]: newValue }));
      }, 16); // ~60fps update rate
    },
    [setFilters]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Collapsible title="Filters">
      <div className="space-y-4">
        {Object.keys(localFilters).map((k) => {
          const key = k as keyof Filters;
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={key} className="text-zinc-300 text-sm">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <span className="w-10 text-xs text-zinc-400 text-right">
                  {localFilters[key].toFixed(2)}
                </span>
              </div>
              <Slider
                id={key}
                value={[localFilters[key]]}
                min={key === "noise" ? 0 : -1}
                max={1}
                step={0.01}
                onValueChange={(value) => updateFilter(key, value)}
                className="py-1"
              />
            </div>
          );
        })}
      </div>
    </Collapsible>
  );
}
