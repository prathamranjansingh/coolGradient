import React, { useState, useEffect } from "react";
import { Filters } from "@/lib/type";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function FilterEditor({ filters, setFilters }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => setLocalFilters(filters), [filters]);

  const handleChange = (key: keyof Filters, val: number[]) => {
    const newVal = val[0];
    setLocalFilters((prev) => ({ ...prev, [key]: newVal }));
    setFilters((prev) => ({ ...prev, [key]: newVal }));
  };

  return (
    <div className="w-full border-b border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
      >
        <span className="panel-header mb-0 group-hover:text-white transition-colors">
          Post_Processing
        </span>
        {isOpen ? (
          <Minus
            size={12}
            className="text-zinc-500 group-hover:text-white transition-colors"
          />
        ) : (
          <Plus
            size={12}
            className="text-zinc-500 group-hover:text-white transition-colors"
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 space-y-5 pt-2">
              {Object.keys(localFilters).map((k) => {
                const key = k as keyof Filters;
                return (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-24 text-xs text-zinc-500 uppercase truncate">
                      {key}
                    </div>
                    <div className="flex-1">
                      <Slider
                        value={[localFilters[key]]}
                        min={key === "noise" ? 0 : -1}
                        max={1}
                        step={0.01}
                        onValueChange={(v) => handleChange(key, v)}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-zinc-300">
                      {localFilters[key].toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
