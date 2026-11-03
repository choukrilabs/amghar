import { BUILDINGS_CONFIG } from './config';
import { BuildingInstance, BuildingType } from './types';

// Oued Souss / Oued Massa meanders gently along Z from -80 to +80
export function riverCenterX(z: number): number {
  return Math.sin(z * 0.04) * 5.2 + Math.cos(z * 0.08) * 1.8;
}

export function riverDistanceAt(x: number, z: number): number {
  const rx = riverCenterX(z);
  return Math.abs(x - rx);
}

// Deterministic multi-octave noise for Sous-Massa plain & distant Anti-Atlas / High Atlas foothills
function hash2d(ix: number, iz: number): number {
  const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);

  const a = hash2d(ix, iz);
  const b = hash2d(ix + 1, iz);
  const c = hash2d(ix, iz + 1);
  const d = hash2d(ix + 1, iz + 1);

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbmNoise(x: number, z: number): number {
  let val = 0;
  let amp = 0.5;
  let freq = 0.035;
  for (let i = 0; i < 3; i++) {
    val += valueNoise(x * freq, z * freq) * amp;
    freq *= 2.05;
    amp *= 0.48;
  }
  return val;
}

/**
 * Returns the buildable village territory radius (in meters) for the Sous-Massa plain.
 * Level 1 = 42m, Level 2 = 48m, Level 3 = 54m, Level 4 = 60m.
 */
export function getTerritoryRadius(territoryLevel = 1): number {
  return 42 + Math.max(0, territoryLevel - 1) * 6;
}

/**
 * Pure terrain elevation function for the Sous-Massa Valley Plain (سهل سوس ماسة الخصيب):
 * - A central Oued Massa / Oued Souss river channel (y ~ -0.6 to 0.15)
 * - A broad, flat-to-gently-terraced fertile alluvial plain (|x|, |z| up to 55m, height 0.25m to 2.2m)
 *   where the player can freely farm barley, plant argan/walnut groves, and build Tighremt houses
 * - Distant Anti-Atlas & High Atlas mountain ridges only beyond radius 56m
 */
export function groundHeightAt(x: number, z: number): number {
  const rx = riverCenterX(z);
  const distFromRiver = Math.abs(x - rx);
  const radialDist = Math.hypot(x, z);

  // River channel carving
  if (distFromRiver < 3.0) {
    const t = distFromRiver / 3.0;
    return -0.62 * (1 - t * t) + 0.15;
  }

  // Broad, flat fertile Sous-Massa alluvial plain
  const valleyDist = Math.max(0, distFromRiver - 3.0);
  const gentlePlainRise = Math.min(2.1, valleyDist * 0.038);
  const subtleUndulation = (fbmNoise(x + 100, z + 100) - 0.48) * 0.42;

  let h = 0.24 + gentlePlainRise + subtleUndulation;

  // Soft agricultural terrace steps across the plain
  if (radialDist < 55) {
    const stepSize = 0.45;
    const stepped = Math.round(h / stepSize) * stepSize;
    h = h * 0.55 + stepped * 0.45;
  }

  // Distant Anti-Atlas & High Atlas mountain perimeter ring (beyond the buildable plain)
  if (radialDist > 56) {
    const ridgeFactor = Math.pow((radialDist - 56) * 0.048, 1.55) * 16;
    const crag = fbmNoise(x * 1.7, z * 1.7) * 6.5;
    h += ridgeFactor + crag;
  }

  return h;
}

export function slopeAt(x: number, z: number): number {
  const eps = 1.2;
  const hx1 = groundHeightAt(x + eps, z);
  const hx0 = groundHeightAt(x - eps, z);
  const hz1 = groundHeightAt(x, z + eps);
  const hz0 = groundHeightAt(x, z - eps);
  const dx = (hx1 - hx0) / (2 * eps);
  const dz = (hz1 - hz0) / (2 * eps);
  return Math.hypot(dx, dz);
}

export function getEffectiveFootprint(
  type: BuildingType,
  rotation: number
): { w: number; d: number } {
  const base = BUILDINGS_CONFIG[type].footprint;
  const quarterTurns = Math.round(rotation / (Math.PI / 2)) % 2;
  if (Math.abs(quarterTurns) === 1) {
    return { w: base.d, d: base.w };
  }
  return { w: base.w, d: base.d };
}

export interface PlacementCheckResult {
  valid: boolean;
  reason?: string;
  arReason?: string;
}

export function validateBuildingPlacement(
  type: BuildingType,
  x: number,
  z: number,
  rotation: number,
  existingBuildings: BuildingInstance[],
  makhzenFavor = 50,
  territoryLevel = 1
): PlacementCheckResult {
  const def = BUILDINGS_CONFIG[type];
  const maxBound = getTerritoryRadius(territoryLevel);

  // Check playable Sous-Massa territory bounds
  if (Math.abs(x) > maxBound || Math.abs(z) > maxBound) {
    return {
      valid: false,
      reason: `Outside village territory border (±${maxBound}m). Expand territory in World Map!`,
      arReason: `خارج حدود أراضي القرية (±${maxBound}م). وسّع أراضي القرية من خريطة العالم!`,
    };
  }

  // Makhzen Favor requirement (e.g. Kasbah needs 70+)
  if (def.minMakhzenFavor && makhzenFavor < def.minMakhzenFavor) {
    return {
      valid: false,
      reason: `Requires Makhzen Favor ${def.minMakhzenFavor}+ (currently ${Math.round(makhzenFavor)})`,
      arReason: `يتطلب رضا المخزن ${def.minMakhzenFavor}+ (الحالي: ${Math.round(makhzenFavor)})`,
    };
  }

  const rDist = riverDistanceAt(x, z);

  // Water mill must be near the river; other buildings cannot sit inside the river bed
  if (def.needsWaterProximity) {
    if (rDist < 2.0 || rDist > 8.5) {
      return {
        valid: false,
        reason: 'Water Mill must be placed along the Oued Massa river bank',
        arReason: 'يجب بناء الرحى المائية على ضفة مجرى وادي سوس ماسة مباشرةً',
      };
    }
  } else {
    if (rDist < 3.3) {
      return {
        valid: false,
        reason: 'Cannot build directly inside the river channel',
        arReason: 'لا يمكن البناء داخل مجرى النهر مباشرةً',
      };
    }
  }

  // Slope check (Sous-Massa plain is gentle and buildable)
  const slope = slopeAt(x, z);
  if (slope > def.maxSlope) {
    return {
      valid: false,
      reason: 'Slope is too steep for this foundation',
      arReason: 'المنحدر شديد الانحدار ولا يصلح لأساسات هذا المبنى',
    };
  }

  // Overlap check with existing buildings
  const fp = getEffectiveFootprint(type, rotation);
  const halfW = fp.w / 2 + 0.35;
  const halfD = fp.d / 2 + 0.35;

  for (const b of existingBuildings) {
    const bFp = getEffectiveFootprint(b.type, b.rotation);
    const bHalfW = bFp.w / 2 + 0.35;
    const bHalfD = bFp.d / 2 + 0.35;

    if (
      Math.abs(x - b.x) < halfW + bHalfW &&
      Math.abs(z - b.z) < halfD + bHalfD
    ) {
      return {
        valid: false,
        reason: `Overlaps with existing ${BUILDINGS_CONFIG[b.type].name}`,
        arReason: `يتداخل مع مبنى قائم (${BUILDINGS_CONFIG[b.type].arName})`,
      };
    }
  }

  return { valid: true };
}
