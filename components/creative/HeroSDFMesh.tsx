"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

float sdCircle(vec2 p, vec2 c, float r) {
  return length(p - c) - r;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * 2.0;
  float asp = uResolution.x / max(uResolution.y, 1.0);
  p.x *= asp;
  vec2 m = (uMouse - 0.5) * 2.0;
  m.x *= asp;
  p += 0.06 * (m - p) * 0.35;
  float warp = 0.11 * fbm(p * 2.2 + uTime * 0.08);
  p += warp;
  float t = uTime * 0.12;
  float d = sdCircle(p, vec2(-0.32 + 0.04 * sin(t), 0.08 + 0.03 * cos(t * 0.9)), 0.26);
  d = smin(d, sdCircle(p, vec2(0.38 + 0.03 * cos(t * 1.1), -0.12 + 0.04 * sin(t * 0.8)), 0.2), 0.16);
  d = smin(d, sdCircle(p, vec2(0.05, 0.32 + 0.02 * sin(t * 1.3)), 0.14), 0.12);
  d += 0.05 * fbm(p * 6.0 + uTime * 0.15) - 0.02 * fbm(p * 12.0 - uTime * 0.1);
  vec3 cBg = vec3(0.98, 0.965, 0.995);
  vec3 cMid = vec3(0.72, 0.64, 0.88);
  vec3 cDeep = vec3(0.36, 0.24, 0.62);
  float edge = smoothstep(0.1, -0.22, d);
  float core = smoothstep(-0.02, -0.28, d);
  vec3 col = mix(cBg, cMid, edge);
  col = mix(col, cDeep, core * 0.55);
  float rim = smoothstep(0.06, 0.0, abs(d + 0.02));
  col += vec3(0.85, 0.72, 0.45) * rim * 0.18;
  gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
  className?: string;
  /** Pause animation (e.g. reduced motion). */
  staticFrame?: boolean;
};

export function HeroSDFMesh({ className = "", staticFrame = false }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTargetRef = useRef(new THREE.Vector2(0.5, 0.5));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const geo = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };
    resize();
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    /** Window-level so the layer can stay pointer-events-none (clicks pass through to hero content). */
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      mouseRef.current.x = (e.clientX - r.left) / r.width;
      mouseRef.current.y = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) * 0.001;
      uniforms.uTime.value = staticFrame ? 0 : t;
      mouseTargetRef.current.set(mouseRef.current.x, mouseRef.current.y);
      uniforms.uMouse.value.lerp(mouseTargetRef.current, staticFrame ? 1 : 0.1);
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [staticFrame]);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none touch-none ${className}`}
      aria-hidden
    />
  );
}
