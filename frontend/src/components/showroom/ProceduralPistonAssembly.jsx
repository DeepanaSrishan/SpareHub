import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ProceduralPistonAssembly:
 * Physically accurate slider-crank kinematic mechanism.
 * Clicking toggles crankshaft-driven piston and connecting rod motion.
 * Supports dynamic speed adjustment.
 */
export default function ProceduralPistonAssembly({
  position = [-0.2, 0.4, 1.2],
  rotation = [0, 0, 0],
  isHovered = false,
  isSelected = false,
  isRunning = true,
  speed = 1.8,
  onToggleRunning,
  onHover,
  onUnhover,
  onSelect,
}) {
  const groupRef = useRef();
  const crankRef = useRef();
  const rodRef = useRef();
  const pistonRef = useRef();

  const [activeRunning, setActiveRunning] = useState(isRunning);
  const crankAngleRef = useRef(0);

  // Geometric Kinematic Constants (Slider-Crank mechanism)
  const CRANK_RADIUS = 0.42; // r
  const ROD_LENGTH = 1.35; // L

  useFrame((_, delta) => {
    if (!crankRef.current || !rodRef.current || !pistonRef.current) return;

    if (activeRunning) {
      crankAngleRef.current += speed * delta * 5;
    }

    const theta = crankAngleRef.current;

    // 1. Crank pin position
    const xc = CRANK_RADIUS * Math.sin(theta);
    const yc = CRANK_RADIUS * Math.cos(theta);

    // 2. Exact Piston wrist pin height along Y
    // yp = r * cos(theta) + sqrt(L^2 - (r * sin(theta))^2)
    const discriminant = Math.max(0, ROD_LENGTH * ROD_LENGTH - xc * xc);
    const yp = yc + Math.sqrt(discriminant);

    // 3. Connecting rod tilt angle
    const phi = -Math.asin(xc / ROD_LENGTH);

    // Update Crank Counterweight & Journal
    crankRef.current.rotation.z = -theta;

    // Update Connecting Rod position and rotation
    rodRef.current.position.set(xc, yc, 0);
    rodRef.current.rotation.z = phi;

    // Update Piston Crown position (strictly vertical reciprocating motion)
    pistonRef.current.position.set(0, yp, 0);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    const nextState = !activeRunning;
    setActiveRunning(nextState);
    onToggleRunning?.(nextState);
    onSelect?.("piston");
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "piston",
          name: "Forged Piston & Billet H-Beam Rod Assembly",
          hint: "Click to toggle crank motion • Speed adjustable in controls",
          specs: "82.5mm Bore • 4340 Chrome Moly Forged Steel • 11.5:1 CR",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      cursor="pointer"
    >
      {/* ==========================================
          1. CRANKSHAFT JOURNAL & COUNTERWEIGHT
          ========================================== */}
      <group position={[0, 0, 0]}>
        {/* Main Crankshaft Center Axis Spindle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.45, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* Rotating Crank Counterweight & Pin */}
        <group ref={crankRef}>
          {/* Lobe Counterweight */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <boxGeometry args={[0.52, 0.42, 0.22]} />
            <meshStandardMaterial
              color={isHovered ? "#93c5fd" : "#94a3b8"}
              metalness={0.94}
              roughness={0.18}
            />
          </mesh>

          {/* Crank Pin (Connects to rod big end) */}
          <mesh position={[0, CRANK_RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.32, 20]} />
            <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.08} />
          </mesh>
        </group>
      </group>

      {/* ==========================================
          2. ARTICULATED H-BEAM CONNECTING ROD
          ========================================== */}
      <group ref={rodRef}>
        {/* Big End Rod Cap & Bearing (encircling crank pin) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.28, 24]} />
          <meshStandardMaterial
            color={isSelected ? "#38bdf8" : "#94a3b8"}
            metalness={0.94}
            roughness={0.15}
          />
        </mesh>

        {/* Rod Journal Bolts */}
        {[-0.14, 0.14].map((bx, idx) => (
          <mesh key={idx} position={[bx, 0, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 12]} />
            <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.1} />
          </mesh>
        ))}

        {/* H-Beam Rod Shaft (extending up to wrist pin at distance ROD_LENGTH) */}
        <mesh position={[0, ROD_LENGTH / 2, 0]} castShadow>
          <boxGeometry args={[0.15, ROD_LENGTH - 0.3, 0.16]} />
          <meshStandardMaterial
            color={isHovered ? "#38bdf8" : "#f1f5f9"}
            metalness={0.95}
            roughness={0.14}
          />
        </mesh>

        {/* Small End Eyelet (Bronze wrist pin bushing) */}
        <mesh position={[0, ROD_LENGTH, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.26, 20]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.92} roughness={0.2} />
        </mesh>
      </group>

      {/* ==========================================
          3. PISTON CROWN & COMPRESSION RINGS
          ========================================== */}
      <group ref={pistonRef}>
        {/* Piston Body (Mirror Polished Billet Aluminum) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.72, 36]} />
          <meshStandardMaterial
            color={isSelected ? "#7dd3fc" : "#ffffff"}
            metalness={0.96}
            roughness={0.12}
            emissive={isHovered ? "#38bdf8" : "#000000"}
            emissiveIntensity={isHovered ? 0.3 : 0}
          />
        </mesh>

        {/* Piston Compression Rings (3 grooved bands) */}
        {[0.16, 0.22, 0.28].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]}>
            <torusGeometry args={[0.625, 0.018, 12, 36]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}

        {/* Piston Valve Relief Crown Indentations */}
        {[-0.2, 0.2].map((vx, idx) => (
          <mesh key={idx} position={[vx, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* Wrist Pin (Internal mirror steel pin) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.58, 20]} />
          <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.06} />
        </mesh>
      </group>
    </group>
  );
}
