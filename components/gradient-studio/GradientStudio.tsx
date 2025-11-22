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
import { randomColor } from "@/lib/utils";
// 1. FIX: Import all necessary types
import { GradientStop, SelectedPoint, RadialPoints } from "@/lib/type";

import { useWebGLRenderer } from "@/hooks/useWebGLRenderer";
import { useOverlayRenderer } from "@/hooks/useOverlayRenderer";
import { useGradientInteractions } from "@/hooks/useGradientInteractions";

import { Toolbar } from "./Toolbar";
import { CanvasArea } from "./CanvasArea";
import { ControlPanel } from "./ControlPanel";
import { Footer } from "./Footer";

export default function GradientStudio() {
  const [mode, setMode] = useState<"linear" | "radial" | "mesh">("linear");

  const [linearStops, setLinearStops] =
    useState<GradientStop[]>(defaultLinearStops);
  const [radialStops, setRadialStops] =
    useState<GradientStop[]>(defaultRadialStops);
  const [meshPoints, setMeshPoints] = useState(defaultMesh);
  const [radialPoints, setRadialPoints] = useState(defaultRadialPoints);
  const [filters, setFilters] = useState(defaultFilters);

  // 2. FIX: Strongly type the selectedPoint state
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    null
  );

  const [showControls, setShowControls] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSize, setExportSize] = useState({ width: 1920, height: 1080 });

  // Determine active stops based on mode
  const activeStops = mode === "radial" ? radialStops : linearStops;
  const setActiveStops = mode === "radial" ? setRadialStops : setLinearStops;

  // Deselect point when mode changes
  useEffect(() => {
    setSelectedPoint(null);
  }, [mode]);

  // Memoized Sorting
  const sortedStops = useMemo(
    () => [...activeStops].sort((a, b) => a.position - b.position),
    [activeStops]
  );

  // Memoized Throttled Setters
  const throttledSetLinear = useMemo(() => throttle(setLinearStops, 16), []);
  const throttledSetRadial = useMemo(() => throttle(setRadialStops, 16), []);
  const throttledSetMeshPoints = useMemo(() => throttle(setMeshPoints, 16), []);
  const throttledSetRadialPoints = useMemo(
    () => throttle(setRadialPoints, 16),
    []
  );

  const activeSetStopsThrottled =
    mode === "radial" ? throttledSetRadial : throttledSetLinear;

  // WebGL Hooks
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

  // Overlay Hooks
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

  // Interaction Hooks
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

  // Resize Logic
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

  // Regular Draw Loops
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

  // Actions
  const randomizeGradient = useCallback(() => {
    const randomizeColors = <T extends { color: string }>(arr: T[]): T[] =>
      arr.map((item) => ({ ...item, color: randomColor() }));

    if (mode === "mesh") {
      setMeshPoints((prevPoints) => randomizeColors(prevPoints));
    } else {
      setActiveStops((prevStops) => randomizeColors(prevStops));
    }
  }, [mode, setActiveStops]);

  const updateSelectedPoint = useCallback(
    (key: string, value: any) => {
      if (!selectedPoint) return;

      // 1. MESH Logic
      if (selectedPoint.type === "mesh") {
        setMeshPoints((prevPoints) =>
          prevPoints.map((pt, idx) =>
            idx === selectedPoint.index ? { ...pt, [key]: value } : pt
          )
        );
      }
      // 2. LINEAR/RADIAL STOP Logic
      else if (
        selectedPoint.type === "linear-stop" ||
        selectedPoint.type === "radial-stop" ||
        selectedPoint.type === "linear"
      ) {
        setActiveStops((prevStops) =>
          prevStops.map((st, idx) =>
            idx === selectedPoint.index ? { ...st, [key]: value } : st
          )
        );
      }
      // 3. RADIAL CONTROL POINT Logic (Center/Focus)
      else if (selectedPoint.type === "radial") {
        // 3. FIX: Explicitly cast point to keyof RadialPoints
        // This tells TS: "Trust me, this string is either 'center' or 'focus'"
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
      {/* Left: Fixed Canvas */}
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

      {/* Right: Scrollable Controls */}
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
