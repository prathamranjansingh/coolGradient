import { useState, memo } from "react";

interface CustomSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

const CustomSlider = memo(
  ({
    label,
    value: initialValue,
    min = 0,
    max = 100,
    onChange,
  }: CustomSliderProps) => {
    const [val, setVal] = useState(initialValue);

    const handleChange = (newValue: number) => {
      setVal(newValue);
      onChange?.(newValue);
    };

    const percentage = ((val - min) / (max - min)) * 100;

    return (
      <div className="flex items-center justify-between gap-4 group h-5">
        <div className="w-20 shrink-0 text-[9px] font-mono text-gray-500 uppercase tracking-wider group-hover:text-white transition-colors">
          {label}
        </div>

        <div className="relative flex-1 flex items-center select-none h-full cursor-crosshair">
          <div className="bg-[#222] relative grow overflow-hidden h-[2px] w-full">
            <div
              className="bg-white absolute h-full will-change-transform"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 block w-2 h-2 shrink-0 bg-black border border-white shadow-sm transition-transform hover:scale-150 rounded-none z-10 pointer-events-none will-change-transform"
            style={{ left: `calc(${percentage}% - 4px)` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step="0.01"
            value={val}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-crosshair z-20 w-full h-full"
          />
        </div>
        <div className="w-8 shrink-0 text-right text-[9px] font-mono text-white">
          {val.toFixed(2)}
        </div>
      </div>
    );
  }
);

CustomSlider.displayName = "CustomSlider";
