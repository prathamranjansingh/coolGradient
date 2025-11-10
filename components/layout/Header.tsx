// src/components/layout/Header.tsx
import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Settings } from "lucide-react"; // ✅ Removed Panel icons
import { DrawerTrigger } from "@/components/ui/drawer";

interface HeaderProps {
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  isMobile: boolean;
  onToggleMobileDrawer: (open: boolean) => void;
  // ✅ Removed desktop inspector props
}

export const Header: FC<HeaderProps> = ({
  isPreviewMode,
  onTogglePreview,
  isMobile,
}) => {
  return (
    <header
      className={`flex items-center justify-between p-4 h-[69px] shrink-0 z-20 ${
        isPreviewMode
          ? "bg-transparent border-transparent"
          : "bg-background border-b border-border"
      }`}
    >
      <h1 className="text-xl font-bold">CoolGradient</h1>
      <div className="flex items-center gap-2">
        <Button
          variant={isPreviewMode ? "default" : "outline"}
          size="icon"
          onClick={onTogglePreview}
          title={isPreviewMode ? "Exit Live Preview" : "Toggle Live Preview"}
        >
          <Eye className="w-4 h-4" />
        </Button>

        {/* ✅ Simplified logic: only show drawer trigger on mobile */}
        {isMobile ? (
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" title="Open Controls">
              <Settings className="w-4 h-4" />
            </Button>
          </DrawerTrigger>
        ) : null}
      </div>
    </header>
  );
};
