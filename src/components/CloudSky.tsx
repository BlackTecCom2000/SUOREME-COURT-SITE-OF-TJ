import React, { useEffect, useRef } from 'react';

/**
 * CloudSky â€” WebGL procedural cloud layer for the global background.
 *
 * Renders an animated sky (gradient + two parallax cloud decks + cirrus veil +
 * sun glow). It sits BEHIND the Supreme Court photograph, and the photograph is
 * masked so the live clouds show through around the building.
 *
 * Design constraints (see AGENTS.md):
 *  - no new dependency: raw WebGL, no three.js on this path
 *  - pointer tracking is bound to `window`, not the canvas, because the whole
 *    background stack is `pointer-events-none` (clouds must still react)
 *  - pauses when the tab is hidden and when the user prefers reduced motion
 *  - renders at a reduced internal resolution and is upscaled by CSS: clouds are
 *    soft, so this is visually free but keeps the fragment shader cheap
 */

const MAX_DPR = 2;

const PUFF_UP = 0.34;
const PUFF_DOWN = 0.19;
const ERODE = 0.7;
const SHADOW_STEP = 0.085;
const NEAR_CELL = 1.05;
const FAR_CELL = 2.15;
const FAR_MIX = 0.55;
const NEAR_DRIFT = 0.055;
const FAR_DRIFT = 0.026;
const CIRRUS_DRIFT = 0.014;
const PUFF_WMAX = 2.15;
const SHADE_BLEND = 12.0;

const VERT_SRC = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uNearX, uFarX, uCirrusX;
uniform float uCoverage, uSize, uSoftness, uShadow, uCirrus;
uniform vec3 uZenith, uHorizon, uCloud;
uniform vec4 uGlow;
uniform vec2 uSun;
uniform vec2 uParallax;

vec2 hash22(vec2 p){
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}

float hash12(vec2 p){
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 x){
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++){
    s += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

vec2 blobs(vec2 uv, float seed){
  vec2 id = floor(uv), f = fract(uv);

  float best = -1e4;
  float wsum = 0.0, ysum = 0.0;
  float wMax = min(${PUFF_WMAX.toFixed(3)}, 0.72 * uSize);
  float reach = min(2.0, ceil(wMax + 0.85) - 1.0);
  for (int j = -2; j <= 2; j++){
    for (int i = -2; i <= 2; i++){
      vec2 o = vec2(float(i), float(j));
      if (max(abs(o.x), abs(o.y)) > reach) continue;
      vec2 h = hash22(id + o + seed);

      if (fract(h.x * 37.1) > uCoverage) continue;
      vec2 c = o + 0.15 + h * 0.7;
      float w = min(${PUFF_WMAX.toFixed(3)}, (0.30 + 0.42 * fract(h.y * 19.7)) * uSize);
      vec2 d = f - c;

      float ry = (d.y > 0.0 ? ${PUFF_UP.toFixed(3)} : ${PUFF_DOWN.toFixed(3)}) * uSize * (0.8 + 0.5 * fract(h.y * 7.3));
      float e = length(vec2(d.x / max(w, 1e-3), d.y / max(ry, 1e-3)));
      float val = 1.0 - e;
      float yN = d.y / max(ry, 1e-3);
      if (val > best){
        float k = exp(${SHADE_BLEND.toFixed(1)} * (best - val));
        wsum = wsum * k + 1.0;
        ysum = ysum * k + yN;
        best = val;
      } else {
        float g = exp(${SHADE_BLEND.toFixed(1)} * (val - best));
        wsum += g;
        ysum += g * yN;
      }
    }
  }
  return vec2(best, ysum / max(wsum, 1e-4));
}

vec2 cloudField(vec2 uv, float seed, float detailScale){
  vec2 b = blobs(uv, seed);

  float n = fbm(uv * detailScale + seed * 3.1) * 0.72
          + fbm(uv * detailScale * 3.3 + seed * 7.7) * 0.28;
  return vec2(b.x - (1.0 - n) * ${ERODE.toFixed(3)}, b.y);
}

vec3 shadeCloud(float dyNorm, vec3 sky){
  float t = smoothstep(-0.95, 0.25, dyNorm);
  vec3 base = mix(uCloud * 0.52, sky, 0.34);
  return mix(mix(uCloud, base, uShadow), uCloud, t);
}

void main(){
  vec2 frag = gl_FragCoord.xy / max(uRes.y, 1.0);
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(frag.x, frag.y);

  vec3 sky = mix(uHorizon, uZenith, smoothstep(-0.15, 1.05, p.y));
  vec2 sunP = vec2(uSun.x * aspect, uSun.y);
  float sd = length(p - sunP);

  sky += uGlow.rgb * uGlow.a * exp(-sd * 3.4) * 0.30;

  vec3 col = sky;

  if (uCirrus > 0.0) {
    vec2 cuv = vec2(p.x * 1.4 + uCirrusX, p.y * 5.5);
    float veil = fbm(cuv) * fbm(cuv * 2.3 + 9.0);
    veil = smoothstep(0.24, 0.55, veil) * smoothstep(0.15, 0.7, p.y);
    col = mix(col, uCloud, veil * uCirrus * 0.5);
  }

  vec2 fuv = vec2(p.x + uFarX, p.y) * ${FAR_CELL.toFixed(3)} + uParallax * 0.4;
  vec2 fd = cloudField(fuv, 17.0, 11.0);
  float fa = clamp(fd.x * uSoftness, 0.0, 1.0);
  if (fa > 0.0) {
    vec3 lit = shadeCloud(fd.y, sky);

    col = mix(col, mix(lit, sky, ${FAR_MIX.toFixed(3)}), fa);
  }

  vec2 nuv = vec2(p.x + uNearX, p.y) * ${NEAR_CELL.toFixed(3)} + uParallax;
  vec2 nd = cloudField(nuv, 3.0, 8.5);
  float na = clamp(nd.x * uSoftness, 0.0, 1.0);
  if (na > 0.0) {
    vec3 lit = shadeCloud(nd.y, sky);

    float above = clamp(cloudField(nuv + vec2(0.0, ${SHADOW_STEP.toFixed(3)}), 3.0, 8.5).x * uSoftness, 0.0, 1.0);
    lit *= 1.0 - 0.18 * uShadow * above;

    lit += uGlow.rgb * uGlow.a * 0.22 * exp(-length(p - sunP) * 1.6);
    col = mix(col, lit, na);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.error('CloudSky shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

type RGBA = [number, number, number, number];

function parseColor(input: string | undefined, fb: RGBA): RGBA {
  if (!input) return fb;
  const str = String(input).trim();
  if (str.charAt(0) === '#') {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + (hex.length === 4 ? hex[3] + hex[3] : '');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255, a];
    }
    return fb;
  }
  const m = str.match(/[\d.]+/g);
  if (m && m.length >= 3) {
    return [
      Math.min(255, parseFloat(m[0])) / 255,
      Math.min(255, parseFloat(m[1])) / 255,
      Math.min(255, parseFloat(m[2])) / 255,
      m.length >= 4 ? Math.min(1, parseFloat(m[3])) : 1,
    ];
  }
  return fb;
}

const num = (v: unknown, fb: number) => (typeof v === 'number' && isFinite(v) ? v : fb);
const clampN = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export interface CloudSkyProps {
  style?: React.CSSProperties;
  className?: string;
  /** sky colour at the top of the screen */
  background?: string;
  /** sky colour at the horizon */
  baseColor?: string;
  /** cloud body colour */
  accentColor?: string;
  /** 0-100, how much of the sky is filled with cloud */
  density?: number;
  /** 0-100, horizontal travel speed */
  speed?: number;
  /** 20-300, puff size */
  size?: number;
  clouds?: { softness?: number; shadow?: number; cirrus?: number };
  sun?: { x?: number; y?: number; glow?: string };
  pointer?: { parallax?: number; wind?: number; damping?: number };
  /** internal render scale, 0.25-1 â€” lower is cheaper and looks the same for soft clouds */
  resolutionScale?: number;
  /** 0-1, global fade so the layer can be dialled per theme */
  opacity?: number;
  /** force the animation off (also honoured automatically for reduced motion) */
  paused?: boolean;
}

const DEFAULTS = {
  softness: 100,
  shadow: 100,
  cirrus: 45,
  sunX: 78,
  sunY: 92,
  glow: 'rgba(232, 243, 255, 0.9)',
  parallax: 100,
  wind: 100,
  damping: 20,
};

export const CloudSky: React.FC<CloudSkyProps> = ({
  style,
  className,
  background = '#2f6fb5',
  baseColor = '#b9d6f0',
  accentColor = '#ffffff',
  density = 100,
  speed = 64,
  size = 130,
  clouds,
  sun,
  pointer,
  resolutionScale = 0.5,
  opacity = 1,
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  sizeRef.current = { w: 0, h: 0 };

  const vRef = useRef<Record<string, number | string>>({});
  vRef.current = {
    zenith: background,
    horizon: baseColor,
    cloud: accentColor,
    glow: (sun && sun.glow) || DEFAULTS.glow,
    coverage: clampN(num(density, 55), 0, 100) / 100,
    speed: clampN(num(speed, 50), 0, 100) / 50,
    size: clampN(num(size, 100), 20, 300) / 100,
    softness: 4.5 / Math.max(0.15, clampN(num(clouds?.softness, DEFAULTS.softness), 20, 300) / 100),
    shadow: clampN(num(clouds?.shadow, DEFAULTS.shadow), 0, 200) / 100,
    cirrus: clampN(num(clouds?.cirrus, DEFAULTS.cirrus), 0, 100) / 100,
    sunX: clampN(num(sun?.x, DEFAULTS.sunX), 0, 100) / 100,
    sunY: clampN(num(sun?.y, DEFAULTS.sunY), 0, 100) / 100,
    parallax: clampN(num(pointer?.parallax, DEFAULTS.parallax), 0, 300) / 100,
    wind: clampN(num(pointer?.wind, DEFAULTS.wind), 0, 300) / 100,
    damping: clampN(num(pointer?.damping, DEFAULTS.damping), 1, 100),
  };

  const ptrRef = useRef({ x: 0, y: 0, inside: false });
  const scaleRef = useRef(resolutionScale);
  scaleRef.current = clampN(resolutionScale, 0.2, 1);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', { alpha: false, antialias: false, depth: false }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (import.meta.env.DEV) console.error('CloudSky link:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const locs: Record<string, WebGLUniformLocation | null> = {};
    const u = (name: string) => {
      if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
      return locs[name];
    };

    let raf = 0;
    let running = true;
    let last = performance.now();

    let nearX = 0;
    let farX = 0;
    let cirrusX = 0;
    let leanX = 0;
    let leanY = 0;

    const draw = () => {
      raf = 0;
      const v = vRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * scaleRef.current;
      const cw = canvas.clientWidth || window.innerWidth;
      const ch = canvas.clientHeight || window.innerHeight;
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);

      const zen = parseColor(v.zenith as string, [0.184, 0.435, 0.71, 1]);
      const hor = parseColor(v.horizon as string, [0.725, 0.839, 0.941, 1]);
      const cld = parseColor(v.cloud as string, [1, 1, 1, 1]);
      const glow = parseColor(v.glow as string, [0.91, 0.953, 1, 0.9]);

      gl.uniform2f(u('uRes'), bw, bh);
      gl.uniform1f(u('uNearX'), nearX);
      gl.uniform1f(u('uFarX'), farX);
      gl.uniform1f(u('uCirrusX'), cirrusX);
      gl.uniform1f(u('uCoverage'), v.coverage as number);
      gl.uniform1f(u('uSize'), v.size as number);
      gl.uniform1f(u('uSoftness'), v.softness as number);
      gl.uniform1f(u('uShadow'), v.shadow as number);
      gl.uniform1f(u('uCirrus'), v.cirrus as number);
      gl.uniform2f(u('uSun'), v.sunX as number, v.sunY as number);
      gl.uniform2f(
        u('uParallax'),
        -leanX * (v.parallax as number) * 0.07,
        -leanY * (v.parallax as number) * 0.05
      );
      gl.uniform3f(u('uZenith'), zen[0], zen[1], zen[2]);
      gl.uniform3f(u('uHorizon'), hor[0], hor[1], hor[2]);
      gl.uniform3f(u('uCloud'), cld[0], cld[1], cld[2]);
      gl.uniform4f(u('uGlow'), glow[0], glow[1], glow[2], glow[3]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = vRef.current;
      const p = ptrRef.current;

      const k = 1 - Math.exp(-(v.damping as number) * 0.12 * dt);
      leanX += ((p.inside ? p.x : 0) - leanX) * k;
      leanY += ((p.inside ? p.y : 0) - leanY) * k;

      const gust = 1 + leanX * (v.wind as number);
      const rate = (v.speed as number) * gust;
      nearX = (nearX - NEAR_DRIFT * rate * dt) % 1000;
      farX = (farX - FAR_DRIFT * rate * dt) % 1000;
      cirrusX = (cirrusX - CIRRUS_DRIFT * rate * dt) % 1000;

      draw();
      if (running) raf = requestAnimationFrame(render);
    };

    const loop = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(render);
    };

    const stop = () => {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // pointer is tracked on the window: the background stack is pointer-events-none
    const track = (e: PointerEvent) => {
      ptrRef.current.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      ptrRef.current.y = 1 - (e.clientY / Math.max(1, window.innerHeight)) * 2;
      ptrRef.current.inside = true;
    };
    const onLeave = () => {
      ptrRef.current.inside = false;
    };

    // honour reduced motion: render one static frame, then idle
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = () => mq.matches;
    const syncRunState = () => {
      if (pausedRef.current || reduce() || document.hidden) {
        stop();
        draw();
      } else {
        running = true;
        loop();
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else syncRunState();
    };
    const onResize = () => draw();

    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    if (mq.addEventListener) mq.addEventListener('change', syncRunState);
    else if (mq.addListener) mq.addListener(syncRunState);

    syncRunState();

    return () => {
      stop();
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (mq.removeEventListener) mq.removeEventListener('change', syncRunState);
      else if (mq.removeListener) mq.removeListener(syncRunState);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
    // mount once: every prop is read through refs on each frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', opacity, ...style }}
    />
  );
};

export default CloudSky;

