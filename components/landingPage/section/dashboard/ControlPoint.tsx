import { memo } from "react";

interface ControlPointProps {
  className: string;
  size?: "sm" | "md";
}

const ControlPoint = memo(({ className, size = "md" }: ControlPointProps) => {
  const sizeClasses = size === "sm" ? "w-2 h-2" : "w-5 h-5";
  const borderClass =
    size === "sm"
      ? "border-0 shadow-[0_0_10px_white]"
      : "border-2 shadow-[0_0_15px_rgba(255,255,255,0.5)]";

  return (
    <div
      className={`${className} ${sizeClasses} bg-white rounded-full ${borderClass} ${
        size === "md"
          ? "border-white cursor-pointer hover:scale-110 transition-transform"
          : ""
      }`}
    />
  );
});

ControlPoint.displayName = "ControlPoint";

export { ControlPoint };
