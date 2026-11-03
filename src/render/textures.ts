import * as THREE from 'three';

export interface ProceduralTextureSet {
  rammedEarthMap: THREE.CanvasTexture;
  rammedEarthBump: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
  stoneBump: THREE.CanvasTexture;
  textileMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
}

let cachedTextures: ProceduralTextureSet | null = null;

export function getProceduralTextures(renderer: THREE.WebGLRenderer): ProceduralTextureSet {
  if (cachedTextures) return cachedTextures;

  const maxAniso = renderer.capabilities.getMaxAnisotropy() || 1;

  // 1. Rammed-Earth (Pisé) Albedo + Bump Map
  const earthCanvas = document.createElement('canvas');
  earthCanvas.width = 256;
  earthCanvas.height = 256;
  const eCtx = earthCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Base warm ochre-terracotta earth
  eCtx.fillStyle = '#b96a40';
  eCtx.fillRect(0, 0, 256, 256);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);

  // Horizontal rammed-earth formwork bands (pisé layers)
  for (let y = 0; y < 256; y += 16) {
    const shade = (Math.sin(y * 0.4) * 10) | 0;
    eCtx.fillStyle = `rgb(${182 + shade}, ${104 + (shade >> 1)}, ${62 + (shade >> 1)})`;
    eCtx.fillRect(0, y, 256, 14);
    eCtx.fillStyle = 'rgba(72, 34, 18, 0.35)';
    eCtx.fillRect(0, y + 14, 256, 2);

    bCtx.fillStyle = '#969696';
    bCtx.fillRect(0, y, 256, 13);
    bCtx.fillStyle = '#484848';
    bCtx.fillRect(0, y + 14, 256, 2);
  }

  // Pebble & mineral grain noise
  for (let i = 0; i < 1800; i++) {
    const x = (Math.sin(i * 78.233) * 0.5 + 0.5) * 256;
    const y = (Math.cos(i * 45.164) * 0.5 + 0.5) * 256;
    const w = 1 + (i % 3);
    eCtx.fillStyle = i % 2 === 0 ? 'rgba(235, 185, 135, 0.22)' : 'rgba(95, 45, 22, 0.24)';
    eCtx.fillRect(x, y, w, w);
    bCtx.fillStyle = i % 2 === 0 ? '#b0b0b0' : '#555555';
    bCtx.fillRect(x, y, w, w);
  }

  const rammedEarthMap = new THREE.CanvasTexture(earthCanvas);
  rammedEarthMap.colorSpace = THREE.SRGBColorSpace;
  rammedEarthMap.wrapS = THREE.RepeatWrapping;
  rammedEarthMap.wrapT = THREE.RepeatWrapping;
  rammedEarthMap.anisotropy = maxAniso;

  const rammedEarthBump = new THREE.CanvasTexture(bumpCanvas);
  rammedEarthBump.wrapS = THREE.RepeatWrapping;
  rammedEarthBump.wrapT = THREE.RepeatWrapping;
  rammedEarthBump.anisotropy = maxAniso;

  // 2. Dry-Stone Masonry Albedo + Bump Map
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = 256;
  stoneCanvas.height = 256;
  const sCtx = stoneCanvas.getContext('2d')!;

  const sBumpCanvas = document.createElement('canvas');
  sBumpCanvas.width = 256;
  sBumpCanvas.height = 256;
  const sbCtx = sBumpCanvas.getContext('2d')!;

  sCtx.fillStyle = '#5c5349';
  sCtx.fillRect(0, 0, 256, 256);
  sbCtx.fillStyle = '#303030';
  sbCtx.fillRect(0, 0, 256, 256);

  for (let row = 0; row < 8; row++) {
    const y = row * 32;
    let x = (row % 2) * -18;
    while (x < 256) {
      const w = 36 + ((row * 17 + x) % 20);
      const tone = 115 + ((row * 31 + x * 7) % 35);
      sCtx.fillStyle = `rgb(${tone}, ${tone - 8}, ${tone - 16})`;
      sCtx.fillRect(x + 2, y + 2, w - 4, 28);
      sbCtx.fillStyle = '#c8c8c8';
      sbCtx.fillRect(x + 3, y + 3, w - 6, 26);
      x += w;
    }
  }

  const stoneMap = new THREE.CanvasTexture(stoneCanvas);
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.wrapS = THREE.RepeatWrapping;
  stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.anisotropy = maxAniso;

  const stoneBump = new THREE.CanvasTexture(sBumpCanvas);
  stoneBump.wrapS = THREE.RepeatWrapping;
  stoneBump.wrapT = THREE.RepeatWrapping;
  stoneBump.anisotropy = maxAniso;

  // 3. Amazigh Geometric Woven Textile Pattern (Ochre, Indigo, Crimson, Ivory)
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 128;
  texCanvas.height = 128;
  const tCtx = texCanvas.getContext('2d')!;
  tCtx.fillStyle = '#9e2b25';
  tCtx.fillRect(0, 0, 128, 128);
  tCtx.fillStyle = '#1d3557';
  tCtx.fillRect(0, 16, 128, 24);
  tCtx.fillRect(0, 88, 128, 24);
  tCtx.strokeStyle = '#f4ead5';
  tCtx.lineWidth = 3;
  for (let x = 0; x < 128; x += 32) {
    tCtx.beginPath();
    tCtx.moveTo(x + 16, 44);
    tCtx.lineTo(x + 30, 64);
    tCtx.lineTo(x + 16, 84);
    tCtx.lineTo(x + 2, 64);
    tCtx.closePath();
    tCtx.stroke();
  }

  const textileMap = new THREE.CanvasTexture(texCanvas);
  textileMap.colorSpace = THREE.SRGBColorSpace;
  textileMap.wrapS = THREE.RepeatWrapping;
  textileMap.wrapT = THREE.RepeatWrapping;
  textileMap.anisotropy = maxAniso;

  // 4. Soft Radial Contact Shadow Disc
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const shCtx = shadowCanvas.getContext('2d')!;
  const grad = shCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(15, 10, 6, 0.65)');
  grad.addColorStop(0.6, 'rgba(15, 10, 6, 0.28)');
  grad.addColorStop(1, 'rgba(15, 10, 6, 0.0)');
  shCtx.fillStyle = grad;
  shCtx.fillRect(0, 0, 128, 128);

  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);
  contactShadowMap.colorSpace = THREE.SRGBColorSpace;

  cachedTextures = {
    rammedEarthMap,
    rammedEarthBump,
    stoneMap,
    stoneBump,
    textileMap,
    contactShadowMap,
  };

  return cachedTextures;
}
