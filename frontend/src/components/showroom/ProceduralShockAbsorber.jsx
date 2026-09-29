import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

/**
 * ProceduralShockAbsorber:
 * Coilover suspension damper.
 * Press & hold: compresses damper piston and spring.
 * Release: recoils smoothly with damped spring oscillation.
 */
export default function ProceduralShockAbsorber({
  position = [2.9, 1.05, 0.6],
  rotation = [0, -0.3, 0.1],
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
  const compressionRatioRef = useRef(0); // 0 = fully extended, 1 = fully compressed
  const targetCompressionRef = useRef(0);

  // Smooth spring physics in useFrame
  useFrame((_, delta) => {
    if (!upperAssemblyRef.current || !springRef.current) return;

    // Interpolate towards target compression
    const target = isPressed ? 1.0 : 0.0;
    targetCompressionRef.current = target;

    // Quick compression, damped smooth rebound
    const lerpSpeed = isPressed ? 14 : 7;
    compressionRatioRef.current = THREE.MathUtils.lerp(
      compressionRatioRef.current,
      targetCompressionRef.current,
      delta * lerpSpeed
    );

    const comp = compressionRatioRef.current;
    const compressionTravel = comp * 0.45; // Max 0.45 units downward travel

    // Move upper shaft and top eyelet down
    upperAssemblyRef.current.position.y = 0.95 - compressionTravel;

    // Compress the helical spring along Y
    springRef.current.scale.y = 1.0 - comp * 0.38;
    springRef.current.position.y = -0.15 - compressionTravel * 0.5;
  });

  // Manual Trigger helper
  const handleCompressTrigger = () => {
    setIsPressed(true);
    setTimeout(() => {
      setIsPressed(false);
    }, 700);
  };

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
          hint: "Press & hold to compress spring • Releases with damped recoil",
          specs: "46mm Nitrogen Piston • Progressive 12kg/mm Spring • Rebound Damped",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      cursor="pointer"
    >
      {/* ==========================================
          1. LOWER DAMPER BODY & MOUNT (Stationary)
          ========================================== */}
      <group position={[0, -0.65, 0]}>
        {/* Bottom Bushing Eyelet */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.18, 0.08, 16, 28]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Lower Damper Outer Body Tube (Electric Anodized Blue) */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.72, 32]} />
          <meshStandardMaterial
            color={isSelected ? "#38bdf8" : "#0284c7"}
            metalness={0.92}
            roughness={0.16}
            emissive={isHovered ? "#38bdf8" : "#000000"}
            emissiveIntensity={isHovered ? 0.35 : 0}
          />
        </mesh>

        {/* External Piggyback Nitrogen Reservoir Tube */}
        <mesh position={[0.28, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.55, 20]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Lower Spring Perch Collar */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 28]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ==========================================
          2. COILED SUSPENSION SPRING (High-Visibility Racing Red)
          ========================================== */}
      <group ref={springRef} position={[0, -0.15, 0]}>
        {/* Array of helical spring coils */}
        {[-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6].map((cy, idx) => (
          <mesh key={idx} position={[0, cy, 0]} rotation={[0.15, idx * 0.8, 0]} castShadow>
            <torusGeometry args={[0.32, 0.048, 14, 32]} />
            <meshStandardMaterial
              color={isHovered ? "#f87171" : "#ef4444"}
              metalness={0.5}
              roughness={0.2}
              emissive={isHovered ? "#ef4444" : "#000000"}
              emissiveIntensity={isHovered ? 0.25 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* ==========================================
          3. UPPER ASSEMBLY (Shaft, Perch, Eyelet)
          ========================================== */}
      <group ref={upperAssemblyRef} position={[0, 0.95, 0]}>
        {/* Polished Chrome Inverted Piston Rod */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.95, 24]} />
          <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.05} />
        </mesh>

        {/* Upper Spring Top Cap Perch */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 28]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Top Pillowball Eyelet Mount */}
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.18, 0.08, 16, 28]} />
          <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Rebound Clicker Adjuster Knob */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 14]} />
          <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
