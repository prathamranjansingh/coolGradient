import { useRef, useCallback, useState } from "react";
import { vertexShaderSource, fragmentShaderSource } from "@/lib/shaders";
import { hexToRgb, safeCompileShader } from "@/lib/utils";
import { MAX_STOPS } from "@/lib/constants";

interface WebGLState {
  mode: string;
  stops: any[];
  meshPoints: any[];
  radialPoints: any;
  filters: any;
}

interface WebGLStatus {
  ok: boolean;
  message: string;
}

export const useWebGLRenderer = (state: WebGLState) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<any>({});

  // Use state instead of ref so React knows when it changes
  const [glStatus, setGLStatus] = useState<WebGLStatus>({
    ok: false,
    message: "Not initialized",
  });

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    // If already initialized and still valid, return true
    if (glRef.current && programRef.current) {
      return true;
    }

    try {
      // Get WebGL context with proper settings to prevent context loss
      const gl =
        (canvas.getContext("webgl", {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }) as WebGLRenderingContext) ||
        (canvas.getContext("experimental-webgl", {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }) as WebGLRenderingContext);

      if (!gl) {
        setGLStatus({ ok: false, message: "WebGL not supported" });
        return false;
      }

      glRef.current = gl;

      // Compile shaders
      const vs = safeCompileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fs = safeCompileShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );

      // Create program
      const program = gl.createProgram();
      if (!program) throw new Error("Could not create program");

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const err = gl.getProgramInfoLog(program);
        throw new Error(err || "Program link failed");
      }

      programRef.current = program;
      gl.useProgram(program);

      // Set up geometry
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      // Cache uniform locations
      uniformsRef.current = {
        mode: gl.getUniformLocation(program, "u_mode"),
        stopCount: gl.getUniformLocation(program, "u_stopCount"),
        colors: gl.getUniformLocation(program, "u_colors"),
        positions: gl.getUniformLocation(program, "u_positions"),
        points: gl.getUniformLocation(program, "u_points"),
        intensities: gl.getUniformLocation(program, "u_intensities"),
        radii: gl.getUniformLocation(program, "u_radii"),
        brightness: gl.getUniformLocation(program, "u_brightness"),
        contrast: gl.getUniformLocation(program, "u_contrast"),
        saturation: gl.getUniformLocation(program, "u_saturation"),
        temperature: gl.getUniformLocation(program, "u_temperature"),
        tint: gl.getUniformLocation(program, "u_tint"),
        noise: gl.getUniformLocation(program, "u_noise"),
        time: gl.getUniformLocation(program, "u_time"),
      };

      setGLStatus({ ok: true, message: "WebGL initialized" });
      return true;
    } catch (err) {
      console.error("WebGL init error:", err);
      setGLStatus({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }, []); // Empty deps - only depends on refs

  const renderGL = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const uniforms = uniformsRef.current;

    if (!gl || !program) return;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Set mode
      const modeIndex =
        state.mode === "linear" ? 0 : state.mode === "radial" ? 1 : 2;
      gl.uniform1i(uniforms.mode, modeIndex);

      // Prepare data based on mode
      if (state.mode === "mesh") {
        const count = Math.min(state.meshPoints.length, MAX_STOPS);
        gl.uniform1i(uniforms.stopCount, count);

        const colors = new Float32Array(MAX_STOPS * 3);
        const points = new Float32Array(MAX_STOPS * 2);
        const intensities = new Float32Array(MAX_STOPS);
        const radii = new Float32Array(MAX_STOPS);

        for (let i = 0; i < count; i++) {
          const p = state.meshPoints[i];
          const rgb = hexToRgb(p.color);
          colors[i * 3] = rgb.r;
          colors[i * 3 + 1] = rgb.g;
          colors[i * 3 + 2] = rgb.b;
          // FIX: Invert Y coordinate for WebGL (0,0 is bottom-left in WebGL, top-left in canvas)
          points[i * 2] = p.x;
          points[i * 2 + 1] = 1.0 - p.y;
          intensities[i] = p.intensity;
          radii[i] = p.radius;
        }

        gl.uniform3fv(uniforms.colors, colors);
        gl.uniform2fv(uniforms.points, points);
        gl.uniform1fv(uniforms.intensities, intensities);
        gl.uniform1fv(uniforms.radii, radii);
      } else {
        const count = Math.min(state.stops.length, MAX_STOPS);
        gl.uniform1i(uniforms.stopCount, count);

        const colors = new Float32Array(MAX_STOPS * 3);
        const positions = new Float32Array(MAX_STOPS);
        const intensities = new Float32Array(MAX_STOPS);

        for (let i = 0; i < count; i++) {
          const s = state.stops[i];
          const rgb = hexToRgb(s.color);
          colors[i * 3] = rgb.r;
          colors[i * 3 + 1] = rgb.g;
          colors[i * 3 + 2] = rgb.b;
          positions[i] = s.position;
          intensities[i] = s.intensity;
        }

        gl.uniform3fv(uniforms.colors, colors);
        gl.uniform1fv(uniforms.positions, positions);
        gl.uniform1fv(uniforms.intensities, intensities);

        const points = new Float32Array(MAX_STOPS * 2);
        if (state.mode === "linear") {
          // FIX: Invert Y coordinates for linear gradient
          points[0] = state.stops[0]?.x ?? 0;
          points[1] = 1.0 - (state.stops[0]?.y ?? 0);
          points[2] = state.stops[state.stops.length - 1]?.x ?? 1;
          points[3] = 1.0 - (state.stops[state.stops.length - 1]?.y ?? 1);
        } else {
          // FIX: Invert Y coordinates for radial gradient
          points[0] = state.radialPoints.center.x;
          points[1] = 1.0 - state.radialPoints.center.y;
          points[2] = state.radialPoints.focus.x;
          points[3] = 1.0 - state.radialPoints.focus.y;
        }
        gl.uniform2fv(uniforms.points, points);
      }

      // Set filters
      gl.uniform1f(uniforms.brightness, state.filters.brightness);
      gl.uniform1f(uniforms.contrast, state.filters.contrast);
      gl.uniform1f(uniforms.saturation, state.filters.saturation);
      gl.uniform1f(uniforms.temperature, state.filters.temperature);
      gl.uniform1f(uniforms.tint, state.filters.tint);
      gl.uniform1f(uniforms.noise, state.filters.noise);
      gl.uniform1f(uniforms.time, performance.now() * 0.001);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } catch (err) {
      console.error("Render error:", err);
    }
  }, [state]);

  // Cleanup function
  const cleanup = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;

    if (gl && program) {
      gl.deleteProgram(program);
    }

    glRef.current = null;
    programRef.current = null;
    uniformsRef.current = {};
    setGLStatus({ ok: false, message: "Cleaned up" });
  }, []);

  return {
    canvasRef,
    glRef,
    initWebGL,
    renderGL,
    cleanup,
    glStatus,
  };
};
