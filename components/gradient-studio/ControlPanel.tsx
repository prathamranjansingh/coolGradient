import React from "react";
import { Inspector } from "./panels/Inspector";
import { FilterEditor } from "./panels/FilterEditor";
import { StopsEditor } from "./panels/StopsEditor";
import { ExportEditor } from "./panels/ExportEditor";

export function ControlPanel(props: any) {
  // Forces Inspector to re-mount when selection changes to prevent stale state
  const inspectorKey = props.selectedPoint
    ? `${props.selectedPoint.type}-${
        props.selectedPoint.index ?? props.selectedPoint.point
      }`
    : "idle";

  return (
    <div className="w-full pb-20">
      <Inspector
        key={inspectorKey}
        selectedPoint={props.selectedPoint}
        data={{
          stops: props.stops,
          meshPoints: props.meshPoints,
          radialPoints: props.radialPoints,
        }}
        onUpdate={props.updateSelectedPoint}
        onDeselect={() => props.setSelectedPoint(null)}
      />

      <FilterEditor filters={props.filters} setFilters={props.setFilters} />

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

      <div className="p-4 border-t border-zinc-800 mt-auto">
        <ExportEditor
          isExporting={props.isExporting}
          exportSize={props.exportSize}
          setExportSize={props.setExportSize}
          onExport={props.exportAsPNG}
          glOK={props.glOK}
        />
      </div>
    </div>
  );
}
