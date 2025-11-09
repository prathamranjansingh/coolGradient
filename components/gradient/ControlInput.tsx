// src/components/gradient/ControlInput.tsx
import React, { FC } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomSlider } from "@/components/ui/custom-slider";

interface ControlInputProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  value: number | string;
  onValueChange: (value: number[] | string) => void;
  type?: "slider" | "text" | "number" | "color";
  disabled?: boolean;
}

export const ControlInput: FC<ControlInputProps> = ({
  label,
  min,
  max,
  step,
  unit = "",
  value,
  onValueChange,
  type = "slider", // Default to slider
  disabled = false,
}) => {
  if (type === "slider") {
    // Ensure min, max, step are provided for slider type
    if (
      typeof value !== "number" ||
      min === undefined ||
      max === undefined ||
      step === undefined
    ) {
      console.error(
        "ControlInput: Slider type requires numeric value, min, max, and step."
      );
      return null;
    }
    return (
      <CustomSlider
        label={label}
        min={min}
        max={max}
        step={step}
        unit={unit}
        value={[value]}
        onValueChange={onValueChange as (value: number[]) => void}
        disabled={disabled}
      />
    );
  }

  // Generic Input fields
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={`${label}-input`}>{label}</Label>
        {type !== "color" && ( // Don't show value next to label for color picker
          <span className="text-sm font-mono text-muted-foreground">
            {value}
            {unit}
          </span>
        )}
      </div>
      <Input
        id={`${label}-input`}
        type={
          type === "number" ? "number" : type === "color" ? "color" : "text"
        }
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="font-mono text-sm"
        disabled={disabled}
      />
    </div>
  );
};
