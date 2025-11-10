// src/hooks/useNoisePattern.ts
import { useState, useEffect } from "react";

export const useNoisePattern = (): string => {
  const [pattern, setPattern] = useState("");

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === "undefined") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 256,
      h = 256;
    canvas.width = w;
    canvas.height = h;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    setPattern(canvas.toDataURL());
  }, []);

  return pattern;
};
