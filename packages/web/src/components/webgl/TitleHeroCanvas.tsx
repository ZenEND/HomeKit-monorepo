import { useEffect, useRef } from 'react';
import type { SimklMediaType } from '@/api/plans';

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
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.12;
    vec2 origin = vec2(0.0, -1.15);

    float angle = atan(p.y - origin.y, p.x - origin.x);
    float rays = 0.0;

    for (float i = 0.0; i < 6.0; i += 1.0) {
      float rayAngle = t * (0.35 + i * 0.08) + i * 1.047;
      float diff = abs(mod(angle - rayAngle + 3.14159, 6.28318) - 3.14159);
      float cone = smoothstep(0.55, 0.0, diff);
      float pulse = 0.65 + 0.35 * sin(t * 1.4 + i * 1.3);
      rays += cone * pulse * (0.18 + 0.12 * sin(i));
    }

    float dist = length(p - origin);
    float falloff = 1.0 / (dist * 1.8 + 0.25);
    float glow = exp(-dist * 1.6) * 0.35;

    vec3 color = mix(u_colorA, u_colorB, 0.5 + 0.5 * sin(t * 0.6 + angle));
    color *= rays * falloff + glow;

    float vignette = smoothstep(1.4, 0.2, length(p));
    color *= vignette;

    float alpha = clamp(length(color) * u_opacity, 0.0, 0.65);
    gl_FragColor = vec4(color, alpha);
  }
`;

const MEDIA_PALETTES: Record<
  SimklMediaType,
  { colorA: [number, number, number]; colorB: [number, number, number] }
> = {
  anime: {
    colorA: [0.62, 0.48, 0.92],
    colorB: [0.96, 0.45, 0.71],
  },
  tv: {
    colorA: [0.22, 0.74, 0.97],
    colorB: [0.18, 0.83, 0.75],
  },
  movie: {
    colorA: [0.98, 0.75, 0.14],
    colorB: [0.98, 0.57, 0.24],
  },
};

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

interface TitleHeroCanvasProps {
  mediaType: SimklMediaType;
  className?: string;
}

export function TitleHeroCanvas({ mediaType, className }: TitleHeroCanvasProps) {
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
    const colorALoc = gl.getUniformLocation(program, 'u_colorA');
    const colorBLoc = gl.getUniformLocation(program, 'u_colorB');

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const palette = MEDIA_PALETTES[mediaType] ?? MEDIA_PALETTES.anime;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement ?? canvas);

    let paused = document.hidden;

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) {
        startRef.current = performance.now();
        rafRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const render = (now: number) => {
      if (paused) return;

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
      gl.uniform1f(opacityLoc, 0.35);
      gl.uniform3f(colorALoc, palette.colorA[0], palette.colorA[1], palette.colorA[2]);
      gl.uniform3f(colorBLoc, palette.colorB[0], palette.colorB[1], palette.colorB[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };

    if (!prefersReducedMotion) {
      rafRef.current = requestAnimationFrame(render);
    } else {
      render(performance.now());
    }

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [mediaType]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
