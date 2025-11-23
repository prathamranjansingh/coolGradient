"use client";
import { memo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
import { motion } from "motion/react";

interface GradientSquareProps {
  gradient: string;
  index: number;
}

const GradientSquare = memo(({ gradient, index }: GradientSquareProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(gradient);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="aspect-square relative group overflow-hidden border border-white/10 cursor-pointer bg-[#0a0a0a]"
      whileHover={{ scale: 0.98 }}
      onClick={handleCopy}
    >
      {/* Gradient */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 filter contrast-125 brightness-90 will-change-transform"
        style={{ background: gradient }}
      />

      {/* Heavy Grain */}
      <div
        className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("${NOISE_SVG_DATA_URI}")`,
          backgroundSize: "100px",
        }}
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
        {copied ? (
          <>
            <Check size={20} className="text-green-500" />
            <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">
              Copied
            </span>
          </>
        ) : (
          <>
            <Copy size={20} className="text-white" />
            <span className="text-[10px] font-mono text-white uppercase tracking-widest">
              Copy CSS
            </span>
          </>
        )}
      </div>

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-[8px] font-mono text-white/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border-t border-white/10">
        Preset_0{index + 1}
      </div>
    </motion.div>
  );
});

GradientSquare.displayName = "GradientSquare";

export { GradientSquare };
