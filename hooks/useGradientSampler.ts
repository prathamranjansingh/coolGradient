// src/hooks/useGradientSampler.ts
import { useMemo } from "react";
import { ColorStop } from "@/types/gradient";
import { hexToRgb, lerp, rgbToCssString, rgbToHex } from "@/lib/color";

interface RgbColor {
  r: number;
  g: number;
  b: number;
}
export interface ColorSample {
  pos: number;
  hex: string;
  rgb: string;
  r: number;
  g: number;
  b: number;
}

const lerpColor = (
  colorA: RgbColor,
  colorB: RgbColor,
  amount: number
): RgbColor => {
  return {
    r: Math.round(lerp(colorA.r, colorB.r, amount)),
    g: Math.round(lerp(colorA.g, colorB.g, amount)),
    b: Math.round(lerp(colorA.b, colorB.b, amount)),
  };
};

const getInterpolatedColor = (
  position: number,
  stops: ColorStop[]
): RgbColor => {
  let stopA = stops[0];
  let stopB = stops[stops.length - 1];

  for (let i = 0; i < stops.length; i++) {
    if (stops[i].position >= position) {
      stopB = stops[i];
      if (i > 0) {
        stopA = stops[i - 1];
      } else {
        stopA = stops[i];
      }
      break;
    }
    stopA = stops[i];
  }

  const range = stopB.position - stopA.position;
  let amount = 0;
  if (range > 0) {
    amount = (position - stopA.position) / range;
  }

  const colorA = hexToRgb(stopA.color);
  const colorB = hexToRgb(stopB.color);
  const defaultColor = { r: 0, g: 0, b: 0 };

  return lerpColor(colorA || defaultColor, colorB || defaultColor, amount);
};

export const useGradientSampler = (
  stops: ColorStop[],
  steps: number
): ColorSample[] => {
  const data = useMemo(() => {
    const samples: ColorSample[] = [];
    if (!stops.length) {
      return [];
    }

    for (let i = 0; i <= steps; i++) {
      const pos = (i / steps) * 100;
      const color = getInterpolatedColor(pos, stops);
      samples.push({
        pos: pos,
        hex: rgbToHex(color.r, color.g, color.b),
        rgb: rgbToCssString(color.r, color.g, color.b),
        r: color.r,
        g: color.g,
        b: color.b,
      });
    }
    return samples;
  }, [stops, steps]);

  return data;
};
