import { Footer } from "@/components/landingPage/layout/Footer";
import { Navbar } from "@/components/landingPage/layout/Navbar";
import { Hero } from "@/components/landingPage/section/Hero";
import { GradientGrid } from "@/components/landingPage/section/gradient/GradientGrid";
import { InteractiveEngine } from "@/components/landingPage/section/InteractiveEngine";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <InteractiveEngine />
      </main>
      <Footer />
    </div>
  );
}
