import React, { useState, useEffect, useRef } from "react";
import { Filters } from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Row } from "@/components/ui/Row";
import { Button } from "@/components/ui/button";
// 1. Import Framer Motion
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function FilterEditor({ filters, setFilters }: Props) {
  // --- UI STATE ---
  const [isOpen, setIsOpen] = useState(true);

  // --- LOGIC (Unchanged) ---
  const [localFilters, setLocalFilters] = useState(filters);
  const animFrameFiltersRef = useRef<number | null>(null);
  const latestFiltersToSet = useRef<Filters | null>(null);

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

  // --- RENDER ---
  return (
    <div className="w-full">
      {/* HEADER 
         - Uses py-2 to match your original alignment
         - Added onClick for toggle 
      */}
      <div
        className="flex items-center justify-between gap-4 px-4 py-2 cursor-pointer select-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-sm font-semibold group-hover:text-zinc-300 transition-colors">
          Filters
        </h4>
        <Button variant="ghost" size="icon" className="size-8 text-zinc-400">
          {/* Animated Plus/Minus Icon */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Horizontal line (Always visible) */}
            <line x1="5" y1="12" x2="19" y2="12" />

            {/* Vertical line (Collapses when Open) */}
            <motion.line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
              initial={false}
              animate={{ scaleY: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.svg>
          <span className="sr-only">Toggle</span>
        </Button>
      </div>

      {/* ANIMATED CONTENT 
         - Replaces CollapsibleContent
         - No extra padding added to preserve exact layout
      */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            {/* Original Content Container */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
