export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type WeatherType =
  | 'clear'
  | 'heavy_rain'
  | 'drought'
  | 'sirocco_dust'
  | 'mountain_mist';

export type GameLifecycleState = 'title' | 'playing' | 'paused' | 'gameover';

export type BuildingType =
  | 'tighremt'
  | 'terrace_field'
  | 'seguia'
  | 'walnut_grove'
  | 'sheepfold'
  | 'water_mill'
  | 'agadir'
  | 'watchtower'
  | 'wall_gate'
  | 'jemaa_square'
  | 'mosque_zawiya'
  | 'souk'
  | 'weaving_house'
  | 'funduq'
  | 'kasbah';

export interface Resources {
  grain: number;
  water: number; // Flow value (computed from season + seguia)
  flocks: number;
  timber: number;
  earth: number;
  stone: number;
  walnuts: number;
  textiles: number;
  silver: number;
  arms: number;
  prestige: number;
}

export type ResourceKey = keyof Resources;

export interface BuildingCost {
  earth: number;
  timber: number;
  stone: number;
  silver: number;
}

export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  arName: string;
  tamazightName: string;
  purpose: string;
  arPurpose: string;
  effectText: string;
  arEffectText: string;
  baseCost: BuildingCost;
  footprint: { w: number; d: number }; // Grid units
  buildTimeSec: number; // Base real seconds for level 1
  maxSlope: number;
  needsWaterProximity?: boolean;
  minMakhzenFavor?: number;
}

export interface BuildingInstance {
  id: string;
  type: BuildingType;
  level: number; // 1 to 3
  x: number; // World X
  z: number; // World Z
  rotation: number; // Radians (multiples of Math.PI / 2)
  finishAt: number | null; // Timestamp ms when construction/upgrade finishes, or null if complete
  plantedSeasonCount?: number; // Used for walnut_grove maturity (2 seasons)
  assignedSkill?: keyof PopulationRoles; // Skill specialization for resident households
}

export interface PopulationRoles {
  farmers: number;
  shepherds: number;
  builders: number;
  guards: number;
  artisans: number;
}

export interface ValleyMeters {
  makhzenFavor: number; // 0 to 100
  prestige: number; // 0+
  unrest: number; // 0 to 100
}

export interface EventChoice {
  id: string;
  label: string;
  arLabel?: string;
  description: string;
  arDescription?: string;
  costText?: string;
  arCostText?: string;
  requiresBuilding?: BuildingType;
  minSilver?: number;
  minTimber?: number;
  minGrain?: number;
}

export interface EventCard {
  id: string;
  title: string;
  arTitle?: string;
  season?: Season | 'any';
  isMahalla?: boolean;
  description: string;
  arDescription?: string;
  historicalContext: string;
  arHistoricalContext?: string;
  choices: EventChoice[];
}

export type NpcPersonality = 'proud' | 'greedy' | 'peaceful';

export interface NeighborValley {
  valleyId: string;
  slotIndex: number;
  slotX: number;
  slotY: number;
  name: string;
  arName?: string;
  ownerName: string;
  arOwnerName?: string;
  tribeName: string;
  arTribeName?: string;
  isNpc: boolean;
  personality: NpcPersonality;
  prestige: number;
  makhzenFavor: number;
  strengthLabel: 'Weak' | 'Moderate' | 'Strong';
  estimatedDefense: number;
  resources: Resources;
  households: number;
  roles: PopulationRoles;
  buildings: BuildingInstance[];
  hasPactWithPlayer: boolean;
  lastRaidedAt: number;
  lastRaidedByPlayerAt: number;
  shieldUntil: number;
  isQaid: boolean;
}

export type OrderType = 'trade' | 'raid' | 'gift' | 'pact' | 'message';

export type PresetMessageKey = 'greeting' | 'thanks' | 'apology' | 'warning';

export interface Order {
  orderId: string;
  type: OrderType;
  fromValleyId: string;
  fromValleyName: string;
  toValleyId: string;
  toValleyName: string;
  createdAt: number;
  arriveAt: number;
  resolvedAt: number | null;
  status: 'pending' | 'resolved' | 'cancelled';
  seed: number;
  payload: {
    giveResource?: keyof Resources;
    giveAmount?: number;
    wantResource?: keyof Resources;
    wantAmount?: number;
    fighters?: number;
    armsUsed?: number;
    presetMessage?: PresetMessageKey;
  };
}

export interface SoukOffer {
  offerId: string;
  sellerValleyId: string;
  sellerName: string;
  arSellerName?: string;
  giveResource: keyof Resources;
  giveAmount: number;
  wantResource: keyof Resources;
  wantAmount: number;
  distanceKm: number;
}

export interface ReportItem {
  id: string;
  timestamp: number;
  gameYear: number;
  season: Season;
  category: 'harvest' | 'event' | 'mahalla' | 'trade' | 'raid' | 'pact';
  title: string;
  arTitle?: string;
  summary: string;
  arSummary?: string;
  read: boolean;
}

export type LanguageCode = 'en' | 'fr' | 'tzm' | 'ar';

export type FamilyLineageId =
  | 'ait_amellal'
  | 'ait_oufella'
  | 'ait_tazerwalt'
  | 'ait_massa'
  | 'ait_igherm';

export type LifeStage = 'child' | 'youth' | 'adult' | 'elder';

export interface VillagerPerson {
  id: string;
  name: string;
  arName: string;
  gender: 'male' | 'female';
  age: number;
  lifeStage: LifeStage;
  lineageId: FamilyLineageId;
  secondaryLineageId?: FamilyLineageId;
  role: keyof PopulationRoles;
  skillLevel: number; // 1 to 5 mastery in family craft
  spouseId: string | null;
  parentIds?: [string, string];
  childrenIds: string[];
  homeBuildingId: string;
  generation: number;
}

export interface GameSettings {
  language: LanguageCode;
  soundEnabled: boolean;
  graphicsQuality: 'low' | 'high';
  raidingOptIn: boolean;
  blockedValleyIds: string[];
}

export interface ValleyState {
  valleyId: string;
  ownerUid: string;
  amgharName: string;
  name: string;
  regionId: string;
  regionName: string;
  slotIndex: number;
  slotX: number;
  slotY: number;
  createdAt: number;
  lastTick: number;
  gameDaysElapsed: number; // 1 season = 30 game days; 4 seasons = 120 game days = 1 game year
  year: number; // Starts at 1870
  season: Season;
  dayInSeason: number; // 1 to 30
  resources: Resources;
  households: number;
  roles: PopulationRoles;
  buildings: BuildingInstance[];
  meters: ValleyMeters;
  isQaid: boolean;
  shieldUntil: number;
  lastRaidedAt: number;
  pacts: string[]; // Valley IDs with active pact
  activeEvent: EventCard | null;
  lastEventMonth: number;
  lastMahallaYear: number;
  orders: Order[];
  reports: ReportItem[];
  neighbors: NeighborValley[];
  soukOffers: SoukOffer[];
  tutorialStep: number; // 0 = in progress, 1..5 steps, 99 = completed
  territoryLevel?: number; // 1 to 4 (expandable Sous-Massa village land border)
  newcomerCount?: number; // Tracks recently welcomed families for 3D newcomer avatars
  villagerRoster?: VillagerPerson[]; // Persistent demographic lifecycle & family lineages
  weather?: WeatherType; // Active real-time Sous-Massa weather condition
  weatherDaysRemaining?: number; // Game days until next natural weather front
  version: number;
}
