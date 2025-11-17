import React, { useState, useEffect, useRef } from "react";
import { Filters } from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Row } from "@/components/ui/Row";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function FilterEditor({ filters, setFilters }: Props) {
  // --- State from your FilterEditor ---
  const [localFilters, setLocalFilters] = useState(filters);
  const animFrameFiltersRef = useRef<number | null>(null);
  const latestFiltersToSet = useRef<Filters | null>(null);

  // --- State added from your CollapsibleDemo example ---
  // We default to `true` (open) which is better for an editor
  const [isOpen, setIsOpen] = React.useState(true);

  // --- All your existing logic and optimizations (unchanged) ---
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const runFiltersUpdate = () => {
      if (latestFiltersToSet.current) {
        setFilters(latestFiltersToSet.current);
        latestFiltersToSet.current = null;
      }
      animFrameFiltersRef.current = requestAnimationFrame(runFiltersUpdate);
    };

    animFrameFiltersRef.current = requestAnimationFrame(runFiltersUpdate);
    return () => {
      if (animFrameFiltersRef.current) {
        cancelAnimationFrame(animFrameFiltersRef.current);
      }
    };
  }, [setFilters]);

  const updateFilter = (key: keyof Filters, value: number[]) => {
    const newValue = value[0];
    setLocalFilters((prev) => {
      const newFilters = { ...prev, [key]: newValue };
      latestFiltersToSet.current = newFilters;
      return newFilters;
    });
  };

  // ---
  // This JSX is now structured like your CollapsibleDemo
  // and contains your FilterEditor's content
  // ---
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full" // Use w-full instead of w-[350px]
    >
      {/* This is the header row with the title and trigger */}
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <h4 className="text-sm font-semibold">Filters</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      {/* This is the content that shows/hides */}
      <CollapsibleContent>
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
      </CollapsibleContent>
    </Collapsible>
  );
}
