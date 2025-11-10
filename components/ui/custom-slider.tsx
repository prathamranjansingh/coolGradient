// src/components/ui/custom-slider.tsx
"use client";

import React, { FC } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface CustomSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
}

export const CustomSlider: FC<CustomSliderProps> = ({
  label,
  min,
  max,
  step,
  unit = "",
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={`${label}-slider`}>{label}</Label>
        <span className="text-sm font-mono text-muted-foreground">
          {value[0]}
          {unit}
        </span>
      </div>
      <Slider
        id={`${label}-slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </div>
  );
};
