import { BUILDINGS_CONFIG, GAME_CONFIG, PRESET_MESSAGES, RESOURCE_ARABIC_LABELS, SEASON_ORDER, WEATHER_INFO, WEATHER_ORDER } from './config';
import { buildMahallaEvent, pickMonthlyEvent } from './events';
import {
  computeDefenseScore,
  generateRegionalSoukOffers,
  generateRegionalValleys,
  resolveRaid,
} from './raid';
import {
  BuildingInstance,
  BuildingType,
  PopulationRoles,
  Season,
  ValleyState,
  WeatherType,
} from './types';
import {
  advanceDemographicsSeason,
  computeLineageBonuses,
  createInitialVillagerRoster,
} from './villagers';

export function createInitialValleyState(
  amgharName = 'Amghar Tariq',
  valleyName = 'Ait Tamda of Tafza',
  nowMs = Date.now()
): ValleyState {
  const playerSlotIndex = 14;
  const col = playerSlotIndex % 6;
  const row = Math.floor(playerSlotIndex / 6);
  const slotX = col * 18 + 10;
  const slotY = row * 18 + 12;

  // Section 11: Starting valley: 6 households, grain 300, Earth 200, Timber 80, Stone 60, Silver 50,
  // flocks 40, Prestige 10, Makhzen Favor 40, 5 terrace fields, 1 tighremt, 1 sheepfold.
  const initialBuildings: BuildingInstance[] = [
    {
      id: 'b_init_tighremt',
      type: 'tighremt',
      level: 3, // Level 3 = +6 households capacity (matches 6 starting households)
      x: -10,
      z: -4,
      rotation: 0,
      finishAt: null,
    },
    {
      id: 'b_init_sheepfold',
      type: 'sheepfold',
      level: 1,
      x: -15,
      z: 6,
      rotation: Math.PI / 2,
      finishAt: null,
    },
    {
      id: 'b_init_field_1',
      type: 'terrace_field',
      level: 1,
      x: 10,
      z: -10,
      rotation: 0,
      finishAt: null,
    },
    {
      id: 'b_init_field_2',
      type: 'terrace_field',
      level: 1,
      x: 10,
      z: -5,
      rotation: 0,
      finishAt: null,
    },
    {
      id: 'b_init_field_3',
      type: 'terrace_field',
      level: 1,
      x: 10,
      z: 0,
      rotation: 0,
      finishAt: null,
    },
    {
      id: 'b_init_field_4',
      type: 'terrace_field',
      level: 1,
      x: 10,
      z: 5,
      rotation: 0,
      finishAt: null,
    },
    {
      id: 'b_init_field_5',
      type: 'terrace_field',
      level: 1,
      x: 10,
      z: 10,
      rotation: 0,
      finishAt: null,
    },
  ];

  const neighbors = generateRegionalValleys(playerSlotIndex);
  const soukOffers = generateRegionalSoukOffers(neighbors);

  return {
    valleyId: 'player_valley_1870',
    ownerUid: 'local_amghar',
    amgharName,
    name: valleyName,
    regionId: 'region_high_atlas_01',
    regionName: 'Tafza-n-Ait Tamda (High Atlas)',
    slotIndex: playerSlotIndex,
    slotX,
    slotY,
    createdAt: nowMs,
    lastTick: nowMs,
    gameDaysElapsed: 0,
    year: GAME_CONFIG.STARTING_YEAR,
    season: GAME_CONFIG.STARTING_SEASON,
    dayInSeason: 1,
    resources: { ...GAME_CONFIG.INITIAL_RESOURCES },
    households: GAME_CONFIG.INITIAL_HOUSEHOLDS,
    roles: {
      farmers: 3,
      shepherds: 1,
      builders: 1,
      guards: 1,
      artisans: 0,
    },
    buildings: initialBuildings,
    meters: {
      makhzenFavor: GAME_CONFIG.INITIAL_FAVOR,
      prestige: GAME_CONFIG.INITIAL_RESOURCES.prestige,
      unrest: GAME_CONFIG.INITIAL_UNREST,
    },
    isQaid: false,
    shieldUntil: nowMs + GAME_CONFIG.NEW_PLAYER_SHIELD_MS,
    lastRaidedAt: 0,
    pacts: ['valley_slot_13', 'valley_slot_15'],
    activeEvent: null,
    lastEventMonth: 0,
    lastMahallaYear: 1869,
    orders: [],
    reports: [
      {
        id: 'rep_welcome_1870',
        timestamp: nowMs,
        gameYear: 1870,
        season: 'spring',
        category: 'event',
        title: 'Chosen by the Jemaa as Amghar (Spring 1870)',
        arTitle: 'اختيارك أمغاراً للقرية من قِبل مجلس الجماعة (ربيع 1870م)',
        summary:
          'The family heads of the valley have chosen you as Amghar. Snowmelt fills the river; tend the 5 terrace fields, build a Seguia irrigation channel and an Agadir granary vault before autumn.',
        arSummary:
          'اختارك شيوخ وأعيان الأسر أمغاراً للوادي في سهل سوس ماسة. تتدفق مياه الربيع في النهر؛ اعتنِ بالحقول المدرجة الخمسة، وشيّد ساقية الري الحجرية وحصن أكادير الجماعي قبل حلول الخريف.',
        read: false,
      },
    ],
    neighbors,
    soukOffers,
    villagerRoster: createInitialVillagerRoster(
      initialBuildings,
      GAME_CONFIG.INITIAL_HOUSEHOLDS
    ),
    weather: 'clear',
    weatherDaysRemaining: 12,
    tutorialStep: 1,
    version: 1,
  };
}

export function getHousingCapacity(buildings: BuildingInstance[], nowMs = Infinity): number {
  let cap = 2; // Base ancestral homestead capacity
  for (const b of buildings) {
    if (b.type === 'tighremt' && (b.finishAt === null || b.finishAt <= nowMs)) {
      cap += b.level * 2;
    }
  }
  return cap;
}

export function getFlockCapacity(buildings: BuildingInstance[], nowMs = Infinity): number {
  let cap = GAME_CONFIG.BASE_FLOCK_CAPACITY;
  for (const b of buildings) {
    if (b.type === 'sheepfold' && (b.finishAt === null || b.finishAt <= nowMs)) {
      cap += b.level * GAME_CONFIG.FLOCK_CAPACITY_PER_SHEEPFOLD_LEVEL;
    }
  }
  return cap;
}

export function computeWaterFlow(
  season: Season,
  buildings: BuildingInstance[],
  nowMs = Infinity,
  weather: WeatherType = 'clear'
): number {
  const wSpec = WEATHER_INFO[weather] || WEATHER_INFO.clear;
  let base = GAME_CONFIG.SEASON_BASE_WATER[season] * wSpec.waterMultiplier;
  for (const b of buildings) {
    if (b.type === 'seguia' && (b.finishAt === null || b.finishAt <= nowMs)) {
      base += b.level * GAME_CONFIG.SEGUIA_WATER_BONUS_PER_LEVEL;
    }
  }
  return Math.round(base);
}

export function getHighestSeguiaLevel(buildings: BuildingInstance[], nowMs = Infinity): number {
  let maxLvl = 0;
  for (const b of buildings) {
    if (b.type === 'seguia' && (b.finishAt === null || b.finishAt <= nowMs)) {
      maxLvl = Math.max(maxLvl, b.level);
    }
  }
  return maxLvl;
}

export function computeWeatherFarmingMultiplier(
  weather: WeatherType = 'clear',
  buildings: BuildingInstance[] = [],
  nowMs = Infinity
): number {
  const wSpec = WEATHER_INFO[weather] || WEATHER_INFO.clear;
  let mult = wSpec.farmingMultiplier;
  // Seguia stone irrigation channels partially mitigate drought and dust wind crop losses
  if (weather === 'drought' || weather === 'sirocco_dust') {
    const seguiaLvl = getHighestSeguiaLevel(buildings, nowMs);
    mult = Math.min(1.0, mult + seguiaLvl * 0.08);
  }
  return Number(mult.toFixed(2));
}

export function pickNextWeather(
  season: Season,
  year: number,
  dayInSeason: number,
  currentWeather: WeatherType = 'clear'
): WeatherType {
  const seed = (year * 37 + dayInSeason * 13 + SEASON_ORDER.indexOf(season) * 19) % 10;
  const pools: Record<Season, WeatherType[]> = {
    spring: ['clear', 'heavy_rain', 'mountain_mist', 'clear', 'heavy_rain'],
    summer: ['clear', 'drought', 'sirocco_dust', 'clear', 'drought'],
    autumn: ['clear', 'mountain_mist', 'heavy_rain', 'sirocco_dust', 'clear'],
    winter: ['mountain_mist', 'heavy_rain', 'clear', 'mountain_mist', 'heavy_rain'],
  };
  const pool = pools[season];
  let picked = pool[seed % pool.length];
  if (picked === currentWeather) {
    picked = pool[(seed + 1) % pool.length];
  }
  return picked;
}

export function setValleyWeatherAction(
  state: ValleyState,
  weather: WeatherType,
  nowMs = Date.now()
): { nextState: ValleyState; message: string; arMessage: string } {
  const wSpec = WEATHER_INFO[weather] || WEATHER_INFO.clear;
  const nextWater = computeWaterFlow(state.season, state.buildings, nowMs, weather);
  const cropDeltaPct = Math.round((wSpec.farmingMultiplier - 1) * 100);
  const waterDeltaPct = Math.round((wSpec.waterMultiplier - 1) * 100);
  const cropSign = cropDeltaPct >= 0 ? `+${cropDeltaPct}%` : `${cropDeltaPct}%`;
  const waterSign = waterDeltaPct >= 0 ? `+${waterDeltaPct}%` : `${waterDeltaPct}%`;

  const nextState: ValleyState = {
    ...state,
    weather,
    weatherDaysRemaining: 35,
    resources: {
      ...state.resources,
      water: nextWater,
    },
  };

  return {
    nextState,
    message: `${wSpec.icon} Weather shifted to ${wSpec.name}: Farming Output ${cropSign}, Water Flow ${waterSign} (${nextWater} flow).`,
    arMessage: `${wSpec.icon} تغير الطقس إلى ${wSpec.arName}: الإنتاج الزراعي ${cropSign}، تدفق المياه ${waterSign} (${nextWater}).`,
  };
}

export function cycleValleyWeatherAction(
  state: ValleyState,
  nowMs = Date.now()
): { nextState: ValleyState; message: string; arMessage: string } {
  const current = state.weather || 'clear';
  const nextIdx = (WEATHER_ORDER.indexOf(current) + 1) % WEATHER_ORDER.length;
  return setValleyWeatherAction(state, WEATHER_ORDER[nextIdx], nowMs);
}

export function getWaterMillSavingsFactor(buildings: BuildingInstance[], nowMs = Infinity): number {
  let totalLvl = 0;
  for (const b of buildings) {
    if (b.type === 'water_mill' && (b.finishAt === null || b.finishAt <= nowMs)) {
      totalLvl += b.level;
    }
  }
  // Grain feeds 25% further per level: consumption divided by (1 + 0.25 * level)
  return 1 / (1 + totalLvl * GAME_CONFIG.WATER_MILL_GRAIN_SAVING_PER_LEVEL);
}

/**
 * Resolves any pending caravan orders (trade, gift, raid, pact, message) whose arriveAt <= nowMs.
 */
export function resolveDueOrders(state: ValleyState, nowMs: number): ValleyState {
  let hasChanges = false;
  for (const o of state.orders) {
    if (o.status === 'pending' && o.arriveAt <= nowMs) {
      hasChanges = true;
      break;
    }
  }
  if (!hasChanges) return state;

  const next: ValleyState = {
    ...state,
    resources: { ...state.resources },
    meters: { ...state.meters },
    roles: { ...state.roles },
    orders: state.orders.map((o) => ({ ...o })),
    reports: [...state.reports],
    neighbors: state.neighbors.map((n) => ({
      ...n,
      resources: { ...n.resources },
    })),
    pacts: [...state.pacts],
  };

  for (const order of next.orders) {
    if (order.status !== 'pending' || order.arriveAt > nowMs) continue;

    order.status = 'resolved';
    order.resolvedAt = nowMs;

    const targetNeighbor = next.neighbors.find((n) => n.valleyId === order.toValleyId);
    const arNeighborName = targetNeighbor?.arName || order.toValleyName;

    if (order.type === 'trade') {
      const wantRes = order.payload.wantResource;
      const wantAmt = order.payload.wantAmount ?? 0;
      const giveRes = order.payload.giveResource;
      const giveAmt = order.payload.giveAmount ?? 0;
      const arGive = giveRes ? RESOURCE_ARABIC_LABELS[giveRes] || giveRes : '';
      const arWant = wantRes ? RESOURCE_ARABIC_LABELS[wantRes] || wantRes : '';
      if (wantRes && wantAmt > 0) {
        next.resources[wantRes] = Math.round((next.resources[wantRes] || 0) + wantAmt);
      }
      next.meters.prestige += 2;
      next.resources.prestige = next.meters.prestige;
      next.reports.unshift({
        id: `rep_trade_${order.orderId}`,
        timestamp: nowMs,
        gameYear: next.year,
        season: next.season,
        category: 'trade',
        title: `Caravan Returned from ${order.toValleyName}`,
        arTitle: `عودة القافلة التجارية من ${arNeighborName}`,
        summary: `Exchanged ${giveAmt} ${giveRes} for +${wantAmt} ${wantRes}. Fair dealing earned +2 Prestige.`,
        arSummary: `تمت مقايضة ${giveAmt} من ${arGive} مقابل +${wantAmt} من ${arWant}، وزادت هيبة القرية بمقدار +2.`,
        read: false,
      });
    } else if (order.type === 'gift') {
      const giveRes = order.payload.giveResource;
      const giveAmt = order.payload.giveAmount ?? 0;
      const arGive = giveRes ? RESOURCE_ARABIC_LABELS[giveRes] || giveRes : '';
      next.meters.prestige += 6;
      next.resources.prestige = next.meters.prestige;
      if (targetNeighbor) {
        targetNeighbor.prestige += 4;
      }
      next.reports.unshift({
        id: `rep_gift_${order.orderId}`,
        timestamp: nowMs,
        gameYear: next.year,
        season: next.season,
        category: 'trade',
        title: `Gift Delivered to ${order.toValleyName}`,
        arTitle: `وصول هدية الضيافة إلى ${arNeighborName}`,
        summary: `Your caravan presented ${giveAmt} ${giveRes} to ${order.toValleyName}. Both valleys gained Prestige (+6).`,
        arSummary: `قدمت قافلتك ${giveAmt} من ${arGive} هديةً إلى ${arNeighborName}، فنالت القريتان الشرف والهيبة (+6 هيبة).`,
        read: false,
      });
    } else if (order.type === 'pact') {
      if (targetNeighbor) {
        targetNeighbor.hasPactWithPlayer = true;
        if (!next.pacts.includes(targetNeighbor.valleyId)) {
          next.pacts.push(targetNeighbor.valleyId);
        }
      }
      next.meters.prestige += 8;
      next.resources.prestige = next.meters.prestige;
      next.reports.unshift({
        id: `rep_pact_${order.orderId}`,
        timestamp: nowMs,
        gameYear: next.year,
        season: next.season,
        category: 'pact',
        title: `Sacred Tada Pact Sealed with ${order.toValleyName}`,
        arTitle: `إبرام ميثاق ومعاهدة تاضا المقدسة مع ${arNeighborName}`,
        summary: `Shared bowls of milk and dates at the jemaa. ${order.toValleyName} is now your sworn ally (+8 Prestige).`,
        arSummary: `تقاسم الشيوخ اللبن والتمر في ساحة الجماعة، وأصبحت ${arNeighborName} حليفاً معاهداً لقريتك (+8 هيبة).`,
        read: false,
      });
    } else if (order.type === 'message') {
      const msgKey = order.payload.presetMessage || 'greeting';
      const msgObj = PRESET_MESSAGES[msgKey] || PRESET_MESSAGES.greeting;
      next.reports.unshift({
        id: `rep_msg_${order.orderId}`,
        timestamp: nowMs,
        gameYear: next.year,
        season: next.season,
        category: 'event',
        title: `Envoy Returned from ${order.toValleyName}`,
        arTitle: `عودة المبعوث الدبلوماسي من ${arNeighborName}`,
        summary: `Delivered message "${msgObj.label}". ${order.toValleyName} acknowledged your words in the jemaa.`,
        arSummary: `بلّغ مبعوثك رسالة "${msgObj.arLabel}" إلى مجلس جماعة ${arNeighborName}.`,
        read: false,
      });
    } else if (order.type === 'raid' && targetNeighbor) {
      const fighters = order.payload.fighters ?? 2;
      const armsUsed = order.payload.armsUsed ?? 5;
      const playerDefScore = computeDefenseScore(
        next.roles.guards,
        next.households,
        next.buildings,
        nowMs
      );
      const morale = Math.max(0.75, 1.15 - next.meters.unrest * 0.004);

      const result = resolveRaid({
        seed: order.seed,
        fighters,
        armsCommitted: armsUsed,
        attackerMorale: morale,
        attackerDefenseScore: playerDefScore,
        defenderGuards: targetNeighbor.roles.guards,
        defenderHouseholds: targetNeighbor.households,
        defenderBuildings: targetNeighbor.buildings,
        defenderResources: {
          grain: targetNeighbor.resources.grain,
          flocks: targetNeighbor.resources.flocks,
          silver: targetNeighbor.resources.silver,
        },
      });

      targetNeighbor.lastRaidedAt = nowMs;
      targetNeighbor.lastRaidedByPlayerAt = nowMs;

      if (result.attackerWon) {
        next.resources.grain += result.loot.grain;
        next.resources.flocks = Math.min(
          getFlockCapacity(next.buildings, nowMs),
          next.resources.flocks + result.loot.flocks
        );
        next.resources.silver += result.loot.silver;
        targetNeighbor.resources.grain = Math.max(0, targetNeighbor.resources.grain - result.loot.grain);
        targetNeighbor.resources.flocks = Math.max(0, targetNeighbor.resources.flocks - result.loot.flocks);
        targetNeighbor.resources.silver = Math.max(0, targetNeighbor.resources.silver - result.loot.silver);
      } else {
        // Lose guard/household if heavy fighter loss
        if (result.attackerFighterLosses >= 2 && next.roles.guards > 0) {
          next.roles.guards = Math.max(0, next.roles.guards - 1);
          next.roles.farmers += 1;
        }
      }

      next.meters.prestige = Math.max(0, next.meters.prestige + result.attackerPrestigeDelta);
      next.resources.prestige = next.meters.prestige;

      const shameNote = result.isShamefulRaid
        ? ` Because ${targetNeighbor.name} was much weaker, the tribes deemed the raid shameful (${result.attackerPrestigeDelta} Prestige).`
        : ` (${result.attackerPrestigeDelta >= 0 ? '+' : ''}${result.attackerPrestigeDelta} Prestige).`;
      const arShameNote = result.isShamefulRaid
        ? ` ولأن ${arNeighborName} أضعف بكثير، استنكرت القبائل هذه الغارة (${result.attackerPrestigeDelta} هيبة).`
        : ` (${result.attackerPrestigeDelta >= 0 ? '+' : ''}${result.attackerPrestigeDelta} هيبة).`;

      next.reports.unshift({
        id: `rep_raid_${order.orderId}`,
        timestamp: nowMs,
        gameYear: next.year,
        season: next.season,
        category: 'raid',
        title: result.attackerWon
          ? `Raid Victorious at ${targetNeighbor.name}`
          : `Raid Repulsed at ${targetNeighbor.name}`,
        arTitle: result.attackerWon
          ? `انتصار الغارة في ${arNeighborName}`
          : `اندحار الغارة عند أسوار ${arNeighborName}`,
        summary: result.attackerWon
          ? `Attack (${result.attackPower}) overcame Defense (${result.defensePower}). Looted +${result.loot.grain} Grain, +${result.loot.flocks} Flocks, +${result.loot.silver} Silver (${result.protectedByAgadir.grain} grain protected in their Agadir).${shameNote}`
          : `Attack (${result.attackPower}) failed against Defense (${result.defensePower}). Your party lost ${result.attackerFighterLosses} fighters retreating through the pass.${shameNote}`,
        arSummary: result.attackerWon
          ? `تغلبت قوة الهجوم (${result.attackPower}) على الدفاع (${result.defensePower}). غنمت السرية +${result.loot.grain} حبوب، +${result.loot.flocks} قطعان، +${result.loot.silver} فضة (وحمى حصن أكادير لديهم ${result.protectedByAgadir.grain} من الحبوب).${arShameNote}`
          : `أخفق الهجوم (${result.attackPower}) أمام قوة الدفاع (${result.defensePower})، وتراجعت السرية بعد خسارة ${result.attackerFighterLosses} من المقاتلين.${arShameNote}`,
        read: false,
      });
    }
  }

  return next;
}

/**
 * Advances the valley state by a discrete number of game days (`daysToAdvance >= 0`).
 * Each season is 30 game-days (Spring, Summer, Autumn, Winter = 120 game-days per year).
 */
export function advanceGameDays(
  state: ValleyState,
  daysToAdvance: number,
  nowMs = Date.now()
): ValleyState {
  // First mark any completed buildings and resolve due orders at `nowMs`
  let current: ValleyState = {
    ...state,
    resources: { ...state.resources },
    meters: { ...state.meters },
    roles: { ...state.roles },
    buildings: state.buildings.map((b) =>
      b.finishAt !== null && b.finishAt <= nowMs ? { ...b, finishAt: null } : { ...b }
    ),
    reports: [...state.reports],
  };

  current = resolveDueOrders(current, nowMs);

  const wholeDays = Math.min(
    GAME_CONFIG.MAX_OFFLINE_CATCHUP_GAME_DAYS,
    Math.max(0, Math.floor(daysToAdvance))
  );

  current.weather = current.weather || 'clear';
  current.weatherDaysRemaining = current.weatherDaysRemaining ?? 35;

  if (wholeDays === 0) {
    current.resources.water = computeWaterFlow(
      current.season,
      current.buildings,
      nowMs,
      current.weather
    );
    return current;
  }

  for (let d = 0; d < wholeDays; d++) {
    current.gameDaysElapsed += 1;
    current.dayInSeason += 1;

    if ((current.weatherDaysRemaining ?? 10) <= 0) {
      current.weather = pickNextWeather(
        current.season,
        current.year,
        current.dayInSeason,
        current.weather
      );
      current.weatherDaysRemaining = 8 + (current.gameDaysElapsed % 5);
    }
    current.weatherDaysRemaining = (current.weatherDaysRemaining ?? 10) - 1;

    const activeWeather = current.weather || 'clear';
    const weatherSpec = WEATHER_INFO[activeWeather] || WEATHER_INFO.clear;
    const weatherFarmingMult = computeWeatherFarmingMultiplier(
      activeWeather,
      current.buildings,
      nowMs
    );

    // Daily continuous resource gathering from assigned household roles
    const { farmers, shepherds, builders, artisans } = current.roles;
    const waterFlow = computeWaterFlow(
      current.season,
      current.buildings,
      nowMs,
      activeWeather
    );
    current.resources.water = waterFlow;

    // Daily farming tending delta from active weather (rain/mist boosts daily green shoots; drought reduces)
    const dailyWeatherGrainDelta = Number(
      (farmers * (weatherSpec.dailyGrainPerFarmer - 0.25)).toFixed(2)
    );
    if (dailyWeatherGrainDelta !== 0) {
      current.resources.grain = Math.max(
        0,
        Number((current.resources.grain + dailyWeatherGrainDelta).toFixed(1))
      );
    }

    // Builders gather earth, stone & timber daily
    current.resources.earth += Number((builders * 1.1 + 0.4).toFixed(1));
    current.resources.stone += Number((builders * 0.65 + 0.2).toFixed(1));
    current.resources.timber += Number((builders * 0.55 + shepherds * 0.25).toFixed(1));

    // Shepherds & weaving houses produce textiles & silver
    let weavingLevels = 0;
    let funduqLevels = 0;
    let jemaaLevels = 0;
    let mosqueLevels = 0;
    for (const b of current.buildings) {
      if (b.finishAt === null || b.finishAt <= nowMs) {
        if (b.type === 'weaving_house') weavingLevels += b.level;
        if (b.type === 'funduq') funduqLevels += b.level;
        if (b.type === 'jemaa_square') jemaaLevels += b.level;
        if (b.type === 'mosque_zawiya') mosqueLevels += b.level;
      }
    }

    if (artisans > 0 || weavingLevels > 0) {
      const dailyTextile = (artisans * 0.35 + weavingLevels * 0.22) * (current.resources.flocks > 10 ? 1 : 0.3);
      current.resources.textiles = Number((current.resources.textiles + dailyTextile).toFixed(1));
    }

    if (funduqLevels > 0) {
      current.resources.silver = Number((current.resources.silver + funduqLevels * 0.4).toFixed(1));
    }

    // Daily food consumption:
    // Annual grain per household = 80. Season fraction: Spring 20%, Summer 20%, Autumn 20%, Winter 40%.
    const seasonFraction = GAME_CONFIG.SEASON_GRAIN_FRACTION[current.season];
    const millFactor = getWaterMillSavingsFactor(current.buildings, nowMs);
    const dailyGrainNeed =
      ((current.households * GAME_CONFIG.ANNUAL_GRAIN_PER_HOUSEHOLD * seasonFraction) /
        GAME_CONFIG.DAYS_PER_SEASON) *
      millFactor;

    if (current.resources.grain >= dailyGrainNeed) {
      current.resources.grain = Number((current.resources.grain - dailyGrainNeed).toFixed(1));
      if (mosqueLevels > 0 && current.dayInSeason % 5 === 0) {
        current.meters.unrest = Math.max(0, current.meters.unrest - mosqueLevels);
      }
    } else {
      // Starvation raises Unrest at 0 grain (Section 11)
      current.resources.grain = 0;
      current.meters.unrest = Math.min(
        100,
        Number(
          (
            current.meters.unrest +
            GAME_CONFIG.STARVATION_UNREST_PER_SEASON / GAME_CONFIG.DAYS_PER_SEASON
          ).toFixed(1)
        )
      );
    }

    // Trigger monthly event card on day 15 of a season if none active
    const currentMonthIndex = Math.floor(current.gameDaysElapsed / 10);
    if (current.dayInSeason === 15 && current.activeEvent === null && current.lastEventMonth < currentMonthIndex) {
      current.lastEventMonth = currentMonthIndex;
      if (current.season === 'summer' && current.lastMahallaYear < current.year) {
        current.lastMahallaYear = current.year;
        current.activeEvent = buildMahallaEvent(current);
      } else {
        current.activeEvent = pickMonthlyEvent(current);
      }
    }

    // End of Season transition (day 30 -> next season day 1)
    if (current.dayInSeason > GAME_CONFIG.DAYS_PER_SEASON) {
      const completedSeason = current.season;
      current.dayInSeason = 1;

      // Count active agricultural buildings
      let fieldUnits = 0;
      let matureWalnutLevels = 0;
      for (const b of current.buildings) {
        if (b.finishAt === null || b.finishAt <= nowMs) {
          if (b.type === 'terrace_field') {
            fieldUnits += b.level;
          } else if (b.type === 'walnut_grove') {
            b.plantedSeasonCount = (b.plantedSeasonCount ?? 0) + 1;
            if (b.plantedSeasonCount >= GAME_CONFIG.WALNUT_MATURITY_SEASONS) {
              matureWalnutLevels += b.level;
            }
          }
        }
      }

      const seguiaLvl = getHighestSeguiaLevel(current.buildings, nowMs);
      const yieldPerFieldYear =
        seguiaLvl >= 2
          ? GAME_CONFIG.FIELD_LEVEL2_SEGUIA_YIELD
          : waterFlow < 70
          ? GAME_CONFIG.FIELD_DROUGHT_YIELD
          : GAME_CONFIG.FIELD_BASE_YIELD;

      const lineageBonuses = computeLineageBonuses(
        current.villagerRoster ||
          createInitialVillagerRoster(current.buildings, current.households)
      );

      // Farmer labor efficiency + Ait Amellal lineage bonus + Active Weather Farming Multiplier
      const farmerEfficiency =
        Math.min(1.25, Math.max(0.65, (farmers + 1) / Math.max(1, fieldUnits * 0.65))) *
        lineageBonuses.farmingMultiplier *
        weatherFarmingMult;

      if (completedSeason === 'spring') {
        // End of Spring: Barley harvest (55% of annual field grain) + lambing boosted by Ait Massa lineage
        const barleyHarvest = Math.round(fieldUnits * yieldPerFieldYear * 0.55 * farmerEfficiency);
        const newLambs = Math.min(
          getFlockCapacity(current.buildings, nowMs) - current.resources.flocks,
          Math.max(
            2,
            Math.round(
              (current.resources.flocks * 0.15 + shepherds * 2) *
                lineageBonuses.pastoralMultiplier
            )
          )
        );
        current.resources.grain = Math.round(current.resources.grain + barleyHarvest);
        current.resources.flocks = Math.round(current.resources.flocks + Math.max(0, newLambs));
        current.reports.unshift({
          id: `rep_harv_spr_${current.year}_${current.gameDaysElapsed}`,
          timestamp: nowMs,
          gameYear: current.year,
          season: 'spring',
          category: 'harvest',
          title: `Spring Barley Harvest & Lambing (${current.year})`,
          arTitle: `حصاد الشعير الربيعي وتكاثر القطعان (${current.year}م)`,
          summary: `Reaped +${barleyHarvest} barley grain (Weather: ${weatherSpec.name} ×${weatherFarmingMult}, Lineage ×${lineageBonuses.farmingMultiplier}) and welcomed +${Math.max(0, newLambs)} lambs.`,
          arSummary: `تم جني +${barleyHarvest} من حبوب الشعير (الطقس: ${weatherSpec.arName} ×${weatherFarmingMult}، مهارة السلالات ×${lineageBonuses.farmingMultiplier}) وتوليد +${Math.max(0, newLambs)} من الحملان.`,
          read: false,
        });
      } else if (completedSeason === 'summer') {
        // End of Summer: Wheat harvest (45% of annual field grain)
        const wheatHarvest = Math.round(fieldUnits * yieldPerFieldYear * 0.45 * farmerEfficiency);
        current.resources.grain = Math.round(current.resources.grain + wheatHarvest);
        current.reports.unshift({
          id: `rep_harv_sum_${current.year}_${current.gameDaysElapsed}`,
          timestamp: nowMs,
          gameYear: current.year,
          season: 'summer',
          category: 'harvest',
          title: `Summer Wheat Harvest (${current.year})`,
          arTitle: `حصاد القمح الصيفي (${current.year}م)`,
          summary: `Gathered +${wheatHarvest} golden wheat under ${weatherSpec.name} (×${weatherFarmingMult}) before autumn sowing.`,
          arSummary: `حصد المزارعون +${wheatHarvest} من القمح الذهبي في أجواء ${weatherSpec.arName} (×${weatherFarmingMult}) قبيل موسم البذر الخريفي.`,
          read: false,
        });
      } else if (completedSeason === 'autumn') {
        // End of Autumn: Walnuts & almonds harvest boosted by Ait Massa lineage & weather
        const walnutHarvest = Math.round(
          (matureWalnutLevels * GAME_CONFIG.WALNUT_YIELD_PER_LEVEL + 10) *
            lineageBonuses.pastoralMultiplier *
            weatherFarmingMult
        );
        current.resources.walnuts = Math.round(current.resources.walnuts + walnutHarvest);
        current.reports.unshift({
          id: `rep_harv_aut_${current.year}_${current.gameDaysElapsed}`,
          timestamp: nowMs,
          gameYear: current.year,
          season: 'autumn',
          category: 'harvest',
          title: `Autumn Walnut & Almond Harvest (${current.year})`,
          arTitle: `موسم جني الجوز واللوز والأركان (${current.year}م)`,
          summary: `Collected +${walnutHarvest} walnuts and almonds from the valley groves (${weatherSpec.name} ×${weatherFarmingMult}).`,
          arSummary: `جمع الأهالي +${walnutHarvest} من الجوز واللوز والأركان من بساتين الوادي (${weatherSpec.arName} ×${weatherFarmingMult}).`,
          read: false,
        });
      } else if (completedSeason === 'winter') {
        // Survived winter without hunger bonus
        if (current.resources.grain > 20 && current.meters.unrest < 25) {
          current.meters.prestige += 5;
        }
      }

      // Seasonal Jemaa + Elder wisdom prestige
      if (jemaaLevels > 0 || lineageBonuses.elderCount > 0) {
        current.meters.prestige += jemaaLevels * 2 + lineageBonuses.elderCount;
      }

      // Advance Villager Demographics (Aging, Marriages, Births & Lineage Skill Mastery)
      current = advanceDemographicsSeason(current, completedSeason, nowMs);

      // Population growth or departure at season end (Section 5.3 & 11)
      const housingCap = getHousingCapacity(current.buildings, nowMs);
      const nextSeasonIdx = (SEASON_ORDER.indexOf(completedSeason) + 1) % 4;
      const nextSeason = SEASON_ORDER[nextSeasonIdx];
      const upcomingSeasonNeed =
        current.households *
        GAME_CONFIG.ANNUAL_GRAIN_PER_HOUSEHOLD *
        GAME_CONFIG.SEASON_GRAIN_FRACTION[nextSeason] *
        millFactor;

      if (
        current.resources.grain >= upcomingSeasonNeed * GAME_CONFIG.SURPLUS_RATIO_FOR_GROWTH &&
        current.households < housingCap &&
        current.meters.unrest < 40
      ) {
        current.households += 1;
        current.roles.farmers += 1;
      } else if (
        current.meters.unrest >= GAME_CONFIG.HIGH_UNREST_LEAVE_THRESHOLD &&
        current.households > 2
      ) {
        current.households -= 1;
        // Decrement a non-zero role
        if (current.roles.farmers > 1) current.roles.farmers -= 1;
        else if (current.roles.builders > 0) current.roles.builders -= 1;
        else if (current.roles.shepherds > 0) current.roles.shepherds -= 1;
      }

      current.season = nextSeason;
      if (nextSeason === 'spring') {
        current.year += 1;
      }
    }
  }

  // Round resource integers cleanly for UI and storage
  current.resources.grain = Math.round(current.resources.grain);
  current.resources.earth = Math.round(current.resources.earth);
  current.resources.stone = Math.round(current.resources.stone);
  current.resources.timber = Math.round(current.resources.timber);
  current.resources.walnuts = Math.round(current.resources.walnuts);
  current.resources.textiles = Math.round(current.resources.textiles);
  current.resources.silver = Math.round(current.resources.silver);
  current.resources.flocks = Math.round(current.resources.flocks);
  current.resources.arms = Math.round(current.resources.arms);
  current.meters.unrest = Math.round(current.meters.unrest);
  current.meters.prestige = Math.round(current.meters.prestige);
  current.resources.prestige = current.meters.prestige;
  current.resources.water = computeWaterFlow(
    current.season,
    current.buildings,
    nowMs,
    current.weather || 'clear'
  );

  if (
    current.meters.makhzenFavor >= GAME_CONFIG.QAID_FAVOR_THRESHOLD &&
    current.meters.prestige >= GAME_CONFIG.QAID_PRESTIGE_THRESHOLD
  ) {
    current.isQaid = true;
  }

  current.lastTick = nowMs;
  return current;
}

/**
 * Pure time function `tick(valleyState, nowMs)` required by Section 9.
 * Calculates elapsed real time since `valleyState.lastTick`, caps offline catch-up at 7 real days,
 * completes finished constructions, resolves arrived orders, and advances game days.
 */
export function tick(valleyState: ValleyState, nowMs: number): ValleyState {
  const rawElapsedMs = Math.max(0, nowMs - valleyState.lastTick);
  const cappedElapsedMs = Math.min(rawElapsedMs, GAME_CONFIG.MAX_OFFLINE_CATCHUP_MS);

  // Convert elapsed real ms to game days (using real season pace; sub-day progress is preserved)
  const gameDaysFloat = cappedElapsedMs / GAME_CONFIG.REAL_MS_PER_GAME_DAY;
  const wholeGameDays = Math.floor(gameDaysFloat);

  if (wholeGameDays >= 1) {
    const next = advanceGameDays(valleyState, wholeGameDays, nowMs);
    // Keep fractional ms remainder so frequent ticks don't lose sub-day time
    const consumedMs = wholeGameDays * GAME_CONFIG.REAL_MS_PER_GAME_DAY;
    next.lastTick =
      rawElapsedMs > GAME_CONFIG.MAX_OFFLINE_CATCHUP_MS
        ? nowMs
        : valleyState.lastTick + consumedMs;
    return next;
  }

  // Even if < 1 full game day has passed in real-time, complete any constructions or caravan orders whose timer expired
  let hasFinishedBuilding = false;
  for (const b of valleyState.buildings) {
    if (b.finishAt !== null && b.finishAt <= nowMs) {
      hasFinishedBuilding = true;
      break;
    }
  }

  let next = hasFinishedBuilding
    ? {
        ...valleyState,
        buildings: valleyState.buildings.map((b) =>
          b.finishAt !== null && b.finishAt <= nowMs ? { ...b, finishAt: null } : b
        ),
      }
    : valleyState;

  next = resolveDueOrders(next, nowMs);
  return next;
}

export function getUpgradeCost(type: BuildingType, targetLevel: number) {
  const base = BUILDINGS_CONFIG[type].baseCost;
  const mult = targetLevel === 1 ? 1 : targetLevel === 2 ? 1.6 : 2.4;
  return {
    earth: Math.round(base.earth * mult),
    timber: Math.round(base.timber * mult),
    stone: Math.round(base.stone * mult),
    silver: Math.round(base.silver * mult),
  };
}

export function canAffordCost(
  resources: ValleyState['resources'],
  cost: { earth: number; timber: number; stone: number; silver: number }
): boolean {
  return (
    resources.earth >= cost.earth &&
    resources.timber >= cost.timber &&
    resources.stone >= cost.stone &&
    resources.silver >= cost.silver
  );
}

export function rebalanceRolesForHouseholds(
  roles: PopulationRoles,
  totalHouseholds: number
): PopulationRoles {
  const next = { ...roles };
  let sum = next.farmers + next.shepherds + next.builders + next.guards + next.artisans;
  while (sum < totalHouseholds) {
    next.farmers += 1;
    sum += 1;
  }
  while (sum > totalHouseholds) {
    if (next.artisans > 0) next.artisans -= 1;
    else if (next.builders > 0) next.builders -= 1;
    else if (next.shepherds > 0) next.shepherds -= 1;
    else if (next.guards > 0) next.guards -= 1;
    else if (next.farmers > 0) next.farmers -= 1;
    sum -= 1;
  }
  return next;
}
