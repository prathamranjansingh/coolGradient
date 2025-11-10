// src/lib/color.ts

// ✅ New helper function
const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

// ✅ New helper function
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

// ✅ New helper function
export const rgbToCssString = (r: number, g: number, b: number): string => {
  return `rgb(${r}, ${g}, ${b})`;
};

export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const getRandomComplementaryColors = (): [string, string] => {
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30);
  const lightness = 50 + Math.floor(Math.random() * 20);
  const complementaryHue = (baseHue + 180) % 360;
  const color1 = hslToHex(baseHue, saturation, lightness);
  const color2 = hslToHex(complementaryHue, saturation, lightness);
  return [color1, color2];
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

export const lerp = (a: number, b: number, amount: number): number => {
  return (1 - amount) * a + amount * b;
};

export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const hexVal = hex.startsWith("#") ? hex.slice(1) : hex;

  if (hexVal.length === 3) {
    const r = parseInt(hexVal[0] + hexVal[0], 16);
    const g = parseInt(hexVal[1] + hexVal[1], 16);
    const b = parseInt(hexVal[2] + hexVal[2], 16);
    return { r, g, b };
  }

  if (hexVal.length === 6) {
    const r = parseInt(hexVal.slice(0, 2), 16);
    const g = parseInt(hexVal.slice(2, 4), 16);
    const b = parseInt(hexVal.slice(4, 6), 16);
    return { r, g, b };
  }

  return null; // Invalid hex
};
