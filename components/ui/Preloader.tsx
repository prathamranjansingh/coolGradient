"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        // Random jump in progress
        return prev + Math.floor(Math.random() * 15) + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-white"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="w-[300px] relative">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          <span>System_Boot</span>
          <span>v.2.0.4</span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-[2px] w-full bg-zinc-900 mb-2 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
          />
        </div>

        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-bold tracking-tighter">LOADING</h1>
          <span className="text-4xl font-bold tabular-nums">
            {Math.min(progress, 100).toString().padStart(3, "0")}%
          </span>
        </div>

        <div className="mt-8 space-y-1">
          <div className="text-[10px] text-zinc-600 uppercase">
            Initializing core modules...
          </div>
          {progress > 30 && (
            <div className="text-[10px] text-zinc-600 uppercase">
              Loading shaders... OK
            </div>
          )}
          {progress > 60 && (
            <div className="text-[10px] text-zinc-600 uppercase">
              Compiling mesh data... OK
            </div>
          )}
          {progress === 100 && (
            <div className="text-[10px] text-emerald-500 uppercase">Ready.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
