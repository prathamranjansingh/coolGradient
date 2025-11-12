// src/components/gradient/GradientInspectorContent.tsx
import React, { FC, Dispatch, useCallback } from "react";
import {
  GradientState,
  GradientActions,
  ActionType,
  ColorStop,
} from "@/types/gradient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shuffle } from "lucide-react";
import { GradientPanel } from "./panels/GradientPanel";
import { EffectsPanel } from "./panels/EffectsPanel";
import { ExportPanel } from "./panels/ExportPanel";

interface GradientInspectorContentProps {
  state: GradientState;
  dispatch: Dispatch<GradientActions>;
  sortedStops: ColorStop[];
  railGradientCss: string;
  cssExportString: string;
  onGraphHover: (position: number) => void;
  onGraphLeave: () => void;
  isPreviewMode: boolean;
}

export const GradientInspectorContent: FC<GradientInspectorContentProps> = ({
  state,
  dispatch,
  sortedStops,
  railGradientCss,
  cssExportString,
  onGraphHover,
  onGraphLeave,
  isPreviewMode,
}) => {
  const handleRandomize = useCallback(
    () => dispatch({ type: ActionType.RANDOMIZE, payload: { newState: {} } }),
    [dispatch]
  );

  return (
    // ✅ Main background is now transparent
    <div
      className={`w-full lg:w-[450px] h-full flex flex-col rounded-lg overflow-hidden bg-transparent`}
    >
      {/* Header */}
      <div
        className={`flex flex-row items-center justify-between p-4 h-[69px] flex-shrink-0 ${
          isPreviewMode ? "border-b border-white/10" : "border-b border-border"
        }`}
      >
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

      <Tabs
        defaultValue="gradient"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList
          className={`m-4 ${
            isPreviewMode ? "bg-white/20" : "bg-muted" // ✅ Glassmorphic tab list
          }`}
        >
          <TabsTrigger value="gradient" className="flex-1">
            Gradient
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex-1">
            Effects
          </TabsTrigger>
          <TabsTrigger value="export" className="flex-1">
            Export
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* ✅ Tab content is transparent */}
          <TabsContent value="gradient" className="p-6 pt-2 bg-transparent">
            <GradientPanel
              state={state}
              dispatch={dispatch}
              sortedStops={sortedStops}
              railGradientCss={railGradientCss}
              onGraphHover={onGraphHover}
              onGraphLeave={onGraphLeave}
            />
          </TabsContent>
          <TabsContent value="effects" className="p-6 pt-2 bg-transparent">
            <EffectsPanel state={state} dispatch={dispatch} />
          </TabsContent>
          <TabsContent value="export" className="p-6 pt-2 bg-transparent">
            <ExportPanel cssExportString={cssExportString} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
