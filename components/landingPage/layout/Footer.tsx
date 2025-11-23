import { GlitchButton } from "@/components/ui/GlitchButton";

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-white pt-32 pb-10 px-6 border-t border-white/10">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-40">
          <h2 className="text-[12vw] leading-[0.8] font-bold tracking-tighter mb-12 select-none text-white mix-blend-difference">
            START
            <br />
            BUILDING
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <GlitchButton primary>Open Generator</GlitchButton>
            <span className="font-mono text-xs text-gray-500 ml-4 uppercase tracking-widest">
              v2.4 Stable Build
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-10 border-t border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600">
          <div>
            Chromonoise © 2025 <br />
            Designed for Developers
          </div>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">
              Twitter
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Github
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Discord
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export { Footer };
