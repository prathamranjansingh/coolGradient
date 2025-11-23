"use client";

import { GlitchButton } from "@/components/ui/GlitchButton";
import { motion, useScroll, useTransform } from "motion/react";

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[#050505]" />
      <div
        className="absolute bottom-0 left-0 right-0 h-[60vh] opacity-40 pointer-events-none will-change-transform"
        style={{
          background:
            "linear-gradient(0deg, #f97316 0%, #f9fafb 40%, transparent 100%)",
          filter: "blur(80px)",
          transform: "scaleY(0.6) translateY(20%)",
        }}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-4"
      >
        <div className="inline-flex items-center gap-2 border-x border-white/20 px-6 py-2 text-[10px] uppercase tracking-[0.3em] mb-12 text-white/50 font-bold">
          <span className="w-1 h-1 bg-orange-500 animate-pulse" />
          System v2.4 Live
        </div>
        <h1 className="text-[13vw] leading-[0.8] font-bold tracking-tighter text-white mb-8 select-none mix-blend-screen antialiased">
          COOL
          <br />
          GRADIENT
        </h1>
        <p className="mt-8 text-sm md:text-lg text-gray-400 max-w-lg mx-auto leading-relaxed font-mono uppercase tracking-widest antialiased">
          Make gradients without overthinking it. <br />
          <span className="text-white">Start creating in browser.</span>
        </p>
        <div className="mt-16 flex flex-col md:flex-row justify-center gap-6">
          <GlitchButton primary>Launch App</GlitchButton>
          <GlitchButton>Read Docs</GlitchButton>
        </div>
      </motion.div>
    </section>
  );
};

export { Hero };
