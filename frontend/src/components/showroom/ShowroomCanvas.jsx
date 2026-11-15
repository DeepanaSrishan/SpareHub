import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import PhotorealisticEngineCylinder from "./PhotorealisticEngineCylinder";
import PhotorealisticWheelTyre from "./PhotorealisticWheelTyre";
import PhotorealisticBrakeAssembly from "./PhotorealisticBrakeAssembly";
import PhotorealisticTransmissionGears from "./PhotorealisticTransmissionGears";
import PhotorealisticCoiloverShock from "./PhotorealisticCoiloverShock";
import PhotorealisticEngineCore from "./PhotorealisticEngineCore";

/**
 * BackdropImage:
 * Renders the reference image (truck, sedan, van, motorcycle) as a photographic studio backdrop.
 */
function BackdropImage() {
  const texture = useTexture("/images/sparehub-assembly.png");
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  return (
    <group position={[0, 3.2, -3.2]}>
      <mesh>
        <planeGeometry args={[14.2, 7.8]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * ParallaxCamera:
 * Applies very subtle, smooth camera parallax tracking the pointer when orbit controls are idle.
 */
function ParallaxCamera({ pointerPos, controlsEnabled, resetTrigger }) {
  const { camera } = useThree();
  const initialCamPos = useMemo(() => new THREE.Vector3(0, 2.2, 5.8), []);

  useEffect(() => {
    if (resetTrigger > 0) {
      gsap.to(camera.position, {
        x: initialCamPos.x,
        y: initialCamPos.y,
        z: initialCamPos.z,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(0, 0.9, 0),
      });
    }
  }, [resetTrigger, camera, initialCamPos]);

  useFrame((_, delta) => {
    if (!controlsEnabled) return;
    // Subdued, natural parallax
    const targetX = pointerPos.x * 0.28;
    const targetY = 2.2 + pointerPos.y * 0.16;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 1.8);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 1.8);
    camera.lookAt(0, 0.9, 0);
  });

  return null;
}

/**
 * StudioFloor:
 * Authentic dark charcoal photo studio floor matching automotive catalog photography.
 */
function StudioFloor() {
  return (
    <group position={[0, 0, 0]}>
      {/* Matte Studio Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial
          color="#161a22"
          metalness={0.65}
          roughness={0.38}
        />
      </mesh>
    </group>
  );
}

/**
 * ShowroomCanvas:
 * Photorealistic automotive studio canvas with HDR environment reflections,
 * soft contact ambient occlusion shadows, physically based materials,
 * and precise interactive kinematics.
 */
export default function ShowroomCanvas({
  selectedPartId,
  setSelectedPartId,
  setHoveredPart,
  setTooltipPos,
  pistonSpeed,
  pistonRunning,
  setPistonRunning,
  isExploded,
  setIsExploded,
  resetTrigger,
}) {
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState(null);
  const orbitControlsRef = useRef();

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointerPos({ x, y });

    if (hoveredId) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePartHover = (partInfo) => {
    setHoveredId(partInfo.id);
    setHoveredPart(partInfo);
  };

  const handlePartUnhover = () => {
    setHoveredId(null);
    setHoveredPart(null);
  };

  return (
    <div
      className="showroom-canvas-container"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setPointerPos({ x: 0, y: 0 });
        handlePartUnhover();
      }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.2, 5.8], fov: 45 }}
      >
        <color attach="background" args={["#0c0f14"]} />

        {/* =========================================================
            PROFESSIONAL AUTOMOTIVE STUDIO LIGHTING
            ========================================================= */}
        {/* Soft HDRI Studio Environment Map for Authentic Metallic Reflections */}
        <Environment preset="studio" environmentIntensity={0.82} />

        {/* Diffuse Studio Ambient Fill */}
        <ambientLight color="#cbd5e1" intensity={0.9} />

        {/* Main Overhead Studio Softbox Light */}
        <directionalLight
          position={[3, 9, 4]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        {/* Front Camera-Direction Fill Light */}
        <directionalLight
          position={[0, 2.8, 6]}
          intensity={1.4}
          color="#f8fafc"
        />

        {/* Studio Side Reflectors */}
        <directionalLight
          position={[-6, 4, 1]}
          intensity={1.2}
          color="#94a3b8"
        />
        <directionalLight
          position={[6, 4, 1]}
          intensity={1.2}
          color="#94a3b8"
        />

        {/* Soft Contact Shadows (Grounds parts onto floor with realistic AO) */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.65}
          scale={18}
          blur={2.4}
          far={4}
          color="#000000"
        />

        {/* Camera Parallax Controller */}
        <ParallaxCamera
          pointerPos={pointerPos}
          controlsEnabled={controlsEnabled}
          resetTrigger={resetTrigger}
        />

        {/* Drei OrbitControls */}
        <OrbitControls
          ref={orbitControlsRef}
          enabled={controlsEnabled}
          enablePan={false}
          enableZoom={true}
          minDistance={3.2}
          maxDistance={8.2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 - 0.04}
          target={[0, 0.9, 0]}
        />

        <Suspense fallback={null}>
          {/* 1. Photographic Automotive Backdrop (Vehicles in Background) */}
          <BackdropImage />

          {/* 2. Studio Floor */}
          <StudioFloor />

          {/* 3. PHOTOREALISTIC INTERACTIVE 3D AUTOMOTIVE PARTS */}

          {/* Floating Ventilated Brake Rotor & 6-Piston Brembo Caliper */}
          <PhotorealisticBrakeAssembly
            position={[-3.3, 0.72, 0.7]}
            rotation={[0, 0.35, 0]}
            isHovered={hoveredId === "rotor"}
            isSelected={selectedPartId === "rotor"}
            onHover={handlePartHover}
            onUnhover={handlePartUnhover}
            onSelect={setSelectedPartId}
            setControlsEnabled={setControlsEnabled}
          />

          {/* Vulcanized Rubber Tire & Forged Multi-Spoke Wheel */}
          <PhotorealisticWheelTyre
            position={[-1.75, 1.08, 0.85]}
            rotation={[0, 0.42, 0]}
            isHovered={hoveredId === "tyre"}
            isSelected={selectedPartId === "tyre"}
            onHover={handlePartHover}
            onUnhover={handlePartUnhover}
            onSelect={setSelectedPartId}
            setControlsEnabled={setControlsEnabled}
          />

          {/* Engine Cylinder Cutaway & Piston (Draggable Crank Control) */}
          <PhotorealisticEngineCylinder
            position={[-0.1, 0.45, 1.1]}
            rotation={[0, 0, 0]}
            isHovered={hoveredId === "piston"}
            isSelected={selectedPartId === "piston"}
            isRunning={pistonRunning}
            speed={pistonSpeed}
            onHover={handlePartHover}
            onUnhover={handlePartUnhover}
            onSelect={setSelectedPartId}
            setControlsEnabled={setControlsEnabled}
          />

          {/* Carburized 8620 Steel Transmission Gearset */}
          <PhotorealisticTransmissionGears
            position={[1.2, 0.45, 1.15]}
            rotation={[0, -0.22, 0]}
            isHovered={hoveredId === "gears"}
            isSelected={selectedPartId === "gears"}
            onHover={handlePartHover}
            onUnhover={handlePartUnhover}
            onSelect={setSelectedPartId}
            setControlsEnabled={setControlsEnabled}
          />

          {/* Inverted Monotube Coilover Damper */}
          <PhotorealisticCoiloverShock
            position={[2.85, 1.05, 0.65]}
            rotation={[0, -0.32, 0.1]}
            isHovered={hoveredId === "shock"}
            isSelected={selectedPartId === "shock"}
            onHover={handlePartHover}
            onUnhover={handlePartUnhover}
            onSelect={setSelectedPartId}
          />

          {/* Modular Engine Core (Explode / Assemble Animation) */}
          <PhotorealisticEngineCore
            position={[-0.1, 0.95, -0.6]}
            rotation={[0, -0.18, 0]}
            isHovered={hoveredId === "engine"}
            isSelected={selectedPartId === "engine"}
            isExploded={isExploded}
            onToggleExplode={() => setIsExploded(!isExploded)}
            onHover={handlePartHover}
            onUnhover={handlePartUnhover}
            onSelect={setSelectedPartId}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
