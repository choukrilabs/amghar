import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BUILDINGS_CONFIG, SEASON_INFO, WEATHER_INFO } from '../game/config';
import {
  getEffectiveFootprint,
  getTerritoryRadius,
  groundHeightAt,
  riverCenterX,
  riverDistanceAt,
  validateBuildingPlacement,
} from '../game/terrain';
import {
  BuildingInstance,
  BuildingType,
  GameLifecycleState,
  PopulationRoles,
  Season,
  VillagerPerson,
  WeatherType,
} from '../game/types';
import { deriveLivingVillagers, VillagerAgent } from '../game/villagers';
import { createBuildingMeshGroup } from './buildings3d';
import { getProceduralTextures } from './textures';

export interface ValleyCanvasProps {
  lifecycleState: GameLifecycleState;
  season: Season;
  weather?: WeatherType;
  buildings: BuildingInstance[];
  roles: PopulationRoles;
  households: number;
  villagerRoster?: VillagerPerson[];
  territoryLevel?: number;
  timeSpeed: number;
  selectedBuildType: BuildingType | null;
  buildRotation: number;
  makhzenFavor: number;
  isVisitMode: boolean;
  selectedBuildingId: string | null;
  selectedVillagerId?: string | null;
  onPlaceBuilding: (x: number, z: number, rotation: number) => void;
  onSelectBuilding: (buildingId: string | null) => void;
  onSelectVillager?: (villagerId: string | null) => void;
  onPlacementStatusChange: (status: { valid: boolean; reason?: string } | null) => void;
}

// Reusable scratch math objects outside the animation loop (Zero-GC render loop)
const _mouseNDC = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _panDelta = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _tempColor = new THREE.Color();

const PARTICLE_COUNT = 36;
const WEATHER_PARTICLE_COUNT = 220;

export const ValleyCanvas: React.FC<ValleyCanvasProps> = ({
  lifecycleState,
  season,
  weather = 'clear',
  buildings,
  roles,
  households,
  villagerRoster,
  territoryLevel = 1,
  timeSpeed,
  selectedBuildType,
  buildRotation,
  makhzenFavor,
  isVisitMode,
  selectedBuildingId,
  selectedVillagerId = null,
  onPlaceBuilding,
  onSelectBuilding,
  onSelectVillager,
  onPlacementStatusChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Store mutable props in refs so React UI updates never tear down the WebGL context
  const propsRef = useRef({
    lifecycleState,
    season,
    weather,
    buildings,
    roles,
    households,
    villagerRoster,
    territoryLevel,
    timeSpeed,
    selectedBuildType,
    buildRotation,
    makhzenFavor,
    isVisitMode,
    selectedBuildingId,
    selectedVillagerId,
    onPlaceBuilding,
    onSelectBuilding,
    onSelectVillager,
    onPlacementStatusChange,
  });

  useEffect(() => {
    propsRef.current = {
      lifecycleState,
      season,
      weather,
      buildings,
      roles,
      households,
      villagerRoster,
      territoryLevel,
      timeSpeed,
      selectedBuildType,
      buildRotation,
      makhzenFavor,
      isVisitMode,
      selectedBuildingId,
      selectedVillagerId,
      onPlaceBuilding,
      onSelectBuilding,
      onSelectVillager,
      onPlacementStatusChange,
    };
  });

  const sceneRef = useRef<{
    rebuildBuildings: () => void;
    rebuildVillagers: () => void;
    updateTerritoryBorder: () => void;
    updateSeasonLook: (s: Season, w?: WeatherType) => void;
    updateGhostPreview: () => void;
    spawnBuildParticles: (x: number, y: number, z: number) => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.dataset.testid = 'valley-3d-canvas';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // 2. Studio Environment Map via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const sInfo = SEASON_INFO[propsRef.current.season];
    scene.background = new THREE.Color(sInfo.fogColor);
    scene.fog = new THREE.FogExp2(sInfo.fogColor, 0.0068);

    // 3. Camera & RTS OrbitControls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 260);
    camera.position.set(-26, 24, 32);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 12;
    controls.maxDistance = 78;
    controls.minPolarAngle = 0.28;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.target.set(0, 1.5, 0);
    controls.update();

    // 4. Balanced 3-Point Outdoor Lighting Rig (Warm Sun Key + Cool Sky/Ground Hemisphere Fill + Rim)
    const hemiLight = new THREE.HemisphereLight(0x8bb4e6, 0x9c6b43, 0.75);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(sInfo.sunColor, 1.85);
    sunLight.position.set(38, 52, 28);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      const d = 46;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.camera.near = 5;
      sunLight.shadow.camera.far = 135;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x9ec5eb, 0.45);
    rimLight.position.set(-40, 28, -35);
    scene.add(rimLight);

    const textures = getProceduralTextures(renderer);

    // 5. Procedural High Atlas Valley Terrain Mesh
    const terrainSize = 160;
    const terrainSegments = 96;
    const terrainGeo = new THREE.PlaneGeometry(
      terrainSize,
      terrainSize,
      terrainSegments,
      terrainSegments
    );
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const colorArray = new Float32Array(posAttr.count * 3);

    const colorTerrainForSeason = (targetSeason: Season, targetWeather: WeatherType = 'clear') => {
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);
        const vy = groundHeightAt(vx, vz);
        posAttr.setY(i, vy);

        const rDist = riverDistanceAt(vx, vz);
        const radial = Math.hypot(vx, vz);

        if (rDist < 3.4) {
          // Oued Massa river pebbles & wet alluvial silt
          _tempColor.setHex(targetWeather === 'drought' ? 0x8f7758 : 0x6b5b4b);
        } else if (vy > 13.5 || (targetSeason === 'winter' && vy > 4.2)) {
          // Distant Atlas snowline
          _tempColor.setHex(0xedf3f8);
        } else if (radial < 55 && vy < 4.5) {
          // Broad, fertile Sous-Massa alluvial plain & argan/barley farmland reacting to season + weather
          if (targetWeather === 'heavy_rain' || targetWeather === 'mountain_mist') {
            _tempColor.setHex(rDist < 22 ? 0x4e8c38 : 0x619944);
          } else if (targetWeather === 'drought') {
            _tempColor.setHex(rDist < 12 ? 0x998e43 : 0xc9944c);
          } else if (targetWeather === 'sirocco_dust') {
            _tempColor.setHex(rDist < 15 ? 0x878743 : 0xbd8146);
          } else if (targetSeason === 'spring') {
            _tempColor.setHex(rDist < 18 ? 0x678f42 : 0x7c9c4e);
          } else if (targetSeason === 'summer') {
            _tempColor.setHex(rDist < 18 ? 0x8ea349 : 0xc29852);
          } else if (targetSeason === 'autumn') {
            _tempColor.setHex(rDist < 18 ? 0x7f8f44 : 0xb37444);
          } else {
            _tempColor.setHex(0x889c68);
          }
        } else {
          // Distant Anti-Atlas & High Atlas red-ochre sandstone foothills
          _tempColor.setHex(vy > 9 ? 0x7a5c4d : 0xa86442);
        }

        // Subtle organic variation per vertex
        const jitter = ((i % 7) - 3) * 0.012;
        colorArray[i * 3] = THREE.MathUtils.clamp(_tempColor.r + jitter, 0, 1);
        colorArray[i * 3 + 1] = THREE.MathUtils.clamp(_tempColor.g + jitter, 0, 1);
        colorArray[i * 3 + 2] = THREE.MathUtils.clamp(_tempColor.b + jitter, 0, 1);
      }
      terrainGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
      terrainGeo.attributes.color.needsUpdate = true;
      posAttr.needsUpdate = true;
      terrainGeo.computeVertexNormals();
    };

    colorTerrainForSeason(propsRef.current.season, propsRef.current.weather);

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      bumpMap: textures.rammedEarthBump,
      bumpScale: 0.025,
      roughness: 0.88,
      metalness: 0.04,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = !isSoftwareGl;
    scene.add(terrainMesh);

    // 6. Meandering River Water Ribbon through the Valley Center
    const riverSegsZ = 80;
    const riverGeo = new THREE.PlaneGeometry(5.6, 156, 4, riverSegsZ);
    riverGeo.rotateX(-Math.PI / 2);
    const rPos = riverGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      const lx = rPos.getX(i);
      const lz = rPos.getZ(i);
      rPos.setX(i, lx + riverCenterX(lz));
      rPos.setY(i, -0.18);
    }
    riverGeo.computeVertexNormals();

    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x267aa6,
      roughness: 0.16,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.position.y = 0.03;
    scene.add(riverMesh);

    // 7. InstancedMesh for Sous-Massa Argan, Olive & Atlas Cedar Trees & Boulders
    const treeCount = 110;
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.24, 1.4, 6);
    trunkGeo.translate(0, 0.7, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x593a22, roughness: 0.85 });
    const instancedTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);

    const canopyGeo = new THREE.ConeGeometry(0.95, 2.4, 7);
    canopyGeo.translate(0, 2.1, 0);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72 });
    const instancedCanopies = new THREE.InstancedMesh(canopyGeo, canopyMat, treeCount);

    let placedTrees = 0;
    for (let i = 0; i < 320 && placedTrees < treeCount; i++) {
      const angle = i * 2.39996;
      const radius = 22 + (i % 38) * 1.15;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;
      if (riverDistanceAt(tx, tz) < 5.5) continue;
      // Leave wide central Sous-Massa agricultural plain clear for farming and building
      if (Math.abs(tx) < 23 && Math.abs(tz) < 20) continue;

      const ty = groundHeightAt(tx, tz);
      if (ty > 14) continue;

      const s = 0.82 + ((i * 13) % 35) * 0.01;
      _dummyObj.position.set(tx, ty, tz);
      _dummyObj.rotation.set(0, (i * 0.7) % (Math.PI * 2), 0);
      _dummyObj.scale.setScalar(s);
      _dummyObj.updateMatrix();

      instancedTrunks.setMatrixAt(placedTrees, _dummyObj.matrix);
      instancedCanopies.setMatrixAt(placedTrees, _dummyObj.matrix);

      const tint = i % 3 === 0 ? 0x2f6131 : i % 3 === 1 ? 0x3b6e38 : 0x4b783c;
      _tempColor.setHex(tint);
      instancedCanopies.setColorAt(placedTrees, _tempColor);
      placedTrees++;
    }
    instancedTrunks.count = placedTrees;
    instancedCanopies.count = placedTrees;
    instancedTrunks.instanceMatrix.needsUpdate = true;
    instancedCanopies.instanceMatrix.needsUpdate = true;
    if (instancedCanopies.instanceColor) instancedCanopies.instanceColor.needsUpdate = true;
    instancedTrunks.computeBoundingSphere();
    instancedCanopies.computeBoundingSphere();
    scene.add(instancedTrunks, instancedCanopies);

    // Instanced Boulders along riverbanks and perimeter foothills
    const rockCount = 85;
    const rockGeo = new THREE.DodecahedronGeometry(0.65, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
    });
    const instancedRocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    for (let i = 0; i < rockCount; i++) {
      const rx = i < 40 ? riverCenterX((i - 20) * 3.2) + (i % 2 === 0 ? 3.5 : -3.5) : Math.cos(i * 1.7) * (30 + (i % 25));
      const rz = i < 40 ? (i - 20) * 3.2 : Math.sin(i * 1.7) * (30 + (i % 25));
      const ry = groundHeightAt(rx, rz);
      _dummyObj.position.set(rx, ry + 0.15, rz);
      _dummyObj.rotation.set(i * 0.4, i * 0.9, 0);
      _dummyObj.scale.set(0.7 + (i % 5) * 0.2, 0.5 + (i % 3) * 0.18, 0.7 + (i % 4) * 0.2);
      _dummyObj.updateMatrix();
      instancedRocks.setMatrixAt(i, _dummyObj.matrix);
      _tempColor.setHex(i % 2 === 0 ? 0x7c6858 : 0x665649);
      instancedRocks.setColorAt(i, _tempColor);
    }
    instancedRocks.instanceMatrix.needsUpdate = true;
    if (instancedRocks.instanceColor) instancedRocks.instanceColor.needsUpdate = true;
    instancedRocks.computeBoundingSphere();
    scene.add(instancedRocks);

    // 7b. Expandable Village Territory Boundary Ring & Corner Cairns on the 3D Sous-Massa Plain
    const territoryBorderGroup = new THREE.Group();
    scene.add(territoryBorderGroup);

    const updateTerritoryBorder = () => {
      while (territoryBorderGroup.children.length > 0) {
        territoryBorderGroup.remove(territoryBorderGroup.children[0]);
      }
      const rad = getTerritoryRadius(propsRef.current.territoryLevel || 1);
      const pts: THREE.Vector3[] = [];
      const steps = 64;
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * 4;
        let bx = 0;
        let bz = 0;
        if (t < 1) {
          bx = THREE.MathUtils.lerp(-rad, rad, t);
          bz = -rad;
        } else if (t < 2) {
          bx = rad;
          bz = THREE.MathUtils.lerp(-rad, rad, t - 1);
        } else if (t < 3) {
          bx = THREE.MathUtils.lerp(rad, -rad, t - 2);
          bz = rad;
        } else {
          bx = -rad;
          bz = THREE.MathUtils.lerp(rad, -rad, t - 3);
        }
        pts.push(new THREE.Vector3(bx, Math.max(0.25, groundHeightAt(bx, bz)) + 0.18, bz));
      }
      const borderGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0xf0b429,
        transparent: true,
        opacity: 0.65,
      });
      territoryBorderGroup.add(new THREE.Line(borderGeo, borderMat));
    };
    updateTerritoryBorder();

    // 8. Buildings & Articulated 3D Character Avatars Container Groups
    const buildingsRoot = new THREE.Group();
    scene.add(buildingsRoot);

    const villagersRoot = new THREE.Group();
    scene.add(villagersRoot);

    // Persistent runtime state per villager ID so villagers keep their continuous daily life position across rebuilds
    const villagerRuntimeMap = new Map<
      string,
      {
        waypointIdx: number;
        legProgress: number;
        dwellTimer: number;
        fromX: number;
        fromZ: number;
      }
    >();

    let activeVillagerData: Array<{
      agent: VillagerAgent;
      group: THREE.Group;
      torsoGroup: THREE.Group;
      leftArmPivot: THREE.Group;
      rightArmPivot: THREE.Group;
      leftLegPivot: THREE.Group;
      rightLegPivot: THREE.Group;
      cargoMesh: THREE.Mesh;
      selectedHalo: THREE.Mesh;
    }> = [];

    const rebuildVillagers = () => {
      while (villagersRoot.children.length > 0) {
        villagersRoot.remove(villagersRoot.children[0]);
      }
      activeVillagerData = [];
      const {
        buildings: bList,
        roles: rList,
        households: hCount,
        villagerRoster: vRoster,
        selectedVillagerId: selVId,
      } = propsRef.current;
      const agents = deriveLivingVillagers(bList, rList, hCount, vRoster);

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a17c, roughness: 0.65 });
      const basketMat = new THREE.MeshStandardMaterial({ color: 0xc28b48, roughness: 0.8 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.85 });
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      const beardMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });

      agents.forEach((ag, idx) => {
        const vGroup = new THREE.Group();
        vGroup.userData.villagerId = ag.id;

        // Scale avatar proportionally by lifeStage (child, youth, adult, elder)
        const stageScale =
          ag.lifeStage === 'child'
            ? 0.68
            : ag.lifeStage === 'youth'
            ? 0.88
            : ag.lifeStage === 'elder'
            ? 0.95
            : 1.0;
        vGroup.scale.setScalar(stageScale);

        // 1. Contact shadow disc
        const sh = new THREE.Mesh(
          new THREE.CircleGeometry(0.35, 10),
          new THREE.MeshBasicMaterial({
            map: textures.contactShadowMap,
            transparent: true,
            opacity: 0.48,
            depthWrite: false,
          })
        );
        sh.rotation.x = -Math.PI / 2;
        sh.position.y = 0.02;
        vGroup.add(sh);

        const robeMat = new THREE.MeshStandardMaterial({
          color: ag.garmentColor,
          roughness: 0.75,
        });

        // 2. Articulated Left & Right Legs
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.08, 0.26, 0);
        const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.26, 6), skinMat);
        legMeshL.position.y = -0.13;
        leftLegPivot.add(legMeshL);
        vGroup.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.08, 0.26, 0);
        const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.26, 6), skinMat);
        legMeshR.position.y = -0.13;
        rightLegPivot.add(legMeshR);
        vGroup.add(rightLegPivot);

        // 3. Upper Torso Group (bends during farming/foraging/building animations)
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, 0.24, 0);
        vGroup.add(torsoGroup);

        const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 0.48, 8), robeMat);
        robe.position.y = 0.22;
        torsoGroup.add(robe);

        // Woven Amazigh belt sash (Gold for married or high skill, silver-ochre for youths)
        const sash = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.165, 0.07, 8),
          ag.spouseId ? goldMat : basketMat
        );
        sash.position.y = 0.24;
        torsoGroup.add(sash);

        // Head + Tagelmust / Headscarf
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), skinMat);
        head.position.y = 0.56;
        torsoGroup.add(head);

        // White beard for Respected Jemaa Elders
        if (ag.lifeStage === 'elder') {
          const beard = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 6), beardMat);
          beard.rotation.x = Math.PI;
          beard.position.set(0, 0.46, 0.08);
          torsoGroup.add(beard);
        }

        const turbanMat = new THREE.MeshStandardMaterial({
          color: ag.headscarfColor,
          roughness: 0.6,
        });
        const turban = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.11, 8), turbanMat);
        turban.position.y = 0.63;
        torsoGroup.add(turban);

        // Carried Harvest / Craft Cargo Sack (visibly held when hauling output on the 'storage' waypoint leg)
        const cargoMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.2, 0.2),
          ag.role === 'farmers' ? goldMat : basketMat
        );
        cargoMesh.position.set(0, 0.3, 0.22);
        cargoMesh.visible = false;
        torsoGroup.add(cargoMesh);

        // Selection ring under villager when clicked in the 3D scene
        const selectedHalo = new THREE.Mesh(
          new THREE.RingGeometry(0.34, 0.45, 20),
          new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide })
        );
        selectedHalo.rotation.x = -Math.PI / 2;
        selectedHalo.position.y = 0.04;
        selectedHalo.visible = selVId === ag.id;
        vGroup.add(selectedHalo);

        // Newcomer golden halo indicator so migrating newcomers stand out clearly
        if (ag.isNewcomer) {
          const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.28, 0.36, 16),
            new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide })
          );
          halo.rotation.x = -Math.PI / 2;
          halo.position.y = 0.035;
          vGroup.add(halo);
        }

        // 4. Articulated Left & Right Arms + Task-Specific 3D Tools
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.18, 0.42, 0);
        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 6), robeMat);
        armL.position.y = -0.12;
        leftArmPivot.add(armL);
        torsoGroup.add(leftArmPivot);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.18, 0.42, 0);
        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 6), robeMat);
        armR.position.y = -0.12;
        rightArmPivot.add(armR);
        torsoGroup.add(rightArmPivot);

        // Attach 3D Tool based on daily task
        if (ag.toolType === 'hoe') {
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.52, 5), woodMat);
          handle.rotation.x = Math.PI / 2.4;
          handle.position.set(0, -0.22, 0.16);
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.03), ironMat);
          blade.position.set(0, -0.28, 0.38);
          rightArmPivot.add(handle, blade);
        } else if (ag.toolType === 'basket' || ag.toolType === 'amphora') {
          const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.18, 8), basketMat);
          basket.position.set(0, -0.22, 0.14);
          const produce = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), goldMat);
          produce.position.set(0, -0.13, 0.14);
          rightArmPivot.add(basket, produce);
        } else if (ag.toolType === 'mallet') {
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 5), woodMat);
          shaft.position.set(0, -0.2, 0.1);
          const headBlock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.18), woodMat);
          headBlock.position.set(0, -0.32, 0.12);
          rightArmPivot.add(shaft, headBlock);
        } else if (ag.toolType === 'bundle') {
          const bundle = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 7), basketMat);
          bundle.position.set(0, 0.32, -0.16);
          torsoGroup.add(bundle);
          const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 5), woodMat);
          staff.position.set(0, -0.15, 0.12);
          rightArmPivot.add(staff);
        } else {
          const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.58, 5), woodMat);
          staff.position.set(0, -0.16, 0.1);
          rightArmPivot.add(staff);
        }

        // Initialize or restore continuous multi-waypoint runtime state
        if (!villagerRuntimeMap.has(ag.id)) {
          const startWpIdx = idx % Math.max(1, ag.waypoints.length);
          const prevWp =
            ag.waypoints[(startWpIdx - 1 + ag.waypoints.length) % ag.waypoints.length] || {
              x: ag.startX,
              z: ag.startZ,
            };
          villagerRuntimeMap.set(ag.id, {
            waypointIdx: startWpIdx,
            legProgress: (idx * 0.23) % 0.85,
            dwellTimer: 0,
            fromX: prevWp.x,
            fromZ: prevWp.z,
          });
        }

        const rt = villagerRuntimeMap.get(ag.id)!;
        const targetWp = ag.waypoints[rt.waypointIdx % ag.waypoints.length] || {
          x: ag.targetX,
          z: ag.targetZ,
        };
        const wx = THREE.MathUtils.lerp(rt.fromX, targetWp.x, rt.legProgress);
        const wz = THREE.MathUtils.lerp(rt.fromZ, targetWp.z, rt.legProgress);
        vGroup.position.set(wx, groundHeightAt(wx, wz), wz);

        villagersRoot.add(vGroup);
        activeVillagerData.push({
          agent: ag,
          group: vGroup,
          torsoGroup,
          leftArmPivot,
          rightArmPivot,
          leftLegPivot,
          rightLegPivot,
          cargoMesh,
          selectedHalo,
        });
      });
    };

    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.55, 24),
      new THREE.MeshBasicMaterial({
        color: 0xf5b041,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.visible = false;
    scene.add(selectionRing);

    // 9. Ghost Building Placement Preview Mesh
    const ghostGroup = new THREE.Group();
    const ghostBox = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.2, 4),
      new THREE.MeshBasicMaterial({
        color: 0x2ecc71,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    ghostBox.position.y = 1.1;
    const ghostFootprintOutline = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.35, 4),
      new THREE.MeshBasicMaterial({
        color: 0x2ecc71,
        side: THREE.DoubleSide,
      })
    );
    ghostFootprintOutline.rotation.x = -Math.PI / 2;
    ghostFootprintOutline.rotation.z = Math.PI / 4;
    ghostFootprintOutline.position.y = 0.08;
    ghostGroup.add(ghostBox, ghostFootprintOutline);
    ghostGroup.visible = false;
    scene.add(ghostGroup);

    // 10. Pooled Particle Ring Buffer (InstancedMesh) for placement dust & harvest bursts
    const particleGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xe6b88a,
      roughness: 0.7,
    });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_COUNT);
    particleMesh.frustumCulled = false;
    scene.add(particleMesh);

    const particleState = Array.from({ length: PARTICLE_COUNT }, () => ({
      active: false,
      x: 0,
      y: -100,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.6,
    }));

    let cameraTrauma = 0;
    const ghostHoverPos = { x: -8, z: 8, valid: false };

    const spawnBuildParticles = (wx: number, wy: number, wz: number) => {
      cameraTrauma = Math.min(1, cameraTrauma + 0.45);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 2.2 + Math.random() * 3.5;
        const p = particleState[i];
        p.active = true;
        p.x = wx + Math.cos(angle) * 1.2;
        p.y = wy + 0.3;
        p.z = wz + Math.sin(angle) * 1.2;
        p.vx = Math.cos(angle) * speed;
        p.vy = 2.5 + Math.random() * 3.0;
        p.vz = Math.sin(angle) * speed;
        p.life = 0;
        p.maxLife = 0.45 + Math.random() * 0.3;
      }
    };

    const rebuildBuildings = () => {
      while (buildingsRoot.children.length > 0) {
        buildingsRoot.remove(buildingsRoot.children[0]);
      }
      const nowMs = Date.now();
      const { buildings: bList, season: curSeason, selectedBuildingId: selId } = propsRef.current;

      let foundSelected = false;
      for (const b of bList) {
        const group = createBuildingMeshGroup(b, curSeason, textures, nowMs);
        const gy = groundHeightAt(b.x, b.z);
        group.position.set(b.x, gy, b.z);
        group.rotation.y = b.rotation;
        buildingsRoot.add(group);

        if (selId && b.id === selId) {
          selectionRing.position.set(b.x, gy + 0.12, b.z);
          selectionRing.visible = true;
          foundSelected = true;
        }
      }
      if (!foundSelected) {
        selectionRing.visible = false;
      }
      rebuildVillagers();
    };

    // 10b. Real-Time 3D Weather Particle System (Rain streaks, Chergui Sandstorm, Mountain Mist, Heat Shimmer)
    const weatherParticleGeo = new THREE.BoxGeometry(0.08, 0.75, 0.08);
    const weatherParticleMat = new THREE.MeshBasicMaterial({
      color: 0xa5d8ff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const weatherParticleMesh = new THREE.InstancedMesh(
      weatherParticleGeo,
      weatherParticleMat,
      WEATHER_PARTICLE_COUNT
    );
    weatherParticleMesh.frustumCulled = false;
    scene.add(weatherParticleMesh);

    const weatherParticles = Array.from({ length: WEATHER_PARTICLE_COUNT }, (_, i) => ({
      x: ((i * 17) % 68) - 34,
      y: ((i * 11) % 26) + 1.5,
      z: ((i * 23) % 68) - 34,
      phase: (i * 0.37) % (Math.PI * 2),
      speedFactor: 0.8 + ((i % 7) * 0.06),
    }));

    // 10c. Drifting 3D Atmospheric Cloud / Mist Clusters over the High Atlas Ridges
    const weatherCloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.95,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const cloudPuffGeo = new THREE.DodecahedronGeometry(2.6, 1);
    const cloudClusters: Array<{ group: THREE.Group; baseX: number; baseZ: number; speed: number }> = [];
    for (let c = 0; c < 10; c++) {
      const cGroup = new THREE.Group();
      for (let p = 0; p < 3; p++) {
        const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
        puff.position.set((p - 1) * 2.4, (p % 2) * 0.6, ((p * 2) % 3 - 1) * 1.1);
        puff.scale.set(1.4 + p * 0.25, 0.48, 1.0 + (p % 2) * 0.3);
        cGroup.add(puff);
      }
      const bx = -42 + (c * 19) % 84;
      const bz = -36 + ((c * 29) % 72);
      cGroup.position.set(bx, 22 + (c % 4) * 1.8, bz);
      weatherCloudsGroup.add(cGroup);
      cloudClusters.push({ group: cGroup, baseX: bx, baseZ: bz, speed: 0.9 + (c % 4) * 0.25 });
    }
    scene.add(weatherCloudsGroup);

    const updateSeasonLook = (s: Season, w: WeatherType = propsRef.current.weather || 'clear') => {
      const sInfo = SEASON_INFO[s];
      const wInfo = WEATHER_INFO[w] || WEATHER_INFO.clear;

      // Blend seasonal and weather fog color & density
      const blendedFog = new THREE.Color(sInfo.fogColor).lerp(
        new THREE.Color(wInfo.fogColor),
        w === 'clear' ? 0.25 : 0.78
      );
      scene.background = blendedFog.clone();
      scene.fog = new THREE.FogExp2(blendedFog.getHex(), wInfo.fogDensity);

      // Modulate directional sun & hemisphere fill light for active weather
      const blendedSun = new THREE.Color(sInfo.sunColor).lerp(
        new THREE.Color(wInfo.sunColor),
        w === 'clear' ? 0.2 : 0.8
      );
      sunLight.color.copy(blendedSun);
      sunLight.intensity = wInfo.sunIntensity;

      hemiLight.color.set(wInfo.hemiSkyColor);
      hemiLight.groundColor.set(wInfo.hemiGroundColor);
      hemiLight.intensity = wInfo.hemiIntensity;

      // Swell or shrink Oued Souss river based on rain/drought
      riverMat.color.set(wInfo.riverColor);
      riverMesh.position.y = wInfo.riverHeight;
      riverMesh.scale.set(wInfo.riverWidthScale, 1, 1);

      // Configure 3D weather particles & cloud bank appearance
      if (w === 'heavy_rain') {
        weatherParticleMat.color.setHex(0xbad7f2);
        weatherParticleMat.opacity = 0.72;
        cloudMat.color.setHex(0x475569);
        cloudMat.opacity = 0.78;
        weatherCloudsGroup.visible = true;
      } else if (w === 'sirocco_dust') {
        weatherParticleMat.color.setHex(0xe09f67);
        weatherParticleMat.opacity = 0.68;
        cloudMat.color.setHex(0xc27849);
        cloudMat.opacity = 0.58;
        weatherCloudsGroup.visible = true;
      } else if (w === 'mountain_mist') {
        weatherParticleMat.color.setHex(0xe2eef8);
        weatherParticleMat.opacity = 0.62;
        cloudMat.color.setHex(0xcbd5e1);
        cloudMat.opacity = 0.68;
        weatherCloudsGroup.visible = true;
      } else if (w === 'drought') {
        weatherParticleMat.color.setHex(0xfde68a);
        weatherParticleMat.opacity = 0.36;
        weatherCloudsGroup.visible = false;
      } else {
        // Clear sky with light fair-weather clouds & golden pollen motes
        weatherParticleMat.color.setHex(s === 'winter' ? 0xffffff : 0xfef3c7);
        weatherParticleMat.opacity = s === 'winter' ? 0.55 : 0.28;
        cloudMat.color.setHex(0xf8fafc);
        cloudMat.opacity = 0.35;
        weatherCloudsGroup.visible = true;
      }

      colorTerrainForSeason(s, w);
      rebuildBuildings();
    };

    const updateGhostPreview = () => {
      const {
        selectedBuildType: bType,
        buildRotation: rot,
        buildings: bList,
        makhzenFavor: favor,
        territoryLevel: tLvl,
        isVisitMode: visit,
      } = propsRef.current;
      if (!bType || visit) {
        ghostGroup.visible = false;
        propsRef.current.onPlacementStatusChange(null);
        return;
      }
      ghostGroup.visible = true;
      const fp = getEffectiveFootprint(bType, rot);
      ghostBox.scale.set(fp.w / 4, 1, fp.d / 4);
      ghostGroup.rotation.y = rot;

      const gy = groundHeightAt(ghostHoverPos.x, ghostHoverPos.z);
      ghostGroup.position.set(ghostHoverPos.x, gy, ghostHoverPos.z);

      const check = validateBuildingPlacement(
        bType,
        ghostHoverPos.x,
        ghostHoverPos.z,
        rot,
        bList,
        favor,
        tLvl || 1
      );
      ghostHoverPos.valid = check.valid;
      const colorHex = check.valid ? 0x2ecc71 : 0xe74c3c;
      (ghostBox.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
      (ghostFootprintOutline.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
      propsRef.current.onPlacementStatusChange(check);
    };

    updateSeasonLook(propsRef.current.season, propsRef.current.weather);

    sceneRef.current = {
      rebuildBuildings,
      rebuildVillagers,
      updateTerritoryBorder,
      updateSeasonLook,
      updateGhostPreview,
      spawnBuildParticles,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 11. Keyboard & Pointer Input Handling
    const keysHeld = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      keysHeld.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.delete(e.code);
    };

    const clearHeldKeys = () => {
      keysHeld.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldKeys);

    // Throttled pointermove for ghost building placement raycasting
    let lastRaycastMs = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updateMouseNDC = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (propsRef.current.lifecycleState !== 'playing') return;
      if (!propsRef.current.selectedBuildType || propsRef.current.isVisitMode) return;

      const now = performance.now();
      if (now - lastRaycastMs < 40) return;
      lastRaycastMs = now;

      updateMouseNDC(e.clientX, e.clientY);
      _raycaster.setFromCamera(_mouseNDC, camera);
      const hits = _raycaster.intersectObject(terrainMesh, false);
      if (hits.length > 0) {
        // Snap to 1m grid for clean architectural alignment
        ghostHoverPos.x = Math.round(hits[0].point.x);
        ghostHoverPos.z = Math.round(hits[0].point.z);
        updateGhostPreview();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (propsRef.current.lifecycleState !== 'playing') return;
      // Ignore if user dragged camera > 6px
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) {
        return;
      }

      updateMouseNDC(e.clientX, e.clientY);
      _raycaster.setFromCamera(_mouseNDC, camera);

      // If in building placement mode, raycast terrain and place at clicked coordinates
      if (propsRef.current.selectedBuildType && !propsRef.current.isVisitMode) {
        const hits = _raycaster.intersectObject(terrainMesh, false);
        if (hits.length > 0) {
          ghostHoverPos.x = Math.round(hits[0].point.x);
          ghostHoverPos.z = Math.round(hits[0].point.z);
        }
        const check = validateBuildingPlacement(
          propsRef.current.selectedBuildType,
          ghostHoverPos.x,
          ghostHoverPos.z,
          propsRef.current.buildRotation,
          propsRef.current.buildings,
          propsRef.current.makhzenFavor,
          propsRef.current.territoryLevel || 1
        );
        if (check.valid) {
          const gy = groundHeightAt(ghostHoverPos.x, ghostHoverPos.z);
          spawnBuildParticles(ghostHoverPos.x, gy, ghostHoverPos.z);
          propsRef.current.onPlaceBuilding(
            ghostHoverPos.x,
            ghostHoverPos.z,
            propsRef.current.buildRotation
          );
        } else {
          propsRef.current.onPlacementStatusChange(check);
        }
        return;
      }

      // First check if clicking a 3D Villager in the valley to inspect their biography & family lineage
      const vHits = _raycaster.intersectObjects(villagersRoot.children, true);
      if (vHits.length > 0) {
        let vObj: THREE.Object3D | null = vHits[0].object;
        while (vObj && !vObj.userData?.villagerId) {
          vObj = vObj.parent;
        }
        if (vObj?.userData?.villagerId && propsRef.current.onSelectVillager) {
          propsRef.current.onSelectVillager(vObj.userData.villagerId);
          return;
        }
      }

      // Otherwise check if clicking an existing building to inspect/upgrade
      const bHits = _raycaster.intersectObjects(buildingsRoot.children, true);
      if (bHits.length > 0) {
        let obj: THREE.Object3D | null = bHits[0].object;
        while (obj && !obj.userData?.buildingId) {
          obj = obj.parent;
        }
        if (obj?.userData?.buildingId) {
          propsRef.current.onSelectBuilding(obj.userData.buildingId);
          return;
        }
      } else {
        propsRef.current.onSelectBuilding(null);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // 12. ResizeObserver (immediately re-render after setSize so software WebGL buffer is never blank)
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Add a cedar & stone footbridge connecting the Tighremt bank and the Terrace Field bank
    const bridgeGroup = new THREE.Group();
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.28, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.75 })
    );
    bridgeDeck.position.set(riverCenterX(0), 0.55, 0);
    const railN = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.45, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x54341a, roughness: 0.8 })
    );
    railN.position.set(riverCenterX(0), 0.85, -0.95);
    const railS = railN.clone();
    railS.position.set(riverCenterX(0), 0.85, 0.95);
    bridgeGroup.add(bridgeDeck, railN, railS);
    scene.add(bridgeGroup);

    // 13. Software-WebGL Safe Animation Loop (afterDraw on software GL, rAF on GPU)
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let tourAngle = 2.25;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function animate() {
      if (disposed) return;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamped dt <= 0.05s

      const lState = propsRef.current.lifecycleState;

      if (lState === 'title') {
        // Live World Camera Tour on Title Screen
        tourAngle += dt * 0.14;
        const radius = 36;
        camera.position.x = Math.cos(tourAngle) * radius;
        camera.position.z = Math.sin(tourAngle) * radius;
        camera.position.y = 22 + Math.sin(tourAngle * 2) * 2.5;
        controls.target.set(0, 2.5, 0);
        camera.lookAt(controls.target);
      } else if (lState === 'playing') {
        // WASD / Arrow keys camera panning & Q/E rotation
        const panSpeed = 24 * dt;
        camera.getWorldDirection(_camForward);
        _camForward.y = 0;
        _camForward.normalize();
        _camRight.crossVectors(_camForward, camera.up).normalize();

        _panDelta.set(0, 0, 0);
        if (keysHeld.has('KeyW') || keysHeld.has('ArrowUp')) _panDelta.addScaledVector(_camForward, panSpeed);
        if (keysHeld.has('KeyS') || keysHeld.has('ArrowDown')) _panDelta.addScaledVector(_camForward, -panSpeed);
        if (keysHeld.has('KeyD') || keysHeld.has('ArrowRight')) _panDelta.addScaledVector(_camRight, panSpeed);
        if (keysHeld.has('KeyA') || keysHeld.has('ArrowLeft')) _panDelta.addScaledVector(_camRight, -panSpeed);

        if (_panDelta.lengthSq() > 0) {
          controls.target.add(_panDelta);
          camera.position.add(_panDelta);
          controls.target.x = THREE.MathUtils.clamp(controls.target.x, -40, 40);
          controls.target.z = THREE.MathUtils.clamp(controls.target.z, -40, 40);
        }

        if (keysHeld.has('KeyQ') || keysHeld.has('KeyE')) {
          const rotDir = keysHeld.has('KeyQ') ? 1 : -1;
          const offset = camera.position.clone().sub(controls.target);
          offset.applyAxisAngle(camera.up, rotDir * 1.4 * dt);
          camera.position.copy(controls.target).add(offset);
        }

        // Decaying trauma * trauma camera shake on building placement
        if (cameraTrauma > 0.001) {
          const shake = cameraTrauma * cameraTrauma * 0.35;
          camera.position.y += Math.sin(now * 0.08) * shake;
          cameraTrauma = Math.max(0, cameraTrauma - dt * 2.4);
        }

        if (controls.enableDamping) {
          controls.update();
        } else {
          camera.lookAt(controls.target);
        }
      }

      // Autonomous Multi-Waypoint Daily Life Loop for 3D Villagers & Newcomers
      const speedMult = Math.max(0.25, Math.min(4, propsRef.current.timeSpeed || 1));
      const selVId = propsRef.current.selectedVillagerId;

      for (let i = 0; i < activeVillagerData.length; i++) {
        const vd = activeVillagerData[i];
        const {
          agent,
          group,
          torsoGroup,
          leftArmPivot,
          rightArmPivot,
          leftLegPivot,
          rightLegPivot,
          cargoMesh,
          selectedHalo,
        } = vd;

        selectedHalo.visible = selVId === agent.id;

        const wps = agent.waypoints;
        if (!wps || wps.length === 0) continue;

        let rt = villagerRuntimeMap.get(agent.id);
        if (!rt) {
          rt = {
            waypointIdx: 0,
            legProgress: 0,
            dwellTimer: 0,
            fromX: agent.startX,
            fromZ: agent.startZ,
          };
          villagerRuntimeMap.set(agent.id, rt);
        }

        const currentWp = wps[rt.waypointIdx % wps.length];

        // Show carried harvest/goods bundle when hauling to storage
        cargoMesh.visible = currentWp.kind === 'storage' && rt.dwellTimer <= 0;

        if (rt.dwellTimer > 0) {
          // DWELLING AT WAYPOINT: Performing real task or socializing animation!
          rt.dwellTimer -= dt * speedMult;
          leftLegPivot.rotation.x = 0;
          rightLegPivot.rotation.x = 0;
          const workPhase = now * 0.007 * speedMult + agent.phaseOffset;

          if (currentWp.kind === 'work') {
            if (agent.habit === 'farming_terraces') {
              // Hoeing soil swing + torso lean
              torsoGroup.rotation.x = 0.25 + Math.sin(workPhase * 1.4) * 0.2;
              rightArmPivot.rotation.x = -0.8 + Math.sin(workPhase * 1.4) * 0.75;
              leftArmPivot.rotation.x = -0.4 + Math.sin(workPhase * 1.4) * 0.35;
            } else if (agent.habit === 'foraging_food') {
              // Crouching & gathering argan nuts / figs into basket
              torsoGroup.position.y = 0.2 + Math.sin(workPhase) * 0.05;
              torsoGroup.rotation.x = 0.32 + Math.sin(workPhase) * 0.15;
              leftArmPivot.rotation.x = -0.6 + Math.cos(workPhase * 1.6) * 0.5;
              rightArmPivot.rotation.x = -0.35;
            } else if (agent.habit === 'building_houses') {
              // Hammering rammed-earth formworks with mallet
              torsoGroup.rotation.x = 0.12 + Math.abs(Math.sin(workPhase * 2.0)) * 0.15;
              rightArmPivot.rotation.x = -0.9 + Math.sin(workPhase * 2.0) * 0.85;
              leftArmPivot.rotation.x = -0.45;
            } else {
              // Weaving / herding / guarding active posture
              torsoGroup.rotation.x = 0.08 * Math.sin(workPhase);
              rightArmPivot.rotation.x = -0.5 + Math.sin(workPhase * 1.3) * 0.4;
              leftArmPivot.rotation.x = -0.5 - Math.sin(workPhase * 1.3) * 0.4;
            }
          } else if (currentWp.kind === 'water') {
            // Bending by the seguia / river bank to draw water
            torsoGroup.rotation.x = 0.35 + Math.sin(workPhase) * 0.15;
            rightArmPivot.rotation.x = -0.7 + Math.sin(workPhase) * 0.4;
            leftArmPivot.rotation.x = -0.5;
          } else {
            // Socializing with spouse / family at Jemaa or resting at home
            torsoGroup.rotation.x = 0;
            torsoGroup.position.y = 0.24;
            group.rotation.y += Math.sin(workPhase * 0.5) * 0.01;
            leftArmPivot.rotation.x = -0.35 + Math.sin(workPhase * 1.2) * 0.35;
            rightArmPivot.rotation.x = -0.35 + Math.cos(workPhase * 1.2) * 0.35;
          }

          if (rt.dwellTimer <= 0) {
            // Advance to next waypoint in the 6-stage daily life circuit
            rt.fromX = currentWp.x;
            rt.fromZ = currentWp.z;
            rt.waypointIdx = (rt.waypointIdx + 1) % wps.length;
            rt.legProgress = 0;
            torsoGroup.rotation.x = 0;
            torsoGroup.position.y = 0.24;
          }
        } else {
          // WALKING BETWEEN WAYPOINTS
          const dist = Math.max(
            4,
            Math.hypot(currentWp.x - rt.fromX, currentWp.z - rt.fromZ)
          );
          rt.legProgress += (dt * agent.speed * 5.2 * speedMult) / dist;

          if (rt.legProgress >= 1) {
            rt.legProgress = 1;
            // Dwell for 2.8s to 4.5s at the destination
            rt.dwellTimer = currentWp.kind === 'work' ? 4.2 : 2.8;
          }

          const crossesRiver = rt.fromX * currentWp.x < 0;
          let wx: number;
          let wz: number;
          let lookTargetX = currentWp.x;
          let lookTargetZ = currentWp.z;

          if (crossesRiver) {
            const bridgeX = riverCenterX(0);
            if (rt.legProgress < 0.5) {
              const t = rt.legProgress * 2;
              wx = THREE.MathUtils.lerp(rt.fromX, bridgeX, t);
              wz = THREE.MathUtils.lerp(rt.fromZ, 0, t);
              lookTargetX = bridgeX;
              lookTargetZ = 0;
            } else {
              const t = (rt.legProgress - 0.5) * 2;
              wx = THREE.MathUtils.lerp(bridgeX, currentWp.x, t);
              wz = THREE.MathUtils.lerp(0, currentWp.z, t);
            }
          } else {
            wx = THREE.MathUtils.lerp(rt.fromX, currentWp.x, rt.legProgress);
            wz = THREE.MathUtils.lerp(rt.fromZ, currentWp.z, rt.legProgress);
          }

          const baseH =
            Math.abs(wx - riverCenterX(0)) < 3.6 && Math.abs(wz) < 1.5
              ? 0.68
              : Math.max(0.15, groundHeightAt(wx, wz));
          const stridePhase = now * 0.011 * speedMult + agent.phaseOffset;
          const walkBob = Math.abs(Math.sin(stridePhase)) * 0.07;

          group.position.set(wx, baseH + walkBob, wz);
          group.rotation.y = Math.atan2(lookTargetX - wx, lookTargetZ - wz);

          // Articulated leg & arm stride cycle
          leftLegPivot.rotation.x = Math.sin(stridePhase) * 0.55;
          rightLegPivot.rotation.x = -Math.sin(stridePhase) * 0.55;
          torsoGroup.rotation.x = 0.06;

          if (cargoMesh.visible) {
            // Hold harvest bundle steady in front with both arms
            leftArmPivot.rotation.x = -0.85;
            rightArmPivot.rotation.x = -0.85;
          } else {
            leftArmPivot.rotation.x = -Math.sin(stridePhase) * 0.42;
            rightArmPivot.rotation.x = Math.sin(stridePhase) * 0.42;
          }
        }
      }

      // Update pooled particles in-place
      let anyParticleActive = false;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particleState[i];
        if (!p.active) {
          _dummyObj.position.set(0, -100, 0);
          _dummyObj.scale.setScalar(0.001);
          _dummyObj.updateMatrix();
          particleMesh.setMatrixAt(i, _dummyObj.matrix);
          continue;
        }
        anyParticleActive = true;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy -= 9.8 * dt;

        const scale = 1 - p.life / p.maxLife;
        _dummyObj.position.set(p.x, p.y, p.z);
        _dummyObj.rotation.set(p.life * 4, p.life * 3, 0);
        _dummyObj.scale.setScalar(scale);
        _dummyObj.updateMatrix();
        particleMesh.setMatrixAt(i, _dummyObj.matrix);
      }
      if (anyParticleActive) {
        particleMesh.instanceMatrix.needsUpdate = true;
      }

      // Animate Real-Time 3D Weather Particles, Cloud Canopy & River Water Pulse
      const activeW = propsRef.current.weather || 'clear';
      const wSpec = WEATHER_INFO[activeW] || WEATHER_INFO.clear;
      riverMesh.position.y = wSpec.riverHeight + Math.sin(now * 0.0028) * 0.014;

      if (weatherCloudsGroup.visible) {
        const windDriftSpeed = activeW === 'sirocco_dust' ? 3.2 : activeW === 'heavy_rain' ? 1.9 : 0.7;
        for (let c = 0; c < cloudClusters.length; c++) {
          const cl = cloudClusters[c];
          cl.group.position.x =
            ((((cl.baseX + now * 0.001 * cl.speed * windDriftSpeed + 48) % 96) + 96) % 96) - 48;
          cl.group.position.y =
            (activeW === 'mountain_mist' ? 13 : 22) +
            (c % 4) * 1.6 +
            Math.sin(now * 0.0012 + c) * 0.35;
        }
      }

      for (let i = 0; i < WEATHER_PARTICLE_COUNT; i++) {
        const wp = weatherParticles[i];
        if (activeW === 'heavy_rain') {
          wp.y -= 24 * wp.speedFactor * dt;
          wp.x += 3.6 * dt;
          if (wp.y < 0.2) {
            wp.y = 26 + (i % 6);
            wp.x = ((i * 17 + Math.floor(now * 0.02)) % 68) - 34;
          }
          _dummyObj.position.set(wp.x, wp.y, wp.z);
          _dummyObj.rotation.set(0, 0, -0.15);
          _dummyObj.scale.set(0.65, 1.85, 0.65);
        } else if (activeW === 'sirocco_dust') {
          wp.x += 16.5 * wp.speedFactor * dt;
          wp.z += 4.5 * dt;
          wp.y += Math.sin(now * 0.003 + wp.phase) * 0.8 * dt;
          if (wp.x > 36) wp.x = -36;
          if (wp.z > 36) wp.z = -36;
          _dummyObj.position.set(wp.x, Math.max(0.5, wp.y * 0.55), wp.z);
          _dummyObj.rotation.set(wp.phase, now * 0.002, 0.4);
          _dummyObj.scale.set(1.6, 0.32, 1.6);
        } else if (activeW === 'mountain_mist') {
          wp.y -= 1.4 * wp.speedFactor * dt;
          wp.x += Math.sin(now * 0.0015 + wp.phase) * 1.2 * dt;
          if (wp.y < 0.4) wp.y = 18;
          _dummyObj.position.set(wp.x, wp.y * 0.7, wp.z);
          _dummyObj.rotation.set(0, now * 0.001, 0);
          _dummyObj.scale.set(2.1, 0.28, 2.1);
        } else if (activeW === 'drought') {
          // Rising heat-shimmer motes from sun-baked soil
          wp.y += 1.6 * wp.speedFactor * dt;
          wp.x += Math.sin(now * 0.004 + wp.phase) * 0.6 * dt;
          if (wp.y > 16) wp.y = 0.4;
          _dummyObj.position.set(wp.x, wp.y, wp.z);
          _dummyObj.rotation.set(0, 0, 0);
          _dummyObj.scale.set(0.8, 0.35, 0.8);
        } else {
          // Clear sky: gentle golden pollen motes or winter snow crystals
          const isWin = propsRef.current.season === 'winter';
          wp.y -= (isWin ? 2.4 : 0.45) * wp.speedFactor * dt;
          wp.x += Math.sin(now * 0.001 + wp.phase) * 0.5 * dt;
          if (wp.y < 0.4) wp.y = 20;
          _dummyObj.position.set(wp.x, wp.y, wp.z);
          _dummyObj.rotation.set(wp.phase, wp.phase, 0);
          _dummyObj.scale.set(0.9, 0.25, 0.9);
        }
        _dummyObj.updateMatrix();
        weatherParticleMesh.setMatrixAt(i, _dummyObj.matrix);
      }
      weatherParticleMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeldKeys);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Trigger scene updates when buildings, roles, households, villagerRoster, season, weather, or ghost selection change
  useEffect(() => {
    sceneRef.current?.rebuildBuildings();
    sceneRef.current?.updateGhostPreview();
  }, [buildings, selectedBuildingId, isVisitMode]);

  useEffect(() => {
    sceneRef.current?.rebuildVillagers();
  }, [roles, households, villagerRoster, selectedVillagerId]);

  useEffect(() => {
    sceneRef.current?.updateSeasonLook(season, weather);
  }, [season, weather]);

  useEffect(() => {
    sceneRef.current?.updateGhostPreview();
  }, [selectedBuildType, buildRotation, makhzenFavor, territoryLevel]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full z-0"
      aria-label="High Atlas 1870 3D Valley Viewport"
    />
  );
};
