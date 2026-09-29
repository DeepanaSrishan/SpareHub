import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCastAluminumBumpMap, getBrushedSteelBumpMap } from "./pbrTextures";

/**
 * PhotorealisticEngineCylinder:
 * Cutaway cast-aluminum engine cylinder with steel liner, forged piston,
 * articulated H-beam rod, and crankshaft journal.
 * Dragging the crank handle drives the slider-crank kinematics inside the cylinder.
 */
export default function PhotorealisticEngineCylinder({
  position = [-0.1, 0.45, 1.1],
  rotation = [0, 0, 0],
  isHovered = false,
  isSelected = false,
  isRunning = true,
  speed = 1.8,
  onHover,
  onUnhover,
  onSelect,
  setControlsEnabled,
}) {
  const groupRef = useRef();
  const crankRef = useRef();
  const rodRef = useRef();
  const pistonRef = useRef();

  const [activeRunning, setActiveRunning] = useState(isRunning);
  const [isDraggingCrank, setIsDraggingCrank] = useState(false);
  const crankAngleRef = useRef(0);
  const lastPointerXRef = useRef(0);

  // Geometric Kinematic Constants (Precision Slider-Crank Mechanism)
  const CRANK_RADIUS = 0.42; // r
  const ROD_LENGTH = 1.35; // L
  const CYLINDER_BORE_RADIUS = 0.65;

  // Authentic PBR Textures
  const castAluminumBump = useMemo(() => getCastAluminumBumpMap(), []);
  const brushedSteelBump = useMemo(() => getBrushedSteelBumpMap(), []);

  useFrame((_, delta) => {
    if (!crankRef.current || !rodRef.current || !pistonRef.current) return;

    if (activeRunning && !isDraggingCrank) {
      crankAngleRef.current += speed * delta * 4;
    }

    const theta = crankAngleRef.current;

    // Crank pin coordinates
    const xc = CRANK_RADIUS * Math.sin(theta);
    const yc = CRANK_RADIUS * Math.cos(theta);

    // Exact Piston wrist pin height inside cylinder
    const discriminant = Math.max(0, ROD_LENGTH * ROD_LENGTH - xc * xc);
    const yp = yc + Math.sqrt(discriminant);

    // Connecting rod tilt angle
    const phi = -Math.asin(xc / ROD_LENGTH);

    // Update Crankshaft
    crankRef.current.rotation.z = -theta;

    // Update Connecting Rod
    rodRef.current.position.set(xc, yc, 0);
    rodRef.current.rotation.z = phi;

    // Update Piston Crown (Confined strictly inside the cylinder sleeve)
    pistonRef.current.position.set(0, yp, 0);
  });

  // Pointer drag on Crank Handle to manually rotate the engine
  const handleCrankPointerDown = (e) => {
    e.stopPropagation();
    setIsDraggingCrank(true);
    setActiveRunning(false);
    lastPointerXRef.current = e.clientX;
    if (setControlsEnabled) setControlsEnabled(false);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handleCrankPointerMove = (e) => {
    if (!isDraggingCrank) return;
    e.stopPropagation();
    const dx = e.clientX - lastPointerXRef.current;
    crankAngleRef.current += dx * 0.02;
    lastPointerXRef.current = e.clientX;
  };

  const handleCrankPointerUp = (e) => {
    if (!isDraggingCrank) return;
    e.stopPropagation();
    setIsDraggingCrank(false);
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
        onSelect?.("piston");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.({
          id: "piston",
          name: "Forged Billet Piston & Articulated Rod Mechanism",
          hint: "Drag crank flywheel to drive piston • Pistons travel inside cylinder liner",
          specs: "82.5mm Bore • 4340 Forged Steel H-Beam Rod • Honed Ductile Iron Liner",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      cursor="pointer"
    >
      {/* =========================================================
          1. CAST-ALUMINUM CYLINDER BLOCK & SLEEVE (Cutaway Section)
          ========================================================= */}
      <group position={[0, 1.35, 0]}>
        {/* Exterior Cast Aluminum Block Housing (Semi-cylindrical cutaway) */}
        <mesh position={[0, 0, -0.15]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.5, 0.7]} />
          <meshStandardMaterial
            color="#5a626d"
            metalness={0.78}
            roughness={0.48}
            bumpMap={castAluminumBump}
            bumpScale={0.04}
          />
        </mesh>

        {/* Cylinder Bore Wall (Cutaway Arch showing interior) */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[
              CYLINDER_BORE_RADIUS + 0.08,
              CYLINDER_BORE_RADIUS + 0.08,
              1.5,
              32,
              1,
              true,
              Math.PI * 0.75,
              Math.PI * 1.5
            ]}
          />
          <meshStandardMaterial
            color="#6b7280"
            metalness={0.82}
            roughness={0.42}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Honed Steel Cylinder Sleeve Interior Liner */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry
            args={[
              CYLINDER_BORE_RADIUS + 0.01,
              CYLINDER_BORE_RADIUS + 0.01,
              1.48,
              32,
              1,
              true,
              Math.PI * 0.8,
              Math.PI * 1.4
            ]}
          />
          <meshStandardMaterial
            color="#9ca3af"
            metalness={0.92}
            roughness={0.2}
            bumpMap={brushedSteelBump}
            bumpScale={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* =========================================================
          2. CRANKSHAFT JOURNAL, COUNTERWEIGHT & DRAG HANDLE
          ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Main Crank Bearing Saddle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.88}
            roughness={0.3}
          />
        </mesh>

        {/* Rotating Crank Counterweight & Pin */}
        <group ref={crankRef}>
          {/* Machined Steel Counterweight Lobe */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <boxGeometry args={[0.55, 0.44, 0.24]} />
            <meshStandardMaterial
              color="#71717a"
              metalness={0.92}
              roughness={0.25}
              bumpMap={brushedSteelBump}
              bumpScale={0.02}
            />
          </mesh>

          {/* Crankshaft Pin (Hardened Ground Steel) */}
          <mesh position={[0, CRANK_RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.32, 24]} />
            <meshStandardMaterial
              color="#d4d4d8"
              metalness={0.96}
              roughness={0.12}
            />
          </mesh>

          {/* Knurled Crank Flywheel (Draggable by user) */}
          <mesh
            position={[0, 0, 0.28]}
            rotation={[Math.PI / 2, 0, 0]}
            onPointerDown={handleCrankPointerDown}
            onPointerMove={handleCrankPointerMove}
            onPointerUp={handleCrankPointerUp}
            castShadow
          >
            <cylinderGeometry args={[0.34, 0.34, 0.08, 32]} />
            <meshStandardMaterial
              color="#52525b"
              metalness={0.9}
              roughness={0.32}
              bumpMap={castAluminumBump}
              bumpScale={0.05}
            />
          </mesh>
          {/* Flywheel Crank Pin Knob */}
          <mesh
            position={[0.22, 0, 0.36]}
            rotation={[Math.PI / 2, 0, 0]}
            onPointerDown={handleCrankPointerDown}
            onPointerMove={handleCrankPointerMove}
            onPointerUp={handleCrankPointerUp}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
            <meshStandardMaterial
              color="#a1a1aa"
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
        </group>
      </group>

      {/* =========================================================
          3. ARTICULATED FORGED 4340 H-BEAM CONNECTING ROD
          ========================================================= */}
      <group ref={rodRef}>
        {/* Rod Big End Journal Cap & Bearing */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.26, 24]} />
          <meshStandardMaterial
            color="#52525b"
            metalness={0.92}
            roughness={0.24}
          />
        </mesh>

        {/* Rod Bolts (ARP Grade Steel) */}
        {[-0.14, 0.14].map((bx, idx) => (
          <mesh key={idx} position={[bx, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.28, 12]} />
            <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}

        {/* H-Beam Forged Shank with recessed center channel */}
        <mesh position={[0, ROD_LENGTH / 2, 0]} castShadow>
          <boxGeometry args={[0.16, ROD_LENGTH - 0.28, 0.16]} />
          <meshStandardMaterial
            color="#71717a"
            metalness={0.9}
            roughness={0.28}
            bumpMap={castAluminumBump}
            bumpScale={0.03}
          />
        </mesh>

        {/* Small End Wrist Pin Bushing (Bronze) */}
        <mesh position={[0, ROD_LENGTH, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.24, 20]} />
          <meshStandardMaterial
            color="#b45309"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* =========================================================
          4. FORGED T6 BILLET PISTON & COMPRESSION RINGS
          ========================================================= */}
      <group ref={pistonRef}>
        {/* Piston Crown & Body (Lathe Turned Billet Aluminum) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.61, 0.61, 0.72, 36]} />
          <meshStandardMaterial
            color="#e4e4e7"
            metalness={0.94}
            roughness={0.16}
            bumpMap={brushedSteelBump}
            bumpScale={0.015}
          />
        </mesh>

        {/* Moly Anti-Friction Skirt Coating (Dark Band) */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.612, 0.612, 0.28, 36]} />
          <meshStandardMaterial
            color="#27272a"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* 3 Precision Piston Rings */}
        {[0.16, 0.22, 0.28].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]}>
            <torusGeometry args={[0.615, 0.015, 12, 36]} />
            <meshStandardMaterial
              color="#3f3f46"
              metalness={0.92}
              roughness={0.25}
            />
          </mesh>
        ))}

        {/* Valve Relief Pockets on Piston Dome */}
        {[-0.2, 0.2].map((vx, idx) => (
          <mesh key={idx} position={[vx, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 16]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.88} roughness={0.25} />
          </mesh>
        ))}

        {/* Hardened Tool-Steel Wrist Pin */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.58, 20]} />
          <meshStandardMaterial
            color="#f4f4f5"
            metalness={0.98}
            roughness={0.06}
          />
        </mesh>
      </group>
    </group>
  );
}
