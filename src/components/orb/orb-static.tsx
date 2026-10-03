// Static, zero-JS rendition of the Scope Orb. Used before WebGL loads, for
// reduced-motion users and on devices without WebGL. Rendered on the server.

const DOTS = (() => {
  const count = 520;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const tilt = 0.35;
  const out: Array<{ x: number; y: number; r: number; o: number; c: string }> = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const t = golden * i;
    const x = Math.cos(t) * radius;
    const z0 = Math.sin(t) * radius;
    // Tilt toward the viewer so the poles read as a sphere, not a disc.
    const yy = y * Math.cos(tilt) - z0 * Math.sin(tilt);
    const z = y * Math.sin(tilt) + z0 * Math.cos(tilt);
    const front = (z + 1) / 2;
    const c = i % 23 === 0 ? "#f3d6ff" : i % 5 === 0 ? "#f2fffe" : i % 2 === 0 ? "#3fd3c7" : "#a8fff7";
    out.push({
      x: +(200 + x * 150).toFixed(2),
      y: +(200 + yy * 150).toFixed(2),
      r: +(0.6 + front * 1.1).toFixed(2),
      o: +(0.15 + front * 0.75).toFixed(2),
      c,
    });
  }
  return out;
})();

export function OrbStatic({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div
        className="absolute inset-[18%] rounded-full motion-safe:animate-[orb-breathe_9s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(63,211,199,0.22) 0%, rgba(15,127,120,0.12) 40%, rgba(1,38,36,0) 70%)",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <ellipse cx="200" cy="200" rx="262" ry="46" fill="none" stroke="#edfffe" strokeOpacity="0.1" />
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={d.o} />
        ))}
      </svg>
    </div>
  );
}
