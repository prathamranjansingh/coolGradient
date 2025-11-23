import { CustomSlider } from "@/components/ui/custom-slider";
import { Lock, Shuffle, EyeOff, X, Trash2 } from "lucide-react";
import { ControlPoint } from "../dashboard/ControlPoint";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
const DashboardMock = () => {
  return (
    <div className="w-full h-full bg-[#050505] flex flex-col font-sans overflow-hidden relative text-white antialiased border border-white/10 shadow-2xl rounded-lg">
      {/* MACOS HEADER */}
      <div className="h-10 bg-[#0a0a0a] border-b border-white/10 flex items-center px-4 justify-between shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/20" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/20" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/20" />
        </div>
        <div className="flex-1 max-w-md mx-4 h-6 bg-[#161616] rounded flex items-center justify-center border border-white/5 text-[9px] font-mono text-gray-500 gap-2">
          <Lock size={8} />
          chromonoise.app/studio
        </div>
        <div className="w-12" />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-[#000] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#ff1a1a] blur-[120px] opacity-60 animate-pulse will-change-transform" />
            <div className="absolute bottom-[0%] right-[0%] w-[60%] h-[60%] bg-[#333] blur-[100px] opacity-80 will-change-transform" />
            <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] bg-[#ff4d4d] blur-[80px] opacity-40 will-change-transform" />
          </div>

          {/* HEAVY GRAIN TEXTURE */}
          <div
            className="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

          <ControlPoint className="absolute top-[30%] left-[30%]" />
          <ControlPoint className="absolute bottom-[40%] right-[30%] border-white/50" />
          <ControlPoint className="absolute top-[60%] right-[20%] border-white/50" />
          <ControlPoint className="absolute bottom-4 left-4" size="sm" />
        </div>

        <div className="w-[280px] bg-[#000] flex flex-col border-l border-white/10 shrink-0">
          <div className="flex h-9 border-b border-white/10 text-[9px] font-bold uppercase tracking-[0.15em]">
            <div className="flex-1 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer border-r border-white/10 transition-colors">
              Linear
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer border-r border-white/10 transition-colors">
              Radial
            </div>
            <div className="flex-1 flex items-center justify-center bg-white text-black cursor-pointer">
              Mesh
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 text-[9px] font-mono text-gray-500 uppercase">
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <Shuffle size={10} /> RANDOMIZE
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <EyeOff size={10} /> HIDE_UI
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-5 overflow-hidden">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/20 rounded-sm" />
                  <span className="text-[10px] font-bold text-white tracking-wide">
                    Mesh_Point_4
                  </span>
                </div>
                <X
                  size={10}
                  className="text-gray-500 cursor-pointer hover:text-white"
                />
              </div>
              <div className="flex items-center justify-between h-6 mb-4">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                  Color
                </span>
                <div className="w-32 h-full bg-[#111] border border-white/10 flex items-center justify-end px-2 gap-2 cursor-pointer hover:border-white/30">
                  <span className="text-[9px] font-mono text-white">
                    #232526
                  </span>
                </div>
              </div>
              <CustomSlider label="Position X" value={0.9} max={1} />
              <CustomSlider label="Position Y" value={0.89} max={1} />
              <CustomSlider label="Radius" value={0.25} max={1} />
              <CustomSlider label="Intensity" value={1.0} max={1} />
            </div>
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] font-bold text-white tracking-wide">
                  Post_Processing
                </span>
                <div className="w-2 h-[1px] bg-gray-500" />
              </div>
              <CustomSlider label="Noise" value={0.15} max={1} />
              <CustomSlider label="Tint" value={0.0} max={1} />
              <CustomSlider label="Temperature" value={0.0} max={1} />
              <CustomSlider label="Contrast" value={0.0} max={1} />
            </div>
          </div>

          <div className="p-3 border-t border-white/10 bg-[#020202]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-white tracking-wide">
                Color_Nodes [4]
              </span>
            </div>
            <div className="h-7 bg-[#111] border border-white/10 flex items-center justify-between px-3 cursor-pointer hover:bg-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#333]" />
                <span className="text-[8px] font-mono text-gray-500 uppercase">
                  NODE_00
                </span>
              </div>
              <Trash2 size={10} className="text-gray-600 hover:text-red-500" />
            </div>
          </div>

          <div className="h-6 border-t border-white/10 bg-[#000] flex items-center px-3 justify-between text-[8px] font-mono uppercase tracking-widest text-gray-600">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full" />{" "}
                SYSTEM_READY
              </span>
            </div>
            <div className="flex gap-3">
              <span className="hover:text-white cursor-pointer">
                R RANDOMIZE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardMock };
