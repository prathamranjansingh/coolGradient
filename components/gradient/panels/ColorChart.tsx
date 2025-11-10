// src/components/gradient/panels/ColorChart.tsx
"use client";

import React, { FC } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { ColorStop } from "@/types/gradient";
import { ColorSample } from "@/hooks/useGradientSampler";
import { hexToRgb, rgbToCssString } from "@/lib/color";

interface ColorChartProps {
  data: ColorSample[];
  stops: ColorStop[];
  // ✅ New props for hover
  onHover: (position: number) => void;
  onLeave: () => void;
}

// Custom Tooltip (same as before)
const CustomTooltip: FC<TooltipProps<number, string>> = (props) => {
  const { active, payload } = props as any;
  if (active && payload && payload.length) {
    const data: ColorSample = payload[0].payload;
    const rgb = rgbToCssString(data.r, data.g, data.b);

    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: data.hex }}
          />
          <p className="text-sm font-bold">{data.hex}</p>
        </div>
        <p className="text-sm text-muted-foreground">{`Position: ${data.pos.toFixed(
          0
        )}%`}</p>
        <p className="text-sm font-mono text-muted-foreground">{rgb}</p>
        <div className="mt-2 border-t pt-2 space-y-1">
          <p className="text-xs" style={{ color: "rgb(255, 0, 0)" }}>
            {`Red: ${data.r}`}
          </p>
          <p className="text-xs" style={{ color: "rgb(0, 255, 0)" }}>
            {`Green: ${data.g}`}
          </p>
          <p className="text-xs" style={{ color: "rgb(0, 0, 255)" }}>
            {`Blue: ${data.b}`}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const ColorChart: FC<ColorChartProps> = ({
  data,
  stops,
  onHover,
  onLeave,
}) => {
  // ✅ Handle mouse move to find position
  const handleMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length) {
      const pos = e.activePayload[0].payload.pos;
      onHover(pos);
    }
  };

  return (
    <div className="w-full h-[150px] bg-muted/50 rounded-lg p-2 border">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          onMouseMove={handleMouseMove} // ✅ Call handler
          onMouseLeave={onLeave} // ✅ Call handler
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              {stops.map((stop) => {
                const rgb = hexToRgb(stop.color);
                const color = rgb
                  ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                  : "#000000";
                return (
                  <stop
                    key={stop.id}
                    offset={`${stop.position}%`}
                    stopColor={color}
                    stopOpacity={stop.alpha}
                  />
                );
              })}
            </linearGradient>
          </defs>

          <XAxis
            dataKey="pos"
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            domain={[0, 255]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* ✅ Gradient area is now semi-transparent */}
          <Area
            type="monotone"
            dataKey="r" // Use any key, it's just for the shape
            stroke="transparent"
            fill="url(#colorGradient)"
            fillOpacity={0.4} // ✅ Make it see-through
            isAnimationActive={false}
          />

          {/* Lines on top */}
          <Line
            type="monotone"
            dataKey="r"
            stroke="rgb(255, 0, 0)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="g"
            stroke="rgb(0, 255, 0)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="b"
            stroke="rgb(0, 0, 255)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
