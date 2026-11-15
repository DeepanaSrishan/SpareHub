import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { getCastAluminumBumpMap, getBrushedSteelBumpMap } from "./pbrTextures";

/**
 * PhotorealisticEngineCore:
 * Multi-component modular engine assembly with cast-aluminum crankcase,
 * CNC-machined cylinder head, wrinkle-coated valve cover, tuned intake runners,
 * and stainless exhaust headers.
 * Explode / Assemble toggle triggers smooth GSAP animation along explosion vectors.
 */
export default function PhotorealisticEngineCore({
  position = [-0.1, 0.95, -0.6],
  rotation = [0, -0.18, 0],
  isHovered = false,
  isSelected = false,
  isExploded = false,
  onToggleExplode,
  onHover,
  onUnhover,
  onSelect,
}) {
  const groupRef = useRef();

  const blockRef = useRef();
  const headRef = useRef();
  const valveCoverRef = useRef();
  const intakeManifoldRef = useRef();
  const exhaustHeaderRef = useRef();
  const sparkCoilsRef = useRef();

  const castAluminumBump = getCastAluminumBumpMap();
  const brushedSteelBump = getBrushedSteelBumpMap();

  const targets = {
    block: { assembled: [0, -0.3, 0], exploded: [0, -0.7, 0] },
    head: { assembled: [0, 0.3, 0], exploded: [0, 0.55, 0] },
    valveCover: { assembled: [0, 0.72, 0], exploded: [0, 1.45, 0] },
    intake: { assembled: [0, 0.32, 0.52], exploded: [0, 0.45, 1.25] },
    exhaust: { assembled: [0, 0.28, -0.52], exploded: [0, 0.38, -1.25] },
    coils: { assembled: [0, 0.86, 0], exploded: [0, 1.95, 0] },
  };

  useEffect(() => {
    const mode = isExploded ? "exploded" : "assembled";
    const dur = 0.85;
    const ease = "power3.inOut";

    if (blockRef.current) gsap.to(blockRef.current.position, { ...targets.block[mode], duration: dur, ease });
    if (headRef.current) gsap.to(headRef.current.position, { ...targets.head[mode], duration: dur, ease });
    if (valveCoverRef.current) gsap.to(valveCoverRef.current.position, { ...targets.valveCover[mode], duration: dur, ease });
    if (intakeManifoldRef.current) gsap.to(intakeManifoldRef.current.position, { ...targets.intake[mode], duration: dur, ease });
    if (exhaustHeaderRef.current) gsap.to(exhaustHeaderRef.current.position, { ...targets.exhaust[mode], duration: dur, ease });
    if (sparkCoilsRef.current) gsap.to(sparkCoilsRef.current.position, { ...targets.coils[mode], duration: dur, ease });
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
          specs: "Cast-Aluminum Bedplate • CNC Ported DOHC Head • Tuned Equal-Length Runners",
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover?.();
      }}
      cursor="pointer"
    >
      {/* 1. LOWER CRANKCASE & OIL PAN */}
      <group ref={blockRef} position={targets.block.assembled}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.7, 0.95]} />
          <meshStandardMaterial
            color="#52525b"
            metalness={0.88}
            roughness={0.42}
            bumpMap={castAluminumBump}
            bumpScale={0.03}
          />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[1.3, 0.18, 0.8]} />
          <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. CNC BILLET CYLINDER HEAD */}
      <group ref={headRef} position={targets.head.assembled}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.52, 0.45, 0.92]} />
          <meshStandardMaterial
            color="#a1a1aa"
            metalness={0.92}
            roughness={0.22}
            bumpMap={brushedSteelBump}
            bumpScale={0.02}
          />
        </mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <mesh key={idx} position={[x, 0.2, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
            <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* 3. WRINKLE-FINISH POWDERCOAT VALVE COVER */}
      <group ref={valveCoverRef} position={targets.valveCover.assembled}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.48, 0.35, 0.88]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.4}
            roughness={0.48}
            bumpMap={castAluminumBump}
            bumpScale={0.04}
          />
        </mesh>
        {[-0.22, 0.22].map((z, idx) => (
          <mesh key={idx} position={[0, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 1.44, 20]} />
            <meshStandardMaterial color="#172554" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        {/* Billet Oil Cap */}
        <mesh position={[0.55, 0.26, 0.2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <meshStandardMaterial color="#e4e4e7" metalness={0.95} roughness={0.12} />
        </mesh>
      </group>

      {/* 4. BRUSHED ALUMINUM INTAKE RUNNERS & PLENUM */}
      <group ref={intakeManifoldRef} position={targets.intake.assembled}>
        <mesh position={[0, 0.15, 0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.35, 24]} />
          <meshStandardMaterial
            color="#d4d4d8"
            metalness={0.94}
            roughness={0.18}
            bumpMap={brushedSteelBump}
            bumpScale={0.015}
          />
        </mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <mesh key={idx} position={[x, 0.05, 0.08]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.38, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 5. TIG-WELDED STAINLESS EXHAUST HEADER */}
      <group ref={exhaustHeaderRef} position={targets.exhaust.assembled}>
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <mesh key={idx} position={[x, -0.05, -0.08]} rotation={[-0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.4, 16]} />
            <meshStandardMaterial color="#b45309" metalness={0.88} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, -0.22, -0.25]} rotation={[-0.8, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.35, 18]} />
          <meshStandardMaterial color="#92400e" metalness={0.85} roughness={0.28} />
        </mesh>
      </group>

      {/* 6. DIRECT IGNITION COILS */}
      <group ref={sparkCoilsRef} position={targets.coils.assembled}>
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <group key={idx} position={[x, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.12, 0.14]} />
              <meshStandardMaterial color="#18181b" metalness={0.3} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.22, 12]} />
              <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
