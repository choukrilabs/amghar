import { FICTIONAL_TRIBES, GAME_CONFIG } from './config';
import {
  BuildingInstance,
  NeighborValley,
  NpcPersonality,
  SoukOffer,
  ValleyState,
} from './types';

// Deterministic Mulberry32 PRNG from integer seed
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Computes the fraction (0..1) of stored grain, walnuts, and silver protected inside the Agadir vault.
 * Section 5.4: Agadir protects 40% per level (Level 1 = 40%, Level 2 = 80%, Level 3 = 100%).
 */
export function getAgadirProtectionRatio(buildings: BuildingInstance[], nowMs = Infinity): number {
  let maxLevel = 0;
  for (const b of buildings) {
    if (b.type === 'agadir' && (b.finishAt === null || b.finishAt <= nowMs)) {
      maxLevel = Math.max(maxLevel, b.level);
    }
  }
  return Math.min(1, maxLevel * GAME_CONFIG.AGADIR_PROTECTION_PER_LEVEL);
}

export function computeDefenseScore(
  guards: number,
  ableHouseholds: number,
  buildings: BuildingInstance[],
  nowMs = Infinity
): number {
  let towerBonus = 0;
  let wallBonus = 0;
  for (const b of buildings) {
    if (b.finishAt === null || b.finishAt <= nowMs) {
      if (b.type === 'watchtower') {
        towerBonus += b.level * GAME_CONFIG.TOWER_DEFENSE_BONUS_PER_LEVEL;
      } else if (b.type === 'wall_gate') {
        wallBonus += b.level * GAME_CONFIG.WALL_DEFENSE_BONUS_PER_LEVEL;
      }
    }
  }
  const baseTroops = guards + 0.5 * ableHouseholds;
  return (
    baseTroops *
    (1 + towerBonus + wallBonus) *
    GAME_CONFIG.TERRAIN_DEFENSE_MULTIPLIER
  );
}

export function getStrengthLabel(defenseScore: number): 'Weak' | 'Moderate' | 'Strong' {
  if (defenseScore < 10) return 'Weak';
  if (defenseScore < 22) return 'Moderate';
  return 'Strong';
}

export interface RaidEligibilityCheck {
  allowed: boolean;
  reason?: string;
  arReason?: string;
}

/**
 * Checks all fairness rules from Section 5.8 before launching a raid.
 */
export function checkRaidEligibility(
  attacker: ValleyState,
  target: NeighborValley,
  fighters: number,
  nowMs: number
): RaidEligibilityCheck {
  if (fighters <= 0) {
    return {
      allowed: false,
      reason: 'Must assign at least 1 fighter to the raiding party',
      arReason: 'يجب تخصيص مقاتل واحد على الأقل لسرية الغزو',
    };
  }
  if (fighters > attacker.roles.guards + Math.floor(attacker.households * 0.5)) {
    return {
      allowed: false,
      reason: 'Not enough guards and able men available in the valley',
      arReason: 'لا يوجد عدد كافٍ من الحراس والرجال القادرين في القرية',
    };
  }
  if (attacker.pacts.includes(target.valleyId) || target.hasPactWithPlayer) {
    return {
      allowed: false,
      reason: 'Cannot raid a valley bound to you by a sacred tada pact',
      arReason: 'لا يجوز الإغارة على قرية تربطك بها معاهدة تاضا المقدسة',
    };
  }
  if (target.shieldUntil > nowMs) {
    return {
      allowed: false,
      reason: 'Target valley is protected by a Newcomer Truce Shield',
      arReason: 'هذه القرية محمية بهدنة الاستقرار الجديدة',
    };
  }
  if (target.lastRaidedAt > 0 && nowMs - target.lastRaidedAt < GAME_CONFIG.RAIDED_VALLEY_COOLDOWN_MS) {
    return {
      allowed: false,
      reason: 'Target valley was raided within the last 24 hours',
      arReason: 'تعرضت هذه القرية لغارة خلال الأربع والعشرين ساعة الماضية',
    };
  }
  if (
    target.lastRaidedByPlayerAt > 0 &&
    nowMs - target.lastRaidedByPlayerAt < GAME_CONFIG.PER_TARGET_RAID_COOLDOWN_MS
  ) {
    return {
      allowed: false,
      reason: 'You may only raid the same valley once every 48 hours',
      arReason: 'لا يمكن الإغارة على نفس القرية إلا مرة كل 48 ساعة',
    };
  }
  return { allowed: true };
}

export interface RaidResolutionInput {
  seed: number;
  fighters: number;
  armsCommitted: number;
  attackerMorale: number; // e.g., 1.0 (or 0.85..1.15 based on unrest)
  attackerDefenseScore: number;
  defenderGuards: number;
  defenderHouseholds: number;
  defenderBuildings: BuildingInstance[];
  defenderResources: {
    grain: number;
    flocks: number;
    silver: number;
  };
}

export interface RaidResolutionResult {
  attackerWon: boolean;
  attackPower: number;
  defensePower: number;
  loot: {
    grain: number;
    flocks: number;
    silver: number;
  };
  protectedByAgadir: {
    grain: number;
    silver: number;
  };
  attackerFighterLosses: number;
  defenderGuardLosses: number;
  attackerPrestigeDelta: number;
  defenderPrestigeDelta: number;
  isShamefulRaid: boolean;
}

/**
 * Deterministic raid resolution matching Section 5.8 formulas and rules:
 * - Attack = fighters * (1 + arms bonus) * morale * random(0.85..1.15)
 * - Defense = (guards + 0.5 * able households) * (1 + tower + wall bonus) * 1.3 terrain bonus * random(0.85..1.15)
 * - Agadir vault contents can never be looted.
 * - Attack wins: loot up to 15% of unprotected grain, 10% flocks, 10% unprotected Silver.
 * - Defense wins: attacker loses 30% of fighters; defender gains Prestige.
 * - Raiding a much weaker valley costs the attacker Prestige (it is shameful).
 */
export function resolveRaid(input: RaidResolutionInput): RaidResolutionResult {
  const rng = seededRandom(input.seed);
  const attackFactor = 0.85 + rng() * 0.3; // 0.85 to 1.15
  const defenseFactor = 0.85 + rng() * 0.3; // 0.85 to 1.15

  const armsBonus = input.armsCommitted * GAME_CONFIG.ARMS_BONUS_PER_UNIT;
  const rawAttack = input.fighters * (1 + armsBonus) * input.attackerMorale;
  const attackPower = Number((rawAttack * attackFactor).toFixed(2));

  const rawDefense = computeDefenseScore(
    input.defenderGuards,
    input.defenderHouseholds,
    input.defenderBuildings
  );
  const defensePower = Number((rawDefense * defenseFactor).toFixed(2));

  const isShamefulRaid =
    rawDefense < input.attackerDefenseScore * GAME_CONFIG.SHAMEFUL_RAID_STRENGTH_RATIO;

  const vaultRatio = getAgadirProtectionRatio(input.defenderBuildings);
  const protectedGrain = Math.round(input.defenderResources.grain * vaultRatio);
  const protectedSilver = Math.round(input.defenderResources.silver * vaultRatio);

  const unprotectedGrain = Math.max(0, input.defenderResources.grain - protectedGrain);
  const unprotectedSilver = Math.max(0, input.defenderResources.silver - protectedSilver);

  if (attackPower > defensePower) {
    const lootGrain = Math.floor(unprotectedGrain * GAME_CONFIG.RAID_LOOT_GRAIN_MAX_RATIO);
    const lootFlocks = Math.floor(
      input.defenderResources.flocks * GAME_CONFIG.RAID_LOOT_FLOCKS_MAX_RATIO
    );
    const lootSilver = Math.floor(unprotectedSilver * GAME_CONFIG.RAID_LOOT_SILVER_MAX_RATIO);

    const defenderGuardLosses = Math.min(
      input.defenderGuards,
      Math.max(1, Math.round(input.defenderGuards * 0.2))
    );
    const attackerFighterLosses = Math.min(
      input.fighters,
      Math.floor(input.fighters * 0.08)
    );

    const attackerPrestigeDelta = isShamefulRaid
      ? -GAME_CONFIG.SHAMEFUL_RAID_PRESTIGE_PENALTY
      : 4;

    return {
      attackerWon: true,
      attackPower,
      defensePower,
      loot: {
        grain: lootGrain,
        flocks: lootFlocks,
        silver: lootSilver,
      },
      protectedByAgadir: {
        grain: protectedGrain,
        silver: protectedSilver,
      },
      attackerFighterLosses,
      defenderGuardLosses,
      attackerPrestigeDelta,
      defenderPrestigeDelta: -2,
      isShamefulRaid,
    };
  } else {
    const attackerFighterLosses = Math.max(
      1,
      Math.round(input.fighters * GAME_CONFIG.RAID_DEFEAT_ATTACKER_LOSS_RATIO)
    );
    const attackerPrestigeDelta = isShamefulRaid
      ? -GAME_CONFIG.SHAMEFUL_RAID_PRESTIGE_PENALTY - 4
      : -4;

    return {
      attackerWon: false,
      attackPower,
      defensePower,
      loot: { grain: 0, flocks: 0, silver: 0 },
      protectedByAgadir: {
        grain: protectedGrain,
        silver: protectedSilver,
      },
      attackerFighterLosses,
      defenderGuardLosses: 0,
      attackerPrestigeDelta,
      defenderPrestigeDelta: GAME_CONFIG.DEFENSE_WIN_PRESTIGE_BONUS,
      isShamefulRaid,
    };
  }
}

/**
 * Deterministically generates the 29 neighboring valleys in the 30-slot High Atlas region
 * (Section 5.7 & Section 6).
 */
export function generateRegionalValleys(playerSlotIndex = 14): NeighborValley[] {
  const neighbors: NeighborValley[] = [];
  const personalities: NpcPersonality[] = ['proud', 'greedy', 'peaceful'];
  const amgharNames = [
    'Amghar Moha',
    'Amghar Brahim',
    'Amghar Lahcen',
    'Amghar Yidir',
    'Amghar Said',
    'Amghar Haddou',
    'Amghar Hammou',
    'Amghar Zayd',
    'Amghar Madani',
    'Amghar Basso',
  ];
  const arAmgharNames = [
    'الأمغار موحا',
    'الأمغار إبراهيم',
    'الأمغار لحسن',
    'الأمغار يدير',
    'الأمغار سعيد',
    'الأمغار حدو',
    'الأمغار حمو',
    'الأمغار زيد',
    'الأمغار المدني',
    'الأمغار باسو',
  ];

  for (let slot = 0; slot < GAME_CONFIG.VALLEYS_PER_REGION; slot++) {
    if (slot === playerSlotIndex) continue;

    const rng = seededRandom(187000 + slot * 97);
    const col = slot % 6;
    const row = Math.floor(slot / 6);
    const slotX = col * 18 + Math.round((rng() - 0.5) * 6) + 10;
    const slotY = row * 18 + Math.round((rng() - 0.5) * 6) + 12;

    const tribePair = FICTIONAL_TRIBES[slot % FICTIONAL_TRIBES.length];
    const personality = personalities[slot % personalities.length];
    const ownerName = `${amgharNames[slot % amgharNames.length]} u-${tribePair.tribe.split(' ')[1]}`;
    const arOwnerName = `${arAmgharNames[slot % arAmgharNames.length]} (${tribePair.arTribe})`;
    const households = 5 + Math.floor(rng() * 8);
    const guards = 1 + Math.floor(rng() * 4);
    const agadirLevel = rng() > 0.45 ? (rng() > 0.75 ? 2 : 1) : 0;
    const towerLevel = rng() > 0.4 ? (rng() > 0.8 ? 2 : 1) : 0;
    const wallLevel = rng() > 0.5 ? 1 : 0;

    const buildings: BuildingInstance[] = [
      {
        id: `npc_${slot}_tig_1`,
        type: 'tighremt',
        level: Math.min(3, Math.ceil(households / 4)),
        x: -8,
        z: -6,
        rotation: 0,
        finishAt: null,
      },
      {
        id: `npc_${slot}_tig_2`,
        type: 'tighremt',
        level: 1,
        x: -14,
        z: 2,
        rotation: Math.PI / 2,
        finishAt: null,
      },
      {
        id: `npc_${slot}_sheep`,
        type: 'sheepfold',
        level: 1 + (slot % 2),
        x: 11,
        z: -8,
        rotation: 0,
        finishAt: null,
      },
      {
        id: `npc_${slot}_seguia`,
        type: 'seguia',
        level: 1 + (slot % 2),
        x: 8,
        z: 3,
        rotation: 0,
        finishAt: null,
      },
      {
        id: `npc_${slot}_jemaa`,
        type: 'jemaa_square',
        level: 1,
        x: -6,
        z: 6,
        rotation: 0,
        finishAt: null,
      },
    ];

    // Add terrace fields
    for (let f = 0; f < 4 + (slot % 3); f++) {
      buildings.push({
        id: `npc_${slot}_field_${f}`,
        type: 'terrace_field',
        level: 1 + (f % 2),
        x: 12 + (f % 2) * 7,
        z: -2 + f * 4.5,
        rotation: 0,
        finishAt: null,
      });
    }

    if (agadirLevel > 0) {
      buildings.push({
        id: `npc_${slot}_agadir`,
        type: 'agadir',
        level: agadirLevel,
        x: -16,
        z: -12,
        rotation: 0,
        finishAt: null,
      });
    }
    if (towerLevel > 0) {
      buildings.push({
        id: `npc_${slot}_tower`,
        type: 'watchtower',
        level: towerLevel,
        x: -10,
        z: 14,
        rotation: 0,
        finishAt: null,
      });
    }
    if (wallLevel > 0) {
      buildings.push({
        id: `npc_${slot}_wall`,
        type: 'wall_gate',
        level: wallLevel,
        x: -4,
        z: 16,
        rotation: 0,
        finishAt: null,
      });
    }
    if (slot % 3 === 0) {
      buildings.push({
        id: `npc_${slot}_mosque`,
        type: 'mosque_zawiya',
        level: 1,
        x: -13,
        z: 9,
        rotation: 0,
        finishAt: null,
      });
    }

    const defScore = computeDefenseScore(guards, households, buildings);
    const makhzenFavor = 25 + Math.floor(rng() * 60);
    const prestige = 12 + Math.floor(rng() * 55);

    neighbors.push({
      valleyId: `valley_slot_${slot}`,
      slotIndex: slot,
      slotX,
      slotY,
      name: `${tribePair.valley} #${slot + 1}`,
      arName: `${tribePair.arValley} #${slot + 1}`,
      ownerName,
      arOwnerName,
      tribeName: tribePair.tribe,
      arTribeName: tribePair.arTribe,
      isNpc: true,
      personality,
      prestige,
      makhzenFavor,
      strengthLabel: getStrengthLabel(defScore),
      estimatedDefense: Number(defScore.toFixed(1)),
      resources: {
        grain: 220 + Math.floor(rng() * 340),
        water: 95,
        flocks: 30 + Math.floor(rng() * 45),
        timber: 60 + Math.floor(rng() * 60),
        earth: 140 + Math.floor(rng() * 120),
        stone: 50 + Math.floor(rng() * 70),
        walnuts: 20 + Math.floor(rng() * 50),
        textiles: 8 + Math.floor(rng() * 25),
        silver: 35 + Math.floor(rng() * 65),
        arms: 10 + Math.floor(rng() * 20),
        prestige,
      },
      households,
      roles: {
        farmers: Math.max(2, households - guards - 2),
        shepherds: 1,
        builders: 1,
        guards,
        artisans: 0,
      },
      buildings,
      hasPactWithPlayer: slot === 13 || slot === 15, // Start with 2 friendly neighbor pacts
      lastRaidedAt: 0,
      lastRaidedByPlayerAt: 0,
      shieldUntil: 0,
      isQaid: makhzenFavor >= 70 && prestige >= 45,
    });
  }

  return neighbors;
}

export function generateRegionalSoukOffers(neighbors: NeighborValley[]): SoukOffer[] {
  const offers: SoukOffer[] = [];
  const sampleNeighbors = neighbors.slice(0, 8);

  const templates: Array<{
    give: keyof SoukOffer['giveResource'] extends never ? never : 'grain' | 'timber' | 'stone' | 'walnuts' | 'textiles' | 'arms' | 'silver';
    giveAmt: number;
    want: 'grain' | 'timber' | 'stone' | 'walnuts' | 'textiles' | 'arms' | 'silver';
    wantAmt: number;
  }> = [
    { give: 'grain', giveAmt: 80, want: 'silver', wantAmt: 20 },
    { give: 'timber', giveAmt: 40, want: 'walnuts', wantAmt: 20 },
    { give: 'stone', giveAmt: 45, want: 'grain', wantAmt: 60 },
    { give: 'arms', giveAmt: 10, want: 'silver', wantAmt: 25 },
    { give: 'silver', giveAmt: 30, want: 'textiles', wantAmt: 10 },
    { give: 'walnuts', giveAmt: 35, want: 'grain', wantAmt: 70 },
    { give: 'timber', giveAmt: 50, want: 'silver', wantAmt: 18 },
    { give: 'stone', giveAmt: 50, want: 'walnuts', wantAmt: 22 },
  ];

  sampleNeighbors.forEach((n, idx) => {
    const t = templates[idx % templates.length];
    const priceMultiplier =
      n.personality === 'greedy' ? 1.15 : n.personality === 'peaceful' ? 0.9 : 1.0;
    offers.push({
      offerId: `souk_offer_${n.valleyId}_${idx}`,
      sellerValleyId: n.valleyId,
      sellerName: `${n.ownerName} (${n.name})`,
      arSellerName: `${n.arOwnerName || n.ownerName} — ${n.arName || n.name}`,
      giveResource: t.give,
      giveAmount: t.giveAmt,
      wantResource: t.want,
      wantAmount: Math.max(5, Math.round(t.wantAmt * priceMultiplier)),
      distanceKm: 6 + idx * 3,
    });
  });

  return offers;
}
