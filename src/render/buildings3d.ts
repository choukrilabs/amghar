import * as THREE from 'three';
import { BuildingInstance, BuildingType, Season } from '../game/types';
import { ProceduralTextureSet } from './textures';

/**
 * Assembles composite 3–12 part procedural High Atlas architectural models (THREE.Group)
 * with varied roughness/metalness, bottom-center grounding pivots, and contact shadows.
 */
export function createBuildingMeshGroup(
  b: BuildingInstance,
  season: Season,
  textures: ProceduralTextureSet,
  nowMs: number
): THREE.Group {
  const group = new THREE.Group();
  group.name = `building_${b.id}`;
  group.userData = { buildingId: b.id, buildingType: b.type, level: b.level };

  const isConstructing = b.finishAt !== null && b.finishAt > nowMs;
  const lvlScale = 1 + (b.level - 1) * 0.16;

  // Shared materials with varied roughness >= 0.25 between primary pisé, secondary stone/timber, and accents
  const piseMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.rammedEarthMap,
    bumpMap: textures.rammedEarthBump,
    bumpScale: 0.04,
    roughness: 0.85,
    metalness: 0.05,
  });

  const darkPiseMat = new THREE.MeshStandardMaterial({
    color: 0xd99b72,
    map: textures.rammedEarthMap,
    bumpMap: textures.rammedEarthBump,
    bumpScale: 0.03,
    roughness: 0.78,
    metalness: 0.08,
  });

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.stoneMap,
    bumpMap: textures.stoneBump,
    bumpScale: 0.05,
    roughness: 0.9,
    metalness: 0.05,
  });

  const cedarMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.55,
    metalness: 0.12,
  });

  const limeWashMat = new THREE.MeshStandardMaterial({
    color: 0xf4ead5,
    roughness: 0.45,
    metalness: 0.05,
  });

  const waterAccentMat = new THREE.MeshStandardMaterial({
    color: 0x2b8cbe,
    roughness: 0.18,
    metalness: 0.22,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4a338,
    roughness: 0.25,
    metalness: 0.8,
  });

  const textileMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.textileMap,
    roughness: 0.65,
    metalness: 0.05,
  });

  // Soft contact shadow disc at y = 0.02 to prevent floating and avoid coplanar Z-fighting
  const shadowRadius = b.type === 'kasbah' || b.type === 'agadir' ? 3.6 : 2.6;
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(shadowRadius, 20),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadowMap,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.02;
  group.add(shadowDisc);

  // Build specific composite 3-12 part High Atlas structure
  switch (b.type) {
    case 'tighremt': {
      // 1. Stone foundation plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 3.4), stoneMat);
      plinth.position.y = 0.225;
      group.add(plinth);

      // 2. Central courtyard keep
      const keepH = 2.2 * lvlScale;
      const keep = new THREE.Mesh(new THREE.BoxGeometry(2.5, keepH, 2.5), piseMat);
      keep.position.y = 0.45 + keepH / 2;
      group.add(keep);

      // 3-6. Four tapering Amazigh corner towers (CylinderGeometry with 4 radial segments rotated 45°)
      const towerH = keepH + 0.85;
      const corners = [
        [-1.2, -1.2],
        [1.2, -1.2],
        [-1.2, 1.2],
        [1.2, 1.2],
      ];
      for (const [cx, cz] of corners) {
        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.58, towerH, 4),
          darkPiseMat
        );
        tower.rotation.y = Math.PI / 4;
        tower.position.set(cx, 0.45 + towerH / 2, cz);
        group.add(tower);

        // Whitewashed geometric crown band + stepped merlons
        const crown = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.7), limeWashMat);
        crown.position.set(cx, 0.45 + towerH + 0.11, cz);
        group.add(crown);

        const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.32), limeWashMat);
        merlon.position.set(cx, 0.45 + towerH + 0.32, cz);
        group.add(merlon);
      }

      // 7. Projecting cedar roof joists (azaghar) & recessed doorway + warm window slits
      for (let bx = -0.9; bx <= 0.9; bx += 0.6) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.75), cedarMat);
        beam.position.set(bx, 0.45 + keepH - 0.12, 0);
        group.add(beam);
      }

      const windowMat = new THREE.MeshStandardMaterial({
        color: 0xffb347,
        emissive: 0xd97706,
        emissiveIntensity: 0.45,
        roughness: 0.4,
      });
      for (const wx of [-0.6, 0.6]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 2.56), windowMat);
        win.position.set(wx, 0.45 + keepH * 0.62, 0);
        group.add(win);
      }

      const door = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.9, 0.18), cedarMat);
      door.position.set(0, 0.88, 1.26);
      group.add(door);
      break;
    }

    case 'terrace_field': {
      // 1-2. Two stepped stone retaining terraces
      const lowWall = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.45, 2.8), stoneMat);
      lowWall.position.y = 0.225;
      group.add(lowWall);

      const soilColor =
        season === 'spring'
          ? 0x4d8c3a
          : season === 'summer'
          ? 0xd4a838
          : season === 'autumn'
          ? 0x8f6239
          : 0xdce4ec;
      const soilMat = new THREE.MeshStandardMaterial({
        color: soilColor,
        roughness: 0.82,
        metalness: 0.04,
      });

      const soilBed = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.16, 2.5), soilMat);
      soilBed.position.y = 0.48;
      group.add(soilBed);

      // 3-8. Rows of crop sheaves / barley stalks
      const stalkColor =
        season === 'spring'
          ? 0x5ca842
          : season === 'summer'
          ? 0xe8bd46
          : season === 'autumn'
          ? 0xa67942
          : 0xeaf0f6;
      const stalkMat = new THREE.MeshStandardMaterial({
        color: stalkColor,
        roughness: 0.6,
        metalness: 0.05,
      });
      for (let r = -1.5; r <= 1.5; r += 0.75) {
        const rowMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, season === 'autumn' ? 0.15 : 0.38 * lvlScale, 2.1),
          stalkMat
        );
        rowMesh.position.set(r, 0.62, 0);
        group.add(rowMesh);
      }

      // Irrigation side sluice
      const sluice = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 0.24), waterAccentMat);
      sluice.position.set(0, 0.56, -1.15);
      group.add(sluice);
      break;
    }

    case 'seguia': {
      // 1. Stone aqueduct channel bed
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.42, 1.4), stoneMat);
      base.position.y = 0.21;
      group.add(base);

      // 2-3. Left and right channel stone curbs
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 0.24), stoneMat);
      curbL.position.set(0, 0.52, -0.45);
      group.add(curbL);

      const curbR = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 0.24), stoneMat);
      curbR.position.set(0, 0.52, 0.45);
      group.add(curbR);

      // 4. Flowing mountain water stream
      const stream = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.16, 0.64), waterAccentMat);
      stream.position.set(0, 0.48, 0);
      group.add(stream);

      // 5. Cedar sluice gate & tanast copper bowl stand
      const gateArch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 1.35), cedarMat);
      gateArch.position.set(0, 0.65, 0);
      group.add(gateArch);
      break;
    }

    case 'walnut_grove': {
      // 1. Low dry-stone orchard boundary wall
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.35, 8), stoneMat);
      ring.position.y = 0.175;
      group.add(ring);

      const foliageColor =
        season === 'spring'
          ? 0x3d7d34
          : season === 'summer'
          ? 0x2e6927
          : season === 'autumn'
          ? 0xd67424
          : 0xdbe3eb;
      const leafMat = new THREE.MeshStandardMaterial({
        color: foliageColor,
        roughness: 0.65,
        metalness: 0.05,
      });

      // 2-7. Three multi-part walnut trees (trunk + layered domes)
      const offsets = [
        [-0.75, -0.55],
        [0.8, -0.45],
        [0, 0.75],
      ];
      offsets.forEach(([ox, oz], idx) => {
        const hScale = (0.9 + idx * 0.12) * lvlScale;
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.22, 1.2 * hScale, 7),
          cedarMat
        );
        trunk.position.set(ox, 0.35 + (0.6 * hScale), oz);
        group.add(trunk);

        const canopy = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.78 * hScale, 1),
          leafMat
        );
        canopy.position.set(ox, 0.35 + 1.35 * hScale, oz);
        group.add(canopy);
      });
      break;
    }

    case 'sheepfold': {
      // 1. Stone corral walls (azib enclosure)
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.65, 0.3), stoneMat);
      wallN.position.set(0, 0.325, -1.5);
      const wallS = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 0.3), stoneMat);
      wallS.position.set(-0.6, 0.325, 1.5);
      const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.65, 3.3), stoneMat);
      wallW.position.set(-1.55, 0.325, 0);
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.65, 3.3), stoneMat);
      wallE.position.set(1.55, 0.325, 0);
      group.add(wallN, wallS, wallW, wallE);

      // 2. Timber winter shelter shed
      const shed = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.15 * lvlScale, 1.2), piseMat);
      shed.position.set(0, 0.58 * lvlScale, -0.85);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.18, 1.45), cedarMat);
      roof.position.set(0, 1.18 * lvlScale, -0.85);
      group.add(shed, roof);

      // 3-6. Stylized white wool sheep clusters inside corral
      for (let s = 0; s < 3 + b.level; s++) {
        const sheep = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.32, 0.55),
          limeWashMat
        );
        sheep.position.set(-0.8 + (s % 3) * 0.8, 0.22, 0.35 + Math.floor(s / 3) * 0.55);
        group.add(sheep);
      }
      break;
    }

    case 'water_mill': {
      // 1. Stone mill race foundation
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 2.4), stoneMat);
      base.position.y = 0.4;
      group.add(base);

      // 2. Pisé upper mill house
      const house = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5 * lvlScale, 2.0), piseMat);
      house.position.y = 0.8 + 0.75 * lvlScale;
      group.add(house);

      // 3-5. Cedar waterwheel + paddles + axle
      const wheelGroup = new THREE.Group();
      wheelGroup.name = 'waterwheel_spinner';
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 8, 16), cedarMat);
      wheelGroup.add(rim);
      for (let p = 0; p < 4; p++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 0.28), cedarMat);
        spoke.rotation.z = (p * Math.PI) / 4;
        wheelGroup.add(spoke);
      }
      wheelGroup.position.set(0, 1.05, 1.22);
      group.add(wheelGroup);

      // 6. Water flume chute
      const chute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.8), waterAccentMat);
      chute.position.set(-0.8, 1.4, 1.15);
      group.add(chute);
      break;
    }

    case 'agadir': {
      // Collective Fortified Granary (Hero landmark)
      // 1. Massive stone bastion base
      const base = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.9, 4.6), stoneMat);
      base.position.y = 0.45;
      group.add(base);

      // 2. Multi-tier honeycomb granary body
      const bodyH = 2.8 * lvlScale;
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.9, bodyH, 3.9), piseMat);
      body.position.y = 0.9 + bodyH / 2;
      group.add(body);

      // 3-6. Four defensive watch bastions
      const towerH = bodyH + 0.9;
      for (const [cx, cz] of [
        [-1.85, -1.85],
        [1.85, -1.85],
        [-1.85, 1.85],
        [1.85, 1.85],
      ]) {
        const bastion = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.68, towerH, 4),
          darkPiseMat
        );
        bastion.rotation.y = Math.PI / 4;
        bastion.position.set(cx, 0.9 + towerH / 2, cz);
        group.add(bastion);
      }

      // 7-9. Projecting stone climbing steps & cedar vault doors
      const vaultCrest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 4.05), limeWashMat);
      vaultCrest.position.y = 0.9 + bodyH - 0.25;
      group.add(vaultCrest);
      break;
    }

    case 'watchtower': {
      // 1. Heavy stone plinth
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.45, 0.8, 4), stoneMat);
      plinth.rotation.y = Math.PI / 4;
      plinth.position.y = 0.4;
      group.add(plinth);

      // 2. Tall tapering rammed-earth borj
      const shaftH = 3.8 * lvlScale;
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 1.15, shaftH, 4),
        piseMat
      );
      shaft.rotation.y = Math.PI / 4;
      shaft.position.y = 0.8 + shaftH / 2;
      group.add(shaft);

      // 3. Whitewashed lookout gallery & fire brazier
      const gallery = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.45, 1.35), limeWashMat);
      gallery.position.y = 0.8 + shaftH + 0.2;
      group.add(gallery);

      const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.3, 8), brassMat);
      brazier.position.y = 0.8 + shaftH + 0.55;
      group.add(brazier);
      break;
    }

    case 'wall_gate': {
      // 1. Curtain wall rampart
      const wallH = 2.1 * lvlScale;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(5.6, wallH, 1.2), piseMat);
      wall.position.y = wallH / 2;
      group.add(wall);

      // 2-3. Flanking gatehouse towers
      const leftT = new THREE.Mesh(new THREE.BoxGeometry(1.4, wallH + 0.7, 1.6), darkPiseMat);
      leftT.position.set(-1.6, (wallH + 0.7) / 2, 0);
      const rightT = new THREE.Mesh(new THREE.BoxGeometry(1.4, wallH + 0.7, 1.6), darkPiseMat);
      rightT.position.set(1.6, (wallH + 0.7) / 2, 0);
      group.add(leftT, rightT);

      // 4. Heavy studded cedar gate
      const gate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.3), cedarMat);
      gate.position.set(0, 0.75, 0);
      group.add(gate);
      break;
    }

    case 'jemaa_square': {
      // 1. Octagonal paved stone assembly plaza
      const plaza = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.2, 0.26, 8), stoneMat);
      plaza.position.y = 0.13;
      group.add(plaza);

      // 2. Woven carpet council ring
      const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 8), textileMat);
      rug.position.y = 0.28;
      group.add(rug);

      // 3-6. Cedar pergola pillars & central council hearth
      for (const [px, pz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.6, 6), cedarMat);
        post.position.set(px, 0.9, pz);
        group.add(post);
      }
      const hearth = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.35, 8), brassMat);
      hearth.position.y = 0.42;
      group.add(hearth);
      break;
    }

    case 'mosque_zawiya': {
      // 1. Prayer hall
      const hall = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8 * lvlScale, 2.8), piseMat);
      hall.position.set(-0.2, 0.9 * lvlScale, 0);
      group.add(hall);

      // 2. Whitewashed marabout qubba dome
      const domeBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.5), limeWashMat);
      domeBase.position.set(-0.8, 1.8 * lvlScale + 0.4, -0.4);
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        limeWashMat
      );
      dome.position.set(-0.8, 1.8 * lvlScale + 1.1, -0.4);
      group.add(domeBase, dome);

      // 3. Square tapering Atlas minaret + brass jamour finial
      const minH = 3.6 * lvlScale;
      const minaret = new THREE.Mesh(new THREE.BoxGeometry(0.95, minH, 0.95), darkPiseMat);
      minaret.position.set(1.1, minH / 2, 0.8);
      const jamour = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.65, 8), brassMat);
      jamour.position.set(1.1, minH + 0.32, 0.8);
      group.add(minaret, jamour);
      break;
    }

    case 'souk': {
      // 1. Stone market platform
      const pad = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 3.4), stoneMat);
      pad.position.y = 0.11;
      group.add(pad);

      // 2-5. Three market stalls with Amazigh woven canopies
      for (let i = -1; i <= 1; i++) {
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1.6), piseMat);
        counter.position.set(i * 1.35, 0.48, 0);
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 1.9), textileMat);
        canopy.position.set(i * 1.35, 1.35 * lvlScale, 0);
        canopy.rotation.x = 0.12;
        group.add(counter, canopy);
      }
      break;
    }

    case 'weaving_house': {
      // 1. Workshop building
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6 * lvlScale, 2.6), piseMat);
      body.position.y = 0.8 * lvlScale;
      group.add(body);

      // 2. Rooftop wool-drying pergola & hanging carpets
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.15), textileMat);
      rack.position.set(0, 1.6 * lvlScale + 0.45, 0.6);
      const rack2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.15), textileMat);
      rack2.position.set(0, 1.6 * lvlScale + 0.45, -0.6);
      group.add(rack, rack2);
      break;
    }

    case 'funduq': {
      // Caravan inn with central courtyard
      const w = 4.4;
      const d = 3.6;
      const h = 1.9 * lvlScale;
      const north = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), piseMat);
      north.position.set(0, h / 2, -d / 2 + 0.4);
      const south = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), piseMat);
      south.position.set(0, h / 2, d / 2 - 0.4);
      const west = new THREE.Mesh(new THREE.BoxGeometry(0.8, h, d), darkPiseMat);
      west.position.set(-w / 2 + 0.4, h / 2, 0);
      const east = new THREE.Mesh(new THREE.BoxGeometry(0.8, h, d), darkPiseMat);
      east.position.set(w / 2 - 0.4, h / 2, 0);
      const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.4, 8), waterAccentMat);
      fountain.position.y = 0.2;
      group.add(north, south, west, east, fountain);
      break;
    }

    case 'kasbah': {
      // Grand Governor's Fortress (Hero multi-tiered citadel)
      const base = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.0, 5.4), stoneMat);
      base.position.y = 0.5;
      group.add(base);

      const outerKeepH = 2.6 * lvlScale;
      const outerKeep = new THREE.Mesh(new THREE.BoxGeometry(4.4, outerKeepH, 4.4), piseMat);
      outerKeep.position.y = 1.0 + outerKeepH / 2;
      group.add(outerKeep);

      const innerPalaceH = 3.8 * lvlScale;
      const innerPalace = new THREE.Mesh(new THREE.BoxGeometry(2.6, innerPalaceH, 2.6), limeWashMat);
      innerPalace.position.y = 1.0 + innerPalaceH / 2;
      group.add(innerPalace);

      const towerH = outerKeepH + 1.2;
      for (const [cx, cz] of [
        [-2.1, -2.1],
        [2.1, -2.1],
        [-2.1, 2.1],
        [2.1, 2.1],
      ]) {
        const t = new THREE.Mesh(
          new THREE.CylinderGeometry(0.58, 0.78, towerH, 4),
          darkPiseMat
        );
        t.rotation.y = Math.PI / 4;
        t.position.set(cx, 1.0 + towerH / 2, cz);
        group.add(t);
      }

      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.25, 0.9, 8), brassMat);
      finial.position.y = 1.0 + innerPalaceH + 0.45;
      group.add(finial);
      break;
    }
  }

  // If currently under construction, add cedar scaffolding poles around the structure
  if (isConstructing) {
    const scaffGroup = new THREE.Group();
    for (const [sx, sz] of [
      [-1.7, -1.7],
      [1.7, -1.7],
      [-1.7, 1.7],
      [1.7, 1.7],
    ]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 6), cedarMat);
      pole.position.set(sx, 1.6, sz);
      scaffGroup.add(pole);
    }
    group.add(scaffGroup);
  }

  return group;
}
