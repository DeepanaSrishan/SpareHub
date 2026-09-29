import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * ProceduralEngineAssembly:
 * Multi-component inline engine assembly.
 * Explode / Assemble toggle smoothly animates modeled components along predefined explosion vectors via GSAP.
 */
export default function ProceduralEngineAssembly({
  position = [-0.1, 0.8, -0.5],
  rotation = [0, -0.15, 0],
  isHovered = false,
  isSelected = false,
  isExploded = false,
  onToggleExplode,
  onHover,
  onUnhover,
  onSelect,
}) {
  const groupRef = useRef();

  // Component Sub-refs for Exploded view animation
  const blockRef = useRef();
  const headRef = useRef();
  const valveCoverRef = useRef();
  const intakeManifoldRef = useRef();
  const exhaustHeaderRef = useRef();
  const sparkCoilsRef = useRef();

  // Target positions: Assembled vs Exploded vectors
  const targets = {
    block: {
      assembled: [0, -0.3, 0],
      exploded: [0, -0.7, 0],
    },
    head: {
      assembled: [0, 0.3, 0],
      exploded: [0, 0.55, 0],
    },
    valveCover: {
      assembled: [0, 0.72, 0],
      exploded: [0, 1.45, 0],
    },
    intake: {
      assembled: [0, 0.32, 0.52],
      exploded: [0, 0.45, 1.25],
    },
    exhaust: {
      assembled: [0, 0.28, -0.52],
      exploded: [0, 0.38, -1.25],
    },
    coils: {
      assembled: [0, 0.86, 0],
      exploded: [0, 1.95, 0],
    },
  };

  // GSAP Animation when isExploded state toggles
  useEffect(() => {
    const mode = isExploded ? "exploded" : "assembled";
    const dur = 0.85;
    const ease = "power3.inOut";

    if (blockRef.current) {
      gsap.to(blockRef.current.position, {
        x: targets.block[mode][0],
        y: targets.block[mode][1],
        z: targets.block[mode][2],
        duration: dur,
        ease,
      });
    }
    if (headRef.current) {
      gsap.to(headRef.current.position, {
        x: targets.head[mode][0],
        y: targets.head[mode][1],
        z: targets.head[mode][2],
        duration: dur,
        ease,
      });
    }
    if (valveCoverRef.current) {
      gsap.to(valveCoverRef.current.position, {
        x: targets.valveCover[mode][0],
        y: targets.valveCover[mode][1],
        z: targets.valveCover[mode][2],
        duration: dur,
        ease,
      });
    }
    if (intakeManifoldRef.current) {
      gsap.to(intakeManifoldRef.current.position, {
        x: targets.intake[mode][0],
        y: targets.intake[mode][1],
        z: targets.intake[mode][2],
        duration: dur,
        ease,
      });
    }
    if (exhaustHeaderRef.current) {
      gsap.to(exhaustHeaderRef.current.position, {
        x: targets.exhaust[mode][0],
        y: targets.exhaust[mode][1],
        z: targets.exhaust[mode][2],
        duration: dur,
        ease,
      });
    }
    if (sparkCoilsRef.current) {
      gsap.to(sparkCoilsRef.current.position, {
        x: targets.coils[mode][0],
        y: targets.coils[mode][1],
        z: targets.coils[mode][2],
        duration: dur,
        ease,
      });
    }
  }, [isExploded]);

  const handleClick = (e) => {
    e.stopPropagation();
    onToggleExplode?.();
    onSelect?.("engine");
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
          id: "engine",
          name: "VTEC Turbo Inline-4 Modular Engine Core",
          hint: "Click to toggle Explode / Assemble view",
          specs: "2.0L Direct Injection • Billet Block • Quad DOHC Valvetrain",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      cursor="pointer"
    >
      {/* ==========================================
          1. LOWER ENGINE BLOCK & OIL PAN
          ========================================== */}
      <group ref={blockRef} position={targets.block.assembled}>
        {/* Main Aluminum Block (Satin Billet Aluminum) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.7, 0.95]} />
          <meshStandardMaterial
            color={isSelected ? "#7dd3fc" : "#e2e8f0"}
            metalness={0.92}
            roughness={0.18}
            emissive={isHovered ? "#38bdf8" : "#000000"}
            emissiveIntensity={isHovered ? 0.25 : 0}
          />
        </mesh>
        {/* Oil Pan Sump (Underneath) */}
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[1.3, 0.18, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Starter & Alternator Mount Bosses */}
        <mesh position={[0.65, 0, 0.42]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.4, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ==========================================
          2. CYLINDER HEAD & PORTS
          ========================================== */}
      <group ref={headRef} position={targets.head.assembled}>
        {/* Machined Billet Cylinder Head (Bright Polished Alloy) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.52, 0.45, 0.92]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.14} />
        </mesh>
        {/* 4 Spark Plug Tube Wells */}
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <mesh key={idx} position={[x, 0.2, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ==========================================
          3. DOHC VALVE COVER & CAM GEAR CASING
          ========================================== */}
      <group ref={valveCoverRef} position={targets.valveCover.assembled}>
        {/* Vivid Anodized Electric Blue Valve Cover */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.48, 0.35, 0.88]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.88}
            roughness={0.18}
            emissive={isHovered ? "#38bdf8" : "#000000"}
            emissiveIntensity={isHovered ? 0.35 : 0}
          />
        </mesh>
        {/* Dual Cam Bulges */}
        {[-0.22, 0.22].map((z, idx) => (
          <mesh key={idx} position={[0, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 1.44, 20]} />
            <meshStandardMaterial color="#0369a1" metalness={0.9} roughness={0.16} />
          </mesh>
        ))}
        {/* Oil Filler Cap */}
        <mesh position={[0.55, 0.26, 0.2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {/* ==========================================
          4. INTAKE RUNNERS & PLENUM
          ========================================== */}
      <group ref={intakeManifoldRef} position={targets.intake.assembled}>
        {/* Polished Mirror Chrome Intake Plenum */}
        <mesh position={[0, 0.15, 0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.35, 24]} />
          <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.06} />
        </mesh>
        {/* 4 Curved Intake Runners */}
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <mesh key={idx} position={[x, 0.05, 0.08]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.38, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* ==========================================
          5. EXHAUST HEADER & RUNNERS (Heat-treated bronze / golden copper)
          ========================================== */}
      <group ref={exhaustHeaderRef} position={targets.exhaust.assembled}>
        {/* 4 Header Tubes */}
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <mesh key={idx} position={[x, -0.05, -0.08]} rotation={[-0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.4, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.92} roughness={0.16} />
          </mesh>
        ))}
        {/* 4-into-1 Collector */}
        <mesh position={[0, -0.22, -0.25]} rotation={[-0.8, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.35, 18]} />
          <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* ==========================================
          6. IGNITION COIL PACKS & PLUG LEADS
          ========================================== */}
      <group ref={sparkCoilsRef} position={targets.coils.assembled}>
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <group key={idx} position={[x, 0, 0]}>
            {/* Coil pack top */}
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.12, 0.14]} />
              <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.25} />
            </mesh>
            {/* Plug stem */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.22, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
