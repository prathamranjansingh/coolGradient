import { useRef, useCallback, useEffect } from "react";
import { vertexShaderSource, fragmentShaderSource } from "@/lib/shaders";
import { safeCompileShader, hexToRgb, checkWebGLSync } from "@/lib/utils";
import { MAX_STOPS } from "@/lib/constants";
import {
  GradientMode,
  GradientStop,
  MeshPoint,
  RadialPoints,
  Filters,
} from "@/lib/type";

type WebGLState = {
  mode: GradientMode;
  stops: GradientStop[];
  meshPoints: MeshPoint[];
  radialPoints: RadialPoints;
  filters: Filters;
};

type WebGLStatus = { ok: boolean; message: string };

export function useWebGLRenderer(initialState: WebGLState) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const stateRef = useRef(initialState);
  const glStatusRef = useRef<WebGLStatus>(checkWebGLSync());
  const rafRef = useRef(0);

  // Keep stateRef updated without triggering re-renders
  useEffect(() => {
    stateRef.current = initialState;
  }, [initialState]);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !glStatusRef.current.ok) return;

    try {
      const gl = canvas.getContext("webgl", {
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: false,
        premultipliedAlpha: false,
      });
      if (!gl) throw new Error("WebGL context creation failed");

      const v = safeCompileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const f = safeCompileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

      const program = gl.createProgram();
      if (!program) throw new Error("Could not create program");
      gl.attachShader(program, v);
      gl.attachShader(program, f);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(program) || "Program link failed");

      gl.useProgram(program);
      const posLoc = gl.getAttribLocation(program, "a_position");
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      glRef.current = gl;
      programRef.current = program;
      glStatusRef.current = { ok: true, message: "" };
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      glStatusRef.current = { ok: false, message: errorMsg };
      console.error("WebGL init failed:", err);
      return false;
    }
  }, []);

  const renderGL = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const { mode, stops, meshPoints, radialPoints, filters } = stateRef.current;

    if (!gl || !program) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(
      gl.getUniformLocation(program, "u_mode"),
      mode === "linear" ? 0 : mode === "radial" ? 1 : 2
    );

    const colors = new Float32Array(MAX_STOPS * 3);
    const positionsArr = new Float32Array(MAX_STOPS);
    const pointsArr = new Float32Array(MAX_STOPS * 2);
    const intensitiesArr = new Float32Array(MAX_STOPS);
    const radiiArr = new Float32Array(MAX_STOPS);
    let stopCount = 0;

    if (mode === "mesh") {
      const meshData = meshPoints.slice(0, MAX_STOPS);
      stopCount = meshData.length;
      meshData.forEach((p, i) => {
        const c = hexToRgb(p.color);
        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        pointsArr[i * 2 + 0] = p.x;
        pointsArr[i * 2 + 1] = 1.0 - p.y; // Flip Y
        intensitiesArr[i] = p.intensity;
        radiiArr[i] = p.radius;
      });
    } else {
      const stopData = stops.slice(0, MAX_STOPS);
      stopCount = stopData.length;
      stopData.forEach((s, i) => {
        const c = hexToRgb(s.color);
        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        positionsArr[i] = s.position;
        intensitiesArr[i] = s.intensity;
      });

      if (mode === "linear") {
        const first = stopData[0];
        const last = stopData[stopData.length - 1];
        pointsArr[0] = first.x;
        pointsArr[1] = 1.0 - first.y; // Flip Y
        pointsArr[2] = last.x;
        pointsArr[3] = 1.0 - last.y; // Flip Y
      } else {
        pointsArr[0] = radialPoints.center.x;
        pointsArr[1] = 1.0 - radialPoints.center.y; // Flip Y
        pointsArr[2] = radialPoints.focus.x;
        pointsArr[3] = 1.0 - radialPoints.focus.y; // Flip Y
      }
    }

    gl.uniform1i(gl.getUniformLocation(program, "u_stopCount"), stopCount);
    gl.uniform3fv(gl.getUniformLocation(program, "u_colors"), colors);
    gl.uniform1fv(gl.getUniformLocation(program, "u_positions"), positionsArr);
    gl.uniform2fv(gl.getUniformLocation(program, "u_points"), pointsArr);
    gl.uniform1fv(
      gl.getUniformLocation(program, "u_intensities"),
      intensitiesArr
    );
    gl.uniform1fv(gl.getUniformLocation(program, "u_radii"), radiiArr);

    Object.entries(filters).forEach(([key, value]) => {
      gl.uniform1f(gl.getUniformLocation(program, `u_${key}`), value);
    });

    gl.uniform1f(
      gl.getUniformLocation(program, "u_time"),
      (Date.now() / 1000) % 3600
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  // Render loop
  useEffect(() => {
    if (!glStatusRef.current.ok) return;

    const loop = () => {
      renderGL();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [renderGL]);

  return { canvasRef, initWebGL, renderGL, glStatus: glStatusRef.current };
}
