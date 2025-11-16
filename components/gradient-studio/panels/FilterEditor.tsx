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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      <div className="space-y-4 px-2 w-full overflow-x-hidden">
        {Object.keys(localFilters).map((k) => {
          const key = k as keyof Filters;
          return (
            // --- START: RESPONSIVE LAYOUT FIX ---
            // Each filter is a flex row.
            // We use `space-x-3` for gutter, so we use `calc` for precision.
            <div
              key={key}
              className="flex items-center space-x-2 sm:space-x-3 border-b border-b-[#222222] p-2 sm:p-4 w-full min-w-0"
            >
              {/* 1. Label: Takes 40% of the width */}
              <Label
                htmlFor={key}
                className="text-[#AAAAAA] font-extralight flex-shrink-0"
                // Use basis-2/5 (40%) minus a small amount for the gutter
                style={{ flexBasis: "calc(40% - 0.25rem)", minWidth: 0 }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Label>

              {/* 2. Slider + Value Container: Takes 60% of the width */}
              <div
                className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"
                // Use basis-3/5 (60%) minus a small amount for the gutter
                style={{ flexBasis: "calc(60% - 0.25rem)", minWidth: 0 }}
              >
                <Slider
                  id={key}
                  value={[localFilters[key]]}
                  min={-1} // Noise filter now behaves like others
                  max={1}
                  step={0.01}
                  onValueChange={(value) => updateFilter(key, value)}
                  className="py-1 flex-grow min-w-0" // Slider takes up available space *within this block*
                />
                <span className="w-8 sm:w-10 text-xs text-zinc-400 text-right flex-shrink-0">
                  {localFilters[key].toFixed(2)}
                </span>
              </div>
            </div>
            // --- END: RESPONSIVE LAYNDAYOUT FIX ---
          );
        })}
      </div>
    </Collapsible>
  );
}
