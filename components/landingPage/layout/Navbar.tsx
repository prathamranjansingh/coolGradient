import { GlitchButton } from "../../ui/GlitchButton";
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 mix-blend-exclusion text-white">
      <div className="max-w-[1800px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-4 h-4 bg-white flex items-center justify-center">
            <div className="w-full h-[1px] bg-black group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="font-bold text-xl tracking-tighter">
            CHROMONOISE
          </span>
        </div>
        <GlitchButton>Get Started</GlitchButton>
      </div>
    </nav>
  );
};

export { Navbar };
