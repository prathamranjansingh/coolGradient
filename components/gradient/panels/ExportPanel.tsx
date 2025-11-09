// src/components/gradient/panels/ExportPanel.tsx

import React, { FC, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ExportPanelProps {
  cssExportString: string;
}

export const ExportPanel: FC<ExportPanelProps> = ({ cssExportString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCss = useCallback(() => {
    navigator.clipboard.writeText(cssExportString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cssExportString]);

  return (
    <div className="space-y-4">
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
  );
};
