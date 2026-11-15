/**
 * SpareHub Automotive 3D Asset Configuration:
 * Defines drop-in paths for external licensed high-fidelity CAD/GLB models.
 * If you supply custom .glb files, place them in public/models/ matching these paths.
 * The showroom will automatically load them, with procedural PBR models serving as
 * the authentic manufactured fallback.
 */

export const AUTOMOTIVE_MODEL_ASSETS = {
  piston: {
    id: "piston",
    name: "Forged Piston & Connecting Rod",
    glbPath: "/models/piston_assembly.glb",
    hasExternalAsset: false,
  },
  tyre: {
    id: "tyre",
    name: "Performance Tire & Alloy Wheel",
    glbPath: "/models/wheel_tyre.glb",
    hasExternalAsset: false,
  },
  rotor: {
    id: "rotor",
    name: "Floating Brake Rotor & Caliper",
    glbPath: "/models/brake_rotor.glb",
    hasExternalAsset: false,
  },
  gears: {
    id: "gears",
    name: "Transmission Gearset",
    glbPath: "/models/transmission_gears.glb",
    hasExternalAsset: false,
  },
  shock: {
    id: "shock",
    name: "Coilover Damper",
    glbPath: "/models/coilover_shock.glb",
    hasExternalAsset: false,
  },
  engine: {
    id: "engine",
    name: "Modular Engine Core",
    glbPath: "/models/engine_assembly.glb",
    hasExternalAsset: false,
  },
};
