import { MAX_STOPS } from "./constants";

export const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
  }
`;

export const fragmentShaderSource = `
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

  // --- SPECTRA NOISE FUNCTION ---
  // This is the exact math from the code you liked.
  // It creates a pseudo-random hash for every single pixel.
  float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
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

    // --- APPLY SPECTRA NOISE ---
    if (u_noise > 0.0) {
       // 1. gl_FragCoord.xy = ensures noise is 1 pixel size (sharp)
       // 2. + u_time = ensures noise dances every frame (animated)
       // 3. - 0.5 = ensures noise adds AND subtracts brightness (centered)
       
       float noise = (rand(gl_FragCoord.xy + u_time) - 0.5) * u_noise;
       color += noise;
    }

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;
