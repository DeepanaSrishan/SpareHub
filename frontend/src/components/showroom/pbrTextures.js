import * as THREE from "three";

/**
 * Procedural PBR Texture Generator:
 * Creates high-fidelity micro-surface bump maps for authentic automotive materials
 * (cast aluminum pebble, brushed steel lathe grooves, and vulcanized rubber grain).
 */

let cachedCastAluminum = null;
let cachedBrushedSteel = null;
let cachedRubberGrain = null;

export function getCastAluminumBumpMap() {
  if (cachedCastAluminum) return cachedCastAluminum;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const imgData = ctx.createImageData(256, 256);
  for (let i = 0; i < imgData.data.length; i += 4) {
    // Shot-peened micro-pebble noise
    const noise = Math.floor(128 + (Math.random() - 0.5) * 45);
    imgData.data[i] = noise;
    imgData.data[i + 1] = noise;
    imgData.data[i + 2] = noise;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  cachedCastAluminum = texture;
  return texture;
}

export function getBrushedSteelBumpMap() {
  if (cachedBrushedSteel) return cachedBrushedSteel;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Concentric fine lathe machining lines
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  const center = 128;
  for (let r = 8; r < 128; r += 1.5) {
    const val = Math.floor(128 + (Math.random() - 0.5) * 35);
    ctx.strokeStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  cachedBrushedSteel = texture;
  return texture;
}

export function getRubberGrainBumpMap() {
  if (cachedRubberGrain) return cachedRubberGrain;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const imgData = ctx.createImageData(256, 256);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = Math.floor(128 + (Math.random() - 0.5) * 25);
    imgData.data[i] = noise;
    imgData.data[i + 1] = noise;
    imgData.data[i + 2] = noise;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  cachedRubberGrain = texture;
  return texture;
}
