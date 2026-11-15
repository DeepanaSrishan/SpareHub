import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ProceduralGears:
 * Dual interlocked precision spur gears with involute-style teeth.
 * Dragging rotates the driving gear, smoothly transmitting inverse motion to the driven gear.
 */
export default function ProceduralGears({
  position = [1.2, 0.45, 1.1],
  rotation = [0, -0.2, 0],
  isHovered = false,
  isSelected = false,
  onHover,
  onUnhover,
  onSelect,
  setControlsEnabled,
}) {
  const groupRef = useRef();
  const gear1Ref = useRef();
  const gear2Ref = useRef();

  const [isDragging, setIsDragging] = useState(false);
  const lastPointerXRef = useRef(0);
  const gear1AngleRef = useRef(0);
  const angularVelocityRef = useRef(0);

  // Gear 1 Parameters (Smaller driver gear)
  const R1 = 0.62;
  const N1 = 16;
  const gear1Teeth = [];
  for (let i = 0; i < N1; i++) {
    const angle = (i / N1) * Math.PI * 2;
    gear1Teeth.push({
      x: Math.cos(angle) * (R1 + 0.08),
      z: Math.sin(angle) * (R1 + 0.08),
      angle: -angle,
    });
  }

  // Gear 2 Parameters (Larger driven gear)
  const R2 = 0.95;
  const N2 = 24;
  const gear2Teeth = [];
  const gearRatio = R1 / R2; // Inverse ratio for driven gear
  for (let i = 0; i < N2; i++) {
    const angle = (i / N2) * Math.PI * 2 + (Math.PI / N2); // Stagger tooth mesh
    gear2Teeth.push({
      x: Math.cos(angle) * (R2 + 0.08),
      z: Math.sin(angle) * (R2 + 0.08),
      angle: -angle,
    });
  }

  // Intermeshed gear centers distance
  const centerDistance = R1 + R2 + 0.05;

  useFrame((_, delta) => {
    if (!gear1Ref.current || !gear2Ref.current) return;

    if (!isDragging) {
      if (Math.abs(angularVelocityRef.current) > 0.0005) {
        gear1AngleRef.current += angularVelocityRef.current * delta * 45;
        angularVelocityRef.current *= Math.pow(0.94, delta * 60);
      } else {
        angularVelocityRef.current = 0;
        if (isHovered) {
          gear1AngleRef.current += 0.8 * delta;
        }
      }
    }

    // Set rotational angles with opposing gear ratio
    gear1Ref.current.rotation.y = gear1AngleRef.current;
    gear2Ref.current.rotation.y = -gear1AngleRef.current * gearRatio;
  });

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    lastPointerXRef.current = e.clientX;
    angularVelocityRef.current = 0;
    if (setControlsEnabled) setControlsEnabled(false);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const dx = e.clientX - lastPointerXRef.current;
    const deltaAngle = dx * 0.02;

    gear1AngleRef.current += deltaAngle;
    angularVelocityRef.current = deltaAngle * 0.8;
    lastPointerXRef.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    if (setControlsEnabled) setControlsEnabled(true);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "gears",
          name: "Interlocking Transmission Spur Gears",
          hint: "Drag horizontally to mesh & rotate synchronized gears",
          specs: "Case-Hardened 8620 Steel • Precision Involute 1.5:1 Ratio",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("gears");
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      cursor={isDragging ? "grabbing" : "grab"}
    >
      {/* ==========================================
          GEAR 1 (Driver Gear - Left - Polished Gold)
          ========================================== */}
      <group ref={gear1Ref} position={[-centerDistance / 2, 0, 0]}>
        {/* Main Body Disc */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R1, R1, 0.16, 32]} />
          <meshStandardMaterial
            color={isSelected ? "#fef08a" : isHovered ? "#fde047" : "#fbbf24"}
            metalness={0.92}
            roughness={0.16}
            emissive={isHovered ? "#eab308" : "#000000"}
            emissiveIntensity={isHovered ? 0.3 : 0}
          />
        </mesh>

        {/* Center Shaft & Keyway */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.35, 18]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Weight-Reduction Windows */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(ang) * 0.36, 0.082, Math.sin(ang) * 0.36]}
          >
            <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.6} />
          </mesh>
        ))}

        {/* Teeth Array (High-Gloss Gold) */}
        {gear1Teeth.map((tooth, idx) => (
          <mesh
            key={idx}
            position={[tooth.x, 0, tooth.z]}
            rotation={[0, tooth.angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.12, 0.15, 0.16]} />
            <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.12} />
          </mesh>
        ))}
      </group>

      {/* ==========================================
          GEAR 2 (Driven Gear - Right - Titanium Cyan)
          ========================================== */}
      <group ref={gear2Ref} position={[centerDistance / 2, 0, 0]}>
        {/* Main Body Disc */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R2, R2, 0.16, 40]} />
          <meshStandardMaterial
            color={isHovered ? "#7dd3fc" : "#0284c7"}
            metalness={0.9}
            roughness={0.18}
            emissive={isHovered ? "#38bdf8" : "#000000"}
            emissiveIntensity={isHovered ? 0.35 : 0}
          />
        </mesh>

        {/* Center Shaft */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.35, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Weight-Reduction Windows (6 Holes) */}
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const ang = (idx / 6) * Math.PI * 2;
          return (
            <mesh
              key={idx}
              position={[Math.cos(ang) * 0.55, 0.082, Math.sin(ang) * 0.55]}
            >
              <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.6} />
            </mesh>
          );
        })}

        {/* Teeth Array (Mirror Chrome) */}
        {gear2Teeth.map((tooth, idx) => (
          <mesh
            key={idx}
            position={[tooth.x, 0, tooth.z]}
            rotation={[0, tooth.angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.13, 0.15, 0.18]} />
            <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
