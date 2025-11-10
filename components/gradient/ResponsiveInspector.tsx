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
  // ✅ New props for hover
  onGraphHover: (position: number) => void;
  onGraphLeave: () => void;
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
}) => {
  const inspectorContentProps = {
    state,
    dispatch,
    sortedStops,
    railGradientCss,
    cssExportString,
    onGraphHover,
    onGraphLeave,
  };

  if (isDesktop) {
    return (
      <aside
        className={`
          lg:w-[450px] block
          sticky top-10 
          z-10
          flex flex-col
          bg-background border border-border rounded-lg
          max-h-[calc(100vh-80px-2.5rem)]
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
