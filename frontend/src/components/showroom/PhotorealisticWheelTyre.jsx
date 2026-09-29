import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCastAluminumBumpMap, getRubberGrainBumpMap, getBrushedSteelBumpMap } from "./pbrTextures";

/**
 * PhotorealisticWheelTyre:
 * Photorealistic automotive wheel with vulcanized rubber compound tyre,
 * circumferential drainage tread grooves, forged aluminum multi-spoke rim,
 * brake rotor behind spokes, and natural rolling inertia.
 */
export default function PhotorealisticWheelTyre({
  position = [-1.75, 1.08, 0.85],
  rotation = [0, 0.42, 0],
  isHovered = false,
  isSelected = false,
  onHover,
  onUnhover,
  onSelect,
  setControlsEnabled,
}) {
  const wheelGroupRef = useRef();
  const rotatingAssemblyRef = useRef();

  const [isDragging, setIsDragging] = useState(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const angularVelocityRef = useRef(0);
  const rotationAngleRef = useRef(0);

  // Authentic PBR Textures
  const rubberGrainBump = useMemo(() => getRubberGrainBumpMap(), []);
  const castAluminumBump = useMemo(() => getCastAluminumBumpMap(), []);
  const brushedSteelBump = useMemo(() => getBrushedSteelBumpMap(), []);

  // 36 Transverse tread blocks around the tyre perimeter
  const treadBlocks = useMemo(() => {
    const blocks = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      blocks.push({
        x: Math.cos(angle) * 1.06,
        y: Math.sin(angle) * 1.06,
        angle: angle,
      });
    }
    return blocks;
  }, []);

  // 10 Split alloy spokes (5 pairs)
  const spokes = useMemo(() => {
    const angles = [];
    for (let i = 0; i < 10; i++) {
      angles.push((i / 10) * Math.PI * 2);
    }
    return angles;
  }, []);

  // Physics Loop: Direct drag torque, realistic angular inertia & rolling resistance
  useFrame((_, delta) => {
    if (!rotatingAssemblyRef.current) return;

    if (!isDragging) {
      if (Math.abs(angularVelocityRef.current) > 0.0002) {
        rotationAngleRef.current += angularVelocityRef.current * delta * 50;
        // Believable rolling resistance friction
        angularVelocityRef.current *= Math.pow(0.962, delta * 60);
      } else {
        angularVelocityRef.current = 0;
      }
    }

    rotatingAssemblyRef.current.rotation.z = rotationAngleRef.current;
  });

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    angularVelocityRef.current = 0;
    if (setControlsEnabled) setControlsEnabled(false);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    const deltaAngle = (dx - dy * 0.25) * 0.012;

    rotationAngleRef.current += deltaAngle;
    angularVelocityRef.current = deltaAngle * 0.9;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
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
      ref={wheelGroupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("tyre");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "tyre",
          name: "High-Performance Semi-Slick Tire & Forged Wheel",
          hint: "Drag tire to spin with authentic inertia & friction deceleration",
          specs: "275/35 R19 Vulcanized Silica Compound • Forged 6061-T6 Aluminum Wheel",
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
      {/* Fixed Wheel Spindle & Suspension Upright */}
      <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.55, 18]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>

      {/* Rotating Wheel, Tire, and Brake Assembly */}
      <group ref={rotatingAssemblyRef}>
        {/* 1. Main Vulcanized Rubber Tire Body */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.58, 48]} />
          <meshStandardMaterial
            color="#181a1f"
            roughness={0.88}
            metalness={0.04}
            bumpMap={rubberGrainBump}
            bumpScale={0.03}
          />
        </mesh>

        {/* 2. Circumferential Water Channel Grooves (3 Recessed Rings) */}
        {[-0.15, 0, 0.15].map((zPos, idx) => (
          <mesh key={idx} position={[0, 0, zPos]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.155, 1.155, 0.04, 48]} />
            <meshStandardMaterial
              color="#0d0e12"
              roughness={0.95}
              metalness={0.02}
            />
          </mesh>
        ))}

        {/* 3. Outer Tread Blocks & Siping */}
        {treadBlocks.map((tread, idx) => (
          <mesh
            key={idx}
            position={[tread.x, tread.y, 0]}
            rotation={[0, 0, tread.angle]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.1, 0.54]} />
            <meshStandardMaterial
              color="#131519"
              roughness={0.92}
              metalness={0.03}
            />
          </mesh>
        ))}

        {/* 4. Forged Aluminum Wheel Rim Barrel (Satin Gunmetal Finish) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.6, 40]} />
          <meshStandardMaterial
            color="#9ca3af"
            metalness={0.92}
            roughness={0.22}
            bumpMap={castAluminumBump}
            bumpScale={0.02}
          />
        </mesh>

        {/* 5. Machined Outer Wheel Lip / Flange */}
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.82, 0.04, 16, 48]} />
          <meshStandardMaterial
            color="#d4d4d8"
            metalness={0.95}
            roughness={0.16}
          />
        </mesh>

        {/* 6. Wheel Center Hub with Engraved Medallion */}
        <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.14, 24]} />
          <meshStandardMaterial
            color="#3f3f46"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0, 0.33]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 24]} />
          <meshStandardMaterial
            color="#27272a"
            metalness={0.92}
            roughness={0.2}
            bumpMap={brushedSteelBump}
            bumpScale={0.04}
          />
        </mesh>

        {/* 7. Chrome Wheel Lug Nuts (5 Studs) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const ang = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(ang) * 0.18, Math.sin(ang) * 0.18, 0.32]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.026, 0.026, 0.06, 6]} />
              <meshStandardMaterial
                color="#e4e4e7"
                metalness={0.96}
                roughness={0.12}
              />
            </mesh>
          );
        })}

        {/* 8. Alloy Wheel Spokes (Forged Split Spokes) */}
        {spokes.map((angle, idx) => (
          <group key={idx} rotation={[0, 0, angle]}>
            <mesh position={[0.5, 0, 0.22]} castShadow>
              <boxGeometry args={[0.54, 0.07, 0.1]} />
              <meshStandardMaterial
                color="#d4d4d8"
                metalness={0.94}
                roughness={0.18}
                bumpMap={castAluminumBump}
                bumpScale={0.02}
              />
            </mesh>
          </group>
        ))}

        {/* 9. Valve Stem & Cap */}
        <mesh position={[0.68, 0.1, 0.27]} rotation={[0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 12]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* 10. Ventilated Brake Rotor visible behind spokes */}
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.64, 0.64, 0.04, 32]} />
          <meshStandardMaterial
            color="#a1a1aa"
            metalness={0.92}
            roughness={0.28}
            bumpMap={brushedSteelBump}
            bumpScale={0.03}
          />
        </mesh>
      </group>
    </group>
  );
}
