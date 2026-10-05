// GLSL for the Scope Orb particle system.
// Stages driven by uProgress (0 → 1):
//   0.00–0.35  stray "brief" particles converge into the sphere (chaos → analysis)
//   0.35–0.70  sphere particles snap into latitude bands (analysis → structure)

export const orbVertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uSize;
uniform vec3 uPointer;

attribute vec3 aSphere;
attribute vec3 aChaos;
attribute float aSeed;
attribute float aStray;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;

mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

void main() {
  float converge = smoothstep(0.0, 0.35, uProgress);
  float structure = smoothstep(0.35, 0.72, uProgress);

  vec3 p = aSphere;

  // Internal currents: each latitude drifts at its own speed, so the surface
  // reads as slow moving fluid rather than a rigid ball.
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float current = uTime * (0.05 + 0.04 * sin(lat * 3.0 + aSeed * 6.2831));
  p.xz = rot(current) * p.xz;
  p += normalize(p) * 0.025 * sin(uTime * 0.6 + aSeed * 40.0);

  // Structure: quantise latitude into bands — information becoming ordered.
  float bands = 14.0;
  float bandLat = floor((lat / 3.14159 + 0.5) * bands + 0.5) / bands * 3.14159 - 1.5708;
  float lon = atan(p.z, p.x);
  vec3 banded = vec3(cos(bandLat) * cos(lon), sin(bandLat), cos(bandLat) * sin(lon));
  p = mix(p, banded, structure);

  // Stray particles: unstructured brief data drifting outside the sphere.
  vec3 chaos = aChaos;
  chaos.xz = rot(uTime * 0.02 * (aSeed - 0.5)) * chaos.xz;
  chaos.y += sin(uTime * 0.3 + aSeed * 20.0) * 0.08;
  p = mix(p, mix(chaos, p, converge), aStray);

  // Cursor: nearby particles lean gently away from the pointer direction.
  vec3 toPointer = p - uPointer;
  float influence = smoothstep(0.9, 0.0, length(toPointer));
  p += normalize(toPointer + 0.0001) * influence * 0.06;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.65 + 0.35 * sin(uTime * 1.3 + aSeed * 50.0);
  gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.75) / -mv.z;

  vColor = aColor;
  // Back-facing particles recede, giving depth without lighting.
  float facing = smoothstep(-1.2, 0.6, mv.z + 4.2);
  vAlpha = twinkle * mix(0.35, 1.0, facing) * mix(0.55, 1.0, 1.0 - aStray * (1.0 - converge));
}
`;

export const orbFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor, core * core * vAlpha);
}
`;
