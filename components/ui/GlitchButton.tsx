"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlitchButtonProps {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
}

const GlitchButton = ({
  children,
  primary = false,
  onClick,
}: GlitchButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-8 py-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-200
        group overflow-hidden border
        ${
          primary
            ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
            : "bg-transparent text-white border-white/20 hover:border-white"
        }
      `}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200 bg-white" />
    </motion.button>
  );
};

export { GlitchButton };
