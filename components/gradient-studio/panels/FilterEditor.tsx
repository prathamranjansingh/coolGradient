import React, { useCallback, useRef, useState, useEffect } from "react";
import { Filters } from "@/lib/type";
import { Collapsible } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Row } from "@/components/ui/Row";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function FilterEditor({ filters, setFilters }: Props) {
  const [localFilters, setLocalFilters] = useState(filters);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = useCallback(
    (key: keyof Filters, value: number[]) => {
      const newValue = value[0];
      setLocalFilters((prev) => ({ ...prev, [key]: newValue }));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [key]: newValue }));
      }, 16);
    },
    [setFilters]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Collapsible title="Filters">
      <div className="w-full overflow-x-hidden">
        {Object.keys(localFilters).map((k) => {
          const key = k as keyof Filters;
          return (
            <Row
              key={key}
              left={
                <Label
                  htmlFor={key}
                  className="text-[#AAAAAA] font-extralight leading-none truncate"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
              }
              right={
                <>
                  {/* slider wrapper always takes remaining width */}
                  <div className="flex-1 min-w-0">
                    <Slider
                      id={key}
                      value={[localFilters[key]]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(value) => updateFilter(key, value)}
                      className="w-full h-1.5 py-0"
                    />
                  </div>

                  {/* trailing element: fixed width w-10 to match StopsEditor */}
                  <div className="w-10 flex-shrink-0 text-right">
                    <span className="text-xs text-zinc-400 block leading-none">
                      {localFilters[key].toFixed(2)}
                    </span>
                  </div>
                </>
              }
            />
          );
        })}
      </div>
    </Collapsible>
  );
}
