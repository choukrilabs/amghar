import { BUILDINGS_CONFIG, GAME_CONFIG, WEATHER_INFO } from './config';
import { getAgadirProtectionRatio } from './raid';
import { getTerritoryRadius } from './terrain';
import {
  computeWaterFlow,
  computeWeatherFarmingMultiplier,
  getHousingCapacity,
  getWaterMillSavingsFactor,
} from './tick';
import {
  BuildingInstance,
  FamilyLineageId,
  LanguageCode,
  LifeStage,
  PopulationRoles,
  Season,
  ValleyState,
  VillagerPerson,
} from './types';

export type VillagerHabit =
  | 'farming_terraces'
  | 'foraging_food'
  | 'building_houses'
  | 'fetching_water'
  | 'herding_flocks'
  | 'weaving_carpets'
  | 'guarding_valley'
  | 'newcomer_arrival';

export type VillagerToolType =
  | 'hoe'
  | 'basket'
  | 'mallet'
  | 'amphora'
  | 'staff'
  | 'loom'
  | 'rifle'
  | 'bundle';

export interface VillagerWaypoint {
  x: number;
  z: number;
  kind: 'work' | 'storage' | 'water' | 'social' | 'home';
  labelEn: string;
  labelAr: string;
}

export interface VillagerAgent {
  id: string;
  name: string;
  arName: string;
  gender: 'male' | 'female';
  age: number;
  lifeStage: LifeStage;
  lineageId: FamilyLineageId;
  secondaryLineageId?: FamilyLineageId;
  skillLevel: number;
  spouseId: string | null;
  role: keyof PopulationRoles;
  habit: VillagerHabit;
  habitLabel: string;
  arHabitLabel: string;
  toolType: VillagerToolType;
  isNewcomer: boolean;
  homeBuildingId?: string;
  garmentColor: number;
  headscarfColor: number;
  startX: number;
  startZ: number;
  targetX: number;
  targetZ: number;
  waypoints: VillagerWaypoint[];
  speed: number;
  phaseOffset: number;
}

export interface FamilyLineageSpec {
  id: FamilyLineageId;
  name: string;
  arName: string;
  nameEn: string;
  nameAr: string;
  specialtyTitle: string;
  arSpecialtyTitle: string;
  bonusText: string;
  arBonusText: string;
  specialtyEn: string;
  specialtyAr: string;
  bonusPerSkillPct: number;
  favoredRole: keyof PopulationRoles;
  badgeColor: string;
  garmentColor: number;
}

export const FAMILY_LINEAGES: Record<FamilyLineageId, FamilyLineageSpec> = {
  ait_amellal: {
    id: 'ait_amellal',
    name: 'Ait Amellal',
    arName: 'آيت أملال',
    nameEn: 'Ait Amellal Lineage',
    nameAr: 'سلالة آيت أملال (الزراعة والسواقي)',
    specialtyTitle: 'Master Irrigators',
    arSpecialtyTitle: 'هندسة السواقي والشعير',
    bonusText: '+4.5% Barley & Wheat Yield / Skill',
    arBonusText: '+4.5% إنتاج الحبوب لكل مستوى مهارة',
    specialtyEn: 'Master Irrigators & Barley Cultivators (+4.5% Grain & Water Yield / Skill Lvl)',
    specialtyAr: 'خبرة متوارثة في هندسة السواقي وزراعة الشعير (+4.5% إنتاج الحبوب لكل مستوى مهارة)',
    bonusPerSkillPct: 4.5,
    favoredRole: 'farmers',
    badgeColor: '#15803d',
    garmentColor: 0xd97706,
  },
  ait_oufella: {
    id: 'ait_oufella',
    name: 'Ait Oufella',
    arName: 'آيت أوفلا',
    nameEn: 'Ait Oufella Lineage',
    nameAr: 'سلالة آيت أوفلا (معلمو البناء واللوح)',
    specialtyTitle: 'Master Pisé Masons',
    arSpecialtyTitle: 'معلمو بناء تغرمت والحجر',
    bonusText: '+5.5% Earth & Stone Output / Skill',
    arBonusText: '+5.5% إنتاج البناء لكل مستوى',
    specialtyEn: 'Master Pisé Masons & Stone Architects (+5.5% Earth & Stone Output / Skill Lvl)',
    specialtyAr: 'معلمو بناء القصبات وتغرمت بالطين المدكوك والحجر (+5.5% إنتاج البناء لكل مستوى)',
    bonusPerSkillPct: 5.5,
    favoredRole: 'builders',
    badgeColor: '#b45309',
    garmentColor: 0xb45309,
  },
  ait_tazerwalt: {
    id: 'ait_tazerwalt',
    name: 'Ait Tazerwalt',
    arName: 'آيت تازروالت',
    nameEn: 'Ait Tazerwalt Lineage',
    nameAr: 'سلالة آيت تازروالت (النسيج والتجارة)',
    specialtyTitle: 'Saffron Carpet Weavers',
    arSpecialtyTitle: 'نسج الزرابي والتجارة',
    bonusText: '+6% Carpet & Silver Trade / Skill',
    arBonusText: '+6% إنتاج النسيج والفضة لكل مستوى',
    specialtyEn: 'Saffron Dyers & Geometric Carpet Weavers (+6% Carpet & Silver Output / Skill Lvl)',
    specialtyAr: 'حرفيو نسج الزرابي السوسية والتجارة الفضية (+6% إنتاج النسيج والفضة لكل مستوى)',
    bonusPerSkillPct: 6.0,
    favoredRole: 'artisans',
    badgeColor: '#be185d',
    garmentColor: 0x991b1b,
  },
  ait_massa: {
    id: 'ait_massa',
    name: 'Ait Massa',
    arName: 'آيت ماسة',
    nameEn: 'Ait Massa Lineage',
    nameAr: 'سلالة آيت ماسة (الأركان والقطعان)',
    specialtyTitle: 'Argan & Flock Shepherds',
    arSpecialtyTitle: 'رعاة القطعان والأركان',
    bonusText: '+5% Flocks & Argan Walnuts / Skill',
    arBonusText: '+5% نمو القطعان والأركان لكل مستوى',
    specialtyEn: 'Argan Grove Foragers & Pastoral Shepherds (+5% Flocks & Walnuts / Skill Lvl)',
    specialtyAr: 'رعاة القطعان وجامعو ثمار الأركان والجوز (+5% نمو القطعان والأركان لكل مستوى)',
    bonusPerSkillPct: 5.0,
    favoredRole: 'shepherds',
    badgeColor: '#4d7c0f',
    garmentColor: 0x4d7c0f,
  },
  ait_igherm: {
    id: 'ait_igherm',
    name: 'Ait Igherm',
    arName: 'آيت إغرم',
    nameEn: 'Ait Igherm Lineage',
    nameAr: 'سلالة آيت إغرم (حماة الأكادير)',
    specialtyTitle: 'Agadir Vault Guardians',
    arSpecialtyTitle: 'حماة حصن الأكادير',
    bonusText: '+5% Valley Defense Power / Skill',
    arBonusText: '+5% قوة دفاعية للقرية لكل مستوى',
    specialtyEn: 'Agadir Vault Guardians & Marksmen (+5% Valley Defense Power / Skill Lvl)',
    specialtyAr: 'حماة حصن الأكادير ورماة البنادق (+5% قوة دفاعية للقرية لكل مستوى)',
    bonusPerSkillPct: 5.0,
    favoredRole: 'guards',
    badgeColor: '#0369a1',
    garmentColor: 0x1e3a8a,
  },
};

const AMAZIGH_MALE_NAMES: Array<{ en: string; ar: string }> = [
  { en: 'Idir', ar: 'إدير' },
  { en: 'Moha', ar: 'موحا' },
  { en: 'Brahim', ar: 'إبراهيم' },
  { en: 'Lahcen', ar: 'لحسن' },
  { en: 'Yuba', ar: 'يوبا' },
  { en: 'Amayas', ar: 'أمياس' },
  { en: 'Zayd', ar: 'زيد' },
  { en: 'Haddou', ar: 'حدو' },
  { en: 'Madghis', ar: 'مدغيس' },
  { en: 'Aksil', ar: 'أكسيل' },
  { en: 'Smail', ar: 'إسماعيل' },
  { en: 'Mbarek', ar: 'مبارك' },
];

const AMAZIGH_FEMALE_NAMES: Array<{ en: string; ar: string }> = [
  { en: 'Tassadit', ar: 'تاسعديت' },
  { en: 'Titrit', ar: 'تيتريت' },
  { en: 'Numidia', ar: 'نوميديا' },
  { en: 'Tiziri', ar: 'تيزيري' },
  { en: 'Dihya', ar: 'ديهيا' },
  { en: 'Talalit', ar: 'تلاليت' },
  { en: 'Tamimunt', ar: 'تميمونت' },
  { en: 'Tanirt', ar: 'تانيرت' },
  { en: 'Tafukt', ar: 'تافوكت' },
  { en: 'Mririda', ar: 'مريريدة' },
  { en: 'Itto', ar: 'إيطو' },
  { en: 'Fadma', ar: 'فاضمة' },
];

export function getLifeStageForAge(age: number): LifeStage {
  if (age < 15) return 'child';
  if (age < 22) return 'youth';
  if (age < 55) return 'adult';
  return 'elder';
}

export function createInitialVillagerRoster(
  buildings: BuildingInstance[] = [],
  households = 6
): VillagerPerson[] {
  const homes = (buildings || []).filter((b) => b.type === 'tighremt' || b.type === 'kasbah');
  const homeId = (idx: number) => homes[idx % Math.max(1, homes.length)]?.id || 'b_init_tighremt';

  const baseRoster: VillagerPerson[] = [
    // Couple 1: Ait Amellal & Ait Massa (Farmers) + their child Amayas
    {
      id: 'v_idir',
      name: 'Idir Ait Amellal',
      arName: 'إدير آيت أملال',
      gender: 'male',
      age: 34,
      lifeStage: 'adult',
      lineageId: 'ait_amellal',
      role: 'farmers',
      skillLevel: 3,
      spouseId: 'v_tassadit',
      childrenIds: ['v_amayas'],
      homeBuildingId: homeId(0),
      generation: 1,
    },
    {
      id: 'v_tassadit',
      name: 'Tassadit Ait Massa',
      arName: 'تاسعديت آيت ماسة',
      gender: 'female',
      age: 31,
      lifeStage: 'adult',
      lineageId: 'ait_massa',
      role: 'farmers',
      skillLevel: 3,
      spouseId: 'v_idir',
      childrenIds: ['v_amayas'],
      homeBuildingId: homeId(0),
      generation: 1,
    },
    {
      id: 'v_amayas',
      name: 'Amayas Ait Amellal',
      arName: 'أمياس آيت أملال',
      gender: 'male',
      age: 12,
      lifeStage: 'child',
      lineageId: 'ait_amellal',
      secondaryLineageId: 'ait_massa',
      role: 'farmers',
      skillLevel: 1,
      spouseId: null,
      parentIds: ['v_idir', 'v_tassadit'],
      childrenIds: [],
      homeBuildingId: homeId(0),
      generation: 2,
    },

    // Couple 2: Ait Oufella & Ait Tazerwalt (Builders & Weavers)
    {
      id: 'v_moha',
      name: 'Moha Ait Oufella',
      arName: 'موحا آيت أوفلا',
      gender: 'male',
      age: 38,
      lifeStage: 'adult',
      lineageId: 'ait_oufella',
      role: 'builders',
      skillLevel: 3,
      spouseId: 'v_titrit',
      childrenIds: [],
      homeBuildingId: homeId(1),
      generation: 1,
    },
    {
      id: 'v_titrit',
      name: 'Titrit Ait Tazerwalt',
      arName: 'تيتريت آيت تازروالت',
      gender: 'female',
      age: 33,
      lifeStage: 'adult',
      lineageId: 'ait_tazerwalt',
      role: 'artisans',
      skillLevel: 3,
      spouseId: 'v_moha',
      childrenIds: [],
      homeBuildingId: homeId(1),
      generation: 1,
    },

    // Couple 3: Ait Massa & Ait Igherm (Shepherds & Guards)
    {
      id: 'v_brahim',
      name: 'Brahim Ait Massa',
      arName: 'إبراهيم آيت ماسة',
      gender: 'male',
      age: 29,
      lifeStage: 'adult',
      lineageId: 'ait_massa',
      role: 'shepherds',
      skillLevel: 2,
      spouseId: 'v_numidia',
      childrenIds: [],
      homeBuildingId: homeId(2),
      generation: 1,
    },
    {
      id: 'v_numidia',
      name: 'Numidia Ait Igherm',
      arName: 'نوميديا آيت إغرم',
      gender: 'female',
      age: 27,
      lifeStage: 'adult',
      lineageId: 'ait_igherm',
      role: 'shepherds',
      skillLevel: 2,
      spouseId: 'v_brahim',
      childrenIds: [],
      homeBuildingId: homeId(2),
      generation: 1,
    },

    // 4 Eligible Unmarried Youths / Young Adults ready for marriage across lineages!
    {
      id: 'v_lahcen',
      name: 'Lahcen Ait Igherm',
      arName: 'لحسن آيت إغرم',
      gender: 'male',
      age: 21,
      lifeStage: 'youth',
      lineageId: 'ait_igherm',
      role: 'guards',
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId(3),
      generation: 1,
    },
    {
      id: 'v_tiziri',
      name: 'Tiziri Ait Tazerwalt',
      arName: 'تيزيري آيت تازروالت',
      gender: 'female',
      age: 19,
      lifeStage: 'youth',
      lineageId: 'ait_tazerwalt',
      role: 'farmers',
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId(3),
      generation: 1,
    },
    {
      id: 'v_yuba',
      name: 'Yuba Ait Amellal',
      arName: 'يوبا آيت أملال',
      gender: 'male',
      age: 23,
      lifeStage: 'adult',
      lineageId: 'ait_amellal',
      role: 'farmers',
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId(4),
      generation: 1,
    },
    {
      id: 'v_dihya',
      name: 'Dihya Ait Oufella',
      arName: 'ديهيا آيت أوفلا',
      gender: 'female',
      age: 20,
      lifeStage: 'youth',
      lineageId: 'ait_oufella',
      role: 'builders',
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId(4),
      generation: 1,
    },

    // Respected Valley Elder & Master Mason
    {
      id: 'v_haddou',
      name: 'Elder Haddou Ait Oufella',
      arName: 'الشيخ حدو آيت أوفلا',
      gender: 'male',
      age: 61,
      lifeStage: 'elder',
      lineageId: 'ait_oufella',
      role: 'guards',
      skillLevel: 4,
      spouseId: null,
      childrenIds: ['v_moha', 'v_dihya'],
      homeBuildingId: homeId(5),
      generation: 1,
    },
  ];

  // If households > 6, add extra family members deterministically
  const extraNeeded = Math.max(0, households * 2 - baseRoster.length);
  const lineageKeys: FamilyLineageId[] = [
    'ait_amellal',
    'ait_oufella',
    'ait_tazerwalt',
    'ait_massa',
    'ait_igherm',
  ];
  for (let i = 0; i < extraNeeded; i++) {
    const isFemale = i % 2 === 1;
    const lin = lineageKeys[i % lineageKeys.length];
    const linSpec = FAMILY_LINEAGES[lin];
    const namePool = isFemale ? AMAZIGH_FEMALE_NAMES : AMAZIGH_MALE_NAMES;
    const picked = namePool[(i + 6) % namePool.length];
    const age = 19 + (i % 16);
    baseRoster.push({
      id: `v_extra_${i}`,
      name: `${picked.en} ${linSpec.nameEn.replace(' Lineage', '')}`,
      arName: `${picked.ar} ${linSpec.nameAr.split(' (')[0].replace('سلالة ', '')}`,
      gender: isFemale ? 'female' : 'male',
      age,
      lifeStage: getLifeStageForAge(age),
      lineageId: lin,
      role: linSpec.favoredRole,
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId(i),
      generation: 1,
    });
  }

  return baseRoster;
}

export interface LineageBonusSummary {
  farmingMultiplier: number;
  buildingMultiplier: number;
  weavingMultiplier: number;
  pastoralMultiplier: number;
  defenseMultiplier: number;
  farmingYieldMultiplier: number;
  herdingYieldMultiplier: number;
  masonrySpeedMultiplier: number;
  weavingValueMultiplier: number;
  defenseBonusMultiplier: number;
  elderCount: number;
  marriedCouplesCount: number;
  childrenCount: number;
  unmarriedEligibleCount: number;
  lineageBreakdown: Array<{
    lineageId: FamilyLineageId;
    memberCount: number;
    totalSkillPoints: number;
    bonusPct: number;
  }>;
}

export function computeLineageBonuses(roster: VillagerPerson[]): LineageBonusSummary {
  const skillTotals: Record<FamilyLineageId, number> = {
    ait_amellal: 0,
    ait_oufella: 0,
    ait_tazerwalt: 0,
    ait_massa: 0,
    ait_igherm: 0,
  };
  const memberCounts: Record<FamilyLineageId, number> = {
    ait_amellal: 0,
    ait_oufella: 0,
    ait_tazerwalt: 0,
    ait_massa: 0,
    ait_igherm: 0,
  };

  let elderCount = 0;
  let marriedPeople = 0;
  let childrenCount = 0;
  let unmarriedEligibleCount = 0;

  for (const person of roster) {
    memberCounts[person.lineageId] = (memberCounts[person.lineageId] || 0) + 1;
    const activeWeight = person.lifeStage === 'child' ? 0.4 : 1.0;
    skillTotals[person.lineageId] += person.skillLevel * activeWeight;

    // Secondary inherited lineage from mother also contributes 50% skill bonus!
    if (person.secondaryLineageId) {
      skillTotals[person.secondaryLineageId] += person.skillLevel * 0.5 * activeWeight;
    }

    if (person.lifeStage === 'elder') elderCount += 1;
    if (person.lifeStage === 'child') childrenCount += 1;
    if (person.spouseId) marriedPeople += 1;
    else if (person.age >= 17 && person.lifeStage !== 'elder') unmarriedEligibleCount += 1;
  }

  const farmingBonusPct = Math.min(60, Math.round(skillTotals.ait_amellal * 4.5));
  const buildingBonusPct = Math.min(60, Math.round(skillTotals.ait_oufella * 5.5));
  const weavingBonusPct = Math.min(65, Math.round(skillTotals.ait_tazerwalt * 6.0));
  const pastoralBonusPct = Math.min(60, Math.round(skillTotals.ait_massa * 5.0));
  const defenseBonusPct = Math.min(60, Math.round(skillTotals.ait_igherm * 5.0));

  const lineageKeys: FamilyLineageId[] = [
    'ait_amellal',
    'ait_oufella',
    'ait_tazerwalt',
    'ait_massa',
    'ait_igherm',
  ];

  const pctMap: Record<FamilyLineageId, number> = {
    ait_amellal: farmingBonusPct,
    ait_oufella: buildingBonusPct,
    ait_tazerwalt: weavingBonusPct,
    ait_massa: pastoralBonusPct,
    ait_igherm: defenseBonusPct,
  };

  const farmingMultiplier = Number((1 + farmingBonusPct / 100).toFixed(3));
  const buildingMultiplier = Number((1 + buildingBonusPct / 100).toFixed(3));
  const weavingMultiplier = Number((1 + weavingBonusPct / 100).toFixed(3));
  const pastoralMultiplier = Number((1 + pastoralBonusPct / 100).toFixed(3));
  const defenseMultiplier = Number((1 + defenseBonusPct / 100).toFixed(3));

  return {
    farmingMultiplier,
    buildingMultiplier,
    weavingMultiplier,
    pastoralMultiplier,
    defenseMultiplier,
    farmingYieldMultiplier: farmingMultiplier,
    herdingYieldMultiplier: pastoralMultiplier,
    masonrySpeedMultiplier: buildingMultiplier,
    weavingValueMultiplier: weavingMultiplier,
    defenseBonusMultiplier: defenseMultiplier,
    elderCount,
    marriedCouplesCount: Math.floor(marriedPeople / 2),
    childrenCount,
    unmarriedEligibleCount,
    lineageBreakdown: lineageKeys.map((lid) => ({
      lineageId: lid,
      memberCount: memberCounts[lid],
      totalSkillPoints: Math.round(skillTotals[lid] * 10) / 10,
      bonusPct: pctMap[lid],
    })),
  };
}

/**
 * Pure seasonal demographic lifecycle progression:
 * - Ages all villagers (+1 yr per season so players experience generational growth, marriages & apprenticeships)
 * - Updates lifeStage (child -> youth -> adult -> elder)
 * - Increases skillLevel through work experience & elder mentorship
 * - Celebrates marriages between eligible youths/adults & welcomes children inheriting both parents' lineages
 */
export function advanceDemographicsSeason(
  state: ValleyState,
  completedSeason: Season,
  nowMs = Date.now()
): ValleyState {
  const currentRoster =
    state.villagerRoster && state.villagerRoster.length > 0
      ? state.villagerRoster.map((v) => ({ ...v, childrenIds: [...v.childrenIds] }))
      : createInitialVillagerRoster(state.buildings, state.households);

  const homes = state.buildings.filter((b) => b.type === 'tighremt' || b.type === 'kasbah');
  const defaultHomeId = homes[0]?.id || 'b_init_tighremt';
  const nextReports = [...state.reports];
  const hasElder = currentRoster.some((v) => v.lifeStage === 'elder');

  // 1. Age every villager by +1 year and progress skill mastery
  for (const person of currentRoster) {
    person.age += 1;
    const prevStage = person.lifeStage;
    person.lifeStage = getLifeStageForAge(person.age);

    // Coming of age: Child -> Youth or Youth -> Adult gains +1 skillLevel
    if (prevStage !== person.lifeStage) {
      if (person.lifeStage === 'youth' || person.lifeStage === 'adult') {
        person.skillLevel = Math.min(5, person.skillLevel + 1);
      }
      if (person.lifeStage === 'elder') {
        nextReports.unshift({
          id: `rep_elder_${person.id}_${state.year}_${completedSeason}`,
          timestamp: nowMs,
          gameYear: state.year,
          season: completedSeason,
          category: 'event',
          title: `${person.name} Honored as Jemaa Elder`,
          arTitle: `تكريم ${person.arName} شيخاً في مجلس الجماعة`,
          summary: `${person.name} (${FAMILY_LINEAGES[person.lineageId].nameEn}) reached age ${person.age} and joined the valley elders, mentoring younger apprentices (+Prestige).`,
          arSummary: `بلغ ${person.arName} (${FAMILY_LINEAGES[person.lineageId].nameAr}) سن ${person.age} وانضم إلى شيوخ الجماعة لتعليم الشباب (+هيبة).`,
          read: false,
        });
      }
    } else if (
      completedSeason === 'autumn' &&
      person.skillLevel < 5 &&
      (hasElder || person.age >= 25)
    ) {
      // Autumn craftsmanship & harvest mastery
      person.skillLevel = Math.min(5, person.skillLevel + 1);
    }
  }

  // 2. Seasonal Marriage in Spring or Autumn if an eligible unmarried pair exists
  if (completedSeason === 'spring' || completedSeason === 'autumn') {
    const bachelor = currentRoster.find(
      (v) => v.gender === 'male' && v.spouseId === null && v.age >= 18 && v.age < 52
    );
    const bachelorette = currentRoster.find(
      (v) =>
        v.gender === 'female' &&
        v.spouseId === null &&
        v.age >= 18 &&
        v.age < 50 &&
        v.id !== bachelor?.id
    );

    if (bachelor && bachelorette && state.resources.grain >= 100) {
      bachelor.spouseId = bachelorette.id;
      bachelorette.spouseId = bachelor.id;
      bachelorette.homeBuildingId = bachelor.homeBuildingId || defaultHomeId;

      const linA = FAMILY_LINEAGES[bachelor.lineageId];
      const linB = FAMILY_LINEAGES[bachelorette.lineageId];
      nextReports.unshift({
        id: `rep_marriage_${bachelor.id}_${bachelorette.id}_${nowMs}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: completedSeason,
        category: 'event',
        title: `Lineage Wedding: ${bachelor.name} & ${bachelorette.name}`,
        arTitle: `زواج ومصاهرة: ${bachelor.arName} و${bachelorette.arName}`,
        summary: `The valley celebrated the marriage of ${bachelor.name} (${linA.nameEn}) and ${bachelorette.name} (${linB.nameEn}), uniting their family skills!`,
        arSummary: `احتفلت القرية بزواج ${bachelor.arName} (${linA.nameAr}) و${bachelorette.arName} (${linB.nameAr}) وتوحيد مهارات العائلتين!`,
        read: false,
      });
    }
  }

  // 3. New Births to Married Couples (inherits both father's and mother's family lineages!)
  const fertileCouples = currentRoster.filter(
    (v) =>
      v.gender === 'female' &&
      v.spouseId !== null &&
      v.age >= 19 &&
      v.age <= 42 &&
      v.childrenIds.length < 2
  );

  if (
    fertileCouples.length > 0 &&
    currentRoster.length < Math.max(16, state.households * 3) &&
    state.resources.grain >= 120
  ) {
    const mother = fertileCouples[state.year % fertileCouples.length];
    const father = currentRoster.find((v) => v.id === mother.spouseId);
    if (mother && father) {
      const childIdx = currentRoster.length;
      const isGirl = childIdx % 2 === 1;
      const namePool = isGirl ? AMAZIGH_FEMALE_NAMES : AMAZIGH_MALE_NAMES;
      const picked = namePool[childIdx % namePool.length];
      const primaryLin = father.lineageId;
      const secondaryLin = mother.lineageId;
      const linSpec = FAMILY_LINEAGES[primaryLin];
      const childId = `v_child_${state.year}_${completedSeason}_${childIdx}`;

      const inheritedSkill = Math.min(
        3,
        Math.max(1, Math.floor((father.skillLevel + mother.skillLevel) / 2))
      );

      const child: VillagerPerson = {
        id: childId,
        name: `${picked.en} ${linSpec.nameEn.replace(' Lineage', '')}`,
        arName: `${picked.ar} ${linSpec.nameAr.split(' (')[0].replace('سلالة ', '')}`,
        gender: isGirl ? 'female' : 'male',
        age: 1,
        lifeStage: 'child',
        lineageId: primaryLin,
        secondaryLineageId: secondaryLin,
        role: linSpec.favoredRole,
        skillLevel: inheritedSkill,
        spouseId: null,
        parentIds: [father.id, mother.id],
        childrenIds: [],
        homeBuildingId: mother.homeBuildingId || defaultHomeId,
        generation: Math.max(father.generation, mother.generation) + 1,
      };

      mother.childrenIds.push(childId);
      father.childrenIds.push(childId);
      currentRoster.push(child);

      nextReports.unshift({
        id: `rep_birth_${childId}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: completedSeason,
        category: 'event',
        title: `New Child Born: ${child.name} (Gen ${child.generation})`,
        arTitle: `مولود جديد في القرية: ${child.arName} (الجيل ${child.generation})`,
        summary: `Born to ${father.name} and ${mother.name}, inheriting both ${FAMILY_LINEAGES[primaryLin].nameEn} and ${FAMILY_LINEAGES[secondaryLin].nameEn} traditions (Starting Skill Lvl ${inheritedSkill}).`,
        arSummary: `وُلد لـ ${father.arName} و${mother.arName}، جامعاً بين إرث ${FAMILY_LINEAGES[primaryLin].nameAr} و${FAMILY_LINEAGES[secondaryLin].nameAr} (مهارة ابتدائية ★${inheritedSkill}).`,
        read: false,
      });
    }
  }

  return {
    ...state,
    villagerRoster: currentRoster,
    reports: nextReports,
  };
}

/**
 * Pure player action: Arrange a marriage between two unmarried villagers (or auto-match the top eligible pair),
 * uniting their family lineages, granting +6 Prestige, -4 Unrest, and welcoming a child of both lineages!
 */
export function arrangeMarriageAction(
  state: ValleyState,
  partnerAIdOrNow?: string | number,
  partnerBId?: string,
  nowMsArg = Date.now()
): { nextState: ValleyState; success: boolean; message: string; arMessage: string } {
  const nowMs = typeof partnerAIdOrNow === 'number' ? partnerAIdOrNow : nowMsArg;
  const partnerAId = typeof partnerAIdOrNow === 'string' ? partnerAIdOrNow : undefined;
  const roster =
    state.villagerRoster && state.villagerRoster.length > 0
      ? state.villagerRoster.map((v) => ({ ...v, childrenIds: [...v.childrenIds] }))
      : createInitialVillagerRoster(state.buildings, state.households);

  const partnerA = partnerAId
    ? roster.find((v) => v.id === partnerAId && !v.spouseId && v.age >= 16)
    : roster.find((v) => v.gender === 'male' && !v.spouseId && v.age >= 16);

  const partnerB = partnerBId
    ? roster.find((v) => v.id === partnerBId && !v.spouseId && v.age >= 16 && v.id !== partnerA?.id)
    : roster.find(
        (v) =>
          v.gender === 'female' &&
          !v.spouseId &&
          v.age >= 16 &&
          v.id !== partnerA?.id
      );

  if (!partnerA || !partnerB) {
    return {
      nextState: { ...state, villagerRoster: roster },
      success: false,
      message: 'No unmarried youths or adults (age 16+) are currently available to marry. Welcome a new family or let children come of age!',
      arMessage: 'لا يوجد شباب غير متزوجين (بعمر 16 فأكثر) حالياً. استقبل أسرة جديدة أو انتظر نمو الأبناء!',
    };
  }

  if (state.resources.grain < 20) {
    return {
      nextState: { ...state, villagerRoster: roster },
      success: false,
      message: 'Need at least 20 Grain to host a traditional Sous-Massa wedding feast (Ahwach).',
      arMessage: 'تحتاج إلى 20 من الحبوب على الأقل لإقامة وليمة العرس الأمازيغي (أحواش).',
    };
  }

  partnerA.spouseId = partnerB.id;
  partnerB.spouseId = partnerA.id;
  partnerB.homeBuildingId = partnerA.homeBuildingId;
  partnerA.skillLevel = Math.min(5, partnerA.skillLevel + 1);
  partnerB.skillLevel = Math.min(5, partnerB.skillLevel + 1);

  const linA = FAMILY_LINEAGES[partnerA.lineageId];
  const linB = FAMILY_LINEAGES[partnerB.lineageId];

  // Also bless the newlywed couple with a young child apprentice if under cap
  const childIdx = roster.length;
  const picked = AMAZIGH_MALE_NAMES[childIdx % AMAZIGH_MALE_NAMES.length];
  const childId = `v_wed_child_${nowMs}`;
  const child: VillagerPerson = {
    id: childId,
    name: `${picked.en} ${linA.nameEn.replace(' Lineage', '')}`,
    arName: `${picked.ar} ${linA.nameAr.split(' (')[0].replace('سلالة ', '')}`,
    gender: 'male',
    age: 6,
    lifeStage: 'child',
    lineageId: partnerA.lineageId,
    secondaryLineageId: partnerB.lineageId,
    role: linA.favoredRole,
    skillLevel: 2,
    spouseId: null,
    parentIds: [partnerA.id, partnerB.id],
    childrenIds: [],
    homeBuildingId: partnerA.homeBuildingId,
    generation: Math.max(partnerA.generation, partnerB.generation) + 1,
  };
  partnerA.childrenIds.push(childId);
  partnerB.childrenIds.push(childId);
  roster.push(child);

  const housingCap = getHousingCapacity(state.buildings, nowMs);
  const gainedHousehold = state.households < housingCap ? 1 : 0;

  const nextState: ValleyState = {
    ...state,
    villagerRoster: roster,
    households: state.households + gainedHousehold,
    roles: {
      ...state.roles,
      [linA.favoredRole]: state.roles[linA.favoredRole] + gainedHousehold,
    },
    resources: {
      ...state.resources,
      grain: state.resources.grain - 20,
      prestige: state.meters.prestige + 6,
    },
    meters: {
      ...state.meters,
      prestige: state.meters.prestige + 6,
      unrest: Math.max(0, state.meters.unrest - 4),
    },
    reports: [
      {
        id: `rep_wedding_${nowMs}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: state.season,
        category: 'event',
        title: `Ahwach Wedding: ${partnerA.name} & ${partnerB.name}`,
        arTitle: `عرس أحواش ومصاهرة: ${partnerA.arName} و${partnerB.arName}`,
        summary: `United ${linA.nameEn} and ${linB.nameEn} (+1 Skill Mastery each, +6 Prestige, -4 Unrest, and welcomed young ${child.name} inheriting both lineages).`,
        arSummary: `اتحدت ${linA.nameAr} و${linB.nameAr} (+1 مستوى مهارة لكل منهما، +6 هيبة، -4 توتر، وميلاد ${child.arName} حاملاً إرث السلالتين).`,
        read: false,
      },
      ...state.reports,
    ],
  };

  return {
    nextState,
    success: true,
    message: `Married ${partnerA.name} & ${partnerB.name}! United ${linA.nameEn} & ${linB.nameEn} (+6 Prestige, +1 Lineage Skill)!`,
    arMessage: `تم زواج ${partnerA.arName} و${partnerB.arName}! اتحدت ${linA.nameAr} و${linB.nameAr} (+6 هيبة، +1 مهارة متوارثة)!`,
  };
}

/**
 * Pure player action: Mentor & train a villager in their family lineage craft (+1 Skill Level up to 5).
 */
export function trainLineageSkillAction(
  state: ValleyState,
  villagerId: string,
  nowMs = Date.now()
): { nextState: ValleyState; success: boolean; message: string; arMessage: string } {
  const roster =
    state.villagerRoster && state.villagerRoster.length > 0
      ? state.villagerRoster.map((v) => ({ ...v, childrenIds: [...v.childrenIds] }))
      : createInitialVillagerRoster(state.buildings, state.households);

  const target = roster.find((v) => v.id === villagerId);
  if (!target) {
    return {
      nextState: state,
      success: false,
      message: 'Villager not found.',
      arMessage: 'لم يتم العثور على الفرد.',
    };
  }

  if (target.skillLevel >= 5) {
    return {
      nextState: state,
      success: false,
      message: `${target.name} has already reached Grand Master (Level 5/5) in ${FAMILY_LINEAGES[target.lineageId].nameEn}!`,
      arMessage: `بلغ ${target.arName} أعلى درجة إتقان (5/5) في ${FAMILY_LINEAGES[target.lineageId].nameAr}!`,
    };
  }

  target.skillLevel = Math.min(5, target.skillLevel + 1);
  if (target.lifeStage === 'child' && target.age >= 12) {
    target.age = 16;
    target.lifeStage = 'youth';
  }

  const lin = FAMILY_LINEAGES[target.lineageId];

  const nextState: ValleyState = {
    ...state,
    villagerRoster: roster,
    meters: {
      ...state.meters,
      prestige: state.meters.prestige + 2,
    },
    resources: {
      ...state.resources,
      prestige: state.meters.prestige + 2,
    },
    reports: [
      {
        id: `rep_train_${villagerId}_${nowMs}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: state.season,
        category: 'event',
        title: `Lineage Mastery: ${target.name} (Skill Lvl ${target.skillLevel}/5)`,
        arTitle: `إتقان حرفة السلالة: ${target.arName} (المستوى ${target.skillLevel}/5)`,
        summary: `Elders of ${lin.nameEn} trained ${target.name} to Skill Level ${target.skillLevel}/5, increasing the family line's contribution to the valley.`,
        arSummary: `درّب شيوخ ${lin.nameAr} الفرد ${target.arName} ليبلغ المستوى ${target.skillLevel}/5، مما عزز مساهمة العائلة في إنتاج القرية.`,
        read: false,
      },
      ...state.reports,
    ],
  };

  return {
    nextState,
    success: true,
    message: `${target.name} advanced to Skill Level ${target.skillLevel}/5 in ${lin.nameEn}!`,
    arMessage: `ارتقت مهارة ${target.arName} إلى المستوى ${target.skillLevel}/5 في ${lin.nameAr}!`,
  };
}

/**
 * Generates 3D character avatars for every person in the valley's demographic roster (plus newcomers),
 * complete with age/lifeStage proportions, family lineage colors, and multi-stop daily life waypoints
 * (Work Site -> Storage House/Agadir -> River Water Bank -> Jemaa Courtyard / Spouse Socializing)
 * so villagers live and work dynamically without repeating a single back-and-forth line.
 */
export function deriveLivingVillagers(
  buildings: BuildingInstance[],
  roles: PopulationRoles,
  households: number,
  villagerRoster?: VillagerPerson[]
): VillagerAgent[] {
  const roster =
    villagerRoster && villagerRoster.length > 0
      ? villagerRoster
      : createInitialVillagerRoster(buildings, households);

  const homes = buildings.filter((b) => b.type === 'tighremt' || b.type === 'kasbah');
  const agadirs = buildings.filter((b) => b.type === 'agadir');
  const fields = buildings.filter((b) => b.type === 'terrace_field' || b.type === 'walnut_grove');
  const seguias = buildings.filter((b) => b.type === 'seguia' || b.type === 'water_mill');
  const sheepfolds = buildings.filter((b) => b.type === 'sheepfold');
  const constructing = buildings.filter((b) => b.finishAt !== null);
  const towers = buildings.filter((b) => b.type === 'watchtower' || b.type === 'wall_gate');
  const jemaas = buildings.filter((b) => b.type === 'jemaa_square' || b.type === 'mosque_zawiya');

  const agents: VillagerAgent[] = [];

  for (let i = 0; i < roster.length; i++) {
    const person = roster[i];
    const role = person.role;
    const linSpec = FAMILY_LINEAGES[person.lineageId];
    const home =
      homes.find((h) => h.id === person.homeBuildingId) ||
      homes[i % Math.max(1, homes.length)] || { id: 'home_0', x: -10, z: -4 };
    const storageSite = agadirs[0] || home;
    const socialSite = jemaas[0] || { x: -4, z: 2 };
    const waterBank = seguias[i % Math.max(1, seguias.length)] || {
      x: 1.5,
      z: ((i % 5) - 2) * 5,
    };

    const startX = home.x + ((i % 3) - 1) * 1.8;
    const startZ = home.z + (Math.floor(i / 3) % 3) * 1.8;

    let targetX = 10;
    let targetZ = (i - roster.length / 2) * 2.4;
    let habit: VillagerHabit = 'farming_terraces';
    let habitLabel = 'Tending barley & irrigation terraces';
    let arHabitLabel = 'يفلح حقول الشعير ويسقي المدرجات الزراعية';
    let toolType: VillagerToolType = 'hoe';
    let garmentColor = linSpec.garmentColor;
    let headscarfColor = person.lifeStage === 'elder' ? 0xfef08a : 0xf4ead5;

    const secondaryWorkSite =
      fields[(i + 2) % Math.max(1, fields.length)] || { x: 12, z: ((i + 2) % 5) * 4 - 8 };

    if (role === 'farmers') {
      if (i % 3 === 0) {
        habit = 'foraging_food';
        habitLabel = `Foraging argan nuts & figs (${linSpec.nameEn} Lvl ${person.skillLevel})`;
        arHabitLabel = `يجمع ثمار الأركان والتين (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
        toolType = 'basket';
        const grove = fields[(i + 1) % Math.max(1, fields.length)];
        targetX = grove ? grove.x + 2.2 : 14;
        targetZ = grove ? grove.z - 1.8 : -8 + i * 2;
      } else if (i % 4 === 0 && seguias.length > 0) {
        habit = 'fetching_water';
        habitLabel = `Channeling seguia water (${linSpec.nameEn} Lvl ${person.skillLevel})`;
        arHabitLabel = `يوزع مياه الساقية على الحقول (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
        toolType = 'amphora';
        const seg = seguias[i % seguias.length];
        targetX = seg.x;
        targetZ = seg.z;
      } else {
        habit = 'farming_terraces';
        habitLabel = `Cultivating Sous-Massa barley (${linSpec.nameEn} Lvl ${person.skillLevel})`;
        arHabitLabel = `يفلح ويحصد حقول الشعير (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
        toolType = 'hoe';
        const fld = fields[i % Math.max(1, fields.length)] || { x: 10, z: 0 };
        targetX = fld.x + ((i % 2) - 0.5) * 2.0;
        targetZ = fld.z;
      }
    } else if (role === 'shepherds') {
      habit = 'herding_flocks';
      habitLabel = `Pasturing sheep & goats (${linSpec.nameEn} Lvl ${person.skillLevel})`;
      arHabitLabel = `يرعى الأغنام والماعز (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
      toolType = 'staff';
      const fold = sheepfolds[i % Math.max(1, sheepfolds.length)] || { x: -15, z: 6 };
      targetX = fold.x - 2.5 + (i % 4) * 1.8;
      targetZ = fold.z + 2.5 + (i % 3) * 1.8;
    } else if (role === 'builders') {
      habit = 'building_houses';
      habitLabel =
        constructing.length > 0
          ? `Raising rammed-earth walls (${linSpec.nameEn} Lvl ${person.skillLevel})`
          : `Maintaining Tighremt masonry (${linSpec.nameEn} Lvl ${person.skillLevel})`;
      arHabitLabel =
        constructing.length > 0
          ? `يبني جدران الطين والأرز (${linSpec.nameAr} · مهارة ${person.skillLevel})`
          : `يرمم قصبات تغرمت والسواقي (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
      toolType = 'mallet';
      const site =
        constructing[i % Math.max(1, constructing.length)] ||
        homes[(i + 1) % Math.max(1, homes.length)] || { x: -8, z: 4 };
      targetX = site.x + 1.8;
      targetZ = site.z + 1.8;
    } else if (role === 'guards') {
      habit = 'guarding_valley';
      habitLabel =
        person.lifeStage === 'elder'
          ? `Advising Jemaa council & inspecting defenses (${linSpec.nameEn})`
          : `Patrolling valley perimeter (${linSpec.nameEn} Lvl ${person.skillLevel})`;
      arHabitLabel =
        person.lifeStage === 'elder'
          ? `يشرف على مجلس الجماعة وتحصينات الوادي (${linSpec.nameAr})`
          : `يحرس حدود القرية والأكادير (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
      toolType = person.lifeStage === 'elder' ? 'staff' : 'rifle';
      const tow = towers[i % Math.max(1, towers.length)] || { x: -3, z: 14 };
      targetX = tow.x;
      targetZ = tow.z;
    } else {
      habit = 'weaving_carpets';
      habitLabel = `Weaving Souss wool carpets (${linSpec.nameEn} Lvl ${person.skillLevel})`;
      arHabitLabel = `تنسج الزرابي السوسية بالصوف (${linSpec.nameAr} · مهارة ${person.skillLevel})`;
      toolType = 'loom';
      targetX = home.x - 2.4;
      targetZ = home.z + 2.4;
    }

    // Build a 5-stage non-repeating waypoint circuit across the valley for this person
    const waypoints: VillagerWaypoint[] = [
      {
        x: targetX,
        z: targetZ,
        kind: 'work',
        labelEn: habitLabel,
        labelAr: arHabitLabel,
      },
      {
        x: storageSite.x + 1.6,
        z: storageSite.z + 1.4,
        kind: 'storage',
        labelEn: `Delivering harvest & craft output to ${storageSite.id.includes('agadir') ? 'Agadir Granary' : 'Tighremt'}`,
        labelAr: 'ينقل المحصول والغلال لتخزينها في الدار والأكادير',
      },
      {
        x: secondaryWorkSite.x - 1.4,
        z: secondaryWorkSite.z + 1.2,
        kind: 'work',
        labelEn: `Inspecting secondary terrace plot & argan trees`,
        labelAr: 'يتفقد المدرجات الزراعية وأشجار الأركان المجاورة',
      },
      {
        x: waterBank.x,
        z: waterBank.z,
        kind: 'water',
        labelEn: 'Drawing fresh water at the Oued Souss seguia channel',
        labelAr: 'يرتوي ويملأ الجرار من مياه ساقية وادي سوس',
      },
      {
        x: socialSite.x + ((i % 4) - 1.5) * 1.5,
        z: socialSite.z + ((i % 3) - 1) * 1.5,
        kind: 'social',
        labelEn: person.spouseId
          ? 'Meeting family & spouse at the Jemaa courtyard'
          : 'Gathering with clan elders & neighbors at the Jemaa',
        labelAr: person.spouseId
          ? 'يلتقي بأسرته وشريك حياته في ساحة الجماعة'
          : 'يتحاور مع أهالي القرية وشيوخ الجماعة',
      },
      {
        x: startX,
        z: startZ,
        kind: 'home',
        labelEn: 'Resting at the family Tighremt hearth',
        labelAr: 'يستريح مع العائلة في دار تغرمت',
      },
    ];

    agents.push({
      id: person.id,
      name: person.name,
      arName: person.arName,
      gender: person.gender,
      age: person.age,
      lifeStage: person.lifeStage,
      lineageId: person.lineageId,
      secondaryLineageId: person.secondaryLineageId,
      skillLevel: person.skillLevel,
      spouseId: person.spouseId,
      role,
      habit,
      habitLabel,
      arHabitLabel,
      toolType,
      isNewcomer: false,
      homeBuildingId: home.id,
      garmentColor,
      headscarfColor,
      startX,
      startZ,
      targetX,
      targetZ,
      waypoints,
      speed: person.lifeStage === 'child' ? 0.36 : person.lifeStage === 'elder' ? 0.22 : 0.29 + (i % 4) * 0.03,
      phaseOffset: i * 1.15,
    });
  }

  // Also spawn 2 visible Newcomer / Traveler Avatars walking along the Sous-Massa caravan road toward the Tighremt homes
  const primaryHome = homes[0] || { id: 'home_0', x: -10, z: -4 };
  const newcomerNames = [
    { en: 'Newcomer Family (Ait Massa)', ar: 'أسرة وافدة جديدة (آيت ماسة)', lin: 'ait_massa' as FamilyLineageId },
    { en: 'Settler Artisan (Ait Tazerwalt)', ar: 'حرفي ومزارع وافد (آيت تازروالت)', lin: 'ait_tazerwalt' as FamilyLineageId },
  ];
  for (let n = 0; n < 2; n++) {
    const startX = -26 + n * 7;
    const startZ = 26 - n * 5;
    const targetX = primaryHome.x + 2.2;
    const targetZ = primaryHome.z + 2.2;
    agents.push({
      id: `newcomer_${n}`,
      name: newcomerNames[n].en,
      arName: newcomerNames[n].ar,
      gender: n === 0 ? 'female' : 'male',
      age: 24 + n * 3,
      lifeStage: 'adult',
      lineageId: newcomerNames[n].lin,
      skillLevel: 2,
      spouseId: null,
      role: 'farmers',
      habit: 'newcomer_arrival',
      habitLabel: 'Newcomer family arriving along the Sous-Massa valley trail to settle',
      arHabitLabel: 'أسرة جديدة قادمة عبر طريق سهل سوس ماسة للاستقرار والعمل في القرية',
      toolType: 'bundle',
      isNewcomer: true,
      homeBuildingId: primaryHome.id,
      garmentColor: n === 0 ? 0x0f766e : 0x7e22ce,
      headscarfColor: 0xfef08a,
      startX,
      startZ,
      targetX,
      targetZ,
      waypoints: [
        {
          x: -14 + n * 4,
          z: 14 - n * 3,
          kind: 'social',
          labelEn: 'Walking along the Sous-Massa caravan trail toward the village',
          labelAr: 'يسير عبر طريق قوافل سوس ماسة نحو القرية',
        },
        {
          x: targetX,
          z: targetZ,
          kind: 'home',
          labelEn: 'Greeting the Amghar at the Tighremt gate to request shelter',
          labelAr: 'يحيّي الأمغار عند بوابة تغرمت طالباً الاستقرار في القرية',
        },
        {
          x: 2,
          z: 4,
          kind: 'water',
          labelEn: 'Resting beside the Oued Souss bridge',
          labelAr: 'يستريح قرب جسر وادي سوس',
        },
      ],
      speed: 0.26,
      phaseOffset: n * 2.3,
    });
  }

  return agents;
}

export interface BuildingInspectionReport {
  buildingId: string;
  buildingName: string;
  categoryLabel: string;
  skillRole: keyof PopulationRoles;
  skillLabel: string;
  residentSummary: string;
  residentVillagers: Array<{ name: string; task: string }>;
  productionItems: Array<{ label: string; amountText: string; isPositive: boolean }>;
  consumptionItems: Array<{ label: string; amountText: string }>;
  netSummary: string;
}

const ROLE_LABELS: Record<
  keyof PopulationRoles,
  { en: string; ar: string; prodEn: string; prodAr: string }
> = {
  farmers: {
    en: 'Farming Household (Barley, Wheat & Seguia)',
    ar: 'أسرة فلاحية (زراعة الشعير والقمح والري)',
    prodEn: '+45 Grain & +8 Foraged Walnuts / yr per household',
    prodAr: '+45 حبوب و+8 جوز وأركان سنوياً لكل أسرة',
  },
  shepherds: {
    en: 'Pastoral Shepherd Household (Flocks, Wool & Timber)',
    ar: 'أسرة رعوية (تربية المواشي والصوف وجمع الحطب)',
    prodEn: '+12 Wool/Flocks & +15 Cedar/Argan Timber / yr',
    prodAr: '+12 صوف وماشية و+15 أخشاب سنوياً لكل أسرة',
  },
  builders: {
    en: 'Master Mason & Pisé Builder Household',
    ar: 'أسرة بنّائين ومعلمي الطين (اللوح) والحجر',
    prodEn: '+35 Rammed Earth, +18 Stone & +50% faster building',
    prodAr: '+35 طين البناء و+18 حجارة وتسريع العمارة بنسبة 50%',
  },
  artisans: {
    en: 'Carpet Weaver & Craft Artisan Household',
    ar: 'أسرة نسّاجين وحرفيي الزرابي السوسية',
    prodEn: '+8 Woven Carpets & +14 Silver trade value / yr',
    prodAr: '+8 زرابي منسوجة و+14 فضة تجارية سنوياً',
  },
  guards: {
    en: 'Tribal Watchmen & Rifle Guard Household',
    ar: 'أسرة حراس ورماة البنادق لحماية الوادي',
    prodEn: '+6.5 Defense Power & Caravan Protection',
    prodAr: '+6.5 قوة دفاعية وحماية القوافل والأكادير',
  },
};

/**
 * Computes detailed household & building production, consumption, and resident skills when a player clicks any 3D building.
 */
export function inspectBuildingEconomics(
  state: ValleyState,
  building: BuildingInstance,
  lang: LanguageCode
): BuildingInspectionReport {
  const isAr = lang === 'ar';
  const def = BUILDINGS_CONFIG[building.type];
  const buildingName = isAr ? def.arName : def.name;
  const millFactor = getWaterMillSavingsFactor(state.buildings);
  const activeWeather = state.weather || 'clear';
  const weatherSpec = WEATHER_INFO[activeWeather] || WEATHER_INFO.clear;
  const weatherFarmMult = computeWeatherFarmingMultiplier(activeWeather, state.buildings);
  const waterFlow = computeWaterFlow(state.season, state.buildings, Infinity, activeWeather);
  const allVillagers = deriveLivingVillagers(
    state.buildings,
    state.roles,
    state.households,
    state.villagerRoster
  );

  // Determine assigned skill for this building
  const defaultSkillByType: Record<string, keyof PopulationRoles> = {
    tighremt: building.assignedSkill || 'farmers',
    terrace_field: 'farmers',
    seguia: 'farmers',
    walnut_grove: 'farmers',
    sheepfold: 'shepherds',
    water_mill: 'builders',
    agadir: 'guards',
    watchtower: 'guards',
    wall_gate: 'guards',
    weaving_house: 'artisans',
    souk: 'artisans',
    funduq: 'artisans',
    jemaa_square: 'builders',
    mosque_zawiya: 'artisans',
    kasbah: building.assignedSkill || 'guards',
  };

  const skillRole: keyof PopulationRoles =
    building.assignedSkill || defaultSkillByType[building.type] || 'farmers';
  const roleMeta = ROLE_LABELS[skillRole];

  const productionItems: Array<{ label: string; amountText: string; isPositive: boolean }> = [];
  const consumptionItems: Array<{ label: string; amountText: string }> = [];
  let residentSummary = '';
  let netSummary = '';

  if (building.type === 'tighremt' || building.type === 'kasbah') {
    const cap = (building.type === 'kasbah' ? 3 : 2) * building.level;
    const souls = cap * GAME_CONFIG.PERSONS_PER_HOUSEHOLD;
    const annualGrainConsumed = Math.round(
      cap * GAME_CONFIG.ANNUAL_GRAIN_PER_HOUSEHOLD * millFactor
    );
    const seasonalGrainConsumed = Math.round(
      annualGrainConsumed * GAME_CONFIG.SEASON_GRAIN_FRACTION[state.season]
    );
    const waterUsed = cap * 4;

    residentSummary = isAr
      ? `يسكن هذه الدار ${cap} أسر (${souls} نسمة) متخصصة في: ${roleMeta.ar}`
      : `Houses ${cap} families (${souls} souls) specialized as: ${roleMeta.en}`;

    productionItems.push({
      label: isAr ? 'السعة السكنية' : 'Housing Capacity',
      amountText: isAr ? `${cap} أسر (${souls} فرداً)` : `${cap} Households (${souls} souls)`,
      isPositive: true,
    });
    productionItems.push({
      label: isAr ? 'إنتاج مهارة الأسرة' : 'Household Skill Output',
      amountText: isAr ? roleMeta.prodAr : roleMeta.prodEn,
      isPositive: true,
    });

    consumptionItems.push({
      label: isAr ? 'استهلاك الحبوب الفصلي' : 'Seasonal Grain Consumed',
      amountText: isAr ? `-${seasonalGrainConsumed} حبوب / فصل` : `-${seasonalGrainConsumed} Grain / season`,
    });
    consumptionItems.push({
      label: isAr ? 'استهلاك الحبوب السنوي' : 'Annual Grain Consumed',
      amountText: isAr ? `-${annualGrainConsumed} حبوب / سنة` : `-${annualGrainConsumed} Grain / yr`,
    });
    consumptionItems.push({
      label: isAr ? 'حصة مياه الشرب والساقية' : 'Household Water Draw',
      amountText: isAr ? `-${waterUsed} مياه / فصل` : `-${waterUsed} Water / season`,
    });

    netSummary = isAr
      ? `صافي المساهمة: تؤوي ${souls} نسمة وتنتج الموارد حسب حرفة الأسرة مقابل ${annualGrainConsumed} حبوب سنوياً.`
      : `Net Balance: Shelters ${souls} souls and produces ${skillRole} output for ${annualGrainConsumed} Grain/yr.`;
  } else if (building.type === 'terrace_field') {
    const hasSeguia = state.buildings.some((b) => b.type === 'seguia' && b.finishAt === null);
    let baseYield = GAME_CONFIG.FIELD_BASE_YIELD;
    if (building.level >= 2 && hasSeguia) baseYield = GAME_CONFIG.FIELD_LEVEL2_SEGUIA_YIELD;
    else if (building.level >= 2) baseYield = 115;
    if (building.level >= 3) baseYield += 35;
    const waterMult = Math.min(1.35, Math.max(0.5, waterFlow / 100));
    const annualGrain = Math.round(baseYield * waterMult * weatherFarmMult);
    const weatherPct = Math.round((weatherFarmMult - 1) * 100);
    const weatherPctLabel = weatherPct >= 0 ? `+${weatherPct}%` : `${weatherPct}%`;

    residentSummary = isAr
      ? `حقل زراعي في سهل سوس ماسة يفلحه ${state.roles.farmers} من المزارعين (${weatherSpec.icon} ${weatherSpec.arName}: ${weatherPctLabel})`
      : `Fertile Sous-Massa plot tended by ${state.roles.farmers} farmers (${weatherSpec.icon} ${weatherSpec.name}: ${weatherPctLabel})`;

    productionItems.push({
      label: isAr ? 'إنتاج الحبوب السنوي' : 'Annual Grain Harvest',
      amountText: isAr ? `+${annualGrain} قمح وشعير / سنة` : `+${annualGrain} Grain / yr`,
      isPositive: true,
    });
    productionItems.push({
      label: isAr ? 'تأثير الطقس والمناخ' : 'Weather Yield Effect',
      amountText: isAr
        ? `${weatherSpec.icon} ${weatherSpec.arName} (${weatherPctLabel} محاصيل)`
        : `${weatherSpec.icon} ${weatherSpec.name} (${weatherPctLabel} Crop Output)`,
      isPositive: weatherFarmMult >= 1,
    });
    productionItems.push({
      label: isAr ? 'حصاد الربيع والصيف' : 'Spring & Summer Yield',
      amountText: isAr
        ? `+${Math.round(annualGrain * 0.55)} ربيعاً / +${Math.round(annualGrain * 0.45)} صيفاً`
        : `+${Math.round(annualGrain * 0.55)} Spring / +${Math.round(annualGrain * 0.45)} Summer`,
      isPositive: true,
    });
    consumptionItems.push({
      label: isAr ? 'احتياج مياه الساقية' : 'Irrigation Water Needed',
      amountText: isAr ? `12 وحدة تدفق مياه (الحالي: ${waterFlow})` : `12 Water Flow (Current: ${waterFlow})`,
    });
    netSummary = isAr
      ? `يطعم هذا الحقل ما يعادل ${(annualGrain / 80).toFixed(1)} أسر سنوياً في ظل الطقس الحالي.`
      : `Feeds approximately ${(annualGrain / 80).toFixed(1)} households for a full year under current weather.`;
  } else if (building.type === 'walnut_grove') {
    const yieldAmt = Math.round(
      building.level * GAME_CONFIG.WALNUT_YIELD_PER_LEVEL * weatherFarmMult
    );
    residentSummary = isAr
      ? 'بستان مثمر لأشجار الجوز واللوز والأركان في وادي سوس ماسة'
      : 'Irrigated grove of walnut, almond, and argan trees';
    productionItems.push({
      label: isAr ? 'محصول الخريف' : 'Autumn Harvest',
      amountText: isAr ? `+${yieldAmt} جوز وأركان / خريف` : `+${yieldAmt} Walnuts & Argan / autumn`,
      isPositive: true,
    });
    consumptionItems.push({
      label: isAr ? 'مياه السقي' : 'Irrigation Draw',
      amountText: isAr ? '8 مياه / فصل' : '8 Water / season',
    });
    netSummary = isAr
      ? 'محصول نقدي وغذائي عالي القيمة للتجارة في السوق الأسبوعي.'
      : 'High-value food and cash crop for Souk caravan trade.';
  } else if (building.type === 'seguia') {
    const bonusWater = building.level * GAME_CONFIG.SEGUIA_WATER_BONUS_PER_LEVEL;
    residentSummary = isAr
      ? 'قناة ري حجرية توزع مياه وادي سوس ماسة بالعدل وفق عرف الجماعة'
      : 'Stone irrigation channel distributing river water under customary urf law';
    productionItems.push({
      label: isAr ? 'زيادة تدفق المياه' : 'Water Flow Bonus',
      amountText: isAr ? `+${bonusWater} مياه لكل الحقول` : `+${bonusWater} Water flow to all fields`,
      isPositive: true,
    });
    consumptionItems.push({
      label: isAr ? 'صيانة دورية' : 'Seasonal Upkeep',
      amountText: isAr ? 'جهد البنائين والمزارعين (0 موارد)' : 'Maintained by village builders (0 cost)',
    });
    netSummary = isAr
      ? 'ترفع غلة جميع الحقول المدرجة إلى 130+ حبوب سنوياً.'
      : 'Boosts Level 2+ Terrace Fields to 130+ Grain/yr.';
  } else {
    residentSummary = isAr ? def.arEffectText : def.effectText;
    productionItems.push({
      label: isAr ? def.arPurpose : def.purpose,
      amountText: isAr ? def.arEffectText : def.effectText,
      isPositive: true,
    });
    consumptionItems.push({
      label: isAr ? 'استهلاك التشغيل' : 'Operating Upkeep',
      amountText: isAr ? 'تدار بواسطة حرفيي وحراس القرية' : 'Operated by assigned village specialists',
    });
    netSummary = isAr ? def.arEffectText : def.effectText;
  }

  const matchingVillagers = allVillagers
    .filter((v) => v.homeBuildingId === building.id || v.role === skillRole)
    .slice(0, 4)
    .map((v) => ({
      name: isAr ? v.arName : v.name,
      task: isAr ? v.arHabitLabel : v.habitLabel,
    }));

  return {
    buildingId: building.id,
    buildingName,
    categoryLabel: isAr ? def.arPurpose : def.purpose,
    skillRole,
    skillLabel: isAr ? roleMeta.ar : roleMeta.en,
    residentSummary,
    residentVillagers: matchingVillagers,
    productionItems,
    consumptionItems,
    netSummary,
  };
}

/**
 * Pure action: Reassign the skill specialization of a clicked house/building and shift 1 household role toward that skill.
 */
export function assignHouseSkillAction(
  state: ValleyState,
  buildingId: string,
  newSkill: keyof PopulationRoles
): ValleyState {
  const updatedBuildings = state.buildings.map((b) =>
    b.id === buildingId ? { ...b, assignedSkill: newSkill } : b
  );
  const nextRoles = { ...state.roles };
  if (nextRoles[newSkill] < state.households) {
    const donor = (Object.keys(nextRoles) as Array<keyof PopulationRoles>).find(
      (k) => k !== newSkill && nextRoles[k] > 0
    );
    if (donor) {
      nextRoles[donor] -= 1;
      nextRoles[newSkill] += 1;
    }
  }
  return {
    ...state,
    buildings: updatedBuildings,
    roles: nextRoles,
  };
}

/**
 * Pure action: Expand the Sous-Massa village territory border (Level 1 -> 2 -> 3 -> 4),
 * unlocking wider buildable land, granting +12 Prestige, and establishing a new irrigated terrace field.
 */
export function expandTerritoryAction(
  state: ValleyState,
  nowMs = Date.now()
): { nextState: ValleyState; success: boolean; message: string; arMessage: string } {
  const currentLevel = state.territoryLevel || 1;
  if (currentLevel >= 4) {
    return {
      nextState: state,
      success: false,
      message: 'Your Sous-Massa valley territory has reached its maximum historical borders (Level 4)!',
      arMessage: 'لقد بلغت أراضي قريتك في سهل سوس ماسة أقصى اتساعها التاريخي (المستوى 4)!',
    };
  }

  const silverCost = 20 * currentLevel;
  const earthCost = 35 * currentLevel;
  const stoneCost = 20 * currentLevel;

  if (
    state.resources.silver < silverCost ||
    state.resources.earth < earthCost ||
    state.resources.stone < stoneCost
  ) {
    return {
      nextState: state,
      success: false,
      message: `Expanding territory to Level ${currentLevel + 1} requires ${earthCost} Earth, ${stoneCost} Stone, and ${silverCost} Silver.`,
      arMessage: `يتطلب توسيع أراضي القرية إلى المستوى ${currentLevel + 1}: ${earthCost} طين، ${stoneCost} حجارة، و${silverCost} فضة.`,
    };
  }

  const nextLevel = currentLevel + 1;
  const newRadius = getTerritoryRadius(nextLevel);

  const nextState: ValleyState = {
    ...state,
    territoryLevel: nextLevel,
    resources: {
      ...state.resources,
      earth: state.resources.earth - earthCost,
      stone: state.resources.stone - stoneCost,
      silver: state.resources.silver - silverCost,
      prestige: state.meters.prestige + 12,
    },
    meters: {
      ...state.meters,
      prestige: state.meters.prestige + 12,
    },
    reports: [
      {
        id: `rep_territory_${nowMs}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: state.season,
        category: 'event',
        title: `Sous-Massa Territory Expanded (Level ${nextLevel})`,
        arTitle: `توسيع أراضي القرية في سهل سوس ماسة (المستوى ${nextLevel})`,
        summary: `The Jemaa placed new boundary stones across the fertile Sous-Massa plain, expanding your buildable land to ±${newRadius}m (+12 Prestige).`,
        arSummary: `وضع مجلس الجماعة معالم الحدود الحجرية الجديدة في سهل سوس ماسة، ليتسع نطاق البناء والزراعة إلى ±${newRadius}م (+12 هيبة).`,
        read: false,
      },
      ...state.reports,
    ],
  };

  return {
    nextState,
    success: true,
    message: `Village territory expanded to Level ${nextLevel} (±${newRadius}m fertile Sous-Massa plain, +12 Prestige)!`,
    arMessage: `تم توسيع أراضي القرية في سهل سوس ماسة إلى المستوى ${nextLevel} (±${newRadius}م، +12 هيبة)!`,
  };
}

export interface CivilizationStatus {
  dailyRhythmPhase: string;
  arDailyRhythmPhase: string;
  dailyRhythmDescription: string;
  arDailyRhythmDescription: string;
  foodDaysRemaining: number;
  freeHousingBeds: number;
  migrationReadinessPct: number;
  migrationSummary: string;
  arMigrationSummary: string;
}

export function computeCivilizationStatus(state: ValleyState): CivilizationStatus {
  const housingCap = getHousingCapacity(state.buildings);
  const freeHousingBeds = Math.max(0, housingCap - state.households);

  const dailyGrainUse = Math.max(0.5, (state.households * 80 * 0.25) / 30);
  const foodDaysRemaining = Math.round(
    (state.resources.grain + state.resources.walnuts * 1.5) / dailyGrainUse
  );

  const phaseIdx = state.dayInSeason % 4;
  const phases = [
    {
      phase: 'Dawn · Seguia & Tanast Water Turns',
      arPhase: 'الفجر · توزيع نوبات مياه الساقية (التناست)',
      desc: 'Elders measure water turns across the Sous-Massa plain while shepherds open the corrals.',
      arDesc: 'يقيس شيوخ الجماعة حصص مياه الري بالساعة المائية النحاسية بينما يخرج الرعاة بالقطعان.',
    },
    {
      phase: 'Morning · Terrace Farming & Argan Foraging',
      arPhase: 'الصباح · فلاحة الحقول وجني الأركان والجوز',
      desc: 'Farmers hoe the fertile barley beds and foraging parties gather argan, figs, and walnuts.',
      arDesc: 'يفلح المزارعون حقول الشعير والقمح في سهل سوس ماسة وتجمع الأسر ثمار الأركان والتين.',
    },
    {
      phase: 'Afternoon · Rammed-Earth Building & Looms',
      arPhase: 'الظهيرة · بناء قصبات الطين ونسج الزرابي',
      desc: 'Builders tamp red pisé earth into wooden forms while artisans weave geometric wool carpets.',
      arDesc: 'يدكّ البنّاؤون جدران الطين (اللوح) لبناء الدور بينما تنسج الحرفيات الزرابي السوسية.',
    },
    {
      phase: 'Dusk · Jemaa Hearth & Evening Watch',
      arPhase: 'المساء · مجلس الجماعة وإيقاد أبراج الحراسة',
      desc: 'Families gather around barley couscous hearths as guards light the watchtower braziers.',
      arDesc: 'تجتمع الأسر حول موائد الكسكس بالشعير بينما يوقد الحراس مشاعل أبراج المراقبة.',
    },
  ];

  let migrationPct = 0;
  if (freeHousingBeds > 0) {
    const foodScore = Math.min(50, Math.round((state.resources.grain / (state.households * 25)) * 50));
    const peaceScore = Math.max(0, 50 - state.meters.unrest);
    migrationPct = Math.min(100, foodScore + peaceScore);
  }

  const migrationSummary =
    freeHousingBeds === 0
      ? 'Build or upgrade a Tighremt (+2 homes/level) to make room for new families.'
      : migrationPct >= 75
      ? 'Word of your abundant granaries and peace has reached Sous-Massa! A new family is ready to join.'
      : 'Gather more food and keep unrest low to attract migrating families.';

  const arMigrationSummary =
    freeHousingBeds === 0
      ? 'قم ببناء أو ترقية دار تغرمت (+2 سعة أسر لكل مستوى) لاستقبال أسر وافدة جديدة.'
      : migrationPct >= 75
      ? 'ذاع صيت رخاء قريتك وأمنها في ربوع سوس ماسة! أسرة جديدة مستعدة للانضمام إليكم.'
      : 'اجمع المزيد من الغذاء وحافظ على استقرار القرية لجذب الأسر الوافدة.';

  return {
    dailyRhythmPhase: phases[phaseIdx].phase,
    arDailyRhythmPhase: phases[phaseIdx].arPhase,
    dailyRhythmDescription: phases[phaseIdx].desc,
    arDailyRhythmDescription: phases[phaseIdx].arDesc,
    foodDaysRemaining,
    freeHousingBeds,
    migrationReadinessPct: migrationPct,
    migrationSummary,
    arMigrationSummary,
  };
}

export function forageForFoodAction(
  state: ValleyState,
  nowMs = Date.now()
): { nextState: ValleyState; message: string; arMessage: string } {
  const farmersAndShepherds = state.roles.farmers + state.roles.shepherds;
  const grainFound = 18 + farmersAndShepherds * 4;
  const walnutsFound = 6 + state.roles.shepherds * 3;
  const timberFound = 8 + state.roles.builders * 2;

  const next: ValleyState = {
    ...state,
    resources: {
      ...state.resources,
      grain: Math.round(state.resources.grain + grainFound),
      walnuts: Math.round(state.resources.walnuts + walnutsFound),
      timber: Math.round(state.resources.timber + timberFound),
    },
    meters: {
      ...state.meters,
      unrest: Math.max(0, state.meters.unrest - 2),
    },
    reports: [
      {
        id: `rep_forage_${nowMs}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: state.season,
        category: 'harvest',
        title: 'Foraging Expedition Returned',
        arTitle: 'عودة بعثة جمع الغذاء والأركان',
        summary: `Villagers searched the Sous-Massa argan groves and terraces, bringing back +${grainFound} wild barley & figs, +${walnutsFound} walnuts/argan, and +${timberFound} timber.`,
        arSummary: `جال الأهالي في غابات الأركان ومدرجات سوس ماسة، وعادوا بـ +${grainFound} من الشعير والتين، و+${walnutsFound} من الجوز والأركان، و+${timberFound} من الأخشاب.`,
        read: false,
      },
      ...state.reports,
    ],
  };

  return {
    nextState: next,
    message: `Foragers gathered +${grainFound} Grain, +${walnutsFound} Walnuts, +${timberFound} Timber!`,
    arMessage: `جمع الأهالي +${grainFound} حبوب، +${walnutsFound} جوز وأركان، و+${timberFound} أخشاب!`,
  };
}

export function welcomeNewcomerFamilyAction(
  state: ValleyState,
  nowMs = Date.now()
): { nextState: ValleyState; message: string; arMessage: string; success: boolean } {
  const housingCap = getHousingCapacity(state.buildings, nowMs);
  if (state.households >= housingCap) {
    return {
      nextState: state,
      success: false,
      message: 'No free housing! Build or upgrade a Tighremt first.',
      arMessage: 'لا توجد مساكن شاغرة! قم ببناء أو ترقية دار تغرمت أولاً.',
    };
  }
  if (state.resources.grain < 35) {
    return {
      nextState: state,
      success: false,
      message: 'Need at least 35 Grain in stores to host a welcoming feast for newcomers.',
      arMessage: 'تحتاج إلى 35 من الحبوب على الأقل لإكرام الأسرة الوافدة الجديدة.',
    };
  }

  const currentRoster =
    state.villagerRoster && state.villagerRoster.length > 0
      ? [...state.villagerRoster]
      : createInitialVillagerRoster(state.buildings, state.households);

  const homes = state.buildings.filter((b) => b.type === 'tighremt' || b.type === 'kasbah');
  const homeId = homes[homes.length - 1]?.id || 'b_init_tighremt';
  const lineageKeys: FamilyLineageId[] = [
    'ait_amellal',
    'ait_oufella',
    'ait_tazerwalt',
    'ait_massa',
    'ait_igherm',
  ];
  const lin = lineageKeys[currentRoster.length % lineageKeys.length];
  const linSpec = FAMILY_LINEAGES[lin];
  const malePick = AMAZIGH_MALE_NAMES[currentRoster.length % AMAZIGH_MALE_NAMES.length];
  const femalePick = AMAZIGH_FEMALE_NAMES[currentRoster.length % AMAZIGH_FEMALE_NAMES.length];

  const newMaleId = `v_settler_m_${nowMs}`;
  const newFemaleId = `v_settler_f_${nowMs}`;
  currentRoster.push(
    {
      id: newMaleId,
      name: `${malePick.en} ${linSpec.nameEn.replace(' Lineage', '')}`,
      arName: `${malePick.ar} ${linSpec.nameAr.split(' (')[0].replace('سلالة ', '')}`,
      gender: 'male',
      age: 22,
      lifeStage: 'adult',
      lineageId: lin,
      role: linSpec.favoredRole,
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId,
      generation: 1,
    },
    {
      id: newFemaleId,
      name: `${femalePick.en} ${linSpec.nameEn.replace(' Lineage', '')}`,
      arName: `${femalePick.ar} ${linSpec.nameAr.split(' (')[0].replace('سلالة ', '')}`,
      gender: 'female',
      age: 20,
      lifeStage: 'youth',
      lineageId: lin,
      role: 'farmers',
      skillLevel: 2,
      spouseId: null,
      childrenIds: [],
      homeBuildingId: homeId,
      generation: 1,
    }
  );

  const next: ValleyState = {
    ...state,
    households: state.households + 1,
    newcomerCount: (state.newcomerCount || 0) + 1,
    villagerRoster: currentRoster,
    roles: {
      ...state.roles,
      farmers: state.roles.farmers + 1,
    },
    resources: {
      ...state.resources,
      grain: state.resources.grain - 25,
      prestige: state.meters.prestige + 4,
    },
    meters: {
      ...state.meters,
      prestige: state.meters.prestige + 4,
      unrest: Math.max(0, state.meters.unrest - 3),
    },
    reports: [
      {
        id: `rep_newcomer_${nowMs}`,
        timestamp: nowMs,
        gameYear: state.year,
        season: state.season,
        category: 'event',
        title: `New Family Welcomed (${linSpec.nameEn})`,
        arTitle: `استقبال أسرة وافدة جديدة (${linSpec.nameAr})`,
        summary: `A kinship household of ${linSpec.nameEn} settled into your Tighremt (+1 Household, +2 Lineage Members, +4 Prestige).`,
        arSummary: `استقرت أسرة من ${linSpec.nameAr} في دار تغرمت (+1 أسرة، +2 أفراد من السلالة، +4 هيبة).`,
        read: false,
      },
      ...state.reports,
    ],
  };

  return {
    nextState: next,
    success: true,
    message: `Welcomed ${linSpec.nameEn} family into your Tighremt (+1 Household, +2 Villagers, +4 Prestige)!`,
    arMessage: `انضمت أسرة من ${linSpec.nameAr} إلى دار تغرمت (+1 أسرة، +2 أفراد، +4 هيبة)!`,
  };
}

// ============================================================================
// Architecture & Data Flow Graph Metadata for D3.js Visualization
// ============================================================================

export interface ModuleNode {
  id: string;
  file: string;
  folder: 'src/game' | 'src/render' | 'src/ui' | 'src/net';
  layer: number;
  title: string;
  exportsList: string[];
  description: string;
  liveMetricLabel?: (state: ValleyState) => string;
}

export interface ModuleLink {
  source: string;
  target: string;
  importedSymbols: string[];
  dataFlowLabel: string;
  isCoreGameDir: boolean;
}

export const GAME_ARCHITECTURE_NODES: ModuleNode[] = [
  {
    id: 'src/game/types.ts',
    file: 'src/game/types.ts',
    folder: 'src/game',
    layer: 0,
    title: 'types.ts (Domain Schemas)',
    exportsList: ['ValleyState', 'BuildingInstance', 'Resources', 'PopulationRoles', 'EventCard', 'Order', 'NeighborValley'],
    description: 'Pure TypeScript interfaces defining the entire state tree, buildings, resources, political meters, and caravan orders.',
    liveMetricLabel: (s) => `Version v${s.version} · ${s.buildings.length} Buildings`,
  },
  {
    id: 'src/game/config.ts',
    file: 'src/game/config.ts',
    folder: 'src/game',
    layer: 0,
    title: 'config.ts (Balance & Arabic Fusha)',
    exportsList: ['GAME_CONFIG', 'BUILDINGS_CONFIG', 'SEASON_INFO', 'FICTIONAL_TRIBES', 'UI_TRANSLATIONS'],
    description: 'Single source of truth for all game numbers, 15 building cost tables, seasonal multipliers, and full Arabic Fusha translations.',
    liveMetricLabel: (s) => `15 Building Specs · Season: ${s.season.toUpperCase()}`,
  },
  {
    id: 'src/game/terrain.ts',
    file: 'src/game/terrain.ts',
    folder: 'src/game',
    layer: 1,
    title: 'terrain.ts (Sous-Massa Plain & Bounds)',
    exportsList: ['groundHeightAt', 'riverCenterX', 'getTerritoryRadius', 'validateBuildingPlacement'],
    description: 'Deterministic Sous-Massa alluvial plain topography, Oued Massa channel math, and expandable village territory bounds.',
    liveMetricLabel: (s) => `Territory Lvl ${s.territoryLevel || 1} (±${getTerritoryRadius(s.territoryLevel || 1)}m)`,
  },
  {
    id: 'src/game/events.ts',
    file: 'src/game/events.ts',
    folder: 'src/game',
    layer: 1,
    title: 'events.ts (Events & Mahalla)',
    exportsList: ['STARTER_EVENTS', 'buildMahallaEvent', 'pickMonthlyEvent', 'resolveEventChoice'],
    description: '12 historical 1870 events and the deterministic annual Sultan’s Mahalla tribute expedition.',
    liveMetricLabel: (s) => `Favor: ${s.meters.makhzenFavor}/100 · Prestige: ${s.meters.prestige}`,
  },
  {
    id: 'src/game/raid.ts',
    file: 'src/game/raid.ts',
    folder: 'src/game',
    layer: 1,
    title: 'raid.ts (Raids, Vault & NPCs)',
    exportsList: ['seededRandom', 'getAgadirProtectionRatio', 'computeDefenseScore', 'checkRaidEligibility', 'resolveRaid', 'generateRegionalValleys'],
    description: 'Seeded Mulberry32 PRNG, Agadir granary vault protection, raid combat resolution, fairness rules, and 29 regional NPC valleys.',
    liveMetricLabel: (s) => `Agadir Vault: ${Math.round(getAgadirProtectionRatio(s.buildings) * 100)}% · 29 Neighbors`,
  },
  {
    id: 'src/game/villagers.ts',
    file: 'src/game/villagers.ts',
    folder: 'src/game',
    layer: 2,
    title: 'villagers.ts (Avatars & House Economics)',
    exportsList: ['deriveLivingVillagers', 'inspectBuildingEconomics', 'expandTerritoryAction', 'forageForFoodAction', 'welcomeNewcomerFamilyAction'],
    description: 'Simulates 3D worker & newcomer avatars, per-building consumption/production inspection, and territory expansion.',
    liveMetricLabel: (s) => `${s.households} Homes (${s.households * 5} Souls)`,
  },
  {
    id: 'src/game/tick.ts',
    file: 'src/game/tick.ts',
    folder: 'src/game',
    layer: 2,
    title: 'tick.ts (Pure Time & Economy Engine)',
    exportsList: ['tick', 'advanceGameDays', 'createInitialValleyState', 'resolveDueOrders', 'getHousingCapacity'],
    description: 'Pure deterministic state transition tick(valleyState, nowMs) advancing harvests, consumption, construction, and caravan orders.',
    liveMetricLabel: (s) => `Day ${s.dayInSeason}/30 · ${s.resources.grain} Grain`,
  },
  {
    id: 'src/game/game.test.ts',
    file: 'src/game/game.test.ts',
    folder: 'src/game',
    layer: 3,
    title: 'game.test.ts (Unit Test Suite)',
    exportsList: ['node:test assertions'],
    description: 'Automated unit test suite verifying tick(), seasonal harvests, Agadir protection, house inspection, and territory expansion.',
    liveMetricLabel: () => '8/8 Tests Passing',
  },
  {
    id: 'src/render/ValleyCanvas.tsx',
    file: 'src/render/ValleyCanvas.tsx',
    folder: 'src/render',
    layer: 3,
    title: 'ValleyCanvas.tsx (Three.js 3D World)',
    exportsList: ['ValleyCanvas', 'createBuildingMeshGroup'],
    description: 'Renders the 3D Sous-Massa valley plain, rammed-earth buildings, territory border ring, and animated 3D worker & newcomer avatars.',
    liveMetricLabel: (s) => `${s.buildings.length} 3D Meshes + ${Math.min(24, s.households * 2) + 2} Avatars`,
  },
  {
    id: 'src/App.tsx',
    file: 'src/App.tsx',
    folder: 'src/ui',
    layer: 3,
    title: 'App.tsx (Game Shell & World Maps)',
    exportsList: ['App'],
    description: 'Orchestrates the Game Shell, interactive house inspector, zoomable World & Political maps, and full Arabic Fusha RTL mode.',
    liveMetricLabel: (s) => `${s.reports.length} Chronicle Reports`,
  },
];

export const GAME_ARCHITECTURE_LINKS: ModuleLink[] = [
  {
    source: 'src/game/types.ts',
    target: 'src/game/config.ts',
    importedSymbols: ['BuildingDefinition', 'BuildingType', 'Resources', 'Season'],
    dataFlowLabel: 'Type definitions',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/types.ts',
    target: 'src/game/terrain.ts',
    importedSymbols: ['BuildingInstance', 'BuildingType'],
    dataFlowLabel: 'Footprint & placement types',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/config.ts',
    target: 'src/game/terrain.ts',
    importedSymbols: ['BUILDINGS_CONFIG'],
    dataFlowLabel: 'Slope limits & footprint sizes',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/types.ts',
    target: 'src/game/events.ts',
    importedSymbols: ['EventCard', 'ValleyState'],
    dataFlowLabel: 'Event & state types',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/config.ts',
    target: 'src/game/events.ts',
    importedSymbols: ['GAME_CONFIG'],
    dataFlowLabel: 'Mahalla tribute rates & Qaid thresholds',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/types.ts',
    target: 'src/game/raid.ts',
    importedSymbols: ['BuildingInstance', 'NeighborValley', 'SoukOffer', 'ValleyState'],
    dataFlowLabel: 'Combat & neighbor types',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/config.ts',
    target: 'src/game/raid.ts',
    importedSymbols: ['GAME_CONFIG', 'FICTIONAL_TRIBES'],
    dataFlowLabel: 'Defense multipliers & vault ratios',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/types.ts',
    target: 'src/game/tick.ts',
    importedSymbols: ['ValleyState', 'BuildingInstance', 'PopulationRoles', 'Season'],
    dataFlowLabel: 'State tree schemas',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/config.ts',
    target: 'src/game/tick.ts',
    importedSymbols: ['GAME_CONFIG', 'BUILDINGS_CONFIG', 'SEASON_ORDER'],
    dataFlowLabel: 'Harvest yields & consumption constants',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/events.ts',
    target: 'src/game/tick.ts',
    importedSymbols: ['buildMahallaEvent', 'pickMonthlyEvent'],
    dataFlowLabel: 'Monthly & summer Mahalla triggers',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/raid.ts',
    target: 'src/game/tick.ts',
    importedSymbols: ['resolveRaid', 'computeDefenseScore', 'generateRegionalValleys', 'generateRegionalSoukOffers'],
    dataFlowLabel: 'Order resolution & region bootstrap',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/tick.ts',
    target: 'src/game/villagers.ts',
    importedSymbols: ['getHousingCapacity', 'computeWaterFlow'],
    dataFlowLabel: 'Housing capacity & house economics',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/terrain.ts',
    target: 'src/game/villagers.ts',
    importedSymbols: ['getTerritoryRadius'],
    dataFlowLabel: 'Expandable Sous-Massa border radius',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/types.ts',
    target: 'src/game/villagers.ts',
    importedSymbols: ['ValleyState', 'BuildingInstance', 'PopulationRoles'],
    dataFlowLabel: 'Villager & habit types',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/tick.ts',
    target: 'src/game/game.test.ts',
    importedSymbols: ['tick', 'createInitialValleyState'],
    dataFlowLabel: 'Tests seasonal tick & catch-up',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/raid.ts',
    target: 'src/game/game.test.ts',
    importedSymbols: ['resolveRaid', 'getAgadirProtectionRatio', 'checkRaidEligibility'],
    dataFlowLabel: 'Tests seeded combat & Agadir vault',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/terrain.ts',
    target: 'src/game/game.test.ts',
    importedSymbols: ['validateBuildingPlacement'],
    dataFlowLabel: 'Tests river & slope constraints',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/events.ts',
    target: 'src/game/game.test.ts',
    importedSymbols: ['buildMahallaEvent', 'resolveEventChoice'],
    dataFlowLabel: 'Tests Mahalla tribute outcomes',
    isCoreGameDir: true,
  },
  {
    source: 'src/game/terrain.ts',
    target: 'src/render/ValleyCanvas.tsx',
    importedSymbols: ['groundHeightAt', 'riverCenterX', 'getTerritoryRadius', 'validateBuildingPlacement'],
    dataFlowLabel: '3D Sous-Massa plain & territory ring',
    isCoreGameDir: false,
  },
  {
    source: 'src/game/villagers.ts',
    target: 'src/render/ValleyCanvas.tsx',
    importedSymbols: ['deriveLivingVillagers'],
    dataFlowLabel: '3D articulated worker & newcomer avatars',
    isCoreGameDir: false,
  },
  {
    source: 'src/game/tick.ts',
    target: 'src/App.tsx',
    importedSymbols: ['tick', 'advanceGameDays', 'createInitialValleyState'],
    dataFlowLabel: 'Live variable-speed state loop',
    isCoreGameDir: false,
  },
  {
    source: 'src/game/villagers.ts',
    target: 'src/App.tsx',
    importedSymbols: ['forageForFoodAction', 'welcomeNewcomerFamilyAction', 'expandTerritoryAction', 'inspectBuildingEconomics'],
    dataFlowLabel: 'House inspector & territory actions',
    isCoreGameDir: false,
  },
];
