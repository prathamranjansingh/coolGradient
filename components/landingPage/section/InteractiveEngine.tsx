"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { DashboardMock } from "./dashboard/DashboardMock";

const InteractiveEngine = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [15, 0, -5]);
  const scale = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    [0.85, 0.95, 0.9]
  );
  const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  return (
    <section
      ref={ref}
      className="bg-[#050505] py-20 min-h-screen perspective-[2000px] overflow-hidden relative flex items-center justify-center"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold text-white/5 pointer-events-none whitespace-nowrap select-none">
        SYS.001
      </div>

      <div className="w-full max-w-[1000px] px-6 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-2 antialiased">
              CONTROL
              <br />
              THE MESH.
            </h2>
            <p className="text-gray-500 font-mono uppercase tracking-widest text-xs antialiased">
              // Drag points. Adjust Noise. Export CSS.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-orange-500 font-mono text-[10px] mb-2 animate-pulse">
              ● Live Preview
            </div>
          </div>
        </div>

        <motion.div
          style={{
            rotateX,
            scale,
            opacity,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
          className="w-full aspect-[16/10] rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_-10px_rgba(255,255,255,0.05)] bg-[#050505] antialiased will-change-transform"
        >
          <DashboardMock />
        </motion.div>
      </div>
    </section>
  );
};

export { InteractiveEngine };
