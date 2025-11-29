"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Layers,
  Hash,
  Command,
  Download,
  Copy,
  Check,
  Maximize2,
} from "lucide-react";

// --- THE FLUID ENGINE (Complex Gradient Data) ---
const ROW_1 = [
  {
    id: "01",
    name: "Nebula_Heat",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        radial-gradient(at 0% 0%, #f43f5e 0px, transparent 50%),
        radial-gradient(at 100% 0%, #8b5cf6 0px, transparent 50%),
        radial-gradient(at 100% 100%, #06b6d4 0px, transparent 50%)
      `,
    },
  },
  {
    id: "02",
    name: "Cyber_Deep",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        radial-gradient(at 0% 100%, #2563eb 0px, transparent 50%),
        radial-gradient(at 100% 0%, #10b981 0px, transparent 50%),
        radial-gradient(at 50% 50%, #000 0px, transparent 50%)
      `,
    },
  },
  {
    id: "03",
    name: "Golden_Hour",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        radial-gradient(at 80% 0%, #fbbf24 0px, transparent 50%),
        radial-gradient(at 0% 50%, #f59e0b 0px, transparent 50%),
        radial-gradient(at 80% 100%, #b91c1c 0px, transparent 50%)
      `,
    },
  },
  {
    id: "04",
    name: "Toxic_Lime",
    style: {
      backgroundColor: "#111",
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #84cc16 0%, transparent 50%),
        radial-gradient(circle at 0% 0%, #ecfccb 0%, transparent 30%)
      `,
    },
  },
  {
    id: "05",
    name: "Violet_Storm",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        radial-gradient(at 0% 0%, #7c3aed 0px, transparent 50%),
        radial-gradient(at 100% 100%, #c026d3 0px, transparent 50%)
      `,
    },
  },
  {
    id: "06",
    name: "Aqua_Luxe",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        radial-gradient(at 50% 0%, #22d3ee 0px, transparent 50%),
        radial-gradient(at 50% 100%, #0ea5e9 0px, transparent 50%)
      `,
    },
  },
];

const ROW_2 = [
  {
    id: "07",
    name: "Linear_Flux",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        linear-gradient(125deg, rgba(0,0,0,0) 0%, #000 100%),
        linear-gradient(45deg, #ef4444 0%, transparent 60%),
        linear-gradient(225deg, #3b82f6 0%, transparent 60%)
      `,
    },
  },
  {
    id: "08",
    name: "Northern_Lights",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 90%),
        linear-gradient(100deg, #10b981 0%, transparent 50%),
        linear-gradient(-20deg, #8b5cf6 0%, transparent 50%)
      `,
    },
  },
  {
    id: "09",
    name: "Deep_Vortex",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        conic-gradient(from 180deg at 50% 100%, #000 0deg, #4f46e5 50deg, #06b6d4 120deg, #000 240deg)
      `,
    },
  },
  {
    id: "10",
    name: "Phantom_Mist",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        linear-gradient(60deg, #333 0%, transparent 40%),
        linear-gradient(-60deg, #666 0%, transparent 40%),
        linear-gradient(to bottom, transparent, #000)
      `,
    },
  },
  {
    id: "11",
    name: "Crimson_Rain",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        linear-gradient(160deg, #991b1b 0%, transparent 60%),
        linear-gradient(340deg, #f87171 0%, transparent 60%)
      `,
    },
  },
  {
    id: "12",
    name: "Golden_Slash",
    style: {
      backgroundColor: "#000",
      backgroundImage: `
        linear-gradient(110deg, #000 40%, #ca8a04 50%, #000 60%),
        linear-gradient(110deg, transparent 45%, #facc15 50%, transparent 55%)
      `,
    },
  },
];

// --- Sub-Component: The Infinite Marquee Track ---
const InfiniteLoop = ({
  children,
  direction = "left",
  speed = 25,
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
}) => {
  return (
    <div className="flex overflow-hidden relative w-full group">
      {/* Heavy Vignette Fade Effect (The "Void" Effect) */}
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />

      <motion.div
        className="flex gap-6 items-center"
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ width: "max-content" }}
      >
        {children}
        {children} {/* Duplicate for seamless loop */}
      </motion.div>

      {/* Pause on Hover via CSS */}
      <style jsx>{`
        .group:hover div {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

// --- Sub-Component: The High-Fidelity Card ---
const GradientCard = ({ item }: { item: (typeof ROW_1)[0] }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-[320px] h-[220px] rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] group/card cursor-pointer shrink-0 transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:shadow-blue-900/10">
      {/* 1. The Fluid Gradient Layer */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out group-hover/card:scale-110"
        style={item.style}
      />

      {/* 2. Noise Texture (Crucial for the "Organic" look) */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 3. Inner Vignette/Shadow */}
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] pointer-events-none" />

      {/* 4. Hover Interactions Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-4 backdrop-blur-[2px]">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-mono text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy CSS"}</span>
          </button>

          <button className="p-2 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
            <Download size={14} />
          </button>
        </div>

        <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
          4096 x 4096 PNG
        </span>
      </div>

      {/* 5. Static Metadata (Always Visible) */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-60 group-hover/card:opacity-100 transition-opacity">
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-tight text-sm drop-shadow-md">
            {item.name}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            ID: {item.id}
          </span>
        </div>
        <Maximize2 size={14} className="text-white drop-shadow-md" />
      </div>
    </div>
  );
};

// --- Main Component ---
const GradientGrid = () => {
  return (
    <section className="bg-black py-24 border-t border-white/5 overflow-hidden">
      {/* Header Context */}
      <div className="max-w-[1400px] mx-auto px-6 mb-16 flex flex-col md:flex-row items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-blue-500 animate-pulse">
            <Zap size={14} fill="currentColor" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">
              Real-Time Generation
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[0.9]">
            INFINITE <br />
            <span className="text-white/20">VELOCITY.</span>
          </h2>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2 text-right">
          <div className="flex gap-6 text-[10px] font-mono text-gray-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <Layers size={12} />
              <span>Mesh + Linear</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={12} />
              <span>Procedural Noise</span>
            </div>
            <div className="flex items-center gap-2">
              <Command size={12} />
              <span>Open Source</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-mono mt-2 max-w-xs">
            Stream of consciousness from our render engine. <br />
            Hover to inspect, Click to capture.
          </p>
        </div>
      </div>

      {/* The Carousel Streams */}
      <div className="flex flex-col gap-8">
        {/* Row 1: Moving Left */}
        <InfiniteLoop direction="left" speed={60}>
          {ROW_1.map((item, i) => (
            <GradientCard key={`row1-${i}`} item={item} />
          ))}
        </InfiniteLoop>

        {/* Row 2: Moving Right */}
        <InfiniteLoop direction="right" speed={70}>
          {ROW_2.map((item, i) => (
            <GradientCard key={`row2-${i}`} item={item} />
          ))}
        </InfiniteLoop>
      </div>

      {/* Bottom Gradient Fade for Section Transition */}
      <div className="h-32 bg-gradient-to-t from-black to-transparent w-full absolute bottom-0 pointer-events-none" />
    </section>
  );
};

export { GradientGrid };
