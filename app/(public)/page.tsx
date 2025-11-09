"use client";

import { NextPage } from "next";
import Head from "next/head";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  ChangeEvent,
  FC,
  useRef,
  MouseEvent as ReactMouseEvent,
} from "react";

// --- SHADCN/UI IMPORTS ---
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// --- LUCIDE-REACT IMPORTS ---
import { RotateCcw, Trash2, Plus, Shuffle, ChevronDown } from "lucide-react";

// --- TYPES ---

interface ColorStop {
  id: string;
  color: string; // #RRGGBB
  alpha: number; // 0-1
  position: number; // 0-100
}

interface GradientState {
  stops: ColorStop[];
  activeStopId: string | null;
  angle: number;
  type: "linear" | "radial";
  repeating: boolean;
  filters: {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
    hueRotate: number;
  };
  vignette: {
    strength: number;
    size: number;
  };
  noise: {
    opacity: number;
    blendMode: "overlay" | "soft-light" | "multiply" | "screen" | "normal";
  };
}

// --- INITIAL STATE ---

const getInitialState = (): GradientState => {
  const firstStopId = crypto.randomUUID();
  return {
    stops: [
      { id: firstStopId, color: "#FF8A00", alpha: 1, position: 0 },
      { id: crypto.randomUUID(), color: "#E52E71", alpha: 1, position: 100 },
    ],
    activeStopId: firstStopId,
    angle: 90,
    type: "linear",
    repeating: false,
    filters: {
      blur: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
    },
    vignette: {
      strength: 0,
      size: 70,
    },
    noise: {
      opacity: 0.1, // 10%
      blendMode: "overlay",
    },
  };
};

// --- COLOR UTILITIES ---

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const getRandomComplementaryColors = (): [string, string] => {
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30);
  const lightness = 50 + Math.floor(Math.random() * 20);
  const complementaryHue = (baseHue + 180) % 360;
  const color1 = hslToHex(baseHue, saturation, lightness);
  const color2 = hslToHex(complementaryHue, saturation, lightness);
  return [color1, color2];
};

// --- UTILITY HOOKS & FUNCTIONS ---

const hexToRgba = (hex: string, alpha: number): string => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    hex = "#000000";
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const useNoisePattern = (): string => {
  const [pattern, setPattern] = useState("");
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 256,
      h = 256;
    canvas.width = w;
    canvas.height = h;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    setPattern(canvas.toDataURL());
  }, []);
  return pattern;
};

// --- CSS GENERATION HOOK ---

const useGeneratedCss = (
  settings: GradientState,
  noisePatternDataUrl: string
) => {
  const sortedStops = useMemo(
    () => [...settings.stops].sort((a, b) => a.position - b.position),
    [settings.stops]
  );

  const stopsCssString = useMemo(
    () =>
      sortedStops
        .map((s) => `${hexToRgba(s.color, s.alpha)} ${s.position}%`)
        .join(", "),
    [sortedStops]
  );

  const gradientCss = useMemo(() => {
    const gradientType = settings.repeating
      ? settings.type === "linear"
        ? "repeating-linear-gradient"
        : "repeating-radial-gradient"
      : settings.type === "linear"
      ? "linear-gradient"
      : "radial-gradient";
    const direction =
      settings.type === "linear" ? `${settings.angle}deg` : "circle";
    return `${gradientType}(${direction}, ${stopsCssString})`;
  }, [settings.type, settings.repeating, settings.angle, stopsCssString]);

  const railGradientCss = useMemo(() => {
    return `linear-gradient(to right, ${stopsCssString})`;
  }, [stopsCssString]);

  const filterCss = useMemo(() => {
    const { blur, brightness, contrast, saturation, hueRotate } =
      settings.filters;
    return [
      blur > 0 && `blur(${blur}px)`,
      brightness !== 100 && `brightness(${brightness}%)`,
      contrast !== 100 && `contrast(${contrast}%)`,
      saturation !== 100 && `saturate(${saturation}%)`,
      hueRotate > 0 && `hue-rotate(${hueRotate}deg)`,
    ]
      .filter(Boolean)
      .join(" ");
  }, [settings.filters]);

  const vignetteCss = useMemo(() => {
    if (settings.vignette.strength === 0) return null;
    const strength = settings.vignette.strength / 100;
    const size = settings.vignette.size;
    return `radial-gradient(ellipse at center, transparent ${size}%, rgba(0,0,0, ${strength}) 100%)`;
  }, [settings.vignette]);

  const basePseudoStyles = ['content: "";', "position: absolute;", "inset: 0;"];

  const cssForBefore = useMemo(() => {
    const layers = [vignetteCss, gradientCss].filter(Boolean);
    const styles = [
      ...basePseudoStyles,
      "z-index: 1;",
      `background-image: ${layers.join(", \n                    ")};`,
      `background-size: cover;`,
      filterCss ? `filter: ${filterCss};` : "",
    ].filter(Boolean);

    return `.your-element::before {\n  ${styles.join("\n  ")}\n}`;
  }, [gradientCss, vignetteCss, filterCss]);

  const cssForAfter = useMemo(() => {
    if (settings.noise.opacity === 0 || !noisePatternDataUrl) {
      return ".your-element::after { display: none; }";
    }

    const styles = [
      ...basePseudoStyles,
      "z-index: 2;",
      `background-image: url(${noisePatternDataUrl});`,
      "background-size: 256px 256px;",
      `opacity: ${settings.noise.opacity};`,
      `mix-blend-mode: ${settings.noise.blendMode};`,
      "pointer-events: none;",
    ];

    return `.your-element::after {\n  ${styles.join("\n  ")}\n}`;
  }, [settings.noise.opacity, settings.noise.blendMode, noisePatternDataUrl]);

  const cssExportString = `
/* Usage: 
  1. Add 'position: relative;' and 'z-index: 0;' to your hero container.
  2. Add 'position: relative;' and 'z-index: 10;' to your content.
  3. Apply these styles.
*/
${cssForBefore}

${cssForAfter}
  `.trim();

  return {
    cssExportString,
    cssForBefore,
    cssForAfter,
    railGradientCss,
    sortedStops,
  };
};

// --- MAIN PAGE COMPONENT ---

const GradientGeneratorPage: NextPage = () => {
  const [settings, setSettings] = useState<GradientState>(getInitialState());
  const [copied, setCopied] = useState(false);

  const activeStop = useMemo(
    () => settings.stops.find((s) => s.id === settings.activeStopId) || null,
    [settings.stops, settings.activeStopId]
  );

  const noisePatternDataUrl = useNoisePattern();

  const {
    cssExportString,
    cssForBefore,
    cssForAfter,
    railGradientCss,
    sortedStops,
  } = useGeneratedCss(settings, noisePatternDataUrl);

  // --- EVENT HANDLERS ---

  const handleSliderChange = (group: keyof GradientState, name: string) => {
    return (value: number[]) => {
      setSettings((s) => ({
        ...s,
        [group]: {
          ...(s[group] as object),
          [name]: value[0],
        },
      }));
    };
  };

  const handleAngleChange = (value: number[]) => {
    setSettings((s) => ({
      ...s,
      angle: value[0],
    }));
  };

  const handleSelectChange = (group: keyof GradientState, name: string) => {
    return (value: string) => {
      setSettings((s) => ({
        ...s,
        [group]: {
          ...(s[group] as object),
          [name]: value,
        },
      }));
    };
  };

  const handleStopChange = useCallback(
    (id: string, key: keyof ColorStop, value: any) => {
      setSettings((s) => ({
        ...s,
        stops: s.stops.map((stop) =>
          stop.id === id ? { ...stop, [key]: value } : stop
        ),
      }));
    },
    []
  );

  const addStop = useCallback(
    (position?: number) => {
      if (settings.stops.length >= 12) return;

      let insertPos = position;

      if (insertPos === undefined) {
        const sorted = [...settings.stops].sort(
          (a, b) => a.position - b.position
        );
        let maxGap = 0;
        let pos = 50;
        let prevPos = 0;

        for (const stop of sorted) {
          const gap = stop.position - prevPos;
          if (gap > maxGap) {
            maxGap = gap;
            pos = prevPos + gap / 2;
          }
          prevPos = stop.position;
        }
        const lastGap = 100 - prevPos;
        if (lastGap > maxGap) {
          pos = prevPos + lastGap / 2;
        }
        insertPos = pos;
      }

      const randomColor =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
      const newStop: ColorStop = {
        id: crypto.randomUUID(),
        color: randomColor,
        alpha: 1,
        position: Math.round(insertPos),
      };

      setSettings((s) => ({
        ...s,
        stops: [...s.stops, newStop],
        activeStopId: newStop.id,
      }));
    },
    [settings.stops]
  );

  const removeStop = useCallback(
    (id: string) => {
      if (settings.stops.length <= 2) return;

      setSettings((s) => {
        const newStops = s.stops.filter((stop) => stop.id !== id);
        let newActiveId = s.activeStopId;

        if (s.activeStopId === id) {
          newActiveId = newStops[0]?.id || null;
        }

        return {
          ...s,
          stops: newStops,
          activeStopId: newActiveId,
        };
      });
    },
    [settings.stops.length]
  );

  const updateStopPosition = useCallback((id: string, position: number) => {
    setSettings((s) => ({
      ...s,
      stops: s.stops.map((stop) =>
        stop.id === id
          ? { ...stop, position: Math.max(0, Math.min(100, position)) }
          : stop
      ),
    }));
  }, []);

  const selectStop = useCallback((id: string) => {
    setSettings((s) => ({ ...s, activeStopId: id }));
  }, []);

  const handleCopyCss = useCallback(() => {
    navigator.clipboard.writeText(cssExportString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cssExportString]);

  const resetFilters = useCallback(() => {
    setSettings((s) => ({
      ...s,
      filters: getInitialState().filters,
      vignette: getInitialState().vignette,
    }));
  }, []);

  const handleRandomize = useCallback(() => {
    const [color1, color2] = getRandomComplementaryColors();
    const newStops: ColorStop[] = [
      { id: crypto.randomUUID(), color: color1, alpha: 1, position: 0 },
      { id: crypto.randomUUID(), color: color2, alpha: 1, position: 100 },
    ];
    setSettings((s) => ({
      ...s,
      stops: newStops,
      activeStopId: newStops[0].id,
      angle: Math.floor(Math.random() * 360),
      type: Math.random() > 0.5 ? "linear" : "radial",
    }));
  }, []);

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

      <main className="flex h-screen bg-background text-foreground">
        {/* --- Main Preview Pane (now on the left) --- */}
        <div className="flex-1 h-full relative p-10 checkerboard overflow-auto">
          <WebsitePreview
            cssForBefore={cssForBefore}
            cssForAfter={cssForAfter}
          />
        </div>

        {/* --- Controls Sidebar (now on the right) --- */}
        <aside className="w-96 h-full flex-shrink-0 border-l border-border bg-background z-10">
          <div className="flex flex-row items-center justify-between p-4 border-b border-border h-[69px]">
            <h1 className="text-xl font-semibold">Inspector</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRandomize}
              title="Randomize Gradient"
            >
              <Shuffle className="w-5 h-5" />
            </Button>
          </div>

          <div className="h-[calc(100vh-69px)] overflow-y-auto">
            {/* --- Collapsible Sections --- */}

            <CollapsibleSection title="Gradient" defaultOpen>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="type"
                        value="linear"
                        checked={settings.type === "linear"}
                        onChange={() =>
                          setSettings((s) => ({ ...s, type: "linear" }))
                        }
                        className="sr-only peer"
                      />
                      <span className="block w-full text-center px-4 py-2 rounded-md bg-muted text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground cursor-pointer text-sm font-medium">
                        Linear
                      </span>
                    </label>
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="type"
                        value="radial"
                        checked={settings.type === "radial"}
                        onChange={() =>
                          setSettings((s) => ({ ...s, type: "radial" }))
                        }
                        className="sr-only peer"
                      />
                      <span className="block w-full text-center px-4 py-2 rounded-md bg-muted text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground cursor-pointer text-sm font-medium">
                        Radial
                      </span>
                    </label>
                  </div>
                </div>

                {settings.type === "linear" && (
                  <SliderInput
                    label="Angle"
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    value={settings.angle}
                    onValueChange={handleAngleChange}
                  />
                )}

                <div className="space-y-2">
                  <Label>Color Stops</Label>
                  <GradientRail
                    stops={sortedStops}
                    gradientCss={railGradientCss}
                    activeStopId={settings.activeStopId}
                    onAddStop={addStop}
                    onSelectStop={selectStop}
                    onUpdateStopPosition={updateStopPosition}
                  />
                </div>

                <ColorStopEditor
                  stop={activeStop}
                  onChange={handleStopChange}
                  onRemove={removeStop}
                  canRemove={settings.stops.length > 2}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Filters">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetFilters}
                    title="Reset Filters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <SliderInput
                  label="Blur"
                  min={0}
                  max={20}
                  step={0.1}
                  unit="px"
                  value={settings.filters.blur}
                  onValueChange={handleSliderChange("filters", "blur")}
                />
                <SliderInput
                  label="Brightness"
                  min={0}
                  max={200}
                  step={1}
                  unit="%"
                  value={settings.filters.brightness}
                  onValueChange={handleSliderChange("filters", "brightness")}
                />
                <SliderInput
                  label="Contrast"
                  min={0}
                  max={200}
                  step={1}
                  unit="%"
                  value={settings.filters.contrast}
                  onValueChange={handleSliderChange("filters", "contrast")}
                />
                <SliderInput
                  label="Saturation"
                  min={0}
                  max={200}
                  step={1}
                  unit="%"
                  value={settings.filters.saturation}
                  onValueChange={handleSliderChange("filters", "saturation")}
                />
                <SliderInput
                  label="Hue"
                  min={0}
                  max={360}
                  step={1}
                  unit="°"
                  value={settings.filters.hueRotate}
                  onValueChange={handleSliderChange("filters", "hueRotate")}
                />

                <h3 className="text-lg font-semibold border-t border-border pt-6">
                  Vignette
                </h3>
                <SliderInput
                  label="Strength"
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  value={settings.vignette.strength}
                  onValueChange={handleSliderChange("vignette", "strength")}
                />
                <SliderInput
                  label="Size"
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  value={settings.vignette.size}
                  onValueChange={handleSliderChange("vignette", "size")}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Noise">
              <div className="space-y-6">
                <SliderInput
                  label="Opacity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.noise.opacity}
                  onValueChange={handleSliderChange("noise", "opacity")}
                />
                <div className="space-y-2">
                  <Label htmlFor="noiseBlendMode">Blend Mode</Label>
                  <Select
                    value={settings.noise.blendMode}
                    onValueChange={handleSelectChange("noise", "blendMode")}
                  >
                    <SelectTrigger id="noiseBlendMode">
                      <SelectValue placeholder="Select blend mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overlay">Overlay</SelectItem>
                      <SelectItem value="soft-light">Soft Light</SelectItem>
                      <SelectItem value="multiply">Multiply</SelectItem>
                      <SelectItem value="screen">Screen</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>

            {/* Export Area (always visible) */}
            <div className="p-6 border-t border-border space-y-4">
              <h3 className="text-lg font-semibold">Export CSS</h3>
              <textarea
                className="w-full h-48 p-2 font-mono text-sm bg-muted text-muted-foreground border border-input rounded-md resize-none"
                readOnly
                value={cssExportString}
                aria-label="Generated CSS"
              />
              <Button className="w-full" onClick={handleCopyCss}>
                {copied ? "Copied!" : "Copy CSS"}
              </Button>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
};

// --- REUSABLE SUB-COMPONENTS ---

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => (
  <Collapsible defaultOpen={defaultOpen} className="border-b border-border">
    <CollapsibleTrigger className="flex justify-between items-center p-4 w-full data-[state=open]:pb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent className="p-6 pt-2">{children}</CollapsibleContent>
  </Collapsible>
);

interface SliderInputProps {
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  value: number;
  onValueChange: (value: number[]) => void;
}

const SliderInput: FC<SliderInputProps> = ({
  label,
  min,
  max,
  step,
  value,
  onValueChange,
  unit = "",
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label htmlFor={`${label}-slider`}>{label}</Label>
      <span className="text-sm font-mono text-muted-foreground">
        {value}
        {unit}
      </span>
    </div>
    <Slider
      id={`${label}-slider`}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={onValueChange}
      aria-label={label}
    />
  </div>
);

interface GradientRailProps {
  stops: ColorStop[];
  gradientCss: string;
  activeStopId: string | null;
  onAddStop: (position: number) => void;
  onSelectStop: (id: string) => void;
  onUpdateStopPosition: (id: string, position: number) => void;
}

const GradientRail: FC<GradientRailProps> = ({
  stops,
  gradientCss,
  activeStopId,
  onAddStop,
  onSelectStop,
  onUpdateStopPosition,
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);

  // *** BUG FIX: Memoize event handlers ***

  const handleDragging = useCallback(
    (e: MouseEvent) => {
      if (!railRef.current || !draggingStopId.current) return;
      const rect = railRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      onUpdateStopPosition(draggingStopId.current, position);
    },
    [onUpdateStopPosition]
  );

  const handleDragEnd = useCallback(() => {
    draggingStopId.current = null;
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", handleDragEnd);
  }, [handleDragging]);

  const handleDragStart = (
    e: ReactMouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    draggingStopId.current = id;
    onSelectStop(id);
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleRailClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!railRef.current) return;
    if ((e.target as HTMLElement).dataset.stopHandle) return;

    const rect = railRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    onAddStop(Math.max(0, Math.min(100, position)));
  };

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleDragging);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDragging, handleDragEnd]);

  return (
    <div
      ref={railRef}
      className="w-full h-6 rounded-md border border-border relative cursor-crosshair"
      style={{ background: gradientCss }}
      onClick={handleRailClick}
    >
      {stops.map((stop) => (
        <button
          key={stop.id}
          data-stop-handle="true"
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 rounded-full border-2 border-primary-foreground 
            shadow-md cursor-pointer bg-clip-padding
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background
            ${
              activeStopId === stop.id
                ? "ring-2 ring-ring"
                : "ring-1 ring-muted-foreground"
            }
          `}
          style={{
            left: `${stop.position}%`,
            background: stop.color,
            opacity: stop.alpha,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectStop(stop.id);
          }}
          onMouseDown={(e) => handleDragStart(e, stop.id)}
          aria-label={`Color stop at ${stop.position.toFixed(0)}%`}
        />
      ))}
    </div>
  );
};

interface ColorStopEditorProps {
  stop: ColorStop | null;
  onChange: (id: string, key: keyof ColorStop, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const ColorStopEditor: FC<ColorStopEditorProps> = ({
  stop,
  onChange,
  onRemove,
  canRemove,
}) => {
  if (!stop) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
        Select a stop to edit.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
      <label
        htmlFor="stopColor"
        className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
        style={{ backgroundColor: stop.color, opacity: stop.alpha }}
      >
        <input
          id="stopColor"
          type="color"
          value={stop.color}
          onChange={(e) => onChange(stop.id, "color", e.target.value)}
          className="sr-only"
        />
      </label>

      <div className="flex flex-col gap-3">
        <Input
          type="text"
          value={stop.color}
          onChange={(e) => onChange(stop.id, "color", e.target.value)}
          className="font-mono text-sm"
          aria-label="Color Hex"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">@</span>
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(stop.position)}
            onChange={(e) =>
              onChange(stop.id, "position", parseFloat(e.target.value))
            }
            className="font-mono text-sm"
            aria-label="Position"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <div className="col-span-2">
        <SliderInput
          label="Alpha"
          min={0}
          max={1}
          step={0.01}
          value={stop.alpha}
          onValueChange={(val) => onChange(stop.id, "alpha", val[0])}
        />
      </div>

      <div className="col-span-2 mt-2">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onRemove(stop.id)}
          disabled={!canRemove}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Stop
        </Button>
      </div>
    </div>
  );
};

/**
 * Website Preview Component
 */
const WebsitePreview: FC<{ cssForBefore: string; cssForAfter: string }> = ({
  cssForBefore,
  cssForAfter,
}) => {
  const beforeStyles = cssForBefore.replace(
    ".your-element",
    "#preview-hero-bg"
  );
  const afterStyles = cssForAfter.replace(".your-element", "#preview-hero-bg");

  return (
    <>
      {/* Inject the dynamic styles. */}
      <style>{beforeStyles}</style>
      <style>{afterStyles}</style>

      <Card className="w-full h-full overflow-hidden">
        <CardContent className="p-0 w-full h-full">
          <div
            id="preview-hero-bg" // This ID is targeted by the <style>
            className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden"
            style={{ position: "relative", zIndex: 0 }}
          >
            {/* ::before (z-index: 1) has gradient + filters */}
            {/* ::after (z-index: 2) has noise + opacity */}

            <div
              className="w-full max-w-2xl text-center text-white"
              style={{ position: "relative", zIndex: 10 }}
            >
              <h1
                className="text-5xl font-bold"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                Your Website Hero
              </h1>
              <p
                className="mt-4 text-xl opacity-90"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
              >
                This background is blurred, but the text is not.
              </p>
              <Button className="mt-8" size="lg">
                Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GradientGeneratorPage;
