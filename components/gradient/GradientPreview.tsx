import React, { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GradientPreviewProps {
  cssForBefore: string;
  cssForAfter: string;
}

export const GradientPreview: FC<GradientPreviewProps> = ({
  cssForBefore,
  cssForAfter,
}) => {
  const beforeStyles = cssForBefore.replace(
    ".your-element",
    "#preview-hero-bg"
  );
  const afterStyles = cssForAfter.replace(".your-element", "#preview-hero-bg");

  return (
    <>
      {/* Inject the dynamic styles. */}
      <style>{beforeStyles}</style>
      <style>{afterStyles}</style>

      <Card className="w-full h-full overflow-hidden">
        <CardContent className="p-0 w-full h-full">
          <div
            id="preview-hero-bg" // This ID is targeted by the <style>
            className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden"
            style={{ position: "relative", zIndex: 0 }}
          >
            {/* ::before (z-index: 1) has gradient + filters */}
            {/* ::after (z-index: 2) has noise + opacity */}

            <div
              className="w-full max-w-2xl text-center text-white"
              style={{ position: "relative", zIndex: 10 }}
            >
              <h1
                className="text-5xl font-bold"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                Your Website Hero
              </h1>
              <p
                className="mt-4 text-xl opacity-90"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque
                voluptatum tempora, quas libero incidunt, blanditiis suscipit
                autem non aut exercitationem dicta magni officiis voluptas
                maiores impedit, quibusdam modi esse quidem.
              </p>
              <Button className="mt-8" size="lg">
                Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
