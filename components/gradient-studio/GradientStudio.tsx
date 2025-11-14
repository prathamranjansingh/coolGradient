"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  defaultStops,
  defaultMesh,
  defaultRadialPoints,
  defaultFilters,
  MAX_STOPS,
} from "@/lib/constants";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  RadialPoints,
  Filters,
  SelectedPoint,
} from "@/lib/type";
import { randomColor } from "@/lib/utils";

// Import Hooks
import { useWebGLRenderer } from "@/hooks/useWebGLRenderer";
import { useOverlayRenderer } from "@/hooks/useOverlayRenderer";
import { useGradientInteractions } from "@/hooks/useGradientInteractions";

// Import Components
import { Header } from "./Header";
import { Toolbar } from "./Toolbar";
import { CanvasArea } from "./CanvasArea";
import { ControlPanel } from "./ControlPanel";
import { Footer } from "./Footer";
import { Collapsible } from "./ui/Collapsible";

export default function GradientStudio() {
  // --- Core Application State ---
  const [mode, setMode] = useState<GradientMode>("linear");
  const [stops, setStops] = useState<GradientStop[]>(defaultStops);
  const [meshPoints, setMeshPoints] = useState<MeshPoint[]>(defaultMesh);
  const [radialPoints, setRadialPoints] =
    useState<RadialPoints>(defaultRadialPoints);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    null
  );
  const [showControls, setShowControls] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSize, setExportSize] = useState({ width: 1920, height: 1080 });
  const [isClient, setIsClient] = useState(false);
  const previewSizeRef = useRef({ width: 0, height: 0 });

  // --- Memoized State ---
  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  // --- Core Logic Hooks ---
  const webGLState = useMemo(
    () => ({ mode, stops: sortedStops, meshPoints, radialPoints, filters }),
    [mode, sortedStops, meshPoints, radialPoints, filters]
  );

  const { canvasRef, initWebGL, renderGL, glStatus, glRef } =
    useWebGLRenderer(webGLState);

  const overlayState = useMemo(
    () => ({
      mode,
      stops,
      sortedStops,
      meshPoints,
      radialPoints,
      selectedPoint,
    }),
    [mode, stops, sortedStops, meshPoints, radialPoints, selectedPoint]
  );
  const { overlayRef, drawOverlay } = useOverlayRenderer();

  const { interactionHandlers, getCursor } = useGradientInteractions({
    mode,
    stops,
    sortedStops,
    meshPoints,
    radialPoints,
    setStops,
    setMeshPoints,
    setRadialPoints,
    setSelectedPoint,
  });

  // --- Resize Handler ---
  //
  // *** THIS IS THE FIX ***
  //
  // 'resizeCanvases' is now stable. It no longer depends on 'overlayState' or 'drawOverlay'.
  // It only resizes the canvases and calls 'renderGL'.
  // The 'drawOverlay' call is handled by its own separate useEffect below.
  // This breaks the infinite loop.
  //
  const resizeCanvases = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay || isExporting) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));

    previewSizeRef.current = { width: w, height: h };

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (overlay.width !== w || overlay.height !== h) {
      overlay.width = w;
      overlay.height = h;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    }

    // Only call renderGL. The overlay will be drawn by its own effect.
    renderGL();
  }, [canvasRef, overlayRef, isExporting, renderGL]); // Removed drawOverlay and overlayState

  // --- Effects ---
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect 1: Initialize WebGL and set up resizing.
  // This now has a stable dependency array and will run ONLY ONCE.
  useEffect(() => {
    if (!isClient) return;

    const success = initWebGL();
    if (success) {
      resizeCanvases(); // Call it once on init
      window.addEventListener("resize", resizeCanvases);
    }

    return () => window.removeEventListener("resize", resizeCanvases);
  }, [isClient, initWebGL, resizeCanvases]); // All dependencies are stable

  // Effect 2: Redraw the 2D Overlay
  // This runs *only* when the overlay's state changes.
  useEffect(() => {
    if (!isClient || isExporting) return;
    drawOverlay(overlayState);
  }, [overlayState, drawOverlay, isClient, isExporting]);

  // --- (State Updaters / Callbacks are unchanged) ---

  const addStop = useCallback(() => {
    if (stops.length >= MAX_STOPS) return;
    const start = sortedStops[0];
    const end = sortedStops[sortedStops.length - 1];
    const newX = start.x + (end.x - start.x) * 0.5;
    const newY = start.y + (end.y - start.y) * 0.5;

    const newStop = {
      position: 0.5,
      color: randomColor(),
      x: newX,
      y: newY,
      intensity: 1,
    };
    setStops((prev) => [...prev, newStop]);
  }, [stops.length, sortedStops]);

  const addMeshPoint = useCallback(() => {
    if (meshPoints.length >= MAX_STOPS) return;
    setMeshPoints((prev) => [
      ...prev,
      { x: 0.5, y: 0.5, color: randomColor(), radius: 0.25, intensity: 1 },
    ]);
  }, [meshPoints.length]);

  const removeStop = useCallback(
    (index: number) => {
      if (stops.length <= 2) return;
      setStops((prev) => prev.filter((_, i) => i !== index));
      if (
        (selectedPoint?.type === "linear-stop" ||
          selectedPoint?.type === "linear" ||
          selectedPoint?.type === "radial-stop") &&
        selectedPoint.index === index
      )
        setSelectedPoint(null);
    },
    [stops.length, selectedPoint]
  );

  const removeMeshPoint = useCallback(
    (index: number) => {
      if (meshPoints.length <= 2) return;
      setMeshPoints((prev) => prev.filter((_, i) => i !== index));
      if (selectedPoint?.type === "mesh" && selectedPoint.index === index)
        setSelectedPoint(null);
    },
    [meshPoints.length, selectedPoint]
  );

  const resetToDefaults = useCallback(() => {
    if (mode === "mesh") setMeshPoints(defaultMesh);
    else setStops(defaultStops);
    setRadialPoints(defaultRadialPoints);
  }, [mode]);

  const randomizeGradient = useCallback(() => {
    if (mode === "mesh")
      setMeshPoints((prev) =>
        prev.map((p) => ({
          ...p,
          color: randomColor(),
          intensity: 0.5 + Math.random() * 0.5,
        }))
      );
    else
      setStops((prev) =>
        prev.map((s) => ({
          ...s,
          color: randomColor(),
          intensity: 0.5 + Math.random() * 0.5,
        }))
      );
  }, [mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (e.key === "r") randomizeGradient();
      if (e.key === "h") setShowControls((v) => !v);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [randomizeGradient]);

  const exportAsPNG = useCallback(async () => {
    if (!glStatus.ok || !canvasRef.current || !glRef.current) return;

    setIsExporting(true);
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const overlay = overlayRef.current;

    const { width: oldWidth, height: oldHeight } = previewSizeRef.current;

    if (overlay) overlay.style.display = "none";

    canvas.width = exportSize.width;
    canvas.height = exportSize.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    renderGL();

    try {
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Blob is null"));
        }, "image/png");
      });

      if (!blob) throw new Error("Blob creation failed");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gradient-${exportSize.width}x${
        exportSize.height
      }-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }

    canvas.width = oldWidth;
    canvas.height = oldHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (overlay) overlay.style.display = "block";

    renderGL();
    drawOverlay(overlayState);

    setIsExporting(false);
  }, [exportSize, renderGL, drawOverlay, glStatus.ok, glRef, overlayState]);

  const updateSelectedPoint = useCallback(
    (key: string, value: any) => {
      if (!selectedPoint) return;
      if (selectedPoint.type === "mesh")
        setMeshPoints((prev) =>
          prev.map((p, i) =>
            i === selectedPoint.index ? { ...p, [key]: value } : p
          )
        );
      else if (
        selectedPoint.type === "linear" ||
        selectedPoint.type === "linear-stop" ||
        selectedPoint.type === "radial-stop"
      )
        setStops((prev) =>
          prev.map((s, i) =>
            i === selectedPoint.index ? { ...s, [key]: value } : s
          )
        );
      else if (selectedPoint.type === "radial" && (key === "x" || key === "y"))
        setRadialPoints((prev) => ({
          ...prev,
          [selectedPoint.point]: { ...prev[selectedPoint.point], [key]: value },
        }));
    },
    [selectedPoint]
  );

  // --- Render ---

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header />
        <div className="p-4 text-zinc-400">Loading Studio...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Toolbar
            mode={mode}
            setMode={setMode}
            onRandomize={randomizeGradient}
            onToggleUI={() => setShowControls((v) => !v)}
            showUI={showControls}
          />
          <CanvasArea
            canvasRef={canvasRef}
            overlayRef={overlayRef}
            interactionHandlers={interactionHandlers}
            getCursor={getCursor}
            isExporting={isExporting}
            glStatus={glStatus}
          />
        </div>

        {showControls && (
          <ControlPanel
            mode={mode}
            stops={stops}
            meshPoints={meshPoints}
            radialPoints={radialPoints}
            filters={filters}
            selectedPoint={selectedPoint}
            isExporting={isExporting}
            exportSize={exportSize}
            glOK={glStatus.ok}
            setStops={setStops}
            setMeshPoints={setMeshPoints}
            setFilters={setFilters}
            setSelectedPoint={setSelectedPoint}
            setExportSize={setExportSize}
            addStop={addStop}
            addMeshPoint={addMeshPoint}
            removeStop={removeStop}
            removeMeshPoint={removeMeshPoint}
            onReset={resetToDefaults}
            exportAsPNG={exportAsPNG}
            updateSelectedPoint={updateSelectedPoint}
          />
        )}
      </div>
      <Footer glStatus={glStatus} />
    </div>
  );
}
