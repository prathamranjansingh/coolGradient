import React from "react";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  RadialPoints,
  Filters,
  SelectedPoint,
} from "@/lib/type";

// Import Panel Components
import { Inspector } from "./panels/Inspector";
import { FilterEditor } from "./panels/FilterEditor";
import { StopsEditor } from "./panels/StopsEditor";
import { ExportEditor } from "./panels/ExportEditor";
import { Collapsible } from "@/components/ui/collapsible";

// This component receives ALL state and setters from the main GradientStudio
// and passes them down to the relevant child panels.
type ControlPanelProps = {
  mode: GradientMode;
  stops: GradientStop[];
  meshPoints: MeshPoint[];
  radialPoints: RadialPoints;
  filters: Filters;
  selectedPoint: SelectedPoint | null;
  isExporting: boolean;
  exportSize: { width: number; height: number };
  glOK: boolean;

  setStops: React.Dispatch<React.SetStateAction<GradientStop[]>>;
  setMeshPoints: React.Dispatch<React.SetStateAction<MeshPoint[]>>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setSelectedPoint: React.Dispatch<React.SetStateAction<SelectedPoint | null>>;
  setExportSize: (size: { width: number; height: number }) => void;

  addStop: () => void;
  addMeshPoint: () => void;
  removeStop: (index: number) => void;
  removeMeshPoint: (index: number) => void;
  onReset: () => void;
  exportAsPNG: () => void;
  updateSelectedPoint: (key: string, value: any) => void;
};

export function ControlPanel(props: ControlPanelProps) {
  return (
    <aside className="lg:col-span-1 w-full">
      {/* Panel 1: Inspector (Figma-style) */}
      <Inspector
        selectedPoint={props.selectedPoint}
        data={{
          stops: props.stops,
          meshPoints: props.meshPoints,
          radialPoints: props.radialPoints,
        }}
        onUpdate={props.updateSelectedPoint}
        onDeselect={() => props.setSelectedPoint(null)}
      />

      {/* Panel 2: Filters (Collapsible) */}
      <FilterEditor filters={props.filters} setFilters={props.setFilters} />

      {/* Panel 3: Stops/Points (Collapsible) */}
      <Collapsible title={props.mode === "mesh" ? "Mesh Points" : "Stops"}>
        <StopsEditor
          mode={props.mode}
          stops={props.stops}
          meshPoints={props.meshPoints}
          selectedPoint={props.selectedPoint}
          setStops={props.setStops}
          setMeshPoints={props.setMeshPoints}
          setSelectedPoint={props.setSelectedPoint}
          addStop={props.addStop}
          addMeshPoint={props.addMeshPoint}
          removeStop={props.removeStop}
          removeMeshPoint={props.removeMeshPoint}
          onReset={props.onReset}
        />
      </Collapsible>

      {/* Panel 4: Export (Collapsible) */}
      <Collapsible title="Export">
        <ExportEditor
          isExporting={props.isExporting}
          exportSize={props.exportSize}
          setExportSize={props.setExportSize}
          onExport={props.exportAsPNG}
          glOK={props.glOK}
        />
      </Collapsible>
    </aside>
  );
}
