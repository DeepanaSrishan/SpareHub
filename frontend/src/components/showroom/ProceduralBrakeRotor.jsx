import { useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * ProceduralBrakeRotor:
 * Slotted ventilated metallic disc with 6-piston monobloc red caliper.
 * Drag along constrained X-Z plane; smoothly returns to base on release via GSAP.
 */
export default function ProceduralBrakeRotor({
  position = [-3.4, 0.75, 0.6],
  rotation = [0, 0.35, 0],
  isHovered = false,
  isSelected = false,
  onHover,
  onUnhover,
  onSelect,
  setControlsEnabled,
}) {
  const groupRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -position[1]));
  const raycasterRef = useRef(new THREE.Raycaster());
  const intersectionPointRef = useRef(new THREE.Vector3());
  const offsetRef = useRef(new THREE.Vector3());

  // Radial drill hole pattern around rotor
  const drillHoles = [];
  const holeRings = [0.85, 1.05, 1.25];
  for (const radius of holeRings) {
    const count = radius === 0.85 ? 12 : radius === 1.05 ? 16 : 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      drillHoles.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      });
    }
  }

  // Lug nuts on center hub
  const lugNuts = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    lugNuts.push({
      x: Math.cos(angle) * 0.4,
      z: Math.sin(angle) * 0.4,
    });
  }

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    if (setControlsEnabled) setControlsEnabled(false);

    // Compute pointer offset
    const plane = dragPlaneRef.current;
    raycasterRef.current.setFromCamera(e.pointer, e.camera);
    if (raycasterRef.current.ray.intersectPlane(plane, intersectionPointRef.current)) {
      offsetRef.current.copy(groupRef.current.position).sub(intersectionPointRef.current);
    }
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !groupRef.current) return;
    e.stopPropagation();

    const plane = dragPlaneRef.current;
    raycasterRef.current.setFromCamera(e.pointer, e.camera);
    if (raycasterRef.current.ray.intersectPlane(plane, intersectionPointRef.current)) {
      const newPos = intersectionPointRef.current.add(offsetRef.current);
      // Constrain dragging to bounds near showroom floor
      groupRef.current.position.x = THREE.MathUtils.clamp(newPos.x, -6, -1);
      groupRef.current.position.z = THREE.MathUtils.clamp(newPos.z, -1, 3);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    if (setControlsEnabled) setControlsEnabled(true);
    e.target.releasePointerCapture?.(e.pointerId);

    // GSAP Smooth return to base display position
    if (groupRef.current) {
      gsap.to(groupRef.current.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 0.75,
        ease: "back.out(1.5)",
      });
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "rotor",
          name: "Ventilated 380mm Brake Rotor & Caliper",
          hint: "Drag across floor • Releases smoothly with recoil",
          specs: "Carbon-Silicon Carbide Matrix • 6-Piston Monobloc Caliper",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("rotor");
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      cursor={isDragging ? "grabbing" : "grab"}
    >
      {/* 1. Main Rotor Disc (Ventilated Friction Ring - Brushed Stainless Steel) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.12, 48]} />
        <meshStandardMaterial
          color={isHovered ? "#e0f2fe" : "#ffffff"}
          metalness={0.96}
          roughness={0.12}
          emissive={isHovered ? "#38bdf8" : "#000000"}
          emissiveIntensity={isHovered ? 0.35 : 0}
        />
      </mesh>

      {/* 2. Ventilation Vanes Internal Core */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.42, 1.42, 0.08, 36]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.4} />
      </mesh>

      {/* 3. Center Mounting Hat / Bell (Gunmetal Anodized Aluminum) */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.7, 0.18, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 4. Center Axle Hole */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* 5. Chrome Lug Nuts */}
      {lugNuts.map((nut, idx) => (
        <mesh key={idx} position={[nut.x, 0.18, nut.z]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.08, 6]} />
          <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.08} />
        </mesh>
      ))}

      {/* 6. Drill Holes Accents */}
      {drillHoles.map((hole, idx) => (
        <mesh key={idx} position={[hole.x, 0.062, hole.z]}>
          <cylinderGeometry args={[0.022, 0.022, 0.01, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.8} />
        </mesh>
      ))}

      {/* 7. Monobloc 6-Piston Ferrari Red Caliper */}
      <group position={[1.1, 0.14, 0]} rotation={[0, 0, 0]}>
        {/* Caliper Outer Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.32, 1.05]} />
          <meshStandardMaterial
            color={isSelected ? "#ff3333" : "#ef4444"}
            metalness={0.7}
            roughness={0.18}
            emissive={isHovered ? "#ef4444" : "#000000"}
            emissiveIntensity={isHovered ? 0.35 : 0}
          />
        </mesh>

        {/* Caliper Pistons (3 on outer face) */}
        {[-0.32, 0, 0.32].map((pz, idx) => (
          <mesh key={idx} position={[-0.24, 0, pz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.1, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Caliper Top Fluid Bridge Pipe */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.65, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.2} />
        </mesh>

        {/* Caliper Brand Plate */}
        <mesh position={[0.28, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.6, 0.12]} />
          <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
