// src/app/page.tsx
"use client";

import { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button"; // Still needed for desktop toggle

// Our modular imports
import { useGradientState } from "@/hooks/useGradientState";
import { useNoisePattern } from "@/hooks/useNoisePattern";
import { useGeneratedCss } from "@/hooks/useGeneratedCss";
import { GradientPreview } from "@/components/gradient/GradientPreview";
import { ResponsiveInspector } from "@/components/gradient/ResponsiveInspector"; // ✅ Import ResponsiveInspector
import { useMediaQuery } from "@/hooks/useMediaQuery"; // ✅ Import useMediaQuery

const GradientGeneratorPage: NextPage = () => {
  const [state, dispatch] = useGradientState();
  const noisePatternDataUrl = useNoisePattern();
  const {
    cssExportString,
    cssForBefore,
    cssForAfter,
    railGradientCss,
    sortedStops,
  } = useGeneratedCss(state, noisePatternDataUrl);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // This state now specifically controls the desktop sidebar visibility
  const [isDesktopInspectorOpen, setIsDesktopInspectorOpen] = useState(true);

  return (
    <>
      <Head>
        <title>Pro CSS Gradient Generator</title>
        <style>{`
          .checkerboard {
            background-image:
              linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
              linear-gradient(135deg, hsl(var(--muted)) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
              linear-gradient(135deg, transparent 75%, hsl(var(--muted)) 75%);
            background-size: 20px 20px;
            background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
          }
        `}</style>
      </Head>

      <main className="relative flex flex-col lg:flex-row h-screen bg-background text-foreground">
        {/* --- Main Preview Pane (Left) --- */}
        <div className="flex-1 h-[60vh] lg:h-full relative p-4 lg:p-10 checkerboard overflow-auto">
          <GradientPreview
            cssForBefore={cssForBefore}
            cssForAfter={cssForAfter}
          />

          {isDesktop && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-20"
              onClick={() => setIsDesktopInspectorOpen((prev) => !prev)}
              aria-label="Toggle Inspector Panel"
            >
              {isDesktopInspectorOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <ResponsiveInspector
          isDesktopInspectorOpen={isDesktopInspectorOpen}
          setIsDesktopInspectorOpen={setIsDesktopInspectorOpen}
          state={state}
          dispatch={dispatch}
          sortedStops={sortedStops}
          railGradientCss={railGradientCss}
          cssExportString={cssExportString}
        />
      </main>
    </>
  );
};

export default GradientGeneratorPage;
