import React, { FC } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection: FC<CollapsibleSectionProps> = ({
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
