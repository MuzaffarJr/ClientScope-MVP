"use client";

import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { ORB_NODES } from "./orb-nodes";
import { orbFragmentShader, orbVertexShader } from "./orb-shaders";


const PALETTE = [
  new THREE.Color("#0f7f78"), // deep teal
  new THREE.Color("#3fd3c7"), // aqua
  new THREE.Color("#a8fff7"), // aqua mist
  new THREE.Color("#f2fffe"), // cool white
  new THREE.Color("#f3d6ff"), // pale lavender (rare)
];
const WEIGHTS = [0.28, 0.32, 0.2, 0.15, 0.05];

function pickColor(r: number): THREE.Color {
  let acc = 0;
  for (let i = 0; i < WEIGHTS.length; i++) {
    acc += WEIGHTS[i];
    if (r <= acc) return PALETTE[i];
  }
  return PALETTE[0];
}

// Deterministic PRNG so server-agnostic layouts are stable between renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGeometry(count: number) {
  const rand = mulberry32(7);
  const sphere = new Float32Array(count * 3);
  const chaos = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const stray = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere with slight radial jitter for an organic shell.
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const r = 1 + (rand() - 0.5) * 0.06;
    sphere.set([Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r], i * 3);

    // Chaos field: a wide, flattened cloud mostly to the sides, like text fragments.
    const angle = rand() * Math.PI * 2;
    const dist = 1.6 + rand() * 2.6;
    chaos.set([Math.cos(angle) * dist * 1.4, (rand() - 0.5) * 1.8, Math.sin(angle) * dist * 0.6], i * 3);

    seeds[i] = rand();
    stray[i] = rand() < 0.22 ? 1 : 0;
    const c = pickColor(rand());
    colors.set([c.r, c.g, c.b], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(sphere, 3));
  geometry.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
  geometry.setAttribute("aChaos", new THREE.BufferAttribute(chaos, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aStray", new THREE.BufferAttribute(stray, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  // Particles move in the shader; keep them from being frustum-culled.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
  return geometry;
}

const NODE_RADIUS = 1.5;

function orbitPoint(a: number, out = new THREE.Vector3()) {
  return out.set(Math.cos(a) * NODE_RADIUS, Math.sin(a * 2) * 0.22, Math.sin(a) * NODE_RADIUS);
}

/**
 * All three.js objects for the scene, created once outside React's render
 * cycle. Per-frame mutation happens in `tickOrb`, the idiomatic three.js way.
 */
function createOrbResources(count: number, pixelRatio: number) {
  const geometry = buildGeometry(count);
  const material = new THREE.ShaderMaterial({
    vertexShader: orbVertexShader,
    fragmentShader: orbFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: Math.min(pixelRatio, 2) },
      uSize: { value: 34 },
      uPointer: { value: new THREE.Vector3(9, 9, 9) },
    },
  });

  // Orbit nodes on a tilted ring, plus connector lines back to the core.
  const nodePositions = ORB_NODES.map((_, i) => orbitPoint((i / ORB_NODES.length) * Math.PI * 2 + 0.4));

  const connectorPts: number[] = [];
  nodePositions.forEach((p) => {
    const inner = p.clone().normalize().multiplyScalar(1.05);
    connectorPts.push(inner.x, inner.y, inner.z, p.x, p.y, p.z);
  });
  const connectorGeometry = new THREE.BufferGeometry();
  connectorGeometry.setAttribute("position", new THREE.Float32BufferAttribute(connectorPts, 3));

  const ringPts: number[] = [];
  const tmp = new THREE.Vector3();
  for (let i = 0; i <= 128; i++) {
    orbitPoint((i / 128) * Math.PI * 2, tmp);
    ringPts.push(tmp.x, tmp.y, tmp.z);
  }
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute("position", new THREE.Float32BufferAttribute(ringPts, 3));

  return {
    geometry,
    material,
    nodePositions,
    connectorGeometry,
    ringGeometry,
    lineMaterial: new THREE.LineBasicMaterial({ color: "#a8fff7", transparent: true, opacity: 0, depthWrite: false }),
    ringMaterial: new THREE.LineBasicMaterial({ color: "#edfffe", transparent: true, opacity: 0, depthWrite: false }),
    nodeMaterial: new THREE.MeshBasicMaterial({ color: "#fde9ff", transparent: true, opacity: 0 }),
    motion: { progress: 0, rx: 0, ry: 0, pointer: new THREE.Vector2() },
    scratch: {
      projected: new THREE.Vector3(),
      hit: new THREE.Vector3(),
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    },
  };
}

type OrbResources = ReturnType<typeof createOrbResources>;

function disposeOrbResources(r: OrbResources) {
  r.geometry.dispose();
  r.material.dispose();
  r.connectorGeometry.dispose();
  r.ringGeometry.dispose();
  r.lineMaterial.dispose();
  r.ringMaterial.dispose();
  r.nodeMaterial.dispose();
}

function tickOrb(
  r: OrbResources,
  state: RootState,
  delta: number,
  group: THREE.Group | null,
  nodesGroup: THREE.Group | null,
  target: number,
  labels: (HTMLElement | null)[] | null,
) {
  const m = r.motion;
  const { camera, size } = state;
  // Damped easing keeps scroll-driven motion slow and confident.
  m.progress += (target - m.progress) * Math.min(1, delta * 3);
  m.pointer.lerp(state.pointer, Math.min(1, delta * 2));

  r.material.uniforms.uTime.value = state.clock.elapsedTime;
  r.material.uniforms.uProgress.value = m.progress;

  if (!group) return;

  r.scratch.raycaster.setFromCamera(m.pointer, camera);
  if (r.scratch.raycaster.ray.intersectPlane(r.scratch.plane, r.scratch.hit)) {
    r.material.uniforms.uPointer.value.copy(group.worldToLocal(r.scratch.hit));
  }

  // Extremely slow idle rotation; pointer adds at most ~6° of tilt.
  m.ry += delta * 0.04;
  m.rx += (m.pointer.y * 0.1 - m.rx) * Math.min(1, delta * 2);
  group.rotation.set(0.25 + m.rx, m.ry + m.pointer.x * 0.1, 0);

  const structure = THREE.MathUtils.smoothstep(m.progress, 0.38, 0.75);
  r.lineMaterial.opacity = structure * 0.22;
  r.ringMaterial.opacity = structure * 0.12;
  r.nodeMaterial.opacity = structure;
  if (nodesGroup) nodesGroup.visible = structure > 0.01;

  // Project nodes to screen space so DOM labels track them.
  if (!labels) return;
  group.updateMatrixWorld();
  r.nodePositions.forEach((p, i) => {
    const el = labels[i];
    if (!el) return;
    const v = r.scratch.projected.copy(p).applyMatrix4(group.matrixWorld).project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    const behind = v.z > 0.985;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.opacity = String(structure * (behind ? 0.25 : 1));
  });
}

interface SceneProps {
  count: number;
  progressRef: RefObject<number>;
  labelRefs: RefObject<(HTMLElement | null)[]>;
}

function OrbScene({ count, progressRef, labelRefs }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const nodesGroup = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);
  const res = useMemo(() => createOrbResources(count, gl.getPixelRatio()), [count, gl]);

  useEffect(() => () => disposeOrbResources(res), [res]);

  useFrame((state, delta) =>
    tickOrb(res, state, delta, group.current, nodesGroup.current, progressRef.current ?? 0, labelRefs.current),
  );

  return (
    <group ref={group}>
      <points geometry={res.geometry} material={res.material} />
      <group ref={nodesGroup} visible={false}>
        <lineSegments geometry={res.connectorGeometry} material={res.lineMaterial} />
        <lineLoop geometry={res.ringGeometry} material={res.ringMaterial} />
        {res.nodePositions.map((p, i) => (
          <mesh key={ORB_NODES[i]} position={p} material={res.nodeMaterial}>
            <sphereGeometry args={[0.014, 12, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function ScopeOrbCanvas({
  quality,
  progressRef,
  labelRefs,
  active,
}: {
  quality: "high" | "low";
  progressRef: RefObject<number>;
  labelRefs: RefObject<(HTMLElement | null)[]>;
  active: boolean;
}) {
  const count = quality === "high" ? 9000 : 2600;
  return (
    <Canvas
      aria-hidden="true"
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      style={{ pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <OrbScene count={count} progressRef={progressRef} labelRefs={labelRefs} />
    </Canvas>
  );
}
