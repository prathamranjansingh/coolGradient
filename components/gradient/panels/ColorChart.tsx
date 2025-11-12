"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  TooltipProps,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { ColorStop } from "@/types/gradient";
import { ColorSample } from "@/hooks/useGradientSampler";
import { hexToRgb, rgbToCssString } from "@/lib/color";

interface ColorChartProps {
  data: ColorSample[];
  stops: ColorStop[];
  onHover: (position: number) => void;
  onLeave: () => void;
}

const chartConfig = {
  r: {
    label: "Red",
    color: "var(--chart-1)",
  },
  g: {
    label: "Green",
    color: "var(--chart-2)",
  },
  b: {
    label: "Blue",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

// This is the custom tooltip component
const CustomGradientTooltip: FC<
  TooltipProps<number, string> & {
    // ✅ We just need to know which hex is "copied"
    copiedHex: string | null;
  }
> = ({ active, payload, copiedHex }) => {
  if (active && payload && payload.length) {
    const data: ColorSample = payload[0].payload;
    const rgb = rgbToCssString(data.r, data.g, data.b);
    const isCopied = copiedHex === data.hex;

    return (
      // ✅ Glassmorphism tooltip
      <div className="p-3 bg-background/50 backdrop-blur-lg border border-border rounded-lg shadow-xl w-[200px] text-sm">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: data.hex }}
          />
          <div className="flex-1">
            <p className="font-bold">{data.hex}</p>
            <p className="text-xs text-muted-foreground">{`Position: ${data.pos.toFixed(
              0
            )}%`}</p>
          </div>
        </div>

        <div className="space-y-1">
          {/* Red */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--color-r)" }}
              />
              <span
                className="font-semibold"
                style={{ color: "var(--color-r)" }}
              >
                Red
              </span>
            </div>
            <span className="font-mono">{data.r}</span>
          </div>
          {/* Green */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--color-g)" }}
              />
              <span
                className="font-semibold"
                style={{ color: "var(--color-g)" }}
              >
                Green
              </span>
            </div>
            <span className="font-mono">{data.g}</span>
          </div>
          {/* Blue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--color-b)" }}
              />
              <span
                className="font-semibold"
                style={{ color: "var(--color-b)" }}
              >
                Blue
              </span>
            </div>
            <span className="font-mono">{data.b}</span>
          </div>
        </div>

        {/* ✅ Updated helper text */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t mt-2">
          {isCopied ? "Copied!" : "Press Ctrl+C to copy HEX"}
        </p>
      </div>
    );
  }
  return null;
};

// This is the main Chart component
export const ColorChart: FC<ColorChartProps> = ({
  data,
  stops,
  onHover,
  onLeave,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  // ✅ Ref to store the currently hovered color data
  const hoveredSampleRef = useRef<ColorSample | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+C or Cmd+C
      if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        // Check if the mouse is currently over the chart
        if (hoveredSampleRef.current) {
          e.preventDefault(); // Stop the browser from its default copy
          const hex = hoveredSampleRef.current.hex;
          navigator.clipboard.writeText(hex);
          setCopiedHex(hex);
          setTimeout(() => setCopiedHex(null), 2000);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array, runs only once

  const handleMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length) {
      const sample: ColorSample = e.activePayload[0].payload;
      onHover(sample.pos);
      // ✅ Update the ref with the current color data
      hoveredSampleRef.current = sample;
    }
  };

  const handleMouseLeave = () => {
    onLeave();
    // ✅ Clear the ref when the mouse leaves
    hoveredSampleRef.current = null;
  };

  return (
    <div className="w-full h-[150px] bg-muted/50 rounded-lg p-2 border">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[100%] w-full"
      >
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave} // ✅ Use our new leave handler
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="pos"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            allowDuplicatedCategory={false}
          />
          <YAxis
            type="number"
            domain={[0, 255]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />

          <ChartTooltip
            cursor={true}
            // ✅ Pass the copiedHex state to the tooltip
            content={(<CustomGradientTooltip copiedHex={copiedHex} />) as any}
          />

          <Line
            dataKey="r"
            type="monotone"
            stroke="var(--color-r)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="g"
            type="monotone"
            stroke="var(--color-g)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="b"
            type="monotone"
            stroke="var(--color-b)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
