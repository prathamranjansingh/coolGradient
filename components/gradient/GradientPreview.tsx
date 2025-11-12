// src/components/gradient/GradientPreview.tsx
import React, { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface GradientPreviewProps {
  cssForBefore: string;
  cssForAfter: string;
  railGradientCss: string; // Still not directly used in this component, but kept for consistency
  hoveredPosition: number | null;
}

export const GradientPreview: FC<GradientPreviewProps> = ({
  cssForBefore,
  cssForAfter,
  hoveredPosition,
}) => {
  const beforeStyles = cssForBefore.replace(
    ".your-element",
    "#preview-hero-bg"
  );
  const afterStyles = cssForAfter.replace(".your-element", "#preview-hero-bg");

  // Calculate positions for the rectangular highlight
  const highlightWidth = 10; // Width of the clear highlight strip
  const highlightPosition = hoveredPosition ?? 50; // Default to center if not hovered

  // Define the transparent window
  const windowStart = Math.max(0, highlightPosition - highlightWidth / 2);
  const windowEnd = Math.min(100, highlightPosition + highlightWidth / 2);

  // CSS for the white wash and clear window effect
  const maskStyle = {
    background: `linear-gradient(to right, 
      rgba(255,255,255,0.7) 0%, 
      rgba(255,255,255,0.7) ${windowStart}%, 
      transparent ${windowStart}%, 
      transparent ${windowEnd}%, 
      rgba(255,255,255,0.7) ${windowEnd}%, 
      rgba(255,255,255,0.7) 100%)`,
    opacity: hoveredPosition !== null ? 1 : 0, // Only show when hovering
    transition: "opacity 100ms ease-in-out",
  };

  return (
    <>
      <style>{beforeStyles}</style>
      <style>{afterStyles}</style>

      <Card className="relative z-10 w-full h-[500px] max-h-[500px] overflow-hidden transition-all duration-300 rounded-lg">
        <CardContent className="p-0 w-full h-full">
          {/* Base gradient element */}
          <div
            id="preview-hero-bg"
            className="relative w-full h-full overflow-hidden"
            style={{ position: "relative", zIndex: 0 }}
          >
            {/* ::before and ::after are applied here */}
          </div>

          {/* ✅ New White Wash with Clear Highlight Layer */}
          <div
            className="absolute inset-0 z-30 pointer-events-none"
            style={maskStyle}
          />
        </CardContent>
      </Card>
    </>
  );
};
