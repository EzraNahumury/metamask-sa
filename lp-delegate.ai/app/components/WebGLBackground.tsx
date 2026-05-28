"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Ambient particle field. Original implementation: a sphere of points
 * rotating slowly, with a subtle wave on the y-axis. No external models,
 * no third-party shaders.
 */
function ParticleField({ count = 1800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const accent = new THREE.Color("#34d399");
    const accent2 = new THREE.Color("#38bdf8");
    const accent3 = new THREE.Color("#a78bfa");
    for (let i = 0; i < count; i++) {
      // Distribute on a sphere with mild radial jitter.
      const r = 4.2 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const mix = Math.random();
      const c =
        mix < 0.55 ? accent : mix < 0.85 ? accent2 : accent3;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={colors.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function WebGLBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-90">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticleField />
      </Canvas>
      {/* Vignette so particles fade into the page edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 40%, transparent 0%, rgba(7,8,12,0.85) 100%)",
        }}
      />
    </div>
  );
}
