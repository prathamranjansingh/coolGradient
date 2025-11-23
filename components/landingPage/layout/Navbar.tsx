"use client";
import { useState, useEffect } from "react";
import { GlitchButton } from "../../ui/GlitchButton";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 px-6 py-6 
        transition-all duration-500 border-b
        ${
          isScrolled
            ? "bg-black/50 backdrop-blur-lg border-white/10 shadow-sm"
            : "bg-transparent border-transparent mix-blend-exclusion"
        }
      `}
    >
      <div className="max-w-[1800px] mx-auto flex justify-between items-center text-white">
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
