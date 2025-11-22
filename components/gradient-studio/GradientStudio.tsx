"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import { motion } from "motion/react";
import {
  defaultLinearStops,
  defaultRadialStops,
  defaultMesh,
  defaultRadialPoints,
  defaultFilters,
} from "@/lib/constants";
import { GradientStop, SelectedPoint, RadialPoints } from "@/lib/type";

import { useWebGLRenderer } from "@/hooks/useWebGLRenderer";
import { useOverlayRenderer } from "@/hooks/useOverlayRenderer";
import { useGradientInteractions } from "@/hooks/useGradientInteractions";

import { Toolbar } from "./Toolbar";
import { CanvasArea } from "./CanvasArea";
import { ControlPanel } from "./ControlPanel";
import { Footer } from "./Footer";

// --- 1. CURATED "PINTEREST" PALETTES ---
// These are hand-picked to ensure they never look muddy.

const DESIGNER_PALETTES = [
  // 1. The "Aura" (Soft, dreamy)
  ["#FF9A9E", "#FECFEF", "#A18CD1", "#FBC2EB"],
  // 2. "Northern Lights" (Deep mesh)
  ["#4338CA", "#3B82F6", "#10B981", "#6EE7B7"],
  // 3. "Sunset Drive" (Orange/Purple/Pink)
  ["#FF3CAC", "#784BA0", "#2B86C5"],
  // 4. "Peachy Clean" (Soft beige/orange)
  ["#FFECD2", "#FCB69F", "#FF9A9E"],
  // 5. "Acid Rain" (High contrast Y2K)
  ["#D9F99D", "#22D3EE", "#F472B6", "#818CF8"],
  // 6. "Deep Space"
  ["#0F172A", "#334155", "#475569", "#94A3B8"],
  // 7. "Cotton Candy"
  ["#D9AFD9", "#97D9E1", "#F8A1D1"],
  // 8. "Hyper" (SaaS website style)
  ["#A855F7", "#6366F1", "#3B82F6", "#EC4899"],
  // 9. "Warm Grain"
  ["#EAE5C9", "#6CC6CB", "#FF9A8B", "#FF6A88"],
  // 10. "Midnight Oil"
  ["#232526", "#414345", "#F43F5E"],
  // 11. "Kindle" (Warm fire)
  ["#F5AF19", "#F12711", "#93291E"],
  // 12. "Sublime"
  ["#FC5C7D", "#6A82FB"],
  // 13. "Witching Hour"
  ["#c31432", "#240b36", "#512a5e"],
  // 14. "Azure"
  ["#00c6ff", "#0072ff", "#0f2027"],
  // 15. "Lush"
  ["#134E5E", "#71B280", "#D9F99D"],
];

function getRandomPalette() {
  const index = Math.floor(Math.random() * DESIGNER_PALETTES.length);
  return DESIGNER_PALETTES[index];
}

// --------------------------------------------------------

export default function GradientStudio() {
  const [mode, setMode] = useState<"linear" | "radial" | "mesh">("linear");

  const [linearStops, setLinearStops] =
    useState<GradientStop[]>(defaultLinearStops);
  const [radialStops, setRadialStops] =
    useState<GradientStop[]>(defaultRadialStops);
  const [meshPoints, setMeshPoints] = useState(defaultMesh);
  const [radialPoints, setRadialPoints] = useState(defaultRadialPoints);
  const [filters, setFilters] = useState(defaultFilters);

  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    null
  );

  const [showControls, setShowControls] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSize, setExportSize] = useState({ width: 1920, height: 1080 });

  const activeStops = mode === "radial" ? radialStops : linearStops;
  const setActiveStops = mode === "radial" ? setRadialStops : setLinearStops;

  useEffect(() => {
    setSelectedPoint(null);
  }, [mode]);

  const sortedStops = useMemo(
    () => [...activeStops].sort((a, b) => a.position - b.position),
    [activeStops]
  );

  const throttledSetLinear = useMemo(() => throttle(setLinearStops, 16), []);
  const throttledSetRadial = useMemo(() => throttle(setRadialStops, 16), []);
  const throttledSetMeshPoints = useMemo(() => throttle(setMeshPoints, 16), []);
  const throttledSetRadialPoints = useMemo(
    () => throttle(setRadialPoints, 16),
    []
  );

  const activeSetStopsThrottled =
    mode === "radial" ? throttledSetRadial : throttledSetLinear;

  const { canvasRef, initWebGL, renderGL, glStatus, glRef, cleanup } =
    useWebGLRenderer(
      useMemo(
        () => ({
          mode,
          stops: sortedStops,
          meshPoints,
          radialPoints,
          filters,
        }),
        [mode, sortedStops, meshPoints, radialPoints, filters]
      )
    );

  const overlayState = useMemo(
    () => ({
      mode,
      stops: activeStops,
      sortedStops,
      meshPoints,
      radialPoints,
      selectedPoint,
    }),
    [mode, activeStops, sortedStops, meshPoints, radialPoints, selectedPoint]
  );
  const { overlayRef, drawOverlay } = useOverlayRenderer();

  const { interactionHandlers, getCursor } = useGradientInteractions({
    mode,
    stops: activeStops,
    sortedStops,
    meshPoints,
    radialPoints,
    setStops: activeSetStopsThrottled,
    setMeshPoints: throttledSetMeshPoints,
    setRadialPoints: throttledSetRadialPoints,
    setSelectedPoint,
  });

  const resizeCanvases = useCallback(() => {
    if (
      canvasRef.current &&
      overlayRef.current &&
      !isExporting &&
      canvasRef.current.parentElement
    ) {
      const { width, height } =
        canvasRef.current.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      overlayRef.current.width = width * dpr;
      overlayRef.current.height = height * dpr;

      overlayRef.current.style.width = `${width}px`;
      overlayRef.current.style.height = `${height}px`;

      renderGL();
      drawOverlay(overlayState);
    }
  }, [canvasRef, overlayRef, isExporting, renderGL, drawOverlay, overlayState]);

  useEffect(() => {
    if (initWebGL()) {
      resizeCanvases();
      window.addEventListener("resize", resizeCanvases);
    }
    return () => {
      window.removeEventListener("resize", resizeCanvases);
      cleanup();
    };
  }, [initWebGL, resizeCanvases, cleanup]);

  useEffect(() => {
    if (!isExporting) drawOverlay(overlayState);
  }, [overlayState, drawOverlay, isExporting]);

  useEffect(() => {
    if (!isExporting) renderGL();
  }, [
    mode,
    sortedStops,
    meshPoints,
    radialPoints,
    filters,
    renderGL,
    isExporting,
  ]);

  // --- UPDATED RANDOMIZER (Auto-adjusts stops to match palette) ---
  const randomizeGradient = useCallback(() => {
    // A. Pick a curated palette
    const palette = getRandomPalette();

    // B. Apply to Mesh
    if (mode === "mesh") {
      setMeshPoints((prevPoints) =>
        prevPoints.map((pt, i) => {
          const newColor = palette[i % palette.length];
          // Slight jitter for organic feel
          const jitter = 0.1;
          return {
            ...pt,
            x: Math.max(
              0.1,
              Math.min(0.9, pt.x + (Math.random() - 0.5) * jitter)
            ),
            y: Math.max(
              0.1,
              Math.min(0.9, pt.y + (Math.random() - 0.5) * jitter)
            ),
            color: newColor,
          };
        })
      );
      // Auto-add noise for texture
      setFilters((prev) => ({ ...prev, noise: 0.15 }));
    }

    // C. Apply to Linear/Radial (FIXED)
    else {
      // Create NEW stops based on the palette length
      // This ensures we see ALL the colors in the curated palette
      const newStops: GradientStop[] = palette.map((color, i) => ({
        id: crypto.randomUUID(),
        // Distribute evenly: 0, 0.33, 0.66, 1.0
        position: i / (palette.length - 1),
        color: color,
        x: 0.5, // Default for radial (unused in linear but required by type)
        y: 0.5,
        intensity: 1,
      }));

      setActiveStops(newStops);
    }
  }, [mode, setActiveStops]);

  const updateSelectedPoint = useCallback(
    (key: string, value: any) => {
      if (!selectedPoint) return;

      if (selectedPoint.type === "mesh") {
        setMeshPoints((prevPoints) =>
          prevPoints.map((pt, idx) =>
            idx === selectedPoint.index ? { ...pt, [key]: value } : pt
          )
        );
      } else if (
        selectedPoint.type === "linear-stop" ||
        selectedPoint.type === "radial-stop" ||
        selectedPoint.type === "linear"
      ) {
        setActiveStops((prevStops) =>
          prevStops.map((st, idx) =>
            idx === selectedPoint.index ? { ...st, [key]: value } : st
          )
        );
      } else if (selectedPoint.type === "radial") {
        const pointKey = selectedPoint.point as keyof RadialPoints;
        setRadialPoints((prev) => ({
          ...prev,
          [pointKey]: {
            ...prev[pointKey],
            [key]: value,
          },
        }));
      }
    },
    [selectedPoint, setActiveStops]
  );

  const addStop = useCallback(() => {
    const newStop: GradientStop = {
      id: crypto.randomUUID(),
      position: 0.5,
      color: "#ffffff",
      x: 0.5,
      y: 0.5,
      intensity: 1,
    };

    setActiveStops((prev) => [...prev, newStop]);
  }, [setActiveStops]);

  const removeStop = useCallback(
    (idx: number) => {
      setActiveStops((prev) => prev.filter((_, i) => i !== idx));
    },
    [setActiveStops]
  );

  const handleReset = useCallback(() => {
    if (mode === "mesh") {
      setMeshPoints(defaultMesh);
    } else if (mode === "radial") {
      setRadialStops(defaultRadialStops);
      setRadialPoints(defaultRadialPoints);
    } else {
      setLinearStops(defaultLinearStops);
    }
  }, [mode]);

  const exportAsPNG = useCallback(async () => {
    if (!glStatus.ok || !canvasRef.current || !glRef.current) return;
    setIsExporting(true);
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const oldW = canvas.width;
    const oldH = canvas.height;

    canvas.width = exportSize.width;
    canvas.height = exportSize.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    renderGL();

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gradient-foundry.png";
        a.click();
      }
      canvas.width = oldW;
      canvas.height = oldH;
      gl.viewport(0, 0, oldW, oldH);
      renderGL();
      setIsExporting(false);
    });
  }, [exportSize, renderGL, glStatus, glRef, canvasRef]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row h-screen w-full overflow-hidden font-mono"
    >
      <div className="relative w-full h-[50vh] lg:h-full lg:flex-1 bg-[#050505] flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800">
        <CanvasArea
          canvasRef={canvasRef}
          overlayRef={overlayRef}
          interactionHandlers={interactionHandlers}
          getCursor={getCursor}
          isExporting={isExporting}
          glStatus={glStatus}
        />
      </div>

      <div className="w-full lg:w-[400px] xl:w-[450px] h-[50vh] lg:h-full flex flex-col bg-black z-20 shadow-2xl shadow-black">
        <Toolbar
          mode={mode}
          setMode={setMode}
          onRandomize={randomizeGradient}
          showUI={showControls}
          onToggleUI={() => setShowControls(!showControls)}
        />

        {showControls && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <ControlPanel
              mode={mode}
              stops={activeStops}
              meshPoints={meshPoints}
              radialPoints={radialPoints}
              filters={filters}
              selectedPoint={selectedPoint}
              isExporting={isExporting}
              exportSize={exportSize}
              glOK={glStatus.ok}
              setStops={setActiveStops}
              setMeshPoints={setMeshPoints}
              setFilters={setFilters}
              setSelectedPoint={setSelectedPoint}
              setExportSize={setExportSize}
              addStop={addStop}
              addMeshPoint={() =>
                setMeshPoints([
                  ...meshPoints,
                  {
                    x: 0.5,
                    y: 0.5,
                    color: "#ffffff",
                    radius: 0.5,
                    intensity: 1,
                  },
                ])
              }
              removeStop={removeStop}
              removeMeshPoint={(idx: number) =>
                setMeshPoints(meshPoints.filter((_, i) => i !== idx))
              }
              onReset={handleReset}
              exportAsPNG={exportAsPNG}
              updateSelectedPoint={updateSelectedPoint}
            />
          </div>
        )}

        <Footer glStatus={glStatus} />
      </div>
    </motion.div>
  );
}
