import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ProceduralWheelTyre:
 * Fixed-center wheel & performance tyre.
 * Hover: gentle spin around axle.
 * Drag: direct rotational control with angular velocity inertia and smooth deceleration.
 */
export default function ProceduralWheelTyre({
  position = [-1.8, 1.1, 0.8],
  rotation = [0, 0.45, 0],
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

  // Tread block markers around the tyre perimeter
  const treadBlocks = [];
  const numTreads = 36;
  for (let i = 0; i < numTreads; i++) {
    const angle = (i / numTreads) * Math.PI * 2;
    treadBlocks.push({
      x: Math.cos(angle) * 1.05,
      y: Math.sin(angle) * 1.05,
      angle: angle,
    });
  }

  // 10 Split alloy spokes (5 pairs)
  const spokes = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    spokes.push(angle);
  }

  // Physics & Animation Loop: Delta-time rotation, gentle hover spin & inertia deceleration
  useFrame((_, delta) => {
    if (!rotatingAssemblyRef.current) return;

    if (isDragging) {
      // Direct drag driving
    } else {
      // If there's inertia from drag, apply with smooth friction
      if (Math.abs(angularVelocityRef.current) > 0.0005) {
        rotationAngleRef.current += angularVelocityRef.current * delta * 45;
        angularVelocityRef.current *= Math.pow(0.955, delta * 60);
      } else {
        angularVelocityRef.current = 0;
        // If hovered and idle, gently rotate around axle
        if (isHovered) {
          rotationAngleRef.current += 1.2 * delta;
        }
      }
    }

    rotatingAssemblyRef.current.rotation.z = rotationAngleRef.current;
  });

  // Pointer Drag Handlers for Spinning
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
    // Tangential drag projection (horizontal drag creates rotation)
    const deltaAngle = (dx - dy * 0.3) * 0.015;

    rotationAngleRef.current += deltaAngle;
    angularVelocityRef.current = deltaAngle * 0.85;
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
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "tyre",
          name: "High-Performance Semi-Slick Tyre & Forged Rim",
          hint: "Hover to spin • Drag horizontally to spin with inertia",
          specs: "275/35 R19 Compound • Forged Monoblock Aluminum 9.5J",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("tyre");
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      cursor={isDragging ? "grabbing" : "grab"}
    >
      {/* Fixed Axle Spindle Support */}
      <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Rotating Wheel & Tyre Assembly */}
      <group ref={rotatingAssemblyRef}>
        {/* 1. Main Rubber Tyre Body (Compound Cylinder - Charcoal) */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.58, 48]} />
          <meshStandardMaterial
            color={isHovered ? "#3b4758" : "#283344"}
            roughness={0.65}
            metalness={0.2}
            emissive={isHovered ? "#38bdf8" : "#000000"}
            emissiveIntensity={isHovered ? 0.25 : 0}
          />
        </mesh>

        {/* 2. Outer Tyre Tread Grippers (Clearly visible pattern) */}
        {treadBlocks.map((tread, idx) => (
          <mesh
            key={idx}
            position={[tread.x, tread.y, 0]}
            rotation={[0, 0, tread.angle]}
            castShadow
          >
            <boxGeometry args={[0.045, 0.12, 0.54]} />
            <meshStandardMaterial color="#1a202c" roughness={0.7} metalness={0.15} />
          </mesh>
        ))}

        {/* 3. Metallic Alloy Wheel Rim Barrel (Diamond Cut Chrome) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.6, 40]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.98}
            roughness={0.08}
          />
        </mesh>

        {/* 4. Polished Outer Wheel Lip / Flange */}
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.82, 0.05, 16, 48]} />
          <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.08} />
        </mesh>

        {/* 4b. Neon Cyan Speed Indicator Ring (Shows rotation clearly) */}
        <mesh position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.74, 0.77, 48]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>

        {/* 5. Central Hub & Center Cap with SpareHub blue glow */}
        <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.33]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.8}
            metalness={0.5}
            roughness={0.1}
          />
        </mesh>

        {/* 6. Alloy Wheel Spokes (Brilliant Polished Beams) */}
        {spokes.map((angle, idx) => (
          <group key={idx} rotation={[0, 0, angle]}>
            <mesh position={[0.5, 0, 0.22]} rotation={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.55, 0.08, 0.1]} />
              <meshStandardMaterial
                color="#ffffff"
                metalness={0.98}
                roughness={0.12}
              />
            </mesh>
          </group>
        ))}

        {/* 7. Visible Mini Brake Disc behind the spokes */}
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.04, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
