// src/components/gradient/ResponsiveInspector.tsx
"use client";

import React, { FC, Dispatch } from "react";
import { GradientState, GradientActions, ColorStop } from "@/types/gradient";
import { DrawerContent } from "@/components/ui/drawer";
import { GradientInspectorContent } from "./GradientInspectorContent";

interface ResponsiveInspectorProps {
  state: GradientState;
  dispatch: Dispatch<GradientActions>;
  sortedStops: ColorStop[];
  railGradientCss: string;
  cssExportString: string;
  isDesktop: boolean;
  onGraphHover: (position: number) => void;
  onGraphLeave: () => void;
  isPreviewMode: boolean; // This prop is now used
}

export const ResponsiveInspector: FC<ResponsiveInspectorProps> = ({
  state,
  dispatch,
  sortedStops,
  railGradientCss,
  cssExportString,
  isDesktop,
  onGraphHover,
  onGraphLeave,
  isPreviewMode,
}) => {
  const inspectorContentProps = {
    state,
    dispatch,
    sortedStops,
    railGradientCss,
    cssExportString,
    onGraphHover,
    onGraphLeave,
    isPreviewMode, // Pass it down
  };

  if (isDesktop) {
    return (
      <aside
        className={`
          lg:w-[450px] block
          sticky top-10 
          z-10
          flex flex-col
          rounded-lg
          max-h-[calc(100vh-80px-2.5rem)]
          transition-all duration-300
          overflow-hidden
          ${
            isPreviewMode // ✅ Apply glassmorphism or solid background
              ? "bg-white/20 backdrop-blur-xl border border-white/10" // More transparent
              : "bg-background border border-border"
          }
        `}
      >
        <GradientInspectorContent {...inspectorContentProps} />
      </aside>
    );
  }

  // Render as DrawerContent on mobile
  return (
    <DrawerContent className="h-[90vh] flex flex-col overflow-hidden">
      <GradientInspectorContent {...inspectorContentProps} />
    </DrawerContent>
  );
};
