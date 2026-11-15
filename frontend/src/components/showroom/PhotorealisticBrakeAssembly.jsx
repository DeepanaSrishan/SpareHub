import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { getCastAluminumBumpMap, getBrushedSteelBumpMap } from "./pbrTextures";

/**
 * PhotorealisticBrakeAssembly:
 * 2-Piece floating ventilated brake rotor with directional cooling vanes,
 * countersunk cross-drilled holes, billet aluminum mounting bell, and
 * 6-piston monobloc powdercoated caliper.
 * Draggable along constrained floor plane; smoothly recoils to base position.
 */
export default function PhotorealisticBrakeAssembly({
  position = [-3.3, 0.72, 0.7],
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

  // Authentic PBR Textures
  const castAluminumBump = useMemo(() => getCastAluminumBumpMap(), []);
  const brushedSteelBump = useMemo(() => getBrushedSteelBumpMap(), []);

  // Countersunk drilled holes pattern
  const drillHoles = useMemo(() => {
    const holes = [];
    const rings = [0.85, 1.05, 1.25];
    for (const radius of rings) {
      const count = radius === 0.85 ? 12 : radius === 1.05 ? 16 : 20;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        holes.push({
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
        });
      }
    }
    return holes;
  }, []);

  // 10 Floating Rotor Drive Bobbins (connecting hat to friction ring)
  const bobbins = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      arr.push({
        x: Math.cos(angle) * 0.68,
        z: Math.sin(angle) * 0.68,
      });
    }
    return arr;
  }, []);

  // Lug nuts
  const lugNuts = useMemo(() => {
    const nuts = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      nuts.push({
        x: Math.cos(angle) * 0.38,
        z: Math.sin(angle) * 0.38,
      });
    }
    return nuts;
  }, []);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    if (setControlsEnabled) setControlsEnabled(false);

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
      groupRef.current.position.x = THREE.MathUtils.clamp(newPos.x, -5.5, -1);
      groupRef.current.position.z = THREE.MathUtils.clamp(newPos.z, -1, 3);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    if (setControlsEnabled) setControlsEnabled(true);
    e.target.releasePointerCapture?.(e.pointerId);

    if (groupRef.current) {
      gsap.to(groupRef.current.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 0.75,
        ease: "back.out(1.4)",
      });
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("rotor");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "rotor",
          name: "Ventilated 380mm Floating Brake Rotor & Caliper",
          hint: "Drag across floor • Releases with damped spring return",
          specs: "High-Carbon Alloy Iron Friction Ring • Forged 6-Piston Caliper • Titanium Bobbins",
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
      {/* 1. Main Rotor Friction Ring (Turned Brushed Steel) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.12, 48]} />
        <meshStandardMaterial
          color="#d4d4d8"
          metalness={0.94}
          roughness={0.2}
          bumpMap={brushedSteelBump}
          bumpScale={0.02}
        />
      </mesh>

      {/* 2. Internal Cooling Vanes Channel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.42, 1.42, 0.08, 36]} />
        <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.6} />
      </mesh>

      {/* 3. Center Mounting Hat / Bell (Anodized T6 Black Billet) */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.66, 0.72, 0.16, 32]} />
        <meshStandardMaterial
          color="#18181b"
          metalness={0.9}
          roughness={0.25}
          bumpMap={castAluminumBump}
          bumpScale={0.02}
        />
      </mesh>

      {/* 4. Center Axle Register */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#09090b" metalness={0.6} roughness={0.7} />
      </mesh>

      {/* 5. Floating Drive Bobbins (Connecting Hat to Ring) */}
      {bobbins.map((b, idx) => (
        <mesh key={idx} position={[b.x, 0.07, b.z]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}

      {/* 6. Wheel Lug Studs */}
      {lugNuts.map((nut, idx) => (
        <mesh key={idx} position={[nut.x, 0.17, nut.z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.07, 6]} />
          <meshStandardMaterial color="#e4e4e7" metalness={0.96} roughness={0.12} />
        </mesh>
      ))}

      {/* 7. Countersunk Drill Holes */}
      {drillHoles.map((hole, idx) => (
        <mesh key={idx} position={[hole.x, 0.061, hole.z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
          <meshStandardMaterial color="#09090b" metalness={0.5} roughness={0.8} />
        </mesh>
      ))}

      {/* 8. Monobloc 6-Piston Caliper (Authentic OEM Deep Brembo Red Powdercoat) */}
      <group position={[1.12, 0.14, 0]} rotation={[0, 0, 0]}>
        {/* Caliper Outer Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.32, 1.04]} />
          <meshStandardMaterial
            color="#991b1b"
            metalness={0.4}
            roughness={0.32}
            bumpMap={castAluminumBump}
            bumpScale={0.03}
          />
        </mesh>

        {/* 3 Caliper Pistons (Machined Titanium) */}
        {[-0.32, 0, 0.32].map((pz, idx) => (
          <mesh key={idx} position={[-0.24, 0, pz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.1, 16]} />
            <meshStandardMaterial color="#71717a" metalness={0.92} roughness={0.2} />
          </mesh>
        ))}

        {/* Top Hydraulic Fluid Bridge Pipe */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.65, 12]} />
          <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* Subtle Cast Caliper Logo Badge */}
        <mesh position={[0.275, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.5, 0.1]} />
          <meshStandardMaterial color="#f4f4f5" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
