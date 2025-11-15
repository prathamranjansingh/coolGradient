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

import { useWebGLRenderer } from "@/hooks/useWebGLRenderer";
import { useOverlayRenderer } from "@/hooks/useOverlayRenderer";
import { useGradientInteractions } from "@/hooks/useGradientInteractions";

import { Header } from "../layout/Header";
import { Toolbar } from "./Toolbar";
import { CanvasArea } from "./CanvasArea";
import { ControlPanel } from "./ControlPanel";
import { Footer } from "./Footer";

export default function GradientStudio() {
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

  // State for Header
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- Memoized State ---
  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  // --- Core Logic Hooks ---
  const { canvasRef, initWebGL, renderGL, glStatus, glRef, cleanup } =
    useWebGLRenderer(
      useMemo(
        () => ({ mode, stops: sortedStops, meshPoints, radialPoints, filters }),
        [mode, sortedStops, meshPoints, radialPoints, filters]
      )
    );

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
  const resizeCanvases = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay || isExporting) return;

    const container = canvas.parentElement?.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

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

    try {
      renderGL();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("renderGL failed during resizeCanvases:", err);
    }
  }, [canvasRef, overlayRef, isExporting, renderGL]);

  // --- Effects ---
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect for mobile detection
  useEffect(() => {
    if (!isClient) return;
    // 1024px is the default 'lg' breakpoint in Tailwind
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isClient]);

  // Initialize WebGL once and set up resize listener
  useEffect(() => {
    if (!isClient) return;

    let mounted = true;
    let rafId: number | null = null;
    let initialized = false;

    const tryInit = () => {
      if (!mounted) return;

      const canvas = canvasRef.current;
      const overlay = overlayRef.current;

      if (!canvas || !overlay) {
        rafId = requestAnimationFrame(tryInit);
        return;
      }

      try {
        const success = initWebGL();
        if (success) {
          initialized = true;
          resizeCanvases(); // Resize once after successful init
          window.addEventListener("resize", resizeCanvases);
        } else {
          // eslint-disable-next-line no-console
          console.error(
            "initWebGL returned false: WebGL initialization failed."
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("initWebGL threw an error:", err);
      }
    };

    tryInit();

    return () => {
      mounted = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (initialized) {
        window.removeEventListener("resize", resizeCanvases);
      } else {
        window.removeEventListener("resize", resizeCanvases);
      }
      try {
        cleanup();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("cleanup threw:", err);
      }
    };
  }, [isClient, initWebGL, resizeCanvases, cleanup, canvasRef, overlayRef]);

  // Redraw overlay when overlay state changes
  useEffect(() => {
    if (!isClient || isExporting) return;
    try {
      drawOverlay(overlayState);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("drawOverlay failed:", err);
    }
  }, [overlayState, drawOverlay, isClient, isExporting]);

  // Trigger WebGL render when state changes
  useEffect(() => {
    if (!isClient || isExporting) return;
    try {
      renderGL();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("renderGL failed on state change:", err);
    }
  }, [
    mode,
    sortedStops,
    meshPoints,
    radialPoints,
    filters,
    renderGL,
    isClient,
    isExporting,
  ]);

  // --- State Updaters / Callbacks ---

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
    if (!glStatus.ok || !canvasRef.current || !glRef.current) {
      // eslint-disable-next-line no-console
      console.warn("Export aborted: GL not ready or canvas missing.");
      return;
    }

    setIsExporting(true);
    const canvas = canvasRef.current!;
    const gl = glRef.current!;
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
      // eslint-disable-next-line no-console
      console.error("Export failed:", err);
    }

    // restore
    canvas.width = oldWidth;
    canvas.height = oldHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (overlay) overlay.style.display = "block";

    try {
      renderGL();
      drawOverlay(overlayState);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("render/draw after export failed:", err);
    }

    setIsExporting(false);
  }, [
    exportSize,
    renderGL,
    drawOverlay,
    glStatus.ok,
    glRef,
    overlayState,
    canvasRef,
    overlayRef,
  ]);

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

  if (!isClient) {
    return (
      <div className="w-full mx-auto min-h-screen flex flex-col">
        <Header
          isPreviewMode={false}
          onTogglePreview={() => {}}
          isMobile={false}
          onToggleMobileDrawer={() => {}}
        />
        <div className="p-4 text-zinc-400">Loading Studio...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">
      <Header
        isPreviewMode={isPreviewMode}
        onTogglePreview={() => setIsPreviewMode((v) => !v)}
        isMobile={isMobile}
        onToggleMobileDrawer={() => {}}
      />

      <div className="flex flex-col lg:flex-row flex-1 lg:min-h-0">
        {/* Canvas Area */}
        <div className="flex items-center justify-center lg:border-r border-[#222222] lg:w-1/2 min-h-[50vh] lg:h-full">
          <CanvasArea
            canvasRef={canvasRef}
            overlayRef={overlayRef}
            interactionHandlers={interactionHandlers}
            getCursor={getCursor}
            isExporting={isExporting}
            glStatus={glStatus}
          />
        </div>

        {/* Controls Area */}
        <div className="lg:w-1/2 flex flex-col lg:h-full">
          {/* Fixed Toolbar on Desktop */}
          <div className="flex-shrink-0 p-6 pb-4 lg:border-b border-[#222222]">
            <Toolbar
              mode={mode}
              setMode={setMode}
              onRandomize={randomizeGradient}
              onToggleUI={() => setShowControls((v) => !v)}
              showUI={showControls}
            />
          </div>

          {/* Scrollable Control Panel */}
          {showControls && (
            <div className="lg:flex-1 lg:overflow-y-auto pb-6 lg:pb-0">
              <div className="p-6 pt-4">
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
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer glStatus={glStatus} />
    </div>
  );
}
