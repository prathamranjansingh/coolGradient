// src/lib/color.ts

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
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    hex = "#000000"; // Fallback for invalid hex
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
