import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getBrushedSteelBumpMap } from "./pbrTextures";

/**
 * PhotorealisticTransmissionGears:
 * Case-hardened carburized 8620 steel spur gears with precision ground teeth.
 * Dragging rotates the driving gear with synchronized counter-rotation.
 */
export default function PhotorealisticTransmissionGears({
  position = [1.2, 0.45, 1.15],
  rotation = [0, -0.22, 0],
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

  const brushedSteelBump = useMemo(() => getBrushedSteelBumpMap(), []);

  // Gear 1 Parameters (Driver Gear)
  const R1 = 0.62;
  const N1 = 16;
  const gear1Teeth = useMemo(() => {
    const teeth = [];
    for (let i = 0; i < N1; i++) {
      const angle = (i / N1) * Math.PI * 2;
      teeth.push({
        x: Math.cos(angle) * (R1 + 0.08),
        z: Math.sin(angle) * (R1 + 0.08),
        angle: -angle,
      });
    }
    return teeth;
  }, []);

  // Gear 2 Parameters (Driven Gear)
  const R2 = 0.95;
  const N2 = 24;
  const gearRatio = R1 / R2;
  const gear2Teeth = useMemo(() => {
    const teeth = [];
    for (let i = 0; i < N2; i++) {
      const angle = (i / N2) * Math.PI * 2 + Math.PI / N2;
      teeth.push({
        x: Math.cos(angle) * (R2 + 0.08),
        z: Math.sin(angle) * (R2 + 0.08),
        angle: -angle,
      });
    }
    return teeth;
  }, []);

  const centerDistance = R1 + R2 + 0.05;

  useFrame((_, delta) => {
    if (!gear1Ref.current || !gear2Ref.current) return;

    if (!isDragging) {
      if (Math.abs(angularVelocityRef.current) > 0.0003) {
        gear1AngleRef.current += angularVelocityRef.current * delta * 45;
        angularVelocityRef.current *= Math.pow(0.95, delta * 60);
      } else {
        angularVelocityRef.current = 0;
      }
    }

    gear1Ref.current.rotation.y = gear1AngleRef.current;
    gear2Ref.current.rotation.y = -gear1AngleRef.current * gearRatio;
  });

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
    const deltaAngle = dx * 0.015;

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
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("gears");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "gears",
          name: "Carburized 8620 Steel Transmission Gearset",
          hint: "Drag horizontally to rotate intermeshed gear pair",
          specs: "Case-Hardened 58-62 HRC • Precision Ground Involute Teeth • 1.5:1 Transmission Ratio",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      cursor={isDragging ? "grabbing" : "grab"}
    >
      {/* =========================================================
          GEAR 1 (Hardened Alloy Steel Driver Gear)
          ========================================================= */}
      <group ref={gear1Ref} position={[-centerDistance / 2, 0, 0]}>
        {/* Main Gear Disc */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R1, R1, 0.16, 32]} />
          <meshStandardMaterial
            color="#71717a"
            metalness={0.92}
            roughness={0.22}
            bumpMap={brushedSteelBump}
            bumpScale={0.02}
          />
        </mesh>

        {/* Center Shaft & Broached Keyway */}
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.32, 20]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.88} roughness={0.3} />
        </mesh>

        {/* Weight-Reduction Windows */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(ang) * 0.36, 0.081, Math.sin(ang) * 0.36]}
          >
            <cylinderGeometry args={[0.08, 0.08, 0.015, 16]} />
            <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.7} />
          </mesh>
        ))}

        {/* Ground Teeth Array */}
        {gear1Teeth.map((tooth, idx) => (
          <mesh
            key={idx}
            position={[tooth.x, 0, tooth.z]}
            rotation={[0, tooth.angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.12, 0.15, 0.16]} />
            <meshStandardMaterial
              color="#a1a1aa"
              metalness={0.94}
              roughness={0.16}
            />
          </mesh>
        ))}
      </group>

      {/* =========================================================
          GEAR 2 (Hardened Alloy Steel Driven Gear)
          ========================================================= */}
      <group ref={gear2Ref} position={[centerDistance / 2, 0, 0]}>
        {/* Main Gear Disc */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R2, R2, 0.16, 40]} />
          <meshStandardMaterial
            color="#52525b"
            metalness={0.92}
            roughness={0.24}
            bumpMap={brushedSteelBump}
            bumpScale={0.02}
          />
        </mesh>

        {/* Center Shaft */}
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.32, 24]} />
          <meshStandardMaterial color="#27272a" metalness={0.88} roughness={0.3} />
        </mesh>

        {/* 6 Weight-Reduction Windows */}
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const ang = (idx / 6) * Math.PI * 2;
          return (
            <mesh
              key={idx}
              position={[Math.cos(ang) * 0.55, 0.081, Math.sin(ang) * 0.55]}
            >
              <cylinderGeometry args={[0.13, 0.13, 0.015, 16]} />
              <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.7} />
            </mesh>
          );
        })}

        {/* Ground Teeth Array */}
        {gear2Teeth.map((tooth, idx) => (
          <mesh
            key={idx}
            position={[tooth.x, 0, tooth.z]}
            rotation={[0, tooth.angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.13, 0.15, 0.18]} />
            <meshStandardMaterial
              color="#a1a1aa"
              metalness={0.94}
              roughness={0.16}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
