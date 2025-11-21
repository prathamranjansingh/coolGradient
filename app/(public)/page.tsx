"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import GradientStudio from "@/components/gradient-studio/GradientStudio";
import Preloader from "@/components/ui/Preloader";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="min-h-screen w-full bg-black text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && <GradientStudio />}
    </main>
  );
}
