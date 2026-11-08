import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface GlassSettings {
  tileSize: number;
  logoScale: number;
  finalScale: number;
  logoOffset: [number, number];
  iconPlate: boolean;
  keepPlate: boolean;
  originalColors: boolean;
  opticalDepth: number;
  dispersion: number;
  colorBleed: number;
  doubleBevel: number;
  bevelWidth: number;
  corner: number;
  cornerPull: number;
  cornerWidth: number;
  cornerFocus: number;
  edgeSmear: number;
  stretch: number;
  tilt: number;
  bulge: number;
  specular: number;
  halo: number;
  shadow: number;
  ripple: number;
  bounce: number;
  response: number;
  startSize: number;
  startZoom: number;
  glide: number;
  present: number;
  drift: number;
  swell: number;
  focus: number;
  sheen: number;
  lightTurn: number;
  hold: number;
  background: string;
  plateColor: string;
  logoColor: string;
}

const LIGHT_DEFAULTS: GlassSettings = {
  tileSize: 256,
  logoScale: 0.7,
  finalScale: 0.69,
  logoOffset: [0, 0],
  iconPlate: false,
  keepPlate: false,
  originalColors: false,
  opticalDepth: 1.1,
  dispersion: 1.7,
  colorBleed: 1.25,
  doubleBevel: 1,
  bevelWidth: 0.14,
  corner: 4.8,
  cornerPull: 2.1,
  cornerWidth: 2.2,
  cornerFocus: 0.58,
  edgeSmear: 2.85,
  stretch: 0,
  tilt: 0.35,
  bulge: 1,
  specular: 1,
  halo: 0,
  shadow: 1,
  ripple: 1,
  bounce: 0,
  response: 0.42,
  startSize: 0.2,
  startZoom: 2.6,
  glide: 2.3,
  present: 2.4,
  drift: 0.12,
  swell: 0.5,
  focus: 1,
  sheen: 1,
  lightTurn: 0.9,
  hold: 1,
  background: '#e9e9eb',
  plateColor: '#ffffff',
  logoColor: '#0e1428',
};

const PRESETS: Record<'light' | 'dark', GlassSettings> = {
  light: LIGHT_DEFAULTS,
  dark: {
    ...LIGHT_DEFAULTS,
    logoScale: 0.72,
    finalScale: 1,
    iconPlate: true,
    halo: 1,
    shadow: 0,
    ripple: 0.5,
    startZoom: 1.6,
    drift: 0.05,
    opticalDepth: 0.75,
    bevelWidth: 0.22,
    dispersion: 0.9,
    colorBleed: 0.45,
    corner: 5,
    cornerPull: 1.4,
    edgeSmear: 1.2,
    tilt: 0,
    cornerWidth: 1.2,
    cornerFocus: 0.4,
    background: '#000000',
    plateColor: '#05070b',
    logoColor: '#ffffff',
  },
};

const TEX_SIZE = 1024;
const BOX_FRAC = 0.75;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('GlassIconReveal: the logo could not be loaded'));
    img.src = src;
  });
}

function isSvgMarkup(str: string): boolean {
  return str.trimStart().startsWith('<');
}

function svgToDataUrl(svgText: string): string {
  const el = new DOMParser().parseFromString(svgText, 'image/svg+xml')
    .documentElement;
  if (!el || el.nodeName.toLowerCase() !== 'svg') {
    throw new Error('GlassIconReveal: the SVG could not be read');
  }
  let w = parseFloat(el.getAttribute('width') || '');
  let h = parseFloat(el.getAttribute('height') || '');
  const vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    [w, h] = [vb[2], vb[3]];
  }
  if (!(w > 0 && h > 0)) {
    w = h = 100;
  }
  const scale = TEX_SIZE / Math.max(w, h);
  el.setAttribute('width', String(Math.round(w * scale)));
  el.setAttribute('height', String(Math.round(h * scale)));
  const serialized = new XMLSerializer()
    .serializeToString(el)
    .replace(/currentColor/g, '#ffffff');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);
}

const resolveLogoSource = (logo: string): string =>
  isSvgMarkup(logo) ? svgToDataUrl(logo) : logo;

function rasterizeLogoToCanvas(
  img: HTMLImageElement,
  naturalW: number,
  naturalH: number
): HTMLCanvasElement {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = tempCanvas.height = TEX_SIZE;
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  const scale = Math.min(TEX_SIZE / naturalW, TEX_SIZE / naturalH);
  const offsetX = (TEX_SIZE - naturalW * scale) / 2;
  const offsetY = (TEX_SIZE - naturalH * scale) / 2;
  ctx.drawImage(img, offsetX, offsetY, naturalW * scale, naturalH * scale);

  const data = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
  let opaqueBackground = true;
  for (let i = 3; i < data.length; i += 388) {
    if (data[i] < 250) {
      opaqueBackground = false;
      break;
    }
  }

  const bgRGB = [data[0], data[1], data[2]];
  const colorDiffAlpha = (r: number, g: number, b: number) =>
    Math.min(
      1,
      Math.max(
        0,
        (Math.hypot(r - bgRGB[0], g - bgRGB[1], b - bgRGB[2]) / 441 - 0.08) / 0.2
      )
    );

  let minX = TEX_SIZE;
  let minY = TEX_SIZE;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const idx = (y * TEX_SIZE + x) * 4;
      const alpha = opaqueBackground
        ? colorDiffAlpha(data[idx], data[idx + 1], data[idx + 2]) * 255
        : data[idx + 3];
      if (alpha > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    throw new Error('GlassIconReveal: the logo is empty');
  }

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const fitScale = (TEX_SIZE * BOX_FRAC) / Math.max(boxW, boxH);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outCanvas.height = TEX_SIZE;
  const outCtx = outCanvas.getContext('2d', { willReadFrequently: true })!;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(
    img,
    TEX_SIZE / 2 - (minX + boxW / 2 - offsetX) * fitScale,
    TEX_SIZE / 2 - (minY + boxH / 2 - offsetY) * fitScale,
    naturalW * scale * fitScale,
    naturalH * scale * fitScale
  );

  if (opaqueBackground) {
    const imgData = outCtx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    const px = imgData.data;
    for (let i = 0; i < px.length; i += 4) {
      px[i + 3] = Math.round(
        px[i + 3] * colorDiffAlpha(px[i], px[i + 1], px[i + 2])
      );
    }
    outCtx.putImageData(imgData, 0, 0);
  }

  return outCanvas;
}

function edt1d(
  grid: Float64Array,
  offset: number,
  stride: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array,
  inf: number
) {
  v[0] = 0;
  z[0] = -inf;
  z[1] = inf;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < TEX_SIZE; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = inf;
  }

  for (let q = 0, k = 0; q < TEX_SIZE; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const dx = q - r;
    grid[offset + q * stride] = f[r] + dx * dx;
  }
}

function edt2d(
  grid: Float64Array,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array,
  inf: number
) {
  for (let x = 0; x < TEX_SIZE; x++) {
    edt1d(grid, x, TEX_SIZE, f, v, z, inf);
  }
  for (let y = 0; y < TEX_SIZE; y++) {
    edt1d(grid, y * TEX_SIZE, 1, f, v, z, inf);
  }
}

function computeSdf(canvas: HTMLCanvasElement): Float32Array {
  const total = TEX_SIZE * TEX_SIZE;
  const data = canvas
    .getContext('2d', { willReadFrequently: true })!
    .getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
  const INF = 1e20;
  const outer = new Float64Array(total);
  const inner = new Float64Array(total);

  for (let i = 0; i < total; i++) {
    const a = data[i * 4 + 3] / 255;
    if (a >= 1) {
      outer[i] = 0;
      inner[i] = INF;
    } else if (a <= 0) {
      outer[i] = INF;
      inner[i] = 0;
    } else {
      const d = 0.5 - a;
      outer[i] = d > 0 ? d * d : 0;
      inner[i] = d < 0 ? d * d : 0;
    }
  }

  const f = new Float64Array(TEX_SIZE);
  const z = new Float64Array(TEX_SIZE + 1);
  const v = new Uint16Array(TEX_SIZE);

  edt2d(outer, f, v, z, INF);
  edt2d(inner, f, v, z, INF);

  const sdf = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX_SIZE;
  }
  return sdf;
}

interface PreparedLogo {
  canvas: HTMLCanvasElement;
  sdf: Float32Array;
}

const logoCache = new Map<string, Promise<PreparedLogo>>();

function prepareLogo(logo: string): Promise<PreparedLogo> {
  let cached = logoCache.get(logo);
  if (!cached) {
    cached = loadImage(resolveLogoSource(logo)).then((img) => {
      const canvas = rasterizeLogoToCanvas(
        img,
        img.naturalWidth || TEX_SIZE,
        img.naturalHeight || TEX_SIZE
      );
      return { canvas, sdf: computeSdf(canvas) };
    });
    logoCache.set(logo, cached);
    cached.catch(() => logoCache.delete(logo));
  }
  return cached;
}

const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uCenter;
uniform float uTile;
uniform sampler2D uSdf;
uniform sampler2D uCol;
uniform float uTexSize;
uniform float uBoxFrac;
uniform float uPlateScale;
uniform float uShapeN;
uniform float uCornerN;
uniform float uOptics;
uniform float uPlateAlpha;
uniform float uLogoHalf;
uniform vec2 uLogoOff;
uniform float uBold;
uniform float uBlur;
uniform float uFrost;
uniform float uDome;
uniform float uDrop;
uniform float uPinch;
uniform float uTilt;
uniform float uRim;
uniform float uHalo;
uniform float uShadow;
uniform float uGhost;
uniform float uRipR;
uniform float uRipA;
uniform float uBare;
uniform float uReach;
uniform float uCornerPull;
uniform float uStreak;
uniform float uWiden;
uniform float uSlab;
uniform float uEtaSpread;
uniform float uFocus;
uniform float uFocusK;
uniform float uFocusSplit;
uniform float uRimLine;
uniform float uCornerOn;
uniform float uDissolve;
uniform float uGlow;
uniform float uFaceDisp;
uniform float uVivid;
uniform float uDisp;
uniform float uDouble;
uniform float uBevelW;
uniform float uSpec;
uniform float uIconPlate;
uniform float uUseColor;
uniform float uLightScene;
uniform float uLightGlass;
uniform float uKeep;
uniform float uSheen;
uniform float uSweep;
uniform float uLightAng;
uniform vec3 uBg;
uniform vec3 uPlateCol;
uniform vec3 uLogoCol;
float px;
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec4 logoAt(vec2 q, float blur, float aa) {
  float L = uLogoHalf;
  float k = 0.5 * uBoxFrac / L;
  vec2 uv = vec2(0.5 + (q.x - uLogoOff.x) * k, 0.5 - (q.y - uLogoOff.y) * k);
  float d = texture(uSdf, uv).r / k;
  float w = 0.75 * aa + blur;
  float a = 1.0 - smoothstep(-w, w, d - uBold * L);
  vec3 c = uLogoCol;
  if (uUseColor > 0.5) {
    float lod = log2(max(1.0, w * k * uTexSize));
    vec4 c0 = textureLod(uCol, uv, lod);
    vec4 c1 = textureLod(uCol, uv, lod + 3.0);
    vec4 c2 = textureLod(uCol, uv, 7.0);
    c = c2.rgb / max(c2.a, 1e-4);
    c = mix(c, c1.rgb / max(c1.a, 1e-4), smoothstep(0.0, 0.06, c1.a));
    c = mix(c, c0.rgb / max(c0.a, 1e-4), smoothstep(0.02, 0.3, c0.a));
  }
  return vec4(c, a);
}
float shape(vec2 p, float scale, float n, out vec2 nOut, out float g, out vec2 dg) {
  vec2 pp = p / scale;
  vec2 a = max(abs(pp), vec2(1e-6));
  g = pow(pow(a.x, n) + pow(a.y, n), 1.0 / n);
  dg = sign(pp) * pow(a, vec2(n - 1.0)) * pow(max(g, 1e-6), 1.0 - n);
  float dgl = max(length(dg), 1e-6);
  nOut = dg / dgl;
  return (g - 1.0) / dgl * scale;
}
float contourRadius(vec2 p, float scale, float n) {
  vec2 a = max(abs(p / scale), vec2(1e-4));
  vec2 a1 = pow(a, vec2(n - 1.0));
  vec2 a2 = pow(a, vec2(n - 2.0));
  float k = (n - 1.0) * (a2.x * a1.y * a1.y + a2.y * a1.x * a1.x) / pow(max(dot(a1, a1), 1e-30), 1.5);
  return scale / max(k, 1e-3);
}
vec2 refractSample(float x, float bwF, float eta, float R, vec2 dirOut, vec2 p, float dome, float offMul) {
  float u = clamp(1.0 - x, 0.0, 0.995);
  float th = asin(u), thr = asin(u / eta);
  float z = uSlab + bwF * sqrt(1.0 - u * u);
  float off = offMul * z * tan(th - thr);
  off = off / (1.0 + off / (6.0 * R));
  return p - (dirOut * off + p * dome) * uOptics;
}
float gauss(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
float band(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }
float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
vec3 spectrum(float x) {
  return vec3(bump(x, 0.34, 0.2) + 0.08 * bump(x, 0.93, 0.05), bump(x, 0.58, 0.1), bump(x, 0.8, 0.11));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  px = 2.0 / uTile;
  vec2 p = (gl_FragCoord.xy - uCenter) * px;
  vec4 lg = logoAt(p, uBlur, px);
  vec3 plain = mix(uBg, lg.rgb, lg.a * uBare);
  vec2 nOut, dg; float g;
  float sd = shape(p, uPlateScale, uShapeN, nOut, g, dg);
  float s = -sd;
  float bw = max(uBevelW, 0.004) * uPlateScale;
  float x = clamp(s / bw, 0.0, 1.0);
  float R = contourRadius(p, uPlateScale, uShapeN);
  vec2 pq = p * p;
  float diag = 4.0 * pq.x * pq.y / max((pq.x + pq.y) * (pq.x + pq.y), 1e-6);
  float tilt = mix(1.0 - uTilt, 1.0, smoothstep(-0.02, 0.02, p.x * p.y));
  float pinchPart = uPinch * min(g * g, 1.0) * diag * diag * tilt;
  float dome = uDome * (1.0 - min(g * g, 1.0)) + pinchPart;
  vec2 dirOut = normalize(mix(nOut, p / max(length(p), 1e-4), 0.2));
  float cornerness = max(smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y), smoothstep(0.15, 0.75, diag));
  float offMul = 1.0 + 0.4 * max(uCornerPull - 1.0, 0.0) * tilt * cornerness * uCornerOn;
  vec2 focus = sign(p) * (pow(0.5, 1.0 / uShapeN) - uFocus * 0.70710678) * uPlateScale;
  float focusW = tilt * cornerness * uOptics * uCornerOn;
  float bwF = max(uReach, 0.004) * (1.0 + uWiden * tilt * cornerness * uCornerOn);
  float xf = clamp(s / bwF, 0.0, 1.0);
  vec2 qc = refractSample(xf, bwF, 1.5, R, dirOut, p, dome, offMul);
  float foot = max(max(length(dFdx(qc)), length(dFdy(qc))), 0.25 * px);
  vec3 bg = uBg;
  vec3 lift = mix(uBg + vec3(0.06), mix(uBg, vec3(1.0), 0.55), uLightScene);
  if (uGhost > 0.001) {
    vec2 gn, gdg; float gg;
    float gsd = shape(p, 1.0, uCornerN, gn, gg, gdg);
    bg = mix(bg, lift, uGhost * 0.12 * (1.0 - smoothstep(-0.16, 0.14, gsd)));
    bg *= 1.0 - uGhost * 0.03 * uLightScene * exp(-max(gsd, 0.0) / 0.12) * step(0.0, gsd);
  }
  float outside = max(sd, 0.0);
  if (uRipA > 0.001) {
    float d0 = (uRipR - 1.0) * uPlateScale;
    float rx = (sd - d0) / 0.022;
    float ring = exp(-rx * rx);
    bg += uRipA * ring * (0.04 * (0.55 + 0.45 * dot(nOut, normalize(vec2(-0.5, 0.8))))) * mix(0.5, 1.0, uLightScene);
    bg -= uRipA * 0.016 * uLightScene * exp(-(rx - 1.6) * (rx - 1.6));
  }
  float shadowFall = max(sd, 0.0) / (0.9 * uPlateScale);
  bg *= 1.0 - uShadow * 0.03 * exp(-shadowFall * shadowFall) * step(0.0, sd);
  vec3 haloCol = mix(vec3(0.62, 0.69, 0.80), vec3(1.0), uLightScene);
  bg = mix(bg, haloCol, clamp(uHalo * (0.30 * exp(-outside / (0.025 * uPlateScale)) + 0.07 * exp(-outside / (0.12 * uPlateScale))), 0.0, 1.0) * step(0.0, sd));
  vec3 col = bg;
  float soft = px + uBlur * 0.8 + 0.06 * uDissolve * (1.0 - uKeep) * uPlateScale;
  if (sd < soft) {
    float y1 = 1.0 - x;
    const float K = 2.6;
    float base1 = max(1.0 - pow(y1, K), 1e-4);
    float db = min(pow(y1, K - 1.0) * pow(base1, 1.0 / K - 1.0), 25.0);
    float s1 = bw * 0.62;
    float w2 = bw * 0.22;
    float t2 = clamp((s - s1) / w2, -1.0, 1.0);
    float dh2 = uDouble * bw * 0.16;
    float dd = dh2 * 0.5 * cos(t2 * 1.5707963) * 1.5707963 / w2 * step(abs(t2), 0.999);
    vec2 gDome = -uDome * 2.0 * g * dg * step(g, 1.0);
    vec2 grad = -(db + dd) * nOut + gDome;
    vec3 back = mix(uBg, uPlateCol, uIconPlate);
    vec3 liftG = mix(back + vec3(0.06), mix(back, vec3(1.0), 0.55), uLightGlass);
    float rblur = uBlur + 0.05 * length(qc - p) + min(uGlow * uOptics * (1.0 - xf) * foot / px, 0.04);
    float cornerW = smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y);
    float streak = 0.35 * uStreak * bw * mix(0.15, 1.0, cornerW) * pow(1.0 - xf, 1.5) * uOptics;
    vec2 tangent = vec2(-nOut.y, nOut.x);
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float lam = (float(i) + 0.5) / 20.0;
      float c = uDisp * (1.0 - 2.0 * lam);
      vec2 along = tangent * (streak * 2.0 * (fract(float(i) * 0.618034 + 0.31) - 0.5));
      float cf = uDisp * (1.0 - 2.0 * lam) * (lam > 0.5 ? 1.0 : 0.5);
      vec2 sp = refractSample(xf, bwF, 1.5 + uEtaSpread * c, R, dirOut, p + along, dome + pinchPart * 0.3 * c, offMul);
      vec2 focusL = focus - sign(p) * (0.70710678 * uFocusSplit * c * uPlateScale);
      float wFocus = pow(1.0 - xf, uFocusK) * smoothstep(0.0, uRimLine * (1.0 + 0.6 * c), xf);
      sp = mix(sp, mix(p + along, focusL, wFocus), focusW);
      float faceOnly = smoothstep(0.7, 1.0, xf) * uOptics;
      sp *= 1.0 + uFaceDisp * cf * faceOnly;
      vec4 l = logoAt(sp, rblur + 0.12 * streak + uFaceDisp * 0.5 * max(c, 0.0) * faceOnly, foot);
      vec3 w = spectrum(lam);
      acc += mix(back, l.rgb, l.a) * w;
      wsum += w;
    }
    vec3 trans = acc / wsum;
    float tl = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    trans = clamp(tl + (trans - tl) * (1.0 + uVivid * uOptics), 0.0, 1.0);
    float hazeLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float hazeGate = mix(1.0 - smoothstep(0.25, 0.75, hazeLum), smoothstep(0.25, 0.75, hazeLum), uLightGlass);
    trans = mix(trans, liftG, uFrost * 0.45 * hazeGate);
    float glassAmt = pow(1.0 - uDissolve, 1.5);
    float lit = uSpec * glassAmt;
    vec3 rimCol = mix(vec3(0.80, 0.87, 0.97), vec3(1.0), uLightGlass);
    float sc = uPlateScale;
    float tLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float lightOnly = smoothstep(0.35, 0.85, tLum);
    float hw = smoothstep(-0.85, 0.5, dot(nOut, rot(vec2(0.5, 0.866), uLightAng)));
    float tileBand = band(s, 0.016 * sc, 0.075 * sc, 0.022 * sc);
    float dropBand = (1.0 - smoothstep(0.06 * sc, 0.13 * sc, s)) * smoothstep(0.0, 0.004 * sc, s);
    float glow = mix(0.32 * tileBand, 0.75 * dropBand, uDrop) * lightOnly;
    float edgeLine = gauss(s, 0.005 * sc, 0.0045 * sc);
    float lip = gauss(s, 0.15 * sc, 0.007 * sc) * uDouble * (1.0 - uDrop);
    vec3 lightGlass = mix(trans, vec3(1.0), glow * glassAmt);
    lightGlass += (0.075 * hw * edgeLine + 0.06 * (0.4 + 0.6 * hw) * lip) * lit;
    lightGlass *= 1.0 - 0.05 * (1.0 - hw) * edgeLine * glassAmt * (1.0 - uDrop);
    lightGlass = mix(lightGlass, vec3(1.0), 0.55 * uDrop * glassAmt * edgeLine);
    vec3 Nl = normalize(vec3(-grad, 1.0));
    float edge = 1.0 - Nl.z;
    vec2 ldir = rot(normalize(vec2(-0.62, 0.78)), uLightAng);
    float side = dot(nOut, ldir);
    float fres = pow(edge, 1.5);
    vec3 rim = rimCol * fres * (0.35 + 0.65 * max(side, -side * 0.8)) * uRim * 0.65;
    vec3 Hv = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    float spc = pow(max(dot(Nl, Hv), 0.0), 140.0) * 0.8 * smoothstep(0.0, 0.25, y1);
    vec3 darkGlass = trans * (1.0 - 0.25 * fres) + (rim + vec3(spc)) * lit;
    darkGlass = mix(darkGlass, rimCol, uDrop * 0.4 * uSpec * (1.0 - smoothstep(0.0, 0.1 * uPlateScale, s)));
    vec3 glass = mix(darkGlass, lightGlass, uLightGlass);
    float sweepD = dot(p / uPlateScale, normalize(vec2(0.8, 0.6))) - uSweep;
    float sheen = uSheen * glassAmt * exp(-sweepD * sweepD / 0.03) * (0.55 + 0.45 * (1.0 - x));
    glass = mix(glass, vec3(1.0), sheen * mix(0.22, 0.42, uLightGlass));
    float cov = clamp(0.5 - sd / soft, 0.0, 1.0);
    col = mix(bg, glass, cov);
  }
  vec3 outc = mix(plain, col, uPlateAlpha);
  outc += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(outc, 1.0);
}`;

function createGlContext(canvas: HTMLCanvasElement) {
  const maybeGl = canvas.getContext('webgl2', {
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!maybeGl) return null;
  const gl: WebGL2RenderingContext = maybeGl;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'shader');
    }
    return shader;
  };

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'program');
  }

  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i)!;
    uniforms[info.name] = gl.getUniformLocation(prog, info.name);
  }

  const sdfTex = gl.createTexture();
  const colTex = gl.createTexture();
  gl.uniform1i(uniforms.uSdf, 0);
  gl.uniform1i(uniforms.uCol, 1);

  let ready = false;
  const setTexParams = (minFilter: number) => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  function setLogo(prepared: PreparedLogo) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sdfTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R16F,
      TEX_SIZE,
      TEX_SIZE,
      0,
      gl.RED,
      gl.FLOAT,
      prepared.sdf
    );
    setTexParams(gl.LINEAR);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, colTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      prepared.canvas
    );
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    setTexParams(gl.LINEAR_MIPMAP_LINEAR);
    ready = true;
  }

  function render(
    u: Record<string, any>,
    width: number,
    height: number,
    tile: number
  ) {
    if (!ready) return;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.uCenter, width / 2, height / 2);
    gl.uniform1f(uniforms.uTile, tile);
    gl.uniform1f(uniforms.uTexSize, TEX_SIZE);
    gl.uniform1f(uniforms.uBoxFrac, BOX_FRAC);
    for (const k in u) {
      const val = u[k];
      if (typeof val === 'number' && uniforms[k]) {
        gl.uniform1f(uniforms[k], val);
      }
    }
    gl.uniform3fv(uniforms.uBg, u.uBg);
    gl.uniform3fv(uniforms.uPlateCol, u.uPlateCol);
    gl.uniform3fv(uniforms.uLogoCol, u.uLogoCol);
    gl.uniform2fv(uniforms.uLogoOff, u.uLogoOff);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function dispose() {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  return { setLogo, render, dispose };
}

const TAIL_DURATION = 1.1;
const FADE_DURATION = 0.5;
const totalDuration = (s: GlassSettings) => s.present + TAIL_DURATION;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const smootherstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.replace(/./g, '$&$&');
  }
  const num = parseInt(clean.slice(0, 6), 16) || 0;
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

const luminance = ([r, g, b]: [number, number, number]) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

function spring(t: number, response: number, damping: number): number {
  if (t <= 0) return 0;
  const omega = (2 * Math.PI) / response;
  if (damping >= 1) {
    return 1 - Math.exp(-omega * t) * (1 + omega * t);
  }
  const wd = omega * Math.sqrt(1 - damping * damping);
  return (
    1 -
    Math.exp(-damping * omega * t) *
      (Math.cos(wd * t) + ((damping * omega) / wd) * Math.sin(wd * t))
  );
}

const springThresholdCache = new Map<string, number>();

function findSpringTime(
  target: number,
  response: number,
  damping: number
): number {
  const key = `${target}/${response}/${damping}`;
  let cached = springThresholdCache.get(key);
  if (cached === undefined) {
    let lo = 0;
    let hi = 3;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (spring(mid, response, damping) < target) lo = mid;
      else hi = mid;
    }
    springThresholdCache.set(key, (cached = hi));
  }
  return cached;
}

function evaluateUniforms(t: number, s: GlassSettings, fadeOut = 0) {
  const r = s.present;
  const i = +!!s.keepPlate;
  const a = 1 - s.bounce;
  const o = spring(t + 0.01, s.response, a);
  const sTime = findSpringTime(0.85, s.response, a) - 0.01;
  const c = spring(t - (findSpringTime(0.92, s.response, a) - 0.01), 0.4, 1);
  const l = 1 - smoothstep(0.05, 1, c);
  const u = smoothstep(0, 0.08, t);
  const d = s.drift * spring(t - 0.3, 2.2, 1);
  const f = 0.25 * spring(t, 0.7, 1) + 0.75 * smootherstep(0, s.glide, t);
  const p = spring(t - 0.5, 2.4, 1);
  const m = spring(t - r, 0.95, 1);
  const h = spring(t - r - 0.05, 0.65, 1);
  const g = 0.15 * s.bulge * (1 - smoothstep(0.4, 0.95, o));
  const zoom =
    (1 + (s.startZoom - 1) * (1 - f)) *
    (1 - 0.045 * p) *
    lerp(1, s.finalScale, m) *
    (1 - 0.06 * fadeOut);
  const v = lerp(s.bevelWidth, Math.max(s.bevelWidth, 0.4), l);
  const y =
    lerp(s.startSize, 1, o) *
    (1 + d) *
    (1 + 0.14 * h * (1 - i)) *
    (1 - i * (0.03 * h + 0.06 * fadeOut));
  const bg = hexToRgb(s.background);

  return {
    uPlateScale: y,
    uShapeN: lerp(2, s.corner, c),
    uCornerN: s.corner,
    uOptics: 1 - smoothstep(0.55, 1, h),
    uPlateAlpha: i ? u * (1 - fadeOut) : u * (1 - smoothstep(0.45, 1, h)),
    uLogoHalf: s.logoScale * zoom,
    uLogoOff: [s.logoOffset[0] * zoom, s.logoOffset[1] * zoom],
    uKeep: i,
    uSheen: s.sheen,
    uSweep: lerp(-1.6, 1.6, smootherstep(0.9, r - 0.1, t)),
    uLightAng: s.lightTurn * smootherstep(0.4, r + 0.4, t),
    uBold: s.swell * 0.03 * (1 - f),
    uBlur: s.focus * 0.05 * (1 - smoothstep(0.3, 0.95, o)) + 0.03 * fadeOut,
    uFrost: s.focus * (1 - smoothstep(0.5, 0.95, o)),
    uPinch: 0.38 * s.stretch * smoothstep(0.1, 0.9, c) * smoothstep(0.75, 0.97, f),
    uTilt: s.tilt,
    uDome: g,
    uDrop: l,
    uRim: 1 + 0.8 * l,
    uHalo: s.halo * (0.5 + 0.5 * l) * (1 - i * h),
    uShadow: Math.max(
      s.shadow * smoothstep(0.45, 0.8, o) * (1 - smoothstep(0, 0.6, c)),
      0.8 * s.shadow * i * h
    ),
    uGhost: smoothstep(0, 0.03, t) * (1 - smoothstep(0.04, 0.08, t)),
    uRipR: 1 + 0.9 * Math.max(0, t - sTime),
    uRipA:
      s.ripple *
      smoothstep(sTime, sTime + 0.06, t) *
      Math.exp(-Math.max(0, t - sTime) / 0.6),
    uBare: (1 - i) * smoothstep(r - 0.25, r, t) * (1 - fadeOut),
    uReach: v * y,
    uCornerPull: s.cornerPull,
    uStreak: s.edgeSmear,
    uWiden: s.cornerWidth,
    uSlab: 0.3 * s.opticalDepth,
    uEtaSpread: 0.06,
    uFocus: s.cornerFocus,
    uFocusK: 1,
    uFocusSplit: 0.056 * s.colorBleed,
    uRimLine: 0.09,
    uCornerOn: smoothstep(0.35, 1, c),
    uGlow: 0.012 * s.colorBleed,
    uFaceDisp: 0.012 * s.dispersion,
    uVivid: 0.85,
    uDissolve: h,
    uDisp: s.dispersion,
    uDouble: s.doubleBevel,
    uBevelW: v * (1 - h),
    uSpec: s.specular,
    uIconPlate: +!!s.iconPlate,
    uUseColor: +!!s.originalColors,
    uLightScene: +(luminance(bg) > 0.5),
    uLightGlass: +(
      luminance(s.iconPlate ? hexToRgb(s.plateColor) : bg) > 0.5
    ),
    uBg: bg,
    uPlateCol: hexToRgb(s.plateColor),
    uLogoCol: hexToRgb(s.logoColor),
  };
}

export interface GlassIconRevealProps
  extends React.HTMLAttributes<HTMLDivElement> {
  logo: string;
  look?: 'light' | 'dark';
  background?: string;
  logoColor?: string;
  plateColor?: string;
  iconPlate?: boolean;
  keepPlate?: boolean;
  originalColors?: boolean;
  tileSize?: number;
  logoScale?: number;
  finalScale?: number;
  logoOffset?: [number, number];
  loop?: boolean;
  hold?: number;
  speed?: number;
  time?: number;
  tuning?: Partial<GlassSettings>;
  label?: string;
}

export function GlassIconReveal({
  logo,
  look = 'light',
  background,
  logoColor,
  plateColor,
  iconPlate,
  keepPlate,
  originalColors,
  tileSize,
  logoScale,
  finalScale,
  logoOffset,
  loop = true,
  hold,
  speed = 1,
  time,
  tuning,
  label = 'Logo',
  className = '',
  style,
  onClick,
  ...rest
}: GlassIconRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<{
    setLogo: (l: PreparedLogo) => void;
    replay: () => void;
    invalidate: () => void;
    dispose: () => void;
  } | null>(null);
  const [fallback, setFallback] = useState(false);

  const tuningJson = JSON.stringify(tuning ?? {});
  const offsetKey = logoOffset ? logoOffset.join(',') : '';

  const settings = useMemo<GlassSettings>(() => {
    const overrides: Record<string, any> = Object.fromEntries(
      Object.entries({
        background,
        logoColor,
        plateColor,
        iconPlate,
        keepPlate,
        originalColors,
        tileSize,
        logoScale,
        finalScale,
        hold,
      }).filter(([, val]) => val !== undefined)
    );
    if (offsetKey) {
      overrides.logoOffset = offsetKey.split(',').map(Number);
    }
    return {
      ...PRESETS[look],
      ...overrides,
      ...JSON.parse(tuningJson),
    };
  }, [
    look,
    background,
    logoColor,
    plateColor,
    iconPlate,
    keepPlate,
    originalColors,
    tileSize,
    logoScale,
    finalScale,
    hold,
    offsetKey,
    tuningJson,
  ]);

  const stateRef = useRef({ settings, loop, speed, time });
  stateRef.current = { settings, loop, speed, time };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block';
    el.appendChild(canvas);

    let glCtx: ReturnType<typeof createGlContext> = null;
    try {
      glCtx = createGlContext(canvas);
    } catch (err) {
      console.error(err);
    }

    if (!glCtx) {
      canvas.remove();
      setFallback(true);
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let preparedLogo: PreparedLogo | null = null;
    let currentTime = reducedMotion ? 1.4 : 0;
    let playing = !reducedMotion;
    let holdRemaining = 0;
    let fadeOut = 0;
    let dirty = true;
    let intersecting = false;
    let contextLost = false;
    let rafId = 0;
    let lastNow = 0;

    function tick(now: number) {
      rafId = 0;
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      const current = stateRef.current;
      if (!current) return;
      const { settings: s, loop: lp, speed: sp, time: fixedTime } = current;
      const maxT = totalDuration(s);

      if (fixedTime !== undefined) {
        playing = false;
        currentTime = fixedTime;
        fadeOut = clamp01(
          (fixedTime - maxT - Math.max(0.05, s.hold)) / FADE_DURATION
        );
      } else if (playing && preparedLogo) {
        if (holdRemaining > 0) {
          holdRemaining -= dt;
          const prevFade = fadeOut;
          fadeOut = clamp01(1 - holdRemaining / FADE_DURATION);
          if (holdRemaining <= 0) {
            holdRemaining = 0;
            fadeOut = 0;
            currentTime = 0;
          }
          if (fadeOut !== prevFade || currentTime === 0) {
            dirty = true;
          }
        } else {
          currentTime += dt * sp;
          if (currentTime >= maxT) {
            currentTime = maxT;
            if (lp) {
              holdRemaining = Math.max(0.05, s.hold) + FADE_DURATION;
            } else {
              playing = false;
            }
          }
          dirty = true;
        }
      }

      if (dirty && preparedLogo && glCtx && !contextLost) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;
        const pw = Math.max(1, Math.round(cw * dpr));
        const ph = Math.max(1, Math.round(ch * dpr));
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw;
          canvas.height = ph;
        }
        const tile = Math.min(s.tileSize, Math.min(cw, ch) / 1.75);
        glCtx.render(
          evaluateUniforms(Math.min(currentTime, maxT), s, fadeOut),
          pw,
          ph,
          tile * dpr
        );
        dirty = false;
      }

      if (intersecting && playing && preparedLogo && !contextLost) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function schedule() {
      if (!rafId && intersecting && !contextLost) {
        lastNow = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      if (intersecting) {
        schedule();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });
    io.observe(el);

    const ro = new ResizeObserver(() => {
      dirty = true;
      schedule();
    });
    ro.observe(el);

    const onLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onRestored = () => {
      contextLost = false;
      try {
        glCtx = createGlContext(canvas);
        if (glCtx && preparedLogo) glCtx.setLogo(preparedLogo);
      } catch (err) {
        console.error(err);
      }
      dirty = true;
      schedule();
    };

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const ctrl = {
      setLogo(l: PreparedLogo) {
        preparedLogo = l;
        glCtx?.setLogo(l);
        if (!reducedMotion) {
          currentTime = 0;
          playing = true;
          holdRemaining = 0;
          fadeOut = 0;
        }
        dirty = true;
        schedule();
      },
      replay() {
        currentTime = 0;
        playing = true;
        holdRemaining = 0;
        fadeOut = 0;
        dirty = true;
        schedule();
      },
      invalidate() {
        dirty = true;
        schedule();
      },
      dispose() {
        if (rafId) cancelAnimationFrame(rafId);
        io.disconnect();
        ro.disconnect();
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        glCtx?.dispose();
        canvas.remove();
      },
    };

    controllerRef.current = ctrl;
    return () => {
      controllerRef.current = null;
      ctrl.dispose();
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.invalidate();
  }, [settings, loop, speed, time]);

  useEffect(() => {
    let cancelled = false;
    prepareLogo(logo).then(
      (prepared) => {
        if (!cancelled) controllerRef.current?.setLogo(prepared);
      },
      (err) => {
        console.error(err);
        if (!cancelled) setFallback(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [logo]);

  const fallbackUrl = useMemo(
    () => (fallback ? resolveLogoSource(logo) : ''),
    [fallback, logo]
  );

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label}
      className={`relative isolate cursor-pointer overflow-hidden select-none ${className}`}
      style={{ backgroundColor: settings.background, ...style }}
      onClick={(e) => {
        controllerRef.current?.replay();
        onClick?.(e);
      }}
      {...rest}
    >
      {fallback && (
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto block"
          style={{
            width:
              settings.tileSize *
              settings.logoScale *
              settings.finalScale *
              BOX_FRAC,
            height:
              settings.tileSize *
              settings.logoScale *
              settings.finalScale *
              BOX_FRAC,
            maxWidth: '40%',
            maxHeight: '40%',
            backgroundColor: settings.logoColor,
            maskImage: `url("${fallbackUrl}")`,
            WebkitMaskImage: `url("${fallbackUrl}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      )}
    </div>
  );
}
