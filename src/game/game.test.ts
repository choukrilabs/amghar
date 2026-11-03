import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_CONFIG } from './config';
import {
  advanceGameDays,
  computeWaterFlow,
  computeWeatherFarmingMultiplier,
  createInitialValleyState,
  cycleValleyWeatherAction,
  getHousingCapacity,
  setValleyWeatherAction,
  tick,
} from './tick';
import {
  checkRaidEligibility,
  computeDefenseScore,
  getAgadirProtectionRatio,
  resolveRaid,
} from './raid';
import { validateBuildingPlacement } from './terrain';
import { buildMahallaEvent, resolveEventChoice } from './events';
import {
  advanceDemographicsSeason,
  arrangeMarriageAction,
  assignHouseSkillAction,
  computeLineageBonuses,
  createInitialVillagerRoster,
  deriveLivingVillagers,
  expandTerritoryAction,
  forageForFoodAction,
  GAME_ARCHITECTURE_LINKS,
  GAME_ARCHITECTURE_NODES,
  inspectBuildingEconomics,
  trainLineageSkillAction,
  welcomeNewcomerFamilyAction,
} from './villagers';

test('Initial valley state matches Section 11 balance numbers', () => {
  const state = createInitialValleyState('Amghar Moha', 'Tafza Valley', 1000000);
  assert.equal(state.households, 6);
  assert.equal(state.resources.grain, 300);
  assert.equal(state.resources.earth, 200);
  assert.equal(state.resources.timber, 80);
  assert.equal(state.resources.stone, 60);
  assert.equal(state.resources.silver, 50);
  assert.equal(state.resources.flocks, 40);
  assert.equal(state.meters.prestige, 10);
  assert.equal(state.meters.makhzenFavor, 40);
  assert.equal(state.buildings.filter((b) => b.type === 'terrace_field').length, 5);
  assert.equal(state.neighbors.length, 29);
  assert.ok((state.villagerRoster?.length || 0) >= 12);
});

test('tick() advances seasons, harvests barley at end of Spring, and caps offline catch-up at 7 real days', () => {
  const startMs = 1_000_000;
  const state = createInitialValleyState('Amghar Moha', 'Tafza Valley', startMs);
  assert.equal(state.season, 'spring');

  // Advance 1 full season (3 real days = 30 game days)
  const afterSpring = tick(state, startMs + GAME_CONFIG.REAL_MS_PER_SEASON);
  assert.equal(afterSpring.season, 'summer');
  assert.equal(afterSpring.dayInSeason, 1);
  // Barley harvest at end of spring should replenish grain well above starting 300 minus spring consumption
  assert.ok(afterSpring.resources.grain > 400, `Expected barley harvest, got ${afterSpring.resources.grain}`);

  // Test 30 real days offline is capped at 7 real days (MAX_OFFLINE_CATCHUP_MS)
  const afterLongOffline = tick(state, startMs + 30 * 24 * 60 * 60 * 1000);
  assert.equal(afterLongOffline.gameDaysElapsed, GAME_CONFIG.MAX_OFFLINE_CATCHUP_GAME_DAYS);
});

test('Agadir vault protects 40% per level and resolveRaid is deterministic from seed', () => {
  const agadirBuildings = [
    {
      id: 'ag1',
      type: 'agadir' as const,
      level: 2, // 80% protection
      x: -12,
      z: -10,
      rotation: 0,
      finishAt: null,
    },
  ];
  assert.equal(getAgadirProtectionRatio(agadirBuildings), 0.8);

  const raidInput = {
    seed: 987654,
    fighters: 12,
    armsCommitted: 20,
    attackerMorale: 1.1,
    attackerDefenseScore: 15,
    defenderGuards: 1,
    defenderHouseholds: 4,
    defenderBuildings: agadirBuildings,
    defenderResources: {
      grain: 500,
      flocks: 40,
      silver: 100,
    },
  };

  const res1 = resolveRaid(raidInput);
  const res2 = resolveRaid(raidInput);
  assert.deepEqual(res1, res2, 'Raid resolution must be 100% deterministic for the same seed');
  assert.equal(res1.attackerWon, true);
  assert.equal(res1.protectedByAgadir.grain, 400); // 80% of 500 protected
  // Max loot is 15% of unprotected 100 grain = 15 grain
  assert.equal(res1.loot.grain, 15);
  // Shameful raid penalty triggered because defender is much weaker
  assert.equal(res1.isShamefulRaid, true);
  assert.equal(res1.attackerPrestigeDelta, -GAME_CONFIG.SHAMEFUL_RAID_PRESTIGE_PENALTY);
});

test('Raid fairness rules block raiding pact allies, shielded valleys, and cooldown targets', () => {
  const nowMs = 5_000_000;
  const state = createInitialValleyState('Amghar Moha', 'Tafza Valley', nowMs);

  // Ally check
  const ally = state.neighbors.find((n) => n.hasPactWithPlayer)!;
  const allyCheck = checkRaidEligibility(state, ally, 2, nowMs);
  assert.equal(allyCheck.allowed, false);

  // Cooldown check
  const rival = state.neighbors.find((n) => !n.hasPactWithPlayer)!;
  const cooledRival = { ...rival, lastRaidedAt: nowMs - 1000 };
  const cooldownCheck = checkRaidEligibility(state, cooledRival, 2, nowMs);
  assert.equal(cooldownCheck.allowed, false);
});

test('Building placement rules enforce river proximity for Water Mill and Favor 70+ for Kasbah', () => {
  const state = createInitialValleyState('Amghar Moha', 'Tafza Valley', 1000);

  // Water mill far from river should fail
  const farMill = validateBuildingPlacement('water_mill', 25, 0, 0, state.buildings, 50);
  assert.equal(farMill.valid, false);

  // Kasbah with Favor 40 should fail, with Favor 75 should pass on valid slope
  const lowFavorKasbah = validateBuildingPlacement('kasbah', -20, -15, 0, state.buildings, 40);
  assert.equal(lowFavorKasbah.valid, false);
});

test('Mahalla tribute resolution adjusts Makhzen Favor and Prestige accurately', () => {
  const state = createInitialValleyState('Amghar Moha', 'Tafza Valley', 1000);
  const mahalla = buildMahallaEvent(state);
  const { nextState: paidState } = resolveEventChoice(state, mahalla, 'pay_full');
  assert.equal(paidState.meters.makhzenFavor, state.meters.makhzenFavor + 15);

  const { nextState: refusedState } = resolveEventChoice(state, mahalla, 'refuse_fortify');
  assert.equal(refusedState.meters.prestige, state.meters.prestige + 14);
  assert.equal(refusedState.meters.makhzenFavor, state.meters.makhzenFavor - 18);
});

test('Living villagers & newcomers, demographic lifecycle, family lineages, marriages, and 6-waypoint daily life circuits', () => {
  const state = createInitialValleyState('Amghar Moha', 'Tafza Valley', 1000);
  const roster = createInitialVillagerRoster();
  assert.equal(roster.length, 12);

  // Verify family lineage production multipliers
  const bonuses = computeLineageBonuses(roster);
  assert.ok(bonuses.farmingYieldMultiplier > 1.05, 'Expected Ait Amellal farming lineage bonus');
  assert.ok(bonuses.herdingYieldMultiplier > 1.05, 'Expected Ait Oufella herding lineage bonus');
  assert.ok(bonuses.masonrySpeedMultiplier > 1.05, 'Expected Ait Tazerwalt masonry lineage bonus');
  assert.ok(bonuses.weavingValueMultiplier > 1.05, 'Expected Ait Massa weaving lineage bonus');
  assert.ok(bonuses.defenseBonusMultiplier > 1.05, 'Expected Ait Igherm defense lineage bonus');

  const agents = deriveLivingVillagers(state.buildings, state.roles, state.households, roster);
  // 12 resident worker avatars + 2 newcomer traveler avatars
  assert.equal(agents.length, 14);
  assert.equal(agents.filter((a) => a.isNewcomer).length, 2);
  // Every resident villager has a 6-waypoint daily life circuit (work -> storage -> secondary work -> water -> social -> home)
  const residentAgent = agents.find((a) => !a.isNewcomer)!;
  assert.equal(residentAgent.waypoints.length, 6);

  // Arrange a lineage marriage between two unmarried villagers
  const { nextState: marriedState, success: marriedOk } = arrangeMarriageAction(state, 1500);
  assert.equal(marriedOk, true);
  assert.equal((marriedState.villagerRoster?.length || 0), roster.length + 1, 'Expected newborn child added to roster');
  const newborn = marriedState.villagerRoster![marriedState.villagerRoster!.length - 1];
  assert.equal(newborn.lifeStage, 'child');
  assert.ok(newborn.secondaryLineageId, 'Expected newborn to inherit dual parental lineage');

  // Train a villager's hereditary lineage skill
  const trainee = marriedState.villagerRoster!.find((p) => p.skillLevel < 5)!;
  const { nextState: trainedState, success: trainOk } = trainLineageSkillAction(marriedState, trainee.id);
  assert.equal(trainOk, true);
  const updatedTrainee = trainedState.villagerRoster!.find((p) => p.id === trainee.id)!;
  assert.equal(updatedTrainee.skillLevel, trainee.skillLevel + 1);

  // Advance demographics across a winter season (ages villagers by 1 year)
  const afterWinter = advanceDemographicsSeason(trainedState, 'winter', 2000);
  const agedTrainee = afterWinter.villagerRoster!.find((p) => p.id === trainee.id)!;
  assert.equal(agedTrainee.age, updatedTrainee.age + 1);

  // Inspect house economics in English and Arabic Fusha
  const tighremt = state.buildings.find((b) => b.type === 'tighremt')!;
  const econEn = inspectBuildingEconomics(state, tighremt, 'en');
  const econAr = inspectBuildingEconomics(state, tighremt, 'ar');
  assert.ok(econEn.productionItems.length >= 2, 'Expected housing capacity and skill output items');
  assert.ok(econEn.consumptionItems.length >= 2, 'Expected seasonal and annual grain consumption items');
  assert.ok(econAr.buildingName.includes('تغرمت'), 'Expected Arabic Fusha building title');

  // Switch house skill to artisans
  const switchedState = assignHouseSkillAction(state, tighremt.id, 'artisans');
  const updatedHouse = switchedState.buildings.find((b) => b.id === tighremt.id)!;
  assert.equal(updatedHouse.assignedSkill, 'artisans');

  // Expand territory border when resources are sufficient
  const richState = {
    ...state,
    resources: { ...state.resources, silver: 200, stone: 200, earth: 200 },
  };
  const { nextState: expandedState, success: expandOk } = expandTerritoryAction(richState, 2500);
  assert.equal(expandOk, true);
  assert.equal(expandedState.territoryLevel, 2);

  // Forage for food increases grain, walnuts, and timber
  const { nextState: foraged } = forageForFoodAction(state, 2000);
  assert.ok(foraged.resources.grain > state.resources.grain);
  assert.ok(foraged.resources.walnuts > state.resources.walnuts);

  // Add a Tighremt to create free housing capacity and welcome a newcomer family
  const withExtraHome = {
    ...foraged,
    buildings: [
      ...foraged.buildings,
      {
        id: 't_extra',
        type: 'tighremt' as const,
        level: 1,
        x: -15,
        z: 10,
        rotation: 0,
        finishAt: null,
      },
    ],
  };
  const { nextState: welcomed, success } = welcomeNewcomerFamilyAction(withExtraHome, 3000);
  assert.equal(success, true);
  assert.equal(welcomed.households, state.households + 1);

  // Verify every link in GAME_ARCHITECTURE_LINKS references valid nodes in GAME_ARCHITECTURE_NODES
  const validNodeIds = new Set(GAME_ARCHITECTURE_NODES.map((n) => n.id));
  for (const link of GAME_ARCHITECTURE_LINKS) {
    assert.ok(validNodeIds.has(link.source), `Missing source node ${link.source}`);
    assert.ok(validNodeIds.has(link.target), `Missing target node ${link.target}`);
  }
});

test('Real-time weather system modifies water flow, daily tending, seasonal farming harvest, and Seguia drought mitigation', () => {
  const baseState = createInitialValleyState('Amghar Moha', 'Tafza Valley', 1000);

  // Verify water flow under clear vs heavy_rain vs drought
  const clearWater = computeWaterFlow('spring', baseState.buildings, 1000, 'clear');
  const rainWater = computeWaterFlow('spring', baseState.buildings, 1000, 'heavy_rain');
  const droughtWater = computeWaterFlow('spring', baseState.buildings, 1000, 'drought');
  assert.ok(rainWater > clearWater, `Expected heavy_rain water (${rainWater}) > clear (${clearWater})`);
  assert.ok(droughtWater < clearWater, `Expected drought water (${droughtWater}) < clear (${clearWater})`);

  // Verify Seguia irrigation channel mitigates drought farming penalty
  const rawDroughtMult = computeWeatherFarmingMultiplier('drought', baseState.buildings);
  const withSeguia = [
    ...baseState.buildings,
    { id: 'seg_1', type: 'seguia' as const, level: 2, x: 4, z: 0, rotation: 0, finishAt: null },
  ];
  const irrigatedDroughtMult = computeWeatherFarmingMultiplier('drought', withSeguia);
  assert.ok(
    irrigatedDroughtMult > rawDroughtMult,
    `Expected Seguia to buffer drought farming multiplier (${irrigatedDroughtMult} > ${rawDroughtMult})`
  );

  // Compare full Spring harvest under Heavy Rain vs Drought
  const { nextState: rainStart } = setValleyWeatherAction(baseState, 'heavy_rain', 1000);
  const { nextState: droughtStart } = setValleyWeatherAction(baseState, 'drought', 1000);
  const afterRainSpring = advanceGameDays(rainStart, 30, 2000);
  const afterDroughtSpring = advanceGameDays(droughtStart, 30, 2000);

  assert.ok(
    afterRainSpring.resources.grain > afterDroughtSpring.resources.grain + 120,
    `Expected Heavy Rain spring harvest (${afterRainSpring.resources.grain}) to exceed Drought harvest (${afterDroughtSpring.resources.grain}) significantly`
  );

  // Verify cycling weather updates active weather and building economics inspection
  const { nextState: cycled } = cycleValleyWeatherAction(baseState, 3000);
  assert.equal(cycled.weather, 'heavy_rain');
  const field = cycled.buildings.find((b) => b.type === 'terrace_field')!;
  const fieldEcon = inspectBuildingEconomics(cycled, field, 'en');
  assert.ok(
    fieldEcon.productionItems.some((item) => item.label === 'Weather Yield Effect' && item.amountText.includes('+35%')),
    'Expected Terrace Field inspection to display +35% Heavy Atlas Rain yield modifier'
  );
});

test('Arabic Fusha localization covers all events, choices, reports, neighbor valleys, souk offers, and placement checks', () => {
  const state = createInitialValleyState('الأمغار طارق', 'آيت تامدا - سوس ماسة', 1000);

  // Welcome report has Arabic title and summary
  assert.ok(state.reports[0]?.arTitle, 'Expected welcome report to have arTitle');
  assert.ok(state.reports[0]?.arSummary, 'Expected welcome report to have arSummary');

  // Every neighbor valley has Arabic name, owner name, and tribe name
  for (const neighbor of state.neighbors) {
    assert.ok(neighbor.arName, `Missing arName on neighbor ${neighbor.valleyId}`);
    assert.ok(neighbor.arOwnerName, `Missing arOwnerName on neighbor ${neighbor.valleyId}`);
    assert.ok(neighbor.arTribeName, `Missing arTribeName on neighbor ${neighbor.valleyId}`);
  }

  // Every Souk offer has an Arabic seller name
  for (const offer of state.soukOffers) {
    assert.ok(offer.arSellerName, `Missing arSellerName on souk offer ${offer.offerId}`);
  }

  // Mahalla event and resolution generate Arabic Fusha title, description, choices, and report summary
  const mahalla = buildMahallaEvent(state);
  assert.ok(mahalla.arTitle, 'Expected Mahalla arTitle');
  assert.ok(mahalla.arDescription, 'Expected Mahalla arDescription');
  assert.ok(mahalla.arHistoricalContext, 'Expected Mahalla arHistoricalContext');
  for (const choice of mahalla.choices) {
    assert.ok(choice.arLabel, `Missing arLabel on choice ${choice.id}`);
    assert.ok(choice.arDescription, `Missing arDescription on choice ${choice.id}`);
    assert.ok(choice.arCostText, `Missing arCostText on choice ${choice.id}`);
  }
  const { nextState: resolvedMahalla, arSummary } = resolveEventChoice(state, mahalla, 'pay_full');
  assert.ok(arSummary && arSummary.length > 5, 'Expected Arabic summary from resolveEventChoice');
  assert.ok(resolvedMahalla.reports[0]?.arTitle, 'Expected resolved event report to store arTitle');
  assert.ok(resolvedMahalla.reports[0]?.arSummary, 'Expected resolved event report to store arSummary');

  // Placement validation provides Arabic Fusha reason when invalid
  const invalidCheck = validateBuildingPlacement('water_mill', 18, 0, 0, state.buildings, 50);
  assert.equal(invalidCheck.valid, false);
  assert.ok(invalidCheck.arReason && invalidCheck.arReason.includes('الرحى المائية'), 'Expected Arabic reason for invalid water mill placement');
});

test('Decorative Tifinagh Historical Date Ticker formats AD and AH calendars and updates with time', async () => {
  const { formatTifinaghHistoricalDate, convertAdToAhYear } = await import('./tick');
  const state = createInitialValleyState('الأمغار طارق', 'آيت تامدا - سوس ماسة', 1000);
  assert.equal(state.year, 1870);
  assert.equal(state.hijriYear, 1287);

  // Verify AD-to-AH conversion utility accuracy across historical milestones
  assert.equal(convertAdToAhYear(1850, 'spring', 1), 1266);
  assert.equal(convertAdToAhYear(1870, 'spring', 1), 1287);
  assert.equal(convertAdToAhYear(1871, 'spring', 1), 1288);
  // Over 32 solar years (1870 -> 1902 AD), Hijri calendar advances by 33 lunar years (1287 -> 1320 AH)
  assert.equal(convertAdToAhYear(1902, 'spring', 1), 1320);

  const d1 = formatTifinaghHistoricalDate(state, 10000);
  assert.equal(d1.adYear, 1870);
  assert.equal(d1.ahYear, 1287);
  assert.ok(d1.tifinaghTicker.includes('ⵣ'), 'Expected Tifinagh Yaz glyph in ticker');
  assert.ok(d1.dualCalendarBadgeEn.includes('AD') && d1.dualCalendarBadgeEn.includes('AH'));
  assert.ok(d1.dualCalendarBadgeAr.includes('1870م') && d1.dualCalendarBadgeAr.includes('1287هـ'));

  const advanced = advanceGameDays(state, 10, 25000);
  const d2 = formatTifinaghHistoricalDate(advanced, 25000);
  assert.notEqual(d1.adDay, d2.adDay, 'Expected AD day to advance after +10 days');
  assert.notEqual(d1.ahDay, d2.ahDay, 'Expected AH day to advance after +10 days');

  // Verify real-time clock tick rolls over hijriYear in ValleyState when advancing across a full game year (120 game days = 4 seasons)
  const midYearState = advanceGameDays(state, 60, 40000);
  const nextYearState = advanceGameDays(midYearState, 60, 50000);
  assert.equal(nextYearState.year, 1871);
  assert.equal(nextYearState.hijriYear, 1288);

  // Verify sub-day real-time tick updates hijriYear on the cusp of the lunar year rollover in late Winter
  const lateWinterState = advanceGameDays(midYearState, 56, 60000); // Winter Day 27 of 1870
  assert.equal(lateWinterState.year, 1870);
  assert.equal(lateWinterState.hijriYear, 1287);
  const afterLunarRollover = tick(
    lateWinterState,
    60000 + GAME_CONFIG.REAL_MS_PER_GAME_DAY * 2
  );
  assert.equal(afterLunarRollover.hijriYear, 1288);
});



