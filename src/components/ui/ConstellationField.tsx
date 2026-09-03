import * as React from 'react';
import { useEffect, useRef } from 'react';

const MAX_DPR = 2;
const MAX_EDGES = 6000;
const PULL_REACH = 220; // px, pointer gravity radius
const PULL_RATE = 0.3; // per second at Hover 100%

const LINE_VERT = `
precision highp float;

attribute vec2  a_p0;
attribute vec2  a_p1;
attribute vec2  a_corner;   // x: which end (0|1), y: which side (-1|1)
attribute float a_alpha;

uniform vec2  uSize;    // CSS px
uniform float uWidth;   // CSS px

varying float v_alpha;
varying float v_off;
varying float v_half;

void main(){
  vec2 d = a_p1 - a_p0;
  float len = max(length(d), 1e-5);
  vec2 nrm = vec2(-d.y, d.x) / len;

  float half_ = max(uWidth * 0.5, 0.35);
  float ext = half_ + 0.75;
  vec2 p = mix(a_p0, a_p1, a_corner.x);
  p += nrm * a_corner.y * ext;

  v_alpha = a_alpha;
  v_off = a_corner.y * ext;
  v_half = half_;
  gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0.0, 1.0);
}
`;

const LINE_FRAG = `
precision mediump float;

uniform vec3 uColor;

varying float v_alpha;
varying float v_off;
varying float v_half;

void main(){
  float cov = clamp((v_half - abs(v_off)) / 0.75 + 0.5, 0.0, 1.0);
  float a = v_alpha * cov;
  gl_FragColor = vec4(uColor * a, a);
}
`;

const NODE_VERT = `
precision highp float;

attribute vec2  a_pos;
attribute float a_radius;
attribute float a_pulse;

uniform vec2  uSize;
uniform float uDpr, uHalo;

varying float v_pulse;
varying float v_core;

void main(){
  float sprite = a_radius * uHalo * 2.0;
  gl_PointSize = max(2.0, sprite * uDpr);
  v_pulse = a_pulse;
  v_core = 1.0 / max(uHalo, 1.0);
  gl_Position = vec4(a_pos.x / uSize.x * 2.0 - 1.0, 1.0 - a_pos.y / uSize.y * 2.0, 0.0, 1.0);
}
`;

const NODE_FRAG = `
precision mediump float;

uniform vec3 uColor;

varying float v_pulse;
varying float v_core;

void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float halo = (1.0 - smoothstep(0.88, 1.0, d)) * 0.28;
  float core = 1.0 - smoothstep(v_core - 0.12, v_core + 0.02, d);
  float a = clamp(v_pulse * (halo + core), 0.0, 1.0);
  if (a <= 0.002) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('ConstellationField shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('ConstellationField link:', gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function parseColor(input: string | undefined, fb: [number, number, number]): [number, number, number] {
  if (!input) return fb;
  const str = String(input).trim();
  if (str.charAt(0) === '#') {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
    }
    return fb;
  }
  const m = str.match(/[\d.]+/g);
  if (m && m.length >= 3) {
    return [
      Math.min(255, parseFloat(m[0])) / 255,
      Math.min(255, parseFloat(m[1])) / 255,
      Math.min(255, parseFloat(m[2])) / 255,
    ];
  }
  return fb;
}

function num(v: unknown, fb: number): number {
  return typeof v === 'number' && isFinite(v) ? v : fb;
}

function clampN(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CORNERS = [
  [0, -1],
  [1, -1],
  [1, 1],
  [0, -1],
  [1, 1],
  [0, 1],
];

export interface NetworkGroup {
  lineWidth?: number;
  halo?: number;
  pulse?: number;
}

export interface ConstellationFieldProps {
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
  background?: string;
  baseColor?: string;
  accentColor?: string;
  density?: number;
  dotSize?: number;
  speed?: number;
  hover?: number;
  linkDistance?: number;
  network?: NetworkGroup;
}

const NETWORK_DEFAULTS: Required<NetworkGroup> = { lineWidth: 100, halo: 240, pulse: 100 };

export const ConstellationField: React.FC<ConstellationFieldProps> = ({
  style,
  className = '',
  background = 'transparent',
  baseColor = '#00DC82',
  accentColor = '#00DC82',
  density = 95,
  dotSize = 110,
  speed = 45,
  hover = 100,
  linkDistance = 160,
  network,
  width,
  height,
}) => {
  const network_ = { ...NETWORK_DEFAULTS, ...(network || {}) };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  sizeRef.current = { w: num(width, 0), h: num(height, 0) };

  const ptrRef = useRef({ x: -10000, y: -10000 });

  const vRef = useRef<Record<string, number | string>>({});
  vRef.current = {
    base: baseColor,
    accent: accentColor,
    density: Math.round(clampN(num(density, 85), 10, 300)),
    dotSize: clampN(num(dotSize, 100), 20, 400) / 100,
    speed: clampN(num(speed, 50), 0, 100) / 50,
    hover: clampN(num(hover, 100), 0, 200) / 100,
    linkDistance: clampN(num(linkDistance, 160), 40, 400),
    lineWidth: clampN(num(network_.lineWidth, 100), 20, 400) / 100,
    halo: clampN(num(network_.halo, 240), 100, 500) / 100,
    pulse: clampN(num(network_.pulse, 100), 0, 200) / 100,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
    });
    if (!gl) {
      console.warn('ConstellationField: WebGL unavailable');
      return;
    }

    const lineProg = link(gl, LINE_VERT, LINE_FRAG);
    const nodeProg = link(gl, NODE_VERT, NODE_FRAG);
    if (!lineProg || !nodeProg) return;

    const locs = new Map<string, WebGLUniformLocation | null>();
    const u = (prog: WebGLProgram, name: string) => {
      const key = (prog === lineProg ? 'L:' : 'N:') + name;
      if (!locs.has(key)) locs.set(key, gl.getUniformLocation(prog, name));
      return locs.get(key) as WebGLUniformLocation | null;
    };

    const eP0 = new Float32Array(MAX_EDGES * 6 * 2);
    const eP1 = new Float32Array(MAX_EDGES * 6 * 2);
    const eCorner = new Float32Array(MAX_EDGES * 6 * 2);
    const eAlpha = new Float32Array(MAX_EDGES * 6);
    for (let e = 0; e < MAX_EDGES; e++) {
      for (let c = 0; c < 6; c++) {
        const k = (e * 6 + c) * 2;
        eCorner[k] = CORNERS[c][0];
        eCorner[k + 1] = CORNERS[c][1];
      }
    }
    const bP0 = gl.createBuffer();
    const bP1 = gl.createBuffer();
    const bCorner = gl.createBuffer();
    const bAlpha = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bP0);
    gl.bufferData(gl.ARRAY_BUFFER, eP0.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bP1);
    gl.bufferData(gl.ARRAY_BUFFER, eP1.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bCorner);
    gl.bufferData(gl.ARRAY_BUFFER, eCorner, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bAlpha);
    gl.bufferData(gl.ARRAY_BUFFER, eAlpha.byteLength, gl.DYNAMIC_DRAW);

    let nodeCount = 0;
    let nx = new Float32Array(0);
    let ny = new Float32Array(0);
    let nvx = new Float32Array(0);
    let nvy = new Float32Array(0);
    let nr = new Float32Array(0);
    let nPos = new Float32Array(0);
    let nRad = new Float32Array(0);
    let nPulse = new Float32Array(0);
    const bNodePos = gl.createBuffer();
    const bNodeRad = gl.createBuffer();
    const bNodePulse = gl.createBuffer();

    const build = (n: number, w: number, h: number) => {
      const R = rng(20260824);
      nodeCount = n;
      nx = new Float32Array(n);
      ny = new Float32Array(n);
      nvx = new Float32Array(n);
      nvy = new Float32Array(n);
      nr = new Float32Array(n);
      nPos = new Float32Array(n * 2);
      nRad = new Float32Array(n);
      nPulse = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        nx[i] = R() * w;
        ny[i] = R() * h;
        nvx[i] = (R() - 0.5) * 0.3 * 60;
        nvy[i] = (R() - 0.5) * 0.3 * 60;
        nr[i] = R() * 2.4 + 1.8;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, bNodePos);
      gl.bufferData(gl.ARRAY_BUFFER, nPos.byteLength, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bNodeRad);
      gl.bufferData(gl.ARRAY_BUFFER, nRad.byteLength, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bNodePulse);
      gl.bufferData(gl.ARRAY_BUFFER, nPulse.byteLength, gl.DYNAMIC_DRAW);
    };

    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let builtFor = -1;
    let builtW = 0;
    let builtH = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = vRef.current;
      const sp = v.speed as number;
      clock = (clock + dt * sp) % 6283;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cw = sizeRef.current.w || canvas.clientWidth || 800;
      const ch = sizeRef.current.h || canvas.clientHeight || 800;
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);

      const wantN = v.density as number;
      if (wantN !== builtFor) {
        build(wantN, cw, ch);
        builtFor = wantN;
        builtW = cw;
        builtH = ch;
      } else if (cw !== builtW || ch !== builtH) {
        const sx = cw / Math.max(builtW, 1);
        const sy = ch / Math.max(builtH, 1);
        for (let i = 0; i < nodeCount; i++) {
          nx[i] *= sx;
          ny[i] *= sy;
        }
        builtW = cw;
        builtH = ch;
      }

      // --- integrate ---
      const pull = PULL_RATE * (v.hover as number);
      const ptr = ptrRef.current;
      for (let i = 0; i < nodeCount; i++) {
        nx[i] += nvx[i] * dt * sp;
        ny[i] += nvy[i] * dt * sp;
        if (nx[i] < 0 || nx[i] > cw) nvx[i] = -nvx[i];
        if (ny[i] < 0 || ny[i] > ch) nvy[i] = -nvy[i];
        if (pull > 0) {
          const dx = nx[i] - ptr.x;
          const dy = ny[i] - ptr.y;
          if (dx * dx + dy * dy < PULL_REACH * PULL_REACH) {
            const k = Math.min(1, pull * dt * sp);
            nx[i] -= dx * k;
            ny[i] -= dy * k;
          }
        }
        nPos[i * 2] = nx[i];
        nPos[i * 2 + 1] = ny[i];
        nRad[i] = nr[i] * (v.dotSize as number);
        nPulse[i] = 0.78 + Math.sin(clock + nx[i]) * 0.22 * (v.pulse as number);
      }

      // --- links ---
      const LINKD = v.linkDistance as number;
      const l2 = LINKD * LINKD;
      let edges = 0;
      for (let i = 0; i < nodeCount && edges < MAX_EDGES; i++) {
        for (let j = i + 1; j < nodeCount && edges < MAX_EDGES; j++) {
          const dx = nx[i] - nx[j];
          const dy = ny[i] - ny[j];
          const dd = dx * dx + dy * dy;
          if (dd >= l2) continue;
          const a = 0.22 + (1 - Math.sqrt(dd) / LINKD) * 0.55;
          for (let c = 0; c < 6; c++) {
            const k = (edges * 6 + c) * 2;
            eP0[k] = nx[i];
            eP0[k + 1] = ny[i];
            eP1[k] = nx[j];
            eP1[k + 1] = ny[j];
            eAlpha[edges * 6 + c] = a;
          }
          edges++;
        }
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const cb = parseColor(v.base as string, [0.0, 0.86, 0.51]);
      const ca = parseColor(v.accent as string, [0.0, 0.86, 0.51]);

      if (edges > 0) {
        gl.useProgram(lineProg);
        const verts = edges * 6;
        gl.bindBuffer(gl.ARRAY_BUFFER, bP0);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, eP0.subarray(0, verts * 2));
        const aP0 = gl.getAttribLocation(lineProg, 'a_p0');
        gl.enableVertexAttribArray(aP0);
        gl.vertexAttribPointer(aP0, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bP1);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, eP1.subarray(0, verts * 2));
        const aP1 = gl.getAttribLocation(lineProg, 'a_p1');
        gl.enableVertexAttribArray(aP1);
        gl.vertexAttribPointer(aP1, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bCorner);
        const aCorner = gl.getAttribLocation(lineProg, 'a_corner');
        gl.enableVertexAttribArray(aCorner);
        gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bAlpha);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, eAlpha.subarray(0, verts));
        const aAlpha = gl.getAttribLocation(lineProg, 'a_alpha');
        gl.enableVertexAttribArray(aAlpha);
        gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);

        gl.uniform2f(u(lineProg, 'uSize'), cw, ch);
        gl.uniform1f(u(lineProg, 'uWidth'), v.lineWidth as number);
        gl.uniform3f(u(lineProg, 'uColor'), cb[0], cb[1], cb[2]);
        gl.drawArrays(gl.TRIANGLES, 0, verts);
        gl.disableVertexAttribArray(aP0);
        gl.disableVertexAttribArray(aP1);
        gl.disableVertexAttribArray(aCorner);
        gl.disableVertexAttribArray(aAlpha);
      }

      if (nodeCount > 0) {
        gl.useProgram(nodeProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, bNodePos);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, nPos);
        const aPos = gl.getAttribLocation(nodeProg, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bNodeRad);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, nRad);
        const aRad = gl.getAttribLocation(nodeProg, 'a_radius');
        gl.enableVertexAttribArray(aRad);
        gl.vertexAttribPointer(aRad, 1, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bNodePulse);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, nPulse);
        const aPulse = gl.getAttribLocation(nodeProg, 'a_pulse');
        gl.enableVertexAttribArray(aPulse);
        gl.vertexAttribPointer(aPulse, 1, gl.FLOAT, false, 0, 0);

        gl.uniform2f(u(nodeProg, 'uSize'), cw, ch);
        gl.uniform1f(u(nodeProg, 'uDpr'), dpr);
        gl.uniform1f(u(nodeProg, 'uHalo'), v.halo as number);
        gl.uniform3f(u(nodeProg, 'uColor'), ca[0], ca[1], ca[2]);
        gl.drawArrays(gl.POINTS, 0, nodeCount);
        gl.disableVertexAttribArray(aPos);
        gl.disableVertexAttribArray(aRad);
        gl.disableVertexAttribArray(aPulse);
      }

      raf = requestAnimationFrame(render);
    };

    const track = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const cw = sizeRef.current.w || canvas.clientWidth || 800;
      const ch = sizeRef.current.h || canvas.clientHeight || 800;
      ptrRef.current.x = ((e.clientX - r.left) / r.width) * cw;
      ptrRef.current.y = ((e.clientY - r.top) / r.height) * ch;
    };
    const onLeave = () => {
      ptrRef.current.x = -10000;
      ptrRef.current.y = -10000;
    };

    const parent = canvas.parentElement || canvas;
    parent.addEventListener('pointermove', track);
    parent.addEventListener('pointerenter', track);
    parent.addEventListener('pointerleave', onLeave);

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('pointermove', track);
      parent.removeEventListener('pointerenter', track);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        background,
        isolation: 'isolate',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
export default ConstellationField;
