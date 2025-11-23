"use client";

import React, { FC } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface CustomSliderProps {
  label: string;
  min?: number;
  max: number;
  step?: number;
  unit?: string;
  value: number | number[];
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

export const CustomSlider: FC<CustomSliderProps> = ({
  label,
  min = 0,
  max,
  step = 0.01,
  unit = "",
  value,
  onValueChange = () => {},
  disabled = false,
}) => {
  // Convert single number → array
  const normalizedValue = Array.isArray(value) ? value : [value];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={`${label}-slider`}>{label}</Label>
        <span className="text-sm font-mono text-muted-foreground">
          {normalizedValue[0]}
          {unit}
        </span>
      </div>

      <Slider
        id={`${label}-slider`}
        min={min}
        max={max}
        step={step}
        value={normalizedValue}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </div>
  );
};
