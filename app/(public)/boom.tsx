"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Download,
  Plus,
  Trash2,
  Shuffle,
  Sliders,
  Grid3x3,
  Circle,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";

// --- Constants and Defaults ---

const MAX_STOPS = 16;
const defaultStops = [
  { position: 0, color: "#FF6B6B", x: 0.2, y: 0.5, intensity: 1 },
  { position: 1, color: "#4ECDC4", x: 0.8, y: 0.5, intensity: 1 },
];
const defaultMesh = [
  { x: 0.25, y: 0.25, color: "#FF6B6B", radius: 0.25, intensity: 1 },
  { x: 0.75, y: 0.25, color: "#4ECDC4", radius: 0.25, intensity: 1 },
  { x: 0.25, y: 0.75, color: "#FFE66D", radius: 0.25, intensity: 1 },
  { x: 0.75, y: 0.75, color: "#A8E6CF", radius: 0.25, intensity: 1 },
];
const exportPresets = [
  { name: "1080p (FHD)", width: 1920, height: 1080 },
  { name: "720p (HD)", width: 1280, height: 720 },
  { name: "4K (UHD)", width: 3840, height: 2160 },
  { name: "Square (1:1)", width: 2048, height: 2048 },
];

// --- SHADER SOURCE ---

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
  }
`;

const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_texCoord;

  uniform int u_mode;
  uniform vec3 u_colors[${MAX_STOPS}];
  uniform float u_positions[${MAX_STOPS}];
  uniform vec2 u_points[${MAX_STOPS}];
  uniform float u_intensities[${MAX_STOPS}];
  uniform float u_radii[${MAX_STOPS}];
  uniform int u_stopCount;

  uniform float u_brightness;
  uniform float u_contrast;
  uniform float u_saturation;
  uniform float u_temperature;
  uniform float u_tint;
  uniform float u_noise;
  uniform float u_time;

  // High quality noise functions
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal/multi-octave noise for fine grain
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }

  vec3 adjustColor(vec3 color) {
    color = color * (1.0 + u_brightness * 0.5);
    color = (color - 0.5) * (1.0 + u_contrast * 1.5) + 0.5;
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luminance), color, 1.0 + u_saturation);
    color.r = color.r + u_temperature * 0.15;
    color.b = color.b - u_temperature * 0.15;
    color.r = color.r + u_tint * 0.1;
    color.g = color.g - u_tint * 0.1;
    return color;
  }

  vec3 linearGradient() {
    vec2 start = u_points[0];
    vec2 end = u_points[1];
    vec2 dir = end - start;
    float len = length(dir);
    if (len < 0.0001) return u_colors[0] * u_intensities[0];
    vec2 p = v_texCoord - start;
    float t = clamp(dot(p, dir) / (len * len), 0.0, 1.0);

    for (int i = 0; i < ${MAX_STOPS - 1}; i++) {
      if (i >= u_stopCount - 1) break;
      float p0 = u_positions[i];
      float p1 = u_positions[i+1];
      if (t >= p0 && t <= p1) {
        float localT = (t - p0) / max(0.0001, (p1 - p0));
        localT = smoothstep(0.0, 1.0, localT);
        vec3 colorA = u_colors[i] * u_intensities[i];
        vec3 colorB = u_colors[i + 1] * u_intensities[i + 1];
        return mix(colorA, colorB, localT);
      }
    }
    return u_colors[0] * u_intensities[0];
  }

  vec3 radialGradient() {
    vec2 c = u_points[0];
    vec2 f = u_points[1];
    float dist = distance(v_texCoord, c);
    float maxDist = distance(c, f) * 2.5;
    maxDist = max(maxDist, 0.001);
    float t = clamp(dist / maxDist, 0.0, 1.0);
    t = smoothstep(0.0, 1.0, t);

    for (int i = 0; i < ${MAX_STOPS - 1}; i++) {
      if (i >= u_stopCount - 1) break;
      float p0 = u_positions[i];
      float p1 = u_positions[i+1];
      if (t >= p0 && t <= p1) {
        float localT = (t - p0) / max(0.0001, (p1 - p0));
        localT = smoothstep(0.0, 1.0, localT);
        vec3 colorA = u_colors[i] * u_intensities[i];
        vec3 colorB = u_colors[i + 1] * u_intensities[i + 1];
        return mix(colorA, colorB, localT);
      }
    }
    return u_colors[0] * u_intensities[0];
  }

  vec3 meshGradient() {
    vec3 color = vec3(0.0);
    float totalWeight = 0.0;
    for (int i = 0; i < ${MAX_STOPS}; i++) {
      if (i >= u_stopCount) break;
      float dist = distance(v_texCoord, u_points[i]);
      float radius = max(0.0001, u_radii[i]);
      float influence = 1.0 / (1.0 + (dist / radius) * (dist / radius) * 10.0);
      influence = pow(influence, 2.0);
      vec3 pointColor = u_colors[i] * u_intensities[i];
      color += pointColor * influence;
      totalWeight += influence;
    }
    if (totalWeight > 0.0) color /= totalWeight;
    return color;
  }

  void main() {
    vec3 color;
    if (u_mode == 0) color = linearGradient();
    else if (u_mode == 1) color = radialGradient();
    else color = meshGradient();

    color = adjustColor(color);

    // Add fine-grained noise
    if (u_noise > 0.0) {
      float n = fbm(v_texCoord * 800.0 + u_time * 0.2) - 0.5;
      color += n * u_noise * 0.08;
    }

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

// --- Utility Functions ---

const checkWebGLSync = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch (e) {
    return false;
  }
};

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
};

const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

const safeCompileShader = (gl, type, src) => {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(err);
  }
  return s;
};

const computeTfromXY = (x, y, start, end) => {
  const dirx = end.x - start.x;
  const diry = end.y - start.y;
  const len2 = dirx * dirx + diry * diry;
  if (len2 < 1e-6) return 0;
  const px = x - start.x;
  const py = y - start.y;
  return (px * dirx + py * diry) / len2;
};

// --- Gradient Studio Component ---

export default function GradientStudio() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const glStatusRef = useRef({ ok: false, message: "" });
  const previewSizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  const [mode, setMode] = useState("linear");
  const [stops, setStops] = useState(defaultStops);
  const [meshPoints, setMeshPoints] = useState(defaultMesh);
  const [radialPoints, setRadialPoints] = useState({
    center: { x: 0.5, y: 0.5 },
    focus: { x: 0.7, y: 0.5 },
  });
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    noise: 0,
  });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [exportSize, setExportSize] = useState({ width: 1920, height: 1080 });
  const [isExporting, setIsExporting] = useState(false);

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  // --- WebGL Initialization ---

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

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
      gl.attachShader(program, v);
      gl.attachShader(program, f);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(program));

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

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay || isExporting) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));

    previewSizeRef.current = { width: w, height: h, dpr: dpr, rect: rect };

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    if (overlay.width !== w || overlay.height !== h) {
      overlay.width = w;
      overlay.height = h;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    }

    if (glRef.current) {
      glRef.current.viewport(0, 0, canvas.width, canvas.height);
    }
  }, [isExporting]);

  const renderGL = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
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
        colors[i * 3 + 0] = c.r / 255;
        colors[i * 3 + 1] = c.g / 255;
        colors[i * 3 + 2] = c.b / 255;
        pointsArr[i * 2 + 0] = p.x;
        pointsArr[i * 2 + 1] = 1.0 - p.y; // Flip Y for WebGL
        intensitiesArr[i] = p.intensity ?? 1;
        radiiArr[i] = p.radius ?? 0.25;
      });
    } else {
      const stopData = sortedStops.slice(0, MAX_STOPS);
      stopCount = stopData.length;
      stopData.forEach((s, i) => {
        const c = hexToRgb(s.color);
        colors[i * 3 + 0] = c.r / 255;
        colors[i * 3 + 1] = c.g / 255;
        colors[i * 3 + 2] = c.b / 255;
        positionsArr[i] = s.position;
        intensitiesArr[i] = s.intensity ?? 1;
      });

      if (mode === "linear") {
        const first = stopData[0] ?? { x: 0, y: 0.5 };
        const last = stopData[stopData.length - 1] ?? { x: 1, y: 0.5 };
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

    gl.uniform1f(
      gl.getUniformLocation(program, "u_brightness"),
      filters.brightness
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "u_contrast"),
      filters.contrast
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "u_saturation"),
      filters.saturation
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "u_temperature"),
      filters.temperature
    );
    gl.uniform1f(gl.getUniformLocation(program, "u_tint"), filters.tint);
    gl.uniform1f(gl.getUniformLocation(program, "u_noise"), filters.noise);
    gl.uniform1f(
      gl.getUniformLocation(program, "u_time"),
      (Date.now() / 1000) % 3600
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [mode, sortedStops, meshPoints, radialPoints, filters]);

  const drawOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas || isExporting) return;

    const container = canvas.getBoundingClientRect();
    if (!container || container.width === 0) return;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, container.width, container.height);

    const toX = (x) => x * container.width;
    const toY = (y) => y * container.height;

    ctx.lineWidth = 2;
    ctx.font = "11px sans-serif";

    if (mode === "linear") {
      const start = sortedStops[0];
      const end = sortedStops[sortedStops.length - 1];
      if (!start || !end) return;

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(toX(start.x), toY(start.y));
      ctx.lineTo(toX(end.x), toY(end.y));
      ctx.stroke();
      ctx.setLineDash([]);

      const dir = { x: end.x - start.x, y: end.y - start.y };
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        const px = start.x + dir.x * s.position;
        const py = start.y + dir.y * s.position;
        const cx = toX(px);
        const cy = toY(py);
        const isSel =
          (selectedPoint?.type === "linear-stop" ||
            selectedPoint?.type === "linear") &&
          selectedPoint?.index === i;
        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      }
    } else if (mode === "radial") {
      const c = radialPoints.center;
      const f = radialPoints.focus;
      const centerX = toX(c.x);
      const centerY = toY(c.y);
      const maxRpx =
        Math.hypot(
          (f.x - c.x) * container.width,
          (f.y - c.y) * container.height
        ) * 2.5;

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(6, maxRpx), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        const r = s.position * maxRpx;
        const cx = centerX + r;
        const cy = centerY;
        const isSel =
          selectedPoint?.type === "radial-stop" && selectedPoint?.index === i;
        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      }

      ["center", "focus"].forEach((k) => {
        const p = radialPoints[k];
        const cx = toX(p.x);
        const cy = toY(p.y);
        const isSel =
          selectedPoint?.type === "radial" && selectedPoint?.point === k;
        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle =
          k === "center"
            ? sortedStops[0]?.color ?? "#fff"
            : sortedStops[sortedStops.length - 1]?.color ?? "#fff";
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      });
    } else if (mode === "mesh") {
      meshPoints.forEach((p, i) => {
        const cx = toX(p.x);
        const cy = toY(p.y);
        const rpx = p.radius * Math.min(container.width, container.height);
        const isSel =
          selectedPoint?.type === "mesh" && selectedPoint?.index === i;

        ctx.beginPath();
        ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(cx, cy, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.stroke();
      });
    }
  }, [
    mode,
    stops,
    sortedStops,
    meshPoints,
    radialPoints,
    selectedPoint,
    isExporting,
  ]);

  // --- Event Handlers ---

  const getPointAtMouse = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const threshold = 0.035;
      const pxThreshold = 12;

      if (mode === "mesh") {
        let closestDist = Infinity;
        let hitIndex = -1;
        meshPoints.forEach((p, i) => {
          const dist = Math.hypot(p.x - x, p.y - y);
          if (dist < threshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
          }
        });
        if (hitIndex !== -1) return { type: "mesh", index: hitIndex };
      } else if (mode === "radial") {
        if (
          Math.hypot(radialPoints.center.x - x, radialPoints.center.y - y) <
          threshold
        )
          return { type: "radial", point: "center" };
        if (
          Math.hypot(radialPoints.focus.x - x, radialPoints.focus.y - y) <
          threshold
        )
          return { type: "radial", point: "focus" };

        const c = radialPoints.center;
        const f = radialPoints.focus;
        const centerX = c.x * rect.width;
        const centerY = c.y * rect.height;
        const maxRpx =
          Math.hypot((f.x - c.x) * rect.width, (f.y - c.y) * rect.height) *
            2.5 || 0.001;

        let closestDist = Infinity;
        let hitIndex = -1;
        for (let i = 0; i < stops.length; i++) {
          const r = stops[i].position * maxRpx;
          const sx = centerX + r;
          const sy = centerY;
          const dx = e.clientX - rect.left - sx;
          const dy = e.clientY - rect.top - sy;
          const dist = Math.hypot(dx, dy);
          if (dist < pxThreshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
          }
        }
        if (hitIndex !== -1) return { type: "radial-stop", index: hitIndex };
      } else {
        const start = sortedStops[0];
        const end = sortedStops[sortedStops.length - 1];
        if (!start || !end) return null;
        const dir = { x: end.x - start.x, y: end.y - start.y };

        let closestDist = Infinity;
        let hitIndex = -1;
        let hitType = "linear-stop";

        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          const px = start.x + dir.x * s.position;
          const py = start.y + dir.y * s.position;
          const dist = Math.hypot(px - x, py - y);

          if (dist < threshold && dist < closestDist) {
            closestDist = dist;
            hitIndex = i;
            const isStart = stops[i] === start;
            const isEnd = stops[i] === end;
            hitType = isStart || isEnd ? "linear" : "linear-stop";
          }
        }
        if (hitIndex !== -1) return { type: hitType, index: hitIndex };
      }
      return null;
    },
    [mode, meshPoints, radialPoints, stops, sortedStops]
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (isExporting) return;
      const hit = getPointAtMouse(e);
      if (hit) {
        setDragging(hit);
        setSelectedPoint(hit);
        return;
      }
      if (mode === "mesh" && e.shiftKey && meshPoints.length < MAX_STOPS) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMeshPoints((prev) => [
          ...prev,
          { x, y, color: randomColor(), radius: 0.25, intensity: 1 },
        ]);
      }
    },
    [getPointAtMouse, mode, meshPoints.length, isExporting]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (isExporting) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      if (!dragging) {
        setHoverPoint(getPointAtMouse(e));
        return;
      }

      if (dragging.type === "mesh") {
        setMeshPoints((prev) =>
          prev.map((p, i) => (i === dragging.index ? { ...p, x, y } : p))
        );
      } else if (dragging.type === "radial") {
        setRadialPoints((prev) => ({ ...prev, [dragging.point]: { x, y } }));
      } else if (dragging.type === "linear") {
        setStops((prev) =>
          prev.map((s, i) => (i === dragging.index ? { ...s, x, y } : s))
        );
      } else if (dragging.type === "linear-stop") {
        setStops((prev) => {
          const sorted = [...prev].sort((a, b) => a.position - b.position);
          const start = sorted[0];
          const end = sorted[sorted.length - 1];
          const t = computeTfromXY(x, y, start, end);

          return prev.map((s, i) =>
            i === dragging.index
              ? {
                  ...s,
                  position: Math.max(0, Math.min(1, t)),
                  x: start.x + (end.x - start.x) * Math.max(0, Math.min(1, t)),
                  y: start.y + (end.y - start.y) * Math.max(0, Math.min(1, t)),
                }
              : s
          );
        });
      } else if (dragging.type === "radial-stop") {
        setStops((prev) => {
          const c = radialPoints.center;
          const f = radialPoints.focus;
          const maxR =
            Math.hypot((f.x - c.x) * rect.width, (f.y - c.y) * rect.height) *
              2.5 || rect.width * 0.5;
          const dx = (x - c.x) * rect.width;
          const dy = (y - c.y) * rect.height;
          const r = Math.hypot(dx, dy);
          const t = Math.max(0, Math.min(1, r / maxR));
          return prev.map((s, i) =>
            i === dragging.index ? { ...s, position: t } : s
          );
        });
      }
    },
    [dragging, getPointAtMouse, radialPoints, isExporting]
  );

  // --- State Updaters ---

  const addStop = useCallback(() => {
    if (stops.length >= MAX_STOPS) return;
    const start = sortedStops[0];
    const end = sortedStops[sortedStops.length - 1];
    const newX = start.x + (end.x - start.x) * 0.5;
    const newY = start.y + (end.y - start.y) * 0.5;

    const newStop = {
      position: 0.5,
      color: randomColor(),
      x: newX,
      y: newY,
      intensity: 1,
    };
    setStops((prev) => [...prev, newStop]);
  }, [stops.length, sortedStops]);

  const removeStop = useCallback(
    (index) => {
      if (stops.length <= 2) return;
      setStops((prev) => prev.filter((_, i) => i !== index));
      if (
        (selectedPoint?.type === "linear-stop" ||
          selectedPoint?.type === "linear" ||
          selectedPoint?.type === "radial-stop") &&
        selectedPoint.index === index
      )
        setSelectedPoint(null);
    },
    [stops.length, selectedPoint]
  );

  const removeMeshPoint = useCallback(
    (index) => {
      if (meshPoints.length <= 2) return;
      setMeshPoints((prev) => prev.filter((_, i) => i !== index));
      if (selectedPoint?.type === "mesh" && selectedPoint.index === index)
        setSelectedPoint(null);
    },
    [meshPoints.length, selectedPoint]
  );

  const exportAsPNG = useCallback(async () => {
    if (!glStatusRef.current.ok || !canvasRef.current || !glRef.current) return;

    setIsExporting(true);
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const overlay = overlayRef.current;

    const { width: oldWidth, height: oldHeight } = previewSizeRef.current;

    if (overlay) overlay.style.display = "none";
    canvas.width = exportSize.width;
    canvas.height = exportSize.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    renderGL();

    try {
      const blob = await new Promise((resolve, reject) => {
        if (canvas.toBlob) {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error("Blob is null"));
          }, "image/png");
        } else {
          reject(new Error("canvas.toBlob is not supported"));
        }
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gradient-${exportSize.width}x${
        exportSize.height
      }-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }

    canvas.width = oldWidth;
    canvas.height = oldHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (overlay) overlay.style.display = "block";

    renderGL();
    drawOverlay();

    setIsExporting(false);
  }, [exportSize, renderGL, drawOverlay]);

  const randomizeGradient = useCallback(() => {
    if (mode === "mesh")
      setMeshPoints((prev) =>
        prev.map((p) => ({
          ...p,
          color: randomColor(),
          intensity: 0.5 + Math.random() * 0.5,
        }))
      );
    else
      setStops((prev) =>
        prev.map((s) => ({
          ...s,
          color: randomColor(),
          intensity: 0.5 + Math.random() * 0.5,
        }))
      );
  }, [mode]);

  const updateSelectedPoint = useCallback(
    (key, value) => {
      if (!selectedPoint) return;
      if (selectedPoint.type === "mesh")
        setMeshPoints((prev) =>
          prev.map((p, i) =>
            i === selectedPoint.index ? { ...p, [key]: value } : p
          )
        );
      else if (
        selectedPoint.type === "linear" ||
        selectedPoint.type === "linear-stop" ||
        selectedPoint.type === "radial-stop"
      )
        setStops((prev) =>
          prev.map((s, i) =>
            i === selectedPoint.index ? { ...s, [key]: value } : s
          )
        );
      else if (selectedPoint.type === "radial" && (key === "x" || key === "y"))
        setRadialPoints((prev) => ({
          ...prev,
          [selectedPoint.point]: { ...prev[selectedPoint.point], [key]: value },
        }));
    },
    [selectedPoint]
  );

  // --- Effects ---

  useEffect(() => {
    setIsClient(true);
    const webGLAvailable = checkWebGLSync();
    if (webGLAvailable) {
      glStatusRef.current.ok = true;
    } else {
      glStatusRef.current = {
        ok: false,
        message: "WebGL not supported by this browser.",
      };
    }
  }, []);

  useEffect(() => {
    if (!isClient || !glStatusRef.current.ok) return;

    const success = initWebGL();
    if (success) {
      resizeCanvas();
      setTimeout(() => {
        renderGL();
        drawOverlay();
      }, 100);
    }

    const onResize = () => {
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);

    const handleKeyDown = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (e.key === "r") randomizeGradient();
      if (e.key === "h") setShowControls((v) => !v);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isClient,
    initWebGL,
    resizeCanvas,
    renderGL,
    drawOverlay,
    randomizeGradient,
  ]);

  useEffect(() => {
    if (!glStatusRef.current.ok || !isClient || isExporting) return;

    let frameId;
    const loop = () => {
      renderGL();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [renderGL, isClient, isExporting]);

  useEffect(() => {
    if (!isClient || isExporting) return;
    drawOverlay();
  }, [drawOverlay, isClient, isExporting]);

  // --- Data for UI ---
  const selectedData = (() => {
    if (!selectedPoint) return null;
    if (selectedPoint.type === "mesh") return meshPoints[selectedPoint.index];
    if (selectedPoint.type === "linear" || selectedPoint.type === "linear-stop")
      return stops[selectedPoint.index];
    if (selectedPoint.type === "radial")
      return radialPoints[selectedPoint.point];
    if (selectedPoint.type === "radial-stop") return stops[selectedPoint.index];
    return null;
  })();

  const getCursor = () => {
    if (dragging) return "grabbing";
    if (hoverPoint) return "grab";
    return "default";
  };

  // --- Render ---

  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
        <div className="text-zinc-400">Loading Studio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Gradient Studio Pro
          </h1>
          <p className="text-zinc-400 text-sm">
            GPU-accelerated gradient editor — linear, radial, mesh. Drag handles
            to edit.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <div
                className="relative w-full"
                style={{ aspectRatio: "16 / 9" }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full rounded border border-zinc-700 block absolute top-0 left-0"
                  aria-label="gradient canvas"
                />
                <canvas
                  ref={overlayRef}
                  className="absolute left-0 top-0 w-full h-full pointer-events-none rounded"
                />

                <div
                  className="absolute inset-0 z-20"
                  role="application"
                  aria-label="gradient editor interaction layer"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  style={{ cursor: getCursor() }}
                />

                {!glStatusRef.current.ok && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-zinc-900/80 rounded">
                    <div className="bg-red-900/80 backdrop-blur-sm border border-red-700 text-sm p-3 rounded text-center">
                      <strong>WebGL Error</strong>
                      <div className="mt-2 text-xs text-red-200">
                        {glStatusRef.current.message ||
                          "WebGL unavailable or initialization failed."}
                      </div>
                    </div>
                  </div>
                )}

                {isExporting && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-zinc-900/80 rounded z-30">
                    <div className="text-white text-lg font-semibold">
                      Exporting...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setMode("linear")}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      mode === "linear"
                        ? "bg-blue-600"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <ArrowUpDown size={16} /> Linear
                  </button>
                  <button
                    onClick={() => setMode("radial")}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      mode === "radial"
                        ? "bg-blue-600"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <Circle size={16} /> Radial
                  </button>
                  <button
                    onClick={() => setMode("mesh")}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      mode === "mesh"
                        ? "bg-blue-600"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <Grid3x3 size={16} /> Mesh
                  </button>

                  <button
                    onClick={randomizeGradient}
                    className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <Shuffle size={16} /> Random
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowControls((v) => !v)}
                    className="px-3 py-2 rounded text-sm bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                  >
                    {showControls ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showControls ? "Hide" : "Show"} UI
                  </button>

                  <div className="flex items-center gap-2">
                    <select
                      value={`${exportSize.width}x${exportSize.height}`}
                      onChange={(e) => {
                        const [width, height] = e.target.value
                          .split("x")
                          .map(Number);
                        setExportSize({ width, height });
                      }}
                      className="bg-zinc-800 rounded px-2 py-2 text-sm appearance-none cursor-pointer hover:bg-zinc-700 transition-colors"
                      aria-label="export size"
                      disabled={isExporting}
                    >
                      {exportPresets.map((p) => (
                        <option key={p.name} value={`${p.width}x${p.height}`}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={exportAsPNG}
                      className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!glStatusRef.current.ok || isExporting}
                    >
                      <Download size={16} />
                      {isExporting ? "Exporting..." : "Export"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showControls && (
              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">
                      {mode === "mesh" ? "Mesh Points" : "Stops"}
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {mode === "mesh"
                        ? meshPoints.map((p, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                                selectedPoint?.type === "mesh" &&
                                selectedPoint.index === i
                                  ? "bg-zinc-700"
                                  : "bg-zinc-800/50 hover:bg-zinc-800"
                              }`}
                            >
                              <input
                                type="color"
                                value={p.color}
                                onChange={(e) =>
                                  setMeshPoints((prev) =>
                                    prev.map((point, idx) =>
                                      idx === i
                                        ? { ...point, color: e.target.value }
                                        : point
                                    )
                                  )
                                }
                                className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer"
                              />
                              <div
                                className="text-sm flex-1 cursor-pointer"
                                onClick={() =>
                                  setSelectedPoint({ type: "mesh", index: i })
                                }
                              >
                                Point {i + 1}
                              </div>
                              <button
                                onClick={() => removeMeshPoint(i)}
                                className="p-1 rounded text-zinc-400 hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50"
                                disabled={meshPoints.length <= 2}
                                aria-label={`Remove point ${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        : stops.map((s, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                                (selectedPoint?.type === "linear-stop" ||
                                  selectedPoint?.type === "linear" ||
                                  selectedPoint?.type === "radial-stop") &&
                                selectedPoint.index === i
                                  ? "bg-zinc-700"
                                  : "bg-zinc-800/50 hover:bg-zinc-800"
                              }`}
                            >
                              <input
                                type="color"
                                value={s.color}
                                onChange={(e) =>
                                  setStops((prev) =>
                                    prev.map((st, idx) =>
                                      idx === i
                                        ? { ...st, color: e.target.value }
                                        : st
                                    )
                                  )
                                }
                                className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer"
                              />
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={s.position}
                                onChange={(e) =>
                                  setStops((prev) =>
                                    prev.map((st, idx) =>
                                      idx === i
                                        ? {
                                            ...st,
                                            position: Number(e.target.value),
                                          }
                                        : st
                                    )
                                  )
                                }
                                className="flex-1"
                              />
                              <button
                                onClick={() => removeStop(i)}
                                className="p-1 rounded text-zinc-400 hover:bg-red-700 hover:text-white transition-colors disabled:opacity-50"
                                disabled={stops.length <= 2}
                                aria-label={`Remove stop ${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={
                          mode === "mesh"
                            ? () =>
                                setMeshPoints((prev) => [
                                  ...prev,
                                  {
                                    x: 0.5,
                                    y: 0.5,
                                    color: randomColor(),
                                    radius: 0.25,
                                    intensity: 1,
                                  },
                                ])
                            : addStop
                        }
                        className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        disabled={
                          mode === "mesh"
                            ? meshPoints.length >= MAX_STOPS
                            : stops.length >= MAX_STOPS
                        }
                        aria-label="Add point or stop"
                      >
                        <Plus size={16} /> Add
                      </button>
                      <button
                        onClick={() => {
                          if (mode === "mesh") setMeshPoints(defaultMesh);
                          else setStops(defaultStops);
                        }}
                        className="px-3 py-1 rounded text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">Filters</h3>
                    <div className="space-y-2">
                      {Object.keys(filters).map((k) => (
                        <div key={k} className="flex items-center gap-2">
                          <label className="w-24 text-sm capitalize text-zinc-300">
                            {k}
                          </label>
                          <input
                            type="range"
                            min={k === "noise" ? 0 : -1}
                            max={1}
                            step={0.01}
                            value={filters[k]}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                [k]: Number(e.target.value),
                              }))
                            }
                            className="flex-1"
                          />
                          <div className="w-10 text-xs text-zinc-400 text-right">
                            {Number(filters[k]).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">Selected</h3>
                    {selectedData ? (
                      <div className="space-y-2 p-2 bg-zinc-800/50 rounded">
                        {"color" in selectedData && (
                          <div className="flex items-center gap-2">
                            <label className="w-16 text-sm text-zinc-300">
                              Color
                            </label>
                            <input
                              type="color"
                              value={selectedData.color}
                              onChange={(e) =>
                                updateSelectedPoint("color", e.target.value)
                              }
                              className="w-7 h-7 p-0 border-none rounded bg-transparent cursor-pointer"
                            />
                          </div>
                        )}

                        {"x" in selectedData && (
                          <div className="flex items-center gap-2">
                            <label className="w-16 text-sm text-zinc-300">
                              X
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={selectedData.x}
                              onChange={(e) =>
                                updateSelectedPoint("x", Number(e.target.value))
                              }
                              className="flex-1"
                            />
                            <div className="w-10 text-xs text-zinc-400 text-right">
                              {selectedData.x.toFixed(2)}
                            </div>
                          </div>
                        )}

                        {"y" in selectedData && (
                          <div className="flex items-center gap-2">
                            <label className="w-16 text-sm text-zinc-300">
                              Y
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={selectedData.y}
                              onChange={(e) =>
                                updateSelectedPoint("y", Number(e.target.value))
                              }
                              className="flex-1"
                            />
                            <div className="w-10 text-xs text-zinc-400 text-right">
                              {selectedData.y.toFixed(2)}
                            </div>
                          </div>
                        )}

                        {"radius" in selectedData && (
                          <div className="flex items-center gap-2">
                            <label className="w-16 text-sm text-zinc-300">
                              Radius
                            </label>
                            <input
                              type="range"
                              min={0.01}
                              max={1}
                              step={0.01}
                              value={selectedData.radius}
                              onChange={(e) =>
                                updateSelectedPoint(
                                  "radius",
                                  Number(e.target.value)
                                )
                              }
                              className="flex-1"
                            />
                            <div className="w-10 text-xs text-zinc-400 text-right">
                              {selectedData.radius.toFixed(2)}
                            </div>
                          </div>
                        )}

                        {"intensity" in selectedData && (
                          <div className="flex items-center gap-2">
                            <label className="w-16 text-sm text-zinc-300">
                              Intensity
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={2}
                              step={0.01}
                              value={selectedData.intensity}
                              onChange={(e) =>
                                updateSelectedPoint(
                                  "intensity",
                                  Number(e.target.value)
                                )
                              }
                              className="flex-1"
                            />
                            <div className="w-10 text-xs text-zinc-400 text-right">
                              {selectedData.intensity.toFixed(2)}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setSelectedPoint(null)}
                            className="px-3 py-1 rounded text-sm bg-zinc-700 hover:bg-zinc-600 transition-colors"
                          >
                            Deselect
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-400 p-2">
                        No selection. Click a handle to edit it.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:col-span-1">
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold">Info & Shortcuts</h3>
              <div className="text-zinc-400 text-sm mt-2">
                WebGL status:{" "}
                <span
                  className={`font-mono ml-2 ${
                    glStatusRef.current.ok
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {glStatusRef.current.ok ? "OK" : "Error"}
                </span>
              </div>
              {!glStatusRef.current.ok && (
                <div className="text-xs text-rose-300 mt-2">
                  {glStatusRef.current.message}
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs text-zinc-400 font-semibold">Shortcuts</p>
                <ul className="text-xs mt-2 space-y-1 text-zinc-300">
                  <li>
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">r</kbd>
                    {"  "}
                    Randomize colors
                  </li>
                  <li>
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">h</kbd>
                    {"  "}
                    Toggle UI panels
                  </li>
                  <li>
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">
                      Shift+Click
                    </kbd>
                    {"  "}
                    Add mesh point
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold">Presets</h3>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setStops([
                      {
                        position: 0,
                        color: "#0EA5A4",
                        x: 0.2,
                        y: 0.5,
                        intensity: 1,
                      },
                      {
                        position: 1,
                        color: "#7DD3FC",
                        x: 0.8,
                        y: 0.5,
                        intensity: 1,
                      },
                    ]);
                    setMode("linear");
                  }}
                  className="px-3 py-1 rounded text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cool
                </button>
                <button
                  onClick={() => {
                    setStops([
                      {
                        position: 0,
                        color: "#FF7AB6",
                        x: 0.2,
                        y: 0.5,
                        intensity: 1,
                      },
                      {
                        position: 1,
                        color: "#7C3AED",
                        x: 0.8,
                        y: 0.5,
                        intensity: 1,
                      },
                    ]);
                    setMode("linear");
                  }}
                  className="px-3 py-1 rounded text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Vivid
                </button>
                <button
                  onClick={() => {
                    setMeshPoints(defaultMesh);
                    setMode("mesh");
                  }}
                  className="px-3 py-1 rounded text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Mesh Default
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
