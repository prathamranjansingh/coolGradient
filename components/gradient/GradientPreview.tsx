// src/components/gradient/GradientPreview.tsx
import React, { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface GradientPreviewProps {
  cssForBefore: string;
  cssForAfter: string;
  railGradientCss: string;
  hoveredPosition: number | null; // ✅ New prop for hover
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

  return (
    <>
      <style>{beforeStyles}</style>
      <style>{afterStyles}</style>

      {/* Clean, borderless card */}
      <Card className="relative z-10 w-full h-[500px] max-h-[500px] overflow-hidden transition-all duration-300">
        <CardContent className="p-0 w-full h-full">
          <div
            id="preview-hero-bg"
            className="relative w-full h-full overflow-hidden"
            style={{ position: "relative", zIndex: 0 }}
          >
            {/* ::before and ::after are applied here */}

            {/* ✅ New Spotlight Element */}
            <div
              className="absolute inset-0 z-30 transition-opacity duration-100 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${
                  hoveredPosition ?? 50
                }% 50%, transparent 0%, transparent 10%, rgba(0,0,0,0.7) 30%)`,
                opacity: hoveredPosition !== null ? 1 : 0,
                backdropFilter: "blur(2px)",
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
