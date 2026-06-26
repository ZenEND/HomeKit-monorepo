import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// fBm nebula atmosphere + 5 Lissajous orbs with Gaussian glow + edge vignette
const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_opacity;

  float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 17.5);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // 4-octave fBm — unrolled for mediump / mobile perf
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    v += a * vnoise(p); p *= 2.0; a *= 0.5;
    v += a * vnoise(p); p *= 2.0; a *= 0.5;
    v += a * vnoise(p); p *= 2.0; a *= 0.5;
    v += a * vnoise(p);
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 st = uv * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    // Very slow time — cinematic drift, not twitchy animation
    float t = u_time * 0.07;

    // ---- 5 Lissajous orb centers ----
    // Each uses two sine/cosine terms with incommensurable frequencies so
    // paths never perfectly repeat, giving organic wandering motion.
    vec2 c0 = vec2(
      sin(t * 0.71) * 0.55 + sin(t * 0.19) * 0.18,
      cos(t * 0.47) * 0.48 + cos(t * 0.31) * 0.15
    );
    vec2 c1 = vec2(
      cos(t * 0.53 + 1.57) * 0.50 + cos(t * 0.23) * 0.20,
      sin(t * 0.37 + 0.50) * 0.55
    );
    vec2 c2 = vec2(
      sin(t * 0.29 + 2.10) * 0.60,
      cos(t * 0.61 + 3.14) * 0.45 + sin(t * 0.11) * 0.18
    );
    vec2 c3 = vec2(
      cos(t * 0.41) * 0.45 + sin(t * 0.17 + 1.00) * 0.22,
      sin(t * 0.33 + 4.00) * 0.52
    );
    vec2 c4 = vec2(
      sin(t * 0.57 + 3.00) * 0.52 + cos(t * 0.13) * 0.15,
      cos(t * 0.43 + 1.50) * 0.48
    );

    // Gaussian soft glow — exp(-d²·k) produces large, visible soft blobs
    // (far more perceptible than the old 1/dist falloff)
    vec2 d0 = st - c0; float g0 = exp(-dot(d0, d0) * 1.80);
    vec2 d1 = st - c1; float g1 = exp(-dot(d1, d1) * 2.20);
    vec2 d2 = st - c2; float g2 = exp(-dot(d2, d2) * 1.60);
    vec2 d3 = st - c3; float g3 = exp(-dot(d3, d3) * 2.50);
    vec2 d4 = st - c4; float g4 = exp(-dot(d4, d4) * 2.00);

    // Brand color palette
    // hsl(260,70%,60%) purple  → ~(0.55, 0.35, 0.90)
    // hsl(230,60%,55%) blue    → ~(0.28, 0.48, 0.88)
    // hsl(320,70%,65%) pink    → ~(0.90, 0.45, 0.70)
    // hsl(275,65%,58%) violet  → ~(0.65, 0.30, 0.82)
    // hsl(340,75%,70%) rose    → ~(0.92, 0.55, 0.78)
    vec3 purple = vec3(0.55, 0.35, 0.90);
    vec3 blue   = vec3(0.28, 0.48, 0.88);
    vec3 pink   = vec3(0.90, 0.45, 0.70);
    vec3 violet = vec3(0.65, 0.30, 0.82);
    vec3 rose   = vec3(0.92, 0.55, 0.78);

    vec3 color = purple * g0 * 0.90
               + blue   * g1 * 0.85
               + pink   * g2 * 0.75
               + violet * g3 * 0.70
               + rose   * g4 * 0.65;

    // ---- fBm nebula overlay ----
    // Two layers of fBm with slightly different speeds for depth parallax
    vec2 noiseUv = st * 0.75 + vec2(t * 0.12, t * 0.07);
    float f1 = fbm(noiseUv);
    float f2 = fbm(noiseUv * 1.6 + vec2(3.7, 1.3));
    float nebulaMask = smoothstep(0.30, 0.70, f1 * 0.65 + f2 * 0.35);

    vec3 nebulaColor = mix(blue * 0.45, purple * 0.55, f1);
    color += nebulaColor * nebulaMask * 0.35;

    // ---- Edge vignette ----
    float vign = 1.0 - smoothstep(0.50, 1.30, length(st * 0.65));
    color *= vign;

    color = clamp(color, 0.0, 1.0);

    // Alpha from luminance so fringe pixels fade naturally
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    float alpha = clamp(luma * u_opacity * 2.5, 0.0, u_opacity);

    gl_FragColor = vec4(color, alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const opacityRef = useRef(resolvedTheme === 'dark' ? 0.45 : 0.15);

  useEffect(() => {
    opacityRef.current = resolvedTheme === 'dark' ? 0.45 : 0.15;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const opacityLoc = gl.getUniformLocation(program, 'u_opacity');

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let paused = document.hidden;
    let inView = true;
    let destroyed = false;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !paused && !destroyed && !prefersReducedMotion) {
          startRef.current = performance.now();
          rafRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused && inView && !destroyed && !prefersReducedMotion) {
        startRef.current = performance.now();
        rafRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const render = (now: number) => {
      if (paused || !inView || destroyed) return;

      if (!startRef.current) startRef.current = now;
      const elapsed = prefersReducedMotion ? 0 : (now - startRef.current) / 1000;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform1f(opacityLoc, opacityRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReducedMotion) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    if (!prefersReducedMotion) {
      rafRef.current = requestAnimationFrame(render);
    } else {
      render(performance.now());
    }

    return () => {
      destroyed = true;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      intersectionObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
