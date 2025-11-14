import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let webglCheckCache: { ok: boolean; message: string } | null = null;

export const checkWebGLSync = (): { ok: boolean; message: string } => {
  if (webglCheckCache) {
    return webglCheckCache;
  }

  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl", {
        failIfMajorPerformanceCaveat: false,
      }) ||
      c.getContext("experimental-webgl", {
        failIfMajorPerformanceCaveat: false,
      });

    const supported = !!gl;

    // Clean up the test context immediately
    if (gl && "getExtension" in gl) {
      const loseContext = (gl as WebGLRenderingContext).getExtension(
        "WEBGL_lose_context"
      );
      if (loseContext) {
        loseContext.loseContext();
      }
    }

    webglCheckCache = supported
      ? { ok: true, message: "OK" }
      : { ok: false, message: "WebGL not supported by this browser." };

    return webglCheckCache;
  } catch (e) {
    webglCheckCache = {
      ok: false,
      message: e instanceof Error ? e.message : String(e),
    };
    return webglCheckCache;
  }
};

export const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r: r / 255, g: g / 255, b: b / 255 }; // Return as 0-1 range
};

export const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

export const safeCompileShader = (
  gl: WebGLRenderingContext,
  type: number,
  src: string
) => {
  const s = gl.createShader(type);
  if (!s) throw new Error("Could not create shader");
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(err || "Shader compilation failed");
  }
  return s;
};

export const computeTfromXY = (
  x: number,
  y: number,
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  const dirx = end.x - start.x;
  const diry = end.y - start.y;
  const len2 = dirx * dirx + diry * diry;
  if (len2 < 1e-6) return 0;
  const px = x - start.x;
  const py = y - start.y;
  return (px * dirx + py * diry) / len2;
};
