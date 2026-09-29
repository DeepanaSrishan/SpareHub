import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCastAluminumBumpMap, getBrushedSteelBumpMap } from "./pbrTextures";

/**
 * PhotorealisticCoiloverShock:
 * High-performance inverted monotube damper with threaded aluminum body,
 * hard-chrome shaft, and progressive powdercoated spring.
 * Press to compress damper; releases with realistic hydraulic rebound.
 */
export default function PhotorealisticCoiloverShock({
  position = [2.85, 1.05, 0.65],
  rotation = [0, -0.32, 0.1],
  isHovered = false,
  isSelected = false,
  onHover,
  onUnhover,
  onSelect,
}) {
  const groupRef = useRef();
  const upperAssemblyRef = useRef();
  const springRef = useRef();

  const [isPressed, setIsPressed] = useState(false);
  const compressionRatioRef = useRef(0);
  const targetCompressionRef = useRef(0);

  const castAluminumBump = getCastAluminumBumpMap();
  const brushedSteelBump = getBrushedSteelBumpMap();

  useFrame((_, delta) => {
    if (!upperAssemblyRef.current || !springRef.current) return;

    const target = isPressed ? 1.0 : 0.0;
    targetCompressionRef.current = target;

    const lerpSpeed = isPressed ? 14 : 7;
    compressionRatioRef.current = THREE.MathUtils.lerp(
      compressionRatioRef.current,
      targetCompressionRef.current,
      delta * lerpSpeed
    );

    const comp = compressionRatioRef.current;
    const travel = comp * 0.45;

    upperAssemblyRef.current.position.y = 0.95 - travel;
    springRef.current.scale.y = 1.0 - comp * 0.38;
    springRef.current.position.y = -0.15 - travel * 0.5;
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsPressed(true);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    setIsPressed(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setIsPressed(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("shock");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "shock",
          name: "Inverted Monotube Coilover Damper",
          hint: "Press & hold to compress damper • Hydraulic rebound on release",
          specs: "46mm Hard-Chrome Piston • Threaded 7075-T6 Damper Body • 12kg/mm Chrome-Silicon Spring",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      cursor="pointer"
    >
      {/* 1. LOWER DAMPER BODY & MOUNT */}
      <group position={[0, -0.65, 0]}>
        {/* Spherical Bearing Eyelet Mount */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.18, 0.08, 16, 28]} />
          <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Lower Damper Tube (Threaded Titanium Anodized Body) */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.72, 32]} />
          <meshStandardMaterial
            color="#3f3f46"
            metalness={0.9}
            roughness={0.22}
            bumpMap={castAluminumBump}
            bumpScale={0.03}
          />
        </mesh>

        {/* Remote Piggyback Nitrogen Reservoir */}
        <mesh position={[0.28, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.55, 20]} />
          <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.3} />
        </mesh>

        {/* Billet Spring Perch Lock Rings */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 28]} />
          <meshStandardMaterial color="#27272a" metalness={0.92} roughness={0.25} />
        </mesh>
      </group>

      {/* 2. PROGRESSIVE HELICAL SUSPENSION SPRING (Powdercoated Titanium Charcoal) */}
      <group ref={springRef} position={[0, -0.15, 0]}>
        {[-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6].map((cy, idx) => (
          <mesh key={idx} position={[0, cy, 0]} rotation={[0.15, idx * 0.8, 0]} castShadow>
            <torusGeometry args={[0.32, 0.048, 14, 32]} />
            <meshStandardMaterial
              color="#52525b"
              metalness={0.7}
              roughness={0.28}
            />
          </mesh>
        ))}
      </group>

      {/* 3. UPPER ASSEMBLY (Hard-Chrome Shaft, Top Mount) */}
      <group ref={upperAssemblyRef} position={[0, 0.95, 0]}>
        {/* Mirror Polished Hard-Chrome Damper Shaft */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.95, 24]} />
          <meshStandardMaterial
            color="#f4f4f5"
            metalness={0.98}
            roughness={0.05}
            bumpMap={brushedSteelBump}
            bumpScale={0.005}
          />
        </mesh>

        {/* Upper Spring Top Cap Perch */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 28]} />
          <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Top Pillowball Eyelet Mount */}
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.18, 0.08, 16, 28]} />
          <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Rebound Clicker Adjuster Knob (Anodized Dark Bronze) */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 14]} />
          <meshStandardMaterial color="#78350f" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}
