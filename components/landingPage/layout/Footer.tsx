"use client";
"use client";
import { GlitchButton } from "../../ui/GlitchButton";

const IsometricText = ({ text }: { text: string }) => {
  return (
    <div className="relative flex justify-center items-center pointer-events-none z-0">
      {/* 3D SCENE CONTAINER 
          Converted rotation style to Tailwind arbitrary value:
          [transform:rotateX(20deg)_rotateY(-25deg)_rotateZ(8deg)]
      */}
      <div className="relative [transform-style:preserve-3d] [transform:rotateX(20deg)_rotateY(-25deg)_rotateZ(8deg)]">
        {/* 1. THE CONNECTING LAYERS (The "Wireframe" Volume) */}
        {[...Array(12)].map((_, i) => (
          <h1
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14vw] leading-none font-black text-transparent whitespace-nowrap select-none font-sans [-webkit-text-stroke:1px_rgba(255,255,255,0.1)]"
            style={{
              // Dynamic depth must remain inline
              transform: `translateZ(-${(i + 1) * 5}px)`,
            }}
          >
            {text}
          </h1>
        ))}

        {/* 2. THE BACK FACE (Anchor) */}
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14vw] leading-none font-black text-transparent whitespace-nowrap select-none font-sans [-webkit-text-stroke:1px_rgba(255,255,255,0.3)] [transform:translateZ(-65px)]">
          {text}
        </h1>

        {/* 3. THE FRONT FACE (Main) */}
        <h1 className="relative text-[14vw] leading-none font-black text-transparent whitespace-nowrap select-none font-sans [-webkit-text-stroke:1px_rgba(255,255,255,1)] [transform:translateZ(0px)]">
          {text}
        </h1>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#080808] text-white min-h-screen flex flex-col overflow-hidden relative border-t border-white/10">
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full perspective-[2000px]">
        <div className="flex flex-col items-center gap-0 md:-space-y-10 -space-y-4">
          <IsometricText text="START" />
          <IsometricText text="BUILDING" />
        </div>

        <div className="mt-20 flex flex-wrap gap-6 items-center z-20 translate-y-10">
          <GlitchButton primary>Open Generator</GlitchButton>
          <span className="font-mono text-xs text-gray-500 ml-4 uppercase tracking-widest">
            v2.4 Stable Build
          </span>
        </div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 pb-8 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-end font-mono text-[10px] uppercase tracking-widest text-gray-500 z-20 bg-[#080808]">
        <div className="mb-4 md:mb-0">
          <p className="text-white/60">Chromonoise © 2025</p>
          <p>Designed for Developers</p>
        </div>
        <div className="flex gap-8">
          {["Twitter", "Github", "Discord"].map((social) => (
            <a
              key={social}
              href="#"
              className="hover:text-white transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export { Footer };
