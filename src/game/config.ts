import { BuildingDefinition, BuildingType, LanguageCode, Resources, Season, WeatherType } from './types';

export const GAME_CONFIG = {
  // Time & Seasons (Section 5.1)
  REAL_MS_PER_SEASON: 3 * 24 * 60 * 60 * 1000, // 3 real days
  DAYS_PER_SEASON: 30,
  SEASONS_PER_YEAR: 4,
  REAL_MS_PER_GAME_DAY: (3 * 24 * 60 * 60 * 1000) / 30, // 8,640,000 ms (2.4 hours)
  LIVE_PLAY_SPEED_MULTIPLIER: 1440,
  MAX_OFFLINE_CATCHUP_GAME_DAYS: 70,
  MAX_OFFLINE_CATCHUP_MS: 7 * 24 * 60 * 60 * 1000,

  STARTING_YEAR: 1870,
  STARTING_SEASON: 'spring' as Season,

  // Starting Balance Numbers (Section 11)
  INITIAL_HOUSEHOLDS: 6,
  INITIAL_RESOURCES: {
    grain: 300,
    water: 100,
    flocks: 40,
    timber: 80,
    earth: 200,
    stone: 60,
    walnuts: 25,
    textiles: 10,
    silver: 50,
    arms: 15,
    prestige: 10,
  } as Resources,
  INITIAL_FAVOR: 40,
  INITIAL_UNREST: 5,

  // Food & Population (Section 5.3 & 11)
  PERSONS_PER_HOUSEHOLD: 5,
  ANNUAL_GRAIN_PER_HOUSEHOLD: 80, // 6 households = 480 grain/year
  SEASON_GRAIN_FRACTION: {
    spring: 0.2,
    summer: 0.2,
    autumn: 0.2,
    winter: 0.4,
  } as Record<Season, number>,
  WATER_MILL_GRAIN_SAVING_PER_LEVEL: 0.25,
  SURPLUS_RATIO_FOR_GROWTH: 1.25,
  STARVATION_UNREST_PER_SEASON: 18,
  HIGH_UNREST_LEAVE_THRESHOLD: 75,

  // Harvest & Production (Section 5.1, 5.2, 11)
  FIELD_BASE_YIELD: 100,
  FIELD_DROUGHT_YIELD: 50,
  FIELD_LEVEL2_SEGUIA_YIELD: 130,
  SEGUIA_WATER_BONUS_PER_LEVEL: 18,
  SEASON_BASE_WATER: {
    spring: 120,
    summer: 75,
    autumn: 90,
    winter: 80,
  } as Record<Season, number>,
  WALNUT_YIELD_PER_LEVEL: 35,
  WALNUT_MATURITY_SEASONS: 2,
  FLOCK_CAPACITY_PER_SHEEPFOLD_LEVEL: 35,
  BASE_FLOCK_CAPACITY: 20,
  WOOL_PER_10_FLOCKS_PER_SEASON: 4,
  TEXTILES_PER_WEAVING_LEVEL: 8,

  // Storage & Agadir Vault (Section 5.2 & 5.4)
  AGADIR_PROTECTION_PER_LEVEL: 0.4,

  // Politics & Mahalla (Section 5.6 & 11)
  QAID_FAVOR_THRESHOLD: 70,
  QAID_PRESTIGE_THRESHOLD: 45,
  MAHALLA_GRAIN_RATE: 0.15,
  MAHALLA_BASE_SILVER: 20,
  MAHALLA_BASE_FLOCKS: 5,

  // Defense & Raids (Section 5.8)
  ARMS_BONUS_PER_UNIT: 0.02,
  TOWER_DEFENSE_BONUS_PER_LEVEL: 0.18,
  WALL_DEFENSE_BONUS_PER_LEVEL: 0.25,
  TERRAIN_DEFENSE_MULTIPLIER: 1.3,
  RAID_LOOT_GRAIN_MAX_RATIO: 0.15,
  RAID_LOOT_FLOCKS_MAX_RATIO: 0.10,
  RAID_LOOT_SILVER_MAX_RATIO: 0.10,
  RAID_DEFEAT_ATTACKER_LOSS_RATIO: 0.30,
  NEW_PLAYER_SHIELD_MS: 7 * 24 * 60 * 60 * 1000,
  RAIDED_VALLEY_COOLDOWN_MS: 24 * 60 * 60 * 1000,
  PER_TARGET_RAID_COOLDOWN_MS: 48 * 60 * 60 * 1000,
  SHAMEFUL_RAID_STRENGTH_RATIO: 0.6,
  SHAMEFUL_RAID_PRESTIGE_PENALTY: 12,
  DEFENSE_WIN_PRESTIGE_BONUS: 8,

  // Region & Travel (Section 6)
  VALLEYS_PER_REGION: 30,
  BASE_CARAVAN_SECONDS_PER_UNIT_DIST: 15,
  WINTER_TRAVEL_TIME_MULTIPLIER: 2.0,
};

export const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export const WEATHER_ORDER: WeatherType[] = [
  'clear',
  'heavy_rain',
  'drought',
  'sirocco_dust',
  'mountain_mist',
];

export interface WeatherSpec {
  id: WeatherType;
  name: string;
  arName: string;
  tamazight: string;
  icon: string;
  farmingMultiplier: number; // Applied to seasonal & daily farming output
  waterMultiplier: number; // Applied to base river water flow
  dailyGrainPerFarmer: number; // Continuous daily terrace tending output per farmer
  summary: string;
  arSummary: string;
  fogColor: string;
  fogDensity: number;
  sunColor: string;
  sunIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  riverColor: string;
  riverHeight: number;
  riverWidthScale: number;
  foliageSaturation: number;
}

export const WEATHER_INFO: Record<WeatherType, WeatherSpec> = {
  clear: {
    id: 'clear',
    name: 'Clear Souss Sky',
    arName: 'صحو سوس المشرق',
    tamazight: 'igenna yessfawen',
    icon: '☀️',
    farmingMultiplier: 1.0,
    waterMultiplier: 1.0,
    dailyGrainPerFarmer: 0.25,
    summary: 'Balanced sunshine and steady Seguia irrigation across the valley (100% Crop & Water).',
    arSummary: 'شمس سوس الدافئة وتدفق معتدل للسواقي في المدرجات الزراعية (100% محاصيل ومياه).',
    fogColor: '#c99e74',
    fogDensity: 0.0065,
    sunColor: '#ffdfb0',
    sunIntensity: 1.85,
    hemiSkyColor: '#8bb4e6',
    hemiGroundColor: '#9c6b43',
    hemiIntensity: 0.75,
    riverColor: '#267aa6',
    riverHeight: 0.03,
    riverWidthScale: 1.0,
    foliageSaturation: 1.0,
  },
  heavy_rain: {
    id: 'heavy_rain',
    name: 'Heavy Atlas Rain',
    arName: 'أمطار أطلسية غزيرة',
    tamazight: 'Anzar iggutn',
    icon: '🌧️',
    farmingMultiplier: 1.35,
    waterMultiplier: 1.45,
    dailyGrainPerFarmer: 0.55,
    summary: 'Monsoon clouds drench the Anti-Atlas slopes: +35% Farming Output & +45% River Water Flow.',
    arSummary: 'أمطار غزيرة تفيض بها أودية الأطلس وسهل سوس: +35% إنتاج زراعي و+45% تدفق مياه.',
    fogColor: '#47596c',
    fogDensity: 0.0118,
    sunColor: '#94b0cb',
    sunIntensity: 0.92,
    hemiSkyColor: '#5c768d',
    hemiGroundColor: '#485948',
    hemiIntensity: 0.95,
    riverColor: '#1b6ca8',
    riverHeight: 0.22,
    riverWidthScale: 1.32,
    foliageSaturation: 1.25,
  },
  drought: {
    id: 'drought',
    name: 'Scorching Drought',
    arName: 'جفاف وقحط سوس',
    tamazight: 'Taɣart',
    icon: '🔥',
    farmingMultiplier: 0.62,
    waterMultiplier: 0.58,
    dailyGrainPerFarmer: 0.05,
    summary: 'Relentless heat parches the plain: -38% Farming Output & -42% Water Flow (Seguia helps buffer).',
    arSummary: 'موجة قيظ وجفاف تشح معها العيون: -38% إنتاج زراعي و-42% تدفق مياه (السواقي تخفف الضرر).',
    fogColor: '#d99854',
    fogDensity: 0.0096,
    sunColor: '#ffbe6b',
    sunIntensity: 2.55,
    hemiSkyColor: '#e6b87d',
    hemiGroundColor: '#b57842',
    hemiIntensity: 0.85,
    riverColor: '#5b6b45',
    riverHeight: -0.09,
    riverWidthScale: 0.62,
    foliageSaturation: 0.65,
  },
  sirocco_dust: {
    id: 'sirocco_dust',
    name: 'Chergui Dust Wind',
    arName: 'رياح الشرقي الرملية',
    tamazight: 'Aḍu n Ccerqi',
    icon: '🌪️',
    farmingMultiplier: 0.8,
    waterMultiplier: 0.82,
    dailyGrainPerFarmer: 0.14,
    summary: 'Hot Saharan dust winds sweep across the Anti-Atlas passes: -20% Farming Output & -18% Water.',
    arSummary: 'رياح الشرقي المحملة بالغبار الصحراوي تلفح الحقول: -20% إنتاج زراعي و-18% تدفق مياه.',
    fogColor: '#bf7343',
    fogDensity: 0.0145,
    sunColor: '#e89054',
    sunIntensity: 1.28,
    hemiSkyColor: '#c98253',
    hemiGroundColor: '#8c5332',
    hemiIntensity: 0.72,
    riverColor: '#4d6f6a',
    riverHeight: -0.03,
    riverWidthScale: 0.82,
    foliageSaturation: 0.78,
  },
  mountain_mist: {
    id: 'mountain_mist',
    name: 'Atlas Dew & Mist',
    arName: 'ضباب وندى الأطلس',
    tamazight: 'Tagut n Drn',
    icon: '🌫️',
    farmingMultiplier: 1.15,
    waterMultiplier: 1.2,
    dailyGrainPerFarmer: 0.38,
    summary: 'Cool Atlantic & High Atlas mist condenses on argan groves and barley: +15% Crop & +20% Water.',
    arSummary: 'ضباب أطلسي رطب ينعش أشجار الأركان ومدرجات الشعير: +15% إنتاج زراعي و+20% تدفق مياه.',
    fogColor: '#8ca9c4',
    fogDensity: 0.0128,
    sunColor: '#dce8f5',
    sunIntensity: 1.35,
    hemiSkyColor: '#9ab8d4',
    hemiGroundColor: '#697a6b',
    hemiIntensity: 0.88,
    riverColor: '#2980b9',
    riverHeight: 0.11,
    riverWidthScale: 1.14,
    foliageSaturation: 1.12,
  },
};

export const SEASON_INFO: Record<
  Season,
  {
    name: string;
    arName: string;
    tamazight: string;
    summary: string;
    arSummary: string;
    skyTop: string;
    skyHorizon: string;
    fogColor: string;
    sunColor: string;
  }
> = {
  spring: {
    name: 'Spring',
    arName: 'فصل الربيع',
    tamazight: 'Tafsut',
    summary: 'Snowmelt fills the seguia; lambing season; barley harvested at season end.',
    arSummary: 'تتدفق مياه السواقي في سهل سوس ماسة وتنضج حقول الشعير في نهاية الفصل.',
    skyTop: '#2c4c7e',
    skyHorizon: '#d9a773',
    fogColor: '#c99e74',
    sunColor: '#ffdfb0',
  },
  summer: {
    name: 'Summer',
    arName: 'فصل الصيف',
    tamazight: 'Anbdu',
    summary: 'Wheat harvest; flocks ascend to high azib pastures; mahalla expedition season.',
    arSummary: 'موسم حصاد القمح وصعود القطعان إلى المراعي وقدوم محلة السلطان لجمع الزكاة.',
    skyTop: '#24426e',
    skyHorizon: '#e6a968',
    fogColor: '#d89f66',
    sunColor: '#ffe4b5',
  },
  autumn: {
    name: 'Autumn',
    arName: 'فصل الخريف',
    tamazight: 'Amwan',
    summary: 'Sow barley and wheat; harvest walnuts and almonds; tribal dues settle.',
    arSummary: 'موسم بذر الحبوب وجني الجوز واللوز والأركان في وادي سوس ماسة.',
    skyTop: '#2b3954',
    skyHorizon: '#cf7e4a',
    fogColor: '#c47d4e',
    sunColor: '#f7b977',
  },
  winter: {
    name: 'Winter',
    arName: 'فصل الشتاء',
    tamazight: 'Tagrest',
    summary: 'Snow closes high passes (travel time doubled); winter stores consumed; weaving.',
    arSummary: 'تغلق الثلوج الممرات الجبلية العليا وتنشط صناعة النسيج والزرابي داخل القصبات.',
    skyTop: '#364659',
    skyHorizon: '#b8c4d0',
    fogColor: '#aebbc7',
    sunColor: '#e6eef7',
  },
};

// All 15 Buildings with complete English & Modern Standard Arabic (العربية الفصحى) metadata
export const BUILDINGS_CONFIG: Record<BuildingType, BuildingDefinition> = {
  tighremt: {
    type: 'tighremt',
    name: 'Tighremt House',
    arName: 'دار تغرمت المحصنة',
    tamazightName: 'Tiɣremt',
    purpose: 'Housing',
    arPurpose: 'سكن الأسر',
    effectText: '+2 household capacity per level',
    arEffectText: '+2 سعة أسر لكل مستوى وإنتاج حسب حرفة الأسرة',
    baseCost: { earth: 30, timber: 10, stone: 0, silver: 0 },
    footprint: { w: 4, d: 4 },
    buildTimeSec: 12,
    maxSlope: 0.45,
  },
  terrace_field: {
    type: 'terrace_field',
    name: 'Terrace Field',
    arName: 'حقل مدرج زراعي',
    tamazightName: 'Igran',
    purpose: 'Grain',
    arPurpose: 'زراعة الحبوب',
    effectText: '100 grain/yr at harvest, scaled by water & seguia',
    arEffectText: 'ينتج 100 قمح وشعير سنوياً، يزداد بوفرة مياه الساقية',
    baseCost: { earth: 20, timber: 0, stone: 5, silver: 0 },
    footprint: { w: 5, d: 3 },
    buildTimeSec: 8,
    maxSlope: 0.60,
  },
  seguia: {
    type: 'seguia',
    name: 'Seguia Channel',
    arName: 'ساقية الري الحجرية',
    tamazightName: 'Targa',
    purpose: 'Irrigation',
    arPurpose: 'شبكة الري',
    effectText: '+18 Water flow per level; boosts all fields',
    arEffectText: '+18 تدفق مياه لكل مستوى؛ تضاعف غلة الحقول',
    baseCost: { earth: 5, timber: 5, stone: 25, silver: 0 },
    footprint: { w: 4, d: 2 },
    buildTimeSec: 10,
    maxSlope: 0.55,
  },
  walnut_grove: {
    type: 'walnut_grove',
    name: 'Walnut & Argan Grove',
    arName: 'بستان الجوز والأركان',
    tamazightName: 'Urtan n-teswickt',
    purpose: 'Cash Crop',
    arPurpose: 'أشجار مثمرة',
    effectText: 'Matures after 2 seasons; yields 35 walnuts in autumn',
    arEffectText: 'يثمر بعد فصلين؛ ينتج 35 من الجوز واللوز كل خريف',
    baseCost: { earth: 0, timber: 5, stone: 0, silver: 5 },
    footprint: { w: 4, d: 4 },
    buildTimeSec: 10,
    maxSlope: 0.50,
  },
  sheepfold: {
    type: 'sheepfold',
    name: 'Sheepfold & Azib',
    arName: 'حظيرة الماشية (عزيب)',
    tamazightName: 'Azib',
    purpose: 'Flocks',
    arPurpose: 'تربية المواشي',
    effectText: '+35 flock capacity & seasonal wool yield',
    arEffectText: '+35 سعة قطعان الماشية وإنتاج الصوف الفصلي',
    baseCost: { earth: 5, timber: 15, stone: 5, silver: 0 },
    footprint: { w: 4, d: 4 },
    buildTimeSec: 10,
    maxSlope: 0.50,
  },
  water_mill: {
    type: 'water_mill',
    name: 'Water Mill',
    arName: 'رحى مائية (طاحونة)',
    tamazightName: 'Tasirt n-waman',
    purpose: 'Flour',
    arPurpose: 'طحن الحبوب',
    effectText: 'Grain feeds households 25% further per level',
    arEffectText: 'تقلل استهلاك الحبوب للأسر بنسبة 25% لكل مستوى',
    baseCost: { earth: 0, timber: 30, stone: 20, silver: 0 },
    footprint: { w: 3, d: 3 },
    buildTimeSec: 15,
    maxSlope: 0.48,
    needsWaterProximity: true,
  },
  agadir: {
    type: 'agadir',
    name: 'Agadir Granary',
    arName: 'أكادير (الحصن الجماعي)',
    tamazightName: 'Agadir',
    purpose: 'Vault',
    arPurpose: 'خزانة القبيلة',
    effectText: 'Protects 40% of stored grain, walnuts & silver per level',
    arEffectText: 'يحمي 40% من الحبوب والجوز والفضة من الغارات لكل مستوى',
    baseCost: { earth: 100, timber: 40, stone: 80, silver: 0 },
    footprint: { w: 5, d: 5 },
    buildTimeSec: 25,
    maxSlope: 0.50,
  },
  watchtower: {
    type: 'watchtower',
    name: 'Watchtower',
    arName: 'برج المراقبة',
    tamazightName: 'Borj n-tissi',
    purpose: 'Warning',
    arPurpose: 'الإنذار والحراسة',
    effectText: 'Early raid warning & +18% valley defense bonus',
    arEffectText: 'إنذار مبكر بالغارات و+18% قوة دفاعية للوادي',
    baseCost: { earth: 40, timber: 10, stone: 40, silver: 0 },
    footprint: { w: 3, d: 3 },
    buildTimeSec: 16,
    maxSlope: 0.55,
  },
  wall_gate: {
    type: 'wall_gate',
    name: 'Wall and Gate',
    arName: 'سور وبوابة القرية',
    tamazightName: 'Agadir n-imi',
    purpose: 'Defense',
    arPurpose: 'التحصين',
    effectText: '+25% valley defense multiplier per level',
    arEffectText: '+25% مضاعف دفاع القرية لكل مستوى',
    baseCost: { earth: 40, timber: 20, stone: 60, silver: 0 },
    footprint: { w: 6, d: 2 },
    buildTimeSec: 18,
    maxSlope: 0.48,
  },
  jemaa_square: {
    type: 'jemaa_square',
    name: 'Jemaa Square',
    arName: 'ساحة الجماعة (أسرير)',
    tamazightName: 'Asarag n-Jemaa',
    purpose: 'Politics',
    arPurpose: 'مجلس الشورى',
    effectText: '+Prestige per season & unlocks tribal council options',
    arEffectText: '+هيبة فصلية وتفتح قرارات مجلس الجماعة العليا',
    baseCost: { earth: 40, timber: 5, stone: 10, silver: 0 },
    footprint: { w: 4, d: 4 },
    buildTimeSec: 12,
    maxSlope: 0.42,
  },
  mosque_zawiya: {
    type: 'mosque_zawiya',
    name: 'Mosque & Zawiya',
    arName: 'المسجد والزاوية العلمية',
    tamazightName: 'Timzgida d Zawiya',
    purpose: 'Community',
    arPurpose: 'العلم والصلح',
    effectText: 'Lowers Unrest, marabout mediation & scholar envoy',
    arEffectText: 'يخفض التوتر ويفتح وساطة العلماء والصلح بين القبائل',
    baseCost: { earth: 60, timber: 20, stone: 20, silver: 0 },
    footprint: { w: 4, d: 4 },
    buildTimeSec: 20,
    maxSlope: 0.42,
  },
  souk: {
    type: 'souk',
    name: 'Weekly Souk',
    arName: 'السوق الأسبوعي',
    tamazightName: 'Assouk',
    purpose: 'Trade',
    arPurpose: 'التجارة الإقليمية',
    effectText: 'Unlocks regional market board & +2 caravan slots',
    arEffectText: 'يفتح تجارة القوافل في سوس ماسة و+2 قوافل إضافية',
    baseCost: { earth: 20, timber: 30, stone: 10, silver: 20 },
    footprint: { w: 5, d: 4 },
    buildTimeSec: 15,
    maxSlope: 0.42,
  },
  weaving_house: {
    type: 'weaving_house',
    name: 'Weaving House',
    arName: 'دار النسيج والزرابي',
    tamazightName: 'Taddart n-uzetta',
    purpose: 'Textiles',
    arPurpose: 'صناعة الزرابي',
    effectText: 'Artisans weave wool into high-value Amazigh carpets',
    arEffectText: 'يحول الصوف إلى زرابي سوسية وأمازيغية عالية القيمة',
    baseCost: { earth: 10, timber: 25, stone: 0, silver: 0 },
    footprint: { w: 3, d: 3 },
    buildTimeSec: 12,
    maxSlope: 0.45,
  },
  funduq: {
    type: 'funduq',
    name: 'Funduq Inn',
    arName: 'الفندق التجاري (خان القوافل)',
    tamazightName: 'el-Funduq',
    purpose: 'Trade Routes',
    arPurpose: 'محطة القوافل',
    effectText: 'Caravans travel 30% faster & generate Silver tolls',
    arEffectText: 'يسرّع القوافل بنسبة 30% ويدرّ عوائد الفضة كل فصل',
    baseCost: { earth: 40, timber: 30, stone: 30, silver: 40 },
    footprint: { w: 5, d: 4 },
    buildTimeSec: 18,
    maxSlope: 0.42,
  },
  kasbah: {
    type: 'kasbah',
    name: 'Qaid Kasbah',
    arName: 'قصبة القائد السلطاني',
    tamazightName: 'Taqasbat',
    purpose: 'Governance',
    arPurpose: 'مقر القيادة',
    effectText: 'Seat of the Qaid (Needs Makhzen Favor 70+); +Prestige & Regional seat',
    arEffectText: 'مقر القائد (يتطلب رضا المخزن 70+)؛ يمنح السيادة الإقليمية والهيبة',
    baseCost: { earth: 150, timber: 60, stone: 120, silver: 100 },
    footprint: { w: 6, d: 6 },
    buildTimeSec: 30,
    maxSlope: 0.42,
    minMakhzenFavor: 70,
  },
};

export const BUILDING_LIST: BuildingDefinition[] = Object.values(BUILDINGS_CONFIG);

export const FICTIONAL_TRIBES = [
  { tribe: 'Ait Tamda', arTribe: 'آيت تامدا', valley: 'Souss-Massa Plain (Tafza)', arValley: 'سهل سوس ماسة (تافزة)' },
  { tribe: 'Ait Ouzir', arTribe: 'آيت أوزير', valley: 'Taroudant Oasis', arValley: 'واحة تارودانت' },
  { tribe: 'Ait Massa', arTribe: 'آيت ماسة', valley: 'Oued Massa Estuary', arValley: 'مصب وادي ماسة' },
  { tribe: 'Ait Tiznit', arTribe: 'آيت تيزنيت', valley: 'Tiznit Silver Plain', arValley: 'سهل تيزنيت الفضي' },
  { tribe: 'Ait Iligh', arTribe: 'آيت إيليغ', valley: 'Tazerwalt Valley', arValley: 'وادي تازروالت' },
  { tribe: 'Ait Chtouka', arTribe: 'آيت شتوكة', valley: 'Chtouka Argan Plain', arValley: 'سهل شتوكة للأركان' },
  { tribe: 'Ait Tafraout', arTribe: 'آيت تافراوت', valley: 'Ameln Almond Valley', arValley: 'وادي أملن للوز' },
  { tribe: 'Ait Igli', arTribe: 'آيت إغلي', valley: 'Igli Souss Terrace', arValley: 'مدرجات إغلي سوس' },
  { tribe: 'Ait Taliouine', arTribe: 'آيت تاليوين', valley: 'Saffron Highlands', arValley: 'هضاب تاليوين للزعفران' },
  { tribe: 'Ait Biougra', arTribe: 'آيت بيوكرى', valley: 'Biougra Pastures', arValley: 'مراعي بيوكرى' },
  { tribe: 'Ait Aoulouz', arTribe: 'آيت أولوز', valley: 'Souss Gorge', arValley: 'مضيق وادي سوس' },
  { tribe: 'Ait Ksima', arTribe: 'آيت كسيمة', valley: 'Agadir Foothills', arValley: 'سفوح أكادير أوفلا' },
];

export const PRESET_MESSAGES: Record<string, { label: string; arLabel: string; text: string; arText: string }> = {
  greeting: {
    label: 'Peace & Greeting',
    arLabel: 'تحية وسلام',
    text: 'May rain bless your seguia and peace guard your tighremt, neighbor.',
    arText: 'بارك الله في سواقيكم وحفظ دياركم وتغرمتكم بالأمن والسلام يا جيراننا.',
  },
  thanks: {
    label: 'Gratitude & Honor',
    arLabel: 'شكر وتقدير',
    text: 'The jemaa of our valley honors your generosity and fair dealing.',
    arText: 'تُشيد جماعة وادينا بكرمكم وحسن معاملتكم ووفائكم بالعهد.',
  },
  apology: {
    label: 'Seek Reconciliation',
    arLabel: 'طلب الصلح والوساطة',
    text: 'Let our marabouts mediate between us so past grievances end in peace.',
    arText: 'ليتوسط فقهاء الزاوية بيننا لإنهاء الخلافات السابقة وإحلال الوئام.',
  },
  warning: {
    label: 'Solemn Warning',
    arLabel: 'تحذير حازم',
    text: 'Our watchtowers are manned and our rifles ready. Respect our borders.',
    arText: 'أبراجنا محروسة وبنادقنا جاهزة؛ احترموا حدود أراضي سوس ماسة.',
  },
};

export const RESOURCE_ARABIC_LABELS: Record<string, string> = {
  grain: 'الحبوب',
  water: 'المياه',
  flocks: 'القطعان',
  earth: 'الطين (اللوح)',
  timber: 'الأخشاب',
  stone: 'الحجارة',
  walnuts: 'الجوز والأركان',
  textiles: 'الزرابي',
  silver: 'الفضة',
  arms: 'البنادق',
  homes: 'المنازل',
  vault: 'حصن أكادير',
  prestige: 'الهيبة',
  favor: 'رضا السلطان',
  unrest: 'التوتر',
};

export const UI_TRANSLATIONS: Record<
  LanguageCode,
  {
    dir: 'ltr' | 'rtl';
    startCta: string;
    build: string;
    population: string;
    politics: string;
    worldMap: string;
    politicalMap: string;
    regionMap: string;
    souk: string;
    reports: string;
    notes: string;
    advanceSeason: string;
    returnHome: string;
  }
> = {
  en: {
    dir: 'ltr',
    startCta: 'Enter Sous-Massa Valley',
    build: 'Build',
    population: 'Households & Life',
    politics: 'Makhzen & Jemaa',
    worldMap: 'World & Territory Map',
    politicalMap: 'Sultans & Politics Map',
    regionMap: 'Nearby Villages (30)',
    souk: 'Souk Trade',
    reports: 'Reports',
    notes: 'Chronicle & Settings',
    advanceSeason: '+10d',
    returnHome: 'Return to My Valley',
  },
  fr: {
    dir: 'ltr',
    startCta: 'Entrer dans la Vallée du Souss',
    build: 'Bâtir',
    population: 'Foyers & Vie',
    politics: 'Makhzen & Jemaa',
    worldMap: 'Carte du Monde & Territoire',
    politicalMap: 'Carte Politique & Sultans',
    regionMap: 'Villages Voisins',
    souk: 'Souk & Caravanes',
    reports: 'Rapports',
    notes: 'Histoire & Options',
    advanceSeason: '+10j',
    returnHome: 'Retour à ma Vallée',
  },
  tzm: {
    dir: 'ltr',
    startCta: 'Kcem s Asif n Sus',
    build: 'Bnu',
    population: 'Tiguira d Tudert',
    politics: 'Lmekhzen d Jemaa',
    worldMap: 'Takarḍa n Umaḍal',
    politicalMap: 'Igelliden d Tsertit',
    regionMap: 'Timizar',
    souk: 'Assouk',
    reports: 'Inallen',
    notes: 'Amezruy',
    advanceSeason: '+10u',
    returnHome: 'Uɣal s Asif-inu',
  },
  ar: {
    dir: 'rtl',
    startCta: 'ادخل إلى سهل ووادي سوس ماسة',
    build: 'البناء والعمارة',
    population: 'الأسر والحياة اليومية',
    politics: 'المخزن والجماعة',
    worldMap: 'خريطة العالم وأراضي القرية',
    politicalMap: 'خريطة السلاطين والسياسة',
    regionMap: 'القرى المجاورة (30)',
    souk: 'السوق والقوافل',
    reports: 'التقارير والرسائل',
    notes: 'التاريخ والإعدادات',
    advanceSeason: '+10 أيام',
    returnHome: 'العودة إلى قريتي في سوس',
  },
};
