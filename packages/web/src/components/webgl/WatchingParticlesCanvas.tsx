import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_opacity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec3 palette(float t) {
    vec3 c1 = vec3(0.62, 0.47, 0.93);
    vec3 c2 = vec3(0.41, 0.25, 0.78);
    vec3 c3 = vec3(0.95, 0.55, 0.75);
    vec3 c4 = vec3(0.35, 0.55, 0.95);
    return mix(mix(c1, c2, t), mix(c3, c4, t), 0.5 + 0.5 * sin(t * 6.28318));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time;
    vec3 color = vec3(0.0);
    float alpha = 0.0;

    float density = smoothstep(0.15, 0.95, 1.0 - uv.y);

    for (float i = 0.0; i < 14.0; i += 1.0) {
      for (float j = 0.0; j < 22.0; j += 1.0) {
        vec2 cellId = vec2(i, j);
        vec2 rnd = vec2(hash(cellId), hash(cellId + 17.0));
        vec2 pos = (cellId + rnd) / vec2(14.0, 22.0);
        pos.y = fract(pos.y - t * (0.015 + rnd.x * 0.025));
        pos.x += sin(t * 0.45 + rnd.y * 6.28318) * 0.018;

        float dist = length(uv - pos);
        float glow = smoothstep(0.012, 0.0, dist);
        float star = glow * (0.35 + rnd.x * 0.45) * density;
        vec3 starColor = palette(rnd.y);
        color += starColor * star;
        alpha += star * 0.85;
      }
    }

    float aurora = 0.0;
    for (float k = 0.0; k < 4.0; k += 1.0) {
      float bandY = 0.18 + k * 0.17 + sin(p.x * 2.8 + t * 0.08 + k * 1.4) * 0.07;
      float wave = sin(p.x * 4.5 + t * 0.12 + k * 2.1) * 0.025;
      float band = smoothstep(0.07, 0.0, abs(uv.y - bandY - wave));
      aurora += band * (0.06 + k * 0.012);
    }

    vec3 auroraColor = mix(
      vec3(0.62, 0.47, 0.93),
      vec3(0.95, 0.55, 0.75),
      0.5 + 0.5 * sin(t * 0.2)
    );
    color += auroraColor * aurora;
    alpha += aurora * 0.35;

    color = clamp(color, 0.0, 1.0);
    alpha = clamp(alpha * u_opacity, 0.0, 0.55);
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

export function WatchingParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

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

    const opacity = 0.1;

    let paused = document.hidden;
    let inView = true;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !paused && !prefersReducedMotion) {
          startRef.current = performance.now();
          rafRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused && inView && !prefersReducedMotion) {
        startRef.current = performance.now();
        rafRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const render = (now: number) => {
      if (paused || !inView) return;

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
      gl.uniform1f(opacityLoc, opacity);
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
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      intersectionObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-[5]"
      aria-hidden="true"
    />,
    document.body,
  );
}
