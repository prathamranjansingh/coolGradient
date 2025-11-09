// src/components/gradient/ResponsiveInspector.tsx
"use client";

import React, { FC, Dispatch } from "react";
import { GradientState, GradientActions, ColorStop } from "@/types/gradient";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"; // Assuming Shadcn Drawer components
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, X } from "lucide-react"; // X for close button

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { GradientInspectorContent } from "./GradientInspector"; // The modified content component

interface ResponsiveInspectorProps {
  state: GradientState;
  dispatch: Dispatch<GradientActions>;
  sortedStops: ColorStop[];
  railGradientCss: string;
  cssExportString: string;
  isDesktopInspectorOpen: boolean; // Renamed to avoid confusion
  setIsDesktopInspectorOpen: (open: boolean) => void;
}

export const ResponsiveInspector: FC<ResponsiveInspectorProps> = ({
  state,
  dispatch,
  sortedStops,
  railGradientCss,
  cssExportString,
  isDesktopInspectorOpen,
  setIsDesktopInspectorOpen,
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)"); // lg breakpoint
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Props for the GradientInspectorContent (now shared)
  const inspectorContentProps = {
    state,
    dispatch,
    sortedStops,
    railGradientCss,
    cssExportString,
  };

  if (isDesktop) {
    // Render as a collapsible sidebar on desktop
    return (
      <aside
        className={`
          bg-background z-10 flex flex-col
          transition-all duration-300 ease-in-out
          lg:h-full lg:border-l lg:border-border
          ${
            isDesktopInspectorOpen
              ? "w-full lg:w-96 h-full"
              : "w-0 h-0 lg:h-full"
          }
          ${isDesktopInspectorOpen ? "opacity-100" : "opacity-0"}
          overflow-hidden
        `}
      >
        <GradientInspectorContent {...inspectorContentProps} />
      </aside>
    );
  }

  // Render as a Drawer on mobile
  return (
    <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-20 lg:hidden" // Only show on mobile
          aria-label="Toggle Inspector Panel"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] flex flex-col overflow-hidden">
        <DrawerHeader className="p-4 border-b border-border flex items-center justify-between">
          <DrawerTitle className="text-xl font-semibold">Controls</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          {/* Render the shared content inside the scrollable area */}
          <GradientInspectorContent {...inspectorContentProps} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
