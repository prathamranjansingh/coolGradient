import { Check } from "lucide-react";
import { GradientSquare } from "./GradientSquare";
import { GRADIENT_PRESETS } from "@/lib/constants";
import { GlitchButton } from "@/components/ui/GlitchButton";

const GradientGrid = () => {
  return (
    <section className="bg-[#050505] py-32 px-6 border-t border-white/5">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Sticky Left Text */}
        <div className="md:col-span-5 relative">
          <div className="sticky top-32">
            <div className="w-8 h-1 bg-orange-500 mb-8" />
            <h2 className="text-5xl font-bold text-white tracking-tighter mb-6 leading-[0.9]">
              INFINITE
              <br />
              <span className="text-gray-600">VARIATIONS.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-mono">
              Explore a curated library of over 500+ dithered presets. Each
              generated with our proprietary grain algorithm for maximum texture
              depth.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                <Check size={12} className="text-white" />
                <span>Copy CSS / Tailwind</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                <Check size={12} className="text-white" />
                <span>Export SVG / PNG</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                <Check size={12} className="text-white" />
                <span>Figma Plugin Ready</span>
              </div>
            </div>

            <div className="mt-12">
              <GlitchButton>View Full Library</GlitchButton>
            </div>
          </div>
        </div>

        {/* Right Grid */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            {GRADIENT_PRESETS.map((g, i) => (
              <GradientSquare key={i} gradient={g} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { GradientGrid };
