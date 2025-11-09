// src/components/gradient/GradientInspector.tsx

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

interface GradientInspectorProps {
  state: GradientState;
  dispatch: Dispatch<GradientActions>;
  sortedStops: ColorStop[];
  railGradientCss: string;
  cssExportString: string;
  // isOpen prop removed, as this component now assumes it's 'open' (on desktop)
  // or part of a drawer (on mobile).
}

// ✅ Renamed to GradientInspectorContent to be clear it's the inner part
// of the inspector, used by both sidebar and drawer.
export const GradientInspectorContent: FC<GradientInspectorProps> = ({
  state,
  dispatch,
  sortedStops,
  railGradientCss,
  cssExportString,
}) => {
  const handleRandomize = useCallback(
    () => dispatch({ type: ActionType.RANDOMIZE, payload: { newState: {} } }),
    [dispatch]
  );

  return (
    <div className="w-full lg:w-96 h-full flex flex-col">
      {" "}
      {/* This div was inside <aside> before */}
      <div className="flex flex-row items-center justify-between p-4 border-b border-border h-[69px] flex-shrink-0">
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
        <TabsList className="m-4">
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
          <TabsContent value="gradient" className="p-6 pt-2">
            <GradientPanel
              state={state}
              dispatch={dispatch}
              sortedStops={sortedStops}
              railGradientCss={railGradientCss}
            />
          </TabsContent>
          <TabsContent value="effects" className="p-6 pt-2">
            <EffectsPanel state={state} dispatch={dispatch} />
          </TabsContent>
          <TabsContent value="export" className="p-6 pt-2">
            <ExportPanel cssExportString={cssExportString} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
