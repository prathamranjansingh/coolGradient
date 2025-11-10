// src/app/page.tsx
"use client";

import { NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useGradientState } from "@/hooks/useGradientState";
import { useNoisePattern } from "@/hooks/useNoisePattern";
import { useGeneratedCss } from "@/hooks/useGeneratedCss";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { GradientPreview } from "@/components/gradient/GradientPreview";
import { ResponsiveInspector } from "@/components/gradient/ResponsiveInspector";
import { Header } from "@/components/layout/Header";

const GradientGeneratorPage: NextPage = () => {
  const [state, dispatch] = useGradientState();
  const noisePatternDataUrl = useNoisePattern();
  const {
    cssExportString,
    cssForBefore,
    cssForAfter,
    railGradientCss,
    sortedStops,
    rawCss,
  } = useGeneratedCss(state, noisePatternDataUrl);

  const [isClient, setIsClient] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // ✅ New state to track graph hover
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      document.body.dataset.livePreview = isPreviewMode ? "true" : "false";
    }
  }, [isPreviewMode, isClient]);

  if (!isClient) {
    return null;
  }

  const layoutContent = (
    <div
      className={`flex flex-col min-h-screen text-foreground ${
        isPreviewMode ? "bg-transparent" : "bg-background"
      }`}
    >
      <Header
        isPreviewMode={isPreviewMode}
        onTogglePreview={() => setIsPreviewMode((p) => !p)}
        isMobile={!isDesktop}
        onToggleMobileDrawer={setIsMobileDrawerOpen}
      />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 lg:p-10">
        <div className="lg:grid lg:grid-cols-[1fr_450px] lg:gap-8">
          <div
            className={`
              group relative flex-1 h-full overflow-auto
              ${isPreviewMode ? "bg-transparent" : "checkerboard"}
              rounded-lg
            `}
          >
            <GradientPreview
              cssForBefore={cssForBefore}
              cssForAfter={cssForAfter}
              railGradientCss={railGradientCss}
              hoveredPosition={hoveredPosition} // ✅ Pass hover state
            />
          </div>

          <div className="relative">
            {isDesktop && (
              <ResponsiveInspector
                isDesktop={isDesktop}
                state={state}
                dispatch={dispatch}
                sortedStops={sortedStops}
                railGradientCss={railGradientCss}
                cssExportString={cssExportString}
                onGraphHover={setHoveredPosition} // ✅ Pass hover handlers
                onGraphLeave={() => setHoveredPosition(null)} // ✅
              />
            )}
          </div>
        </div>
      </main>

      {!isDesktop && (
        <ResponsiveInspector
          isDesktop={isDesktop}
          state={state}
          dispatch={dispatch}
          sortedStops={sortedStops}
          railGradientCss={railGradientCss}
          cssExportString={cssExportString}
          onGraphHover={setHoveredPosition} // ✅ Pass hover handlers
          onGraphLeave={() => setHoveredPosition(null)} // ✅
        />
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>Pro CSS Gradient Generator</title>
      </Head>

      {isPreviewMode && (
        <style>{`
          body::before { ${rawCss.before} }
          body::after { ${rawCss.after} }
        `}</style>
      )}

      {isDesktop ? (
        layoutContent
      ) : (
        <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
          {layoutContent}
        </Drawer>
      )}
    </>
  );
};

export default GradientGeneratorPage;
