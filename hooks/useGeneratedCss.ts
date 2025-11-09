// src/hooks/useGeneratedCss.ts

import { useMemo } from "react";
import { GradientState } from "@/types/gradient";
import { hexToRgba } from "@/lib/color";

export const useGeneratedCss = (
  settings: GradientState,
  noisePatternDataUrl: string
) => {
  const sortedStops = useMemo(
    () => [...settings.stops].sort((a, b) => a.position - b.position),
    [settings.stops]
  );

  const stopsCssString = useMemo(
    () =>
      sortedStops
        .map((s) => `${hexToRgba(s.color, s.alpha)} ${s.position}%`)
        .join(", "),
    [sortedStops]
  );

  const gradientCss = useMemo(() => {
    const gradientType = settings.repeating
      ? settings.type === "linear"
        ? "repeating-linear-gradient"
        : "repeating-radial-gradient"
      : settings.type === "linear"
      ? "linear-gradient"
      : "radial-gradient";
    const direction =
      settings.type === "linear" ? `${settings.angle}deg` : "circle";
    return `${gradientType}(${direction}, ${stopsCssString})`;
  }, [settings.type, settings.repeating, settings.angle, stopsCssString]);

  const railGradientCss = useMemo(() => {
    return `linear-gradient(to right, ${stopsCssString})`;
  }, [stopsCssString]);

  const filterCss = useMemo(() => {
    const { blur, brightness, contrast, saturation, hueRotate } =
      settings.filters;
    return [
      blur > 0 && `blur(${blur}px)`,
      brightness !== 100 && `brightness(${brightness}%)`,
      contrast !== 100 && `contrast(${contrast}%)`,
      saturation !== 100 && `saturate(${saturation}%)`,
      hueRotate > 0 && `hue-rotate(${hueRotate}deg)`,
    ]
      .filter(Boolean)
      .join(" ");
  }, [settings.filters]);

  const vignetteCss = useMemo(() => {
    if (settings.vignette.strength === 0) return null;
    const strength = settings.vignette.strength / 100;
    const size = settings.vignette.size;
    return `radial-gradient(ellipse at center, transparent ${size}%, rgba(0,0,0, ${strength}) 100%)`;
  }, [settings.vignette]);

  const basePseudoStyles = ['content: "";', "position: absolute;", "inset: 0;"];

  const cssForBefore = useMemo(() => {
    const layers = [vignetteCss, gradientCss].filter(Boolean);
    const styles = [
      ...basePseudoStyles,
      "z-index: 1;",
      `background-image: ${layers.join(", \n                ")};`,
      `background-size: cover;`,
      filterCss ? `filter: ${filterCss};` : "",
    ].filter(Boolean);

    return `.your-element::before {\n  ${styles.join("\n  ")}\n}`;
  }, [gradientCss, vignetteCss, filterCss]);

  const cssForAfter = useMemo(() => {
    if (settings.noise.opacity === 0 || !noisePatternDataUrl) {
      return ".your-element::after { display: none; }";
    }

    const styles = [
      ...basePseudoStyles,
      "z-index: 2;",
      `background-image: url(${noisePatternDataUrl});`,
      "background-size: 256px 256px;",
      `opacity: ${settings.noise.opacity};`,
      `mix-blend-mode: ${settings.noise.blendMode};`,
      "pointer-events: none;",
    ];

    return `.your-element::after {\n  ${styles.join("\n  ")}\n}`;
  }, [settings.noise.opacity, settings.noise.blendMode, noisePatternDataUrl]);

  const cssExportString = `
/* Usage: 
  1. Add 'position: relative;' and 'z-index: 0;' to your hero container.
  2. Add 'position: relative;' and 'z-index: 10;' to your content.
  3. Apply these styles.
*/
${cssForBefore}

${cssForAfter}
  `.trim();

  return {
    cssExportString,
    cssForBefore,
    cssForAfter,
    railGradientCss,
    sortedStops,
  };
};
