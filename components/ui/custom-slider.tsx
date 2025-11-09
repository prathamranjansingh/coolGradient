// src/components/ui/custom-slider.tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils"; // Assuming you have shadcn's cn utility

interface CustomSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
}

const CustomSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  CustomSliderProps
>(
  (
    {
      className,
      value,
      onValueChange,
      min,
      max,
      step,
      label,
      unit = "",
      ...props
    },
    ref
  ) => {
    // Determine if the slider has a non-default value to make the track active
    const hasValue = value && value[0] !== min;
    const thumbValue = value?.[0] !== undefined ? Math.round(value[0]) : min;

    return (
      <div className="relative pt-4 pb-2">
        {" "}
        {/* Added padding for label and value */}
        {label && (
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-muted-foreground">
              {label}
            </label>
            <span className="text-sm font-medium text-foreground">
              {thumbValue}
              {unit}
            </span>
          </div>
        )}
        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          {...props}
        >
          <SliderPrimitive.Track
            className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted" // Thicker track
          >
            <SliderPrimitive.Range
              className={cn(
                "absolute h-full rounded-full bg-primary transition-colors",
                {
                  "bg-muted-foreground": !hasValue, // Dimmer if at min value
                  "bg-gradient-to-r from-primary to-accent": hasValue, // Gradient for active track (optional, but looks good)
                }
              )}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-primary bg-background shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative flex items-center justify-center text-xs font-semibold">
            <span className="text-foreground select-none">{thumbValue}</span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    );
  }
);
CustomSlider.displayName = SliderPrimitive.Root.displayName;

export { CustomSlider };
