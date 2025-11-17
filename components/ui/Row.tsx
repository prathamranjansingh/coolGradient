import React from "react";

type RowProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
};

export function Row({ left, right, className = "" }: RowProps) {
  return (
    <div
      className={`flex items-center border-b border-b-[#222] h-12 px-3 sm:px-4 w-full ${className}`}
    >
      <div className="w-[40%] min-w-0 flex items-center">{left}</div>
      <div className="w-[60%] min-w-0 flex items-center gap-2">{right}</div>
    </div>
  );
}
