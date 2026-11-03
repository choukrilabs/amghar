import React, { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/sound';
import { BUILDINGS_CONFIG, GAME_CONFIG } from './game/config';
import { buildMahallaEvent, pickMonthlyEvent, resolveEventChoice } from './game/events';
import { validateBuildingPlacement } from './game/terrain';
import {
  advanceGameDays,
  canAffordCost,
  createInitialValleyState,
  getUpgradeCost,
  rebalanceRolesForHouseholds,
  tick,
} from './game/tick';
import {
  BuildingType,
  GameLifecycleState,
  GameSettings,
  NeighborValley,
  Order,
  PopulationRoles,
  PresetMessageKey,
  Resources,
  SoukOffer,
  ValleyState,
} from './game/types';
import {
  arrangeMarriageAction,
  assignHouseSkillAction,
  expandTerritoryAction,
  forageForFoodAction,
  trainLineageSkillAction,
  welcomeNewcomerFamilyAction,
} from './game/villagers';
import {
  loadSavedValley,
  loadSettings,
  resetValleyState,
  saveSettings,
  saveValleyState,
} from './net/storage';
import { ValleyCanvas } from './render/ValleyCanvas';
import { AmgharArchivalPage } from './ui/AmgharArchivalPage';
import { AmgharProfileDrawer } from './ui/AmgharProfileDrawer';
import { ArchivalPortraitId } from './ui/ArchivalPortraits';
import { ArchitectureGraphView } from './ui/ArchitectureGraphModal';
import { ArchivalManagementSection, BottomDock, DockTab } from './ui/BottomDock';
import { EventModal, NeighborActionModal, StatusModal } from './ui/Modals';
import { TitleScreen } from './ui/TitleScreen';
import { TopBar } from './ui/TopBar';
import { MapModeType, WorldAndPoliticalMaps } from './ui/WorldAndPoliticalMaps';

export default function App() {
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [hasSavedValley, setHasSavedValley] = useState<boolean>(() => {
    return loadSavedValley() !== null;
  });

  const [valley, setValley] = useState<ValleyState>(() => {
    const saved = loadSavedValley();
    if (saved) return saved;
    const initial = createInitialValleyState('الأمغار طارق', 'آيت تامدا - سوس ماسة', Date.now());
    saveValleyState(initial);
    return initial;
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const loaded = loadSettings();
    soundEngine.setMuted(!loaded.soundEnabled);
    return loaded;
  });

  const [lifecycleState, setLifecycleState] = useState<GameLifecycleState>(() =>
    isAutostart ? 'playing' : 'title'
  );

  // Continuous Variable Time Speed (0x paused, 1x calm, 2x brisk, 5x fast, 15x rapid)
  const [timeSpeed, setTimeSpeed] = useState<number>(1);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isWorldMapModalOpen, setIsWorldMapModalOpen] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isArchivalPageOpen, setIsArchivalPageOpen] = useState<boolean>(false);
  const [archivalPortraitId, setArchivalPortraitId] = useState<ArchivalPortraitId>('amghar');
  const [archivalSection, setArchivalSection] = useState<ArchivalManagementSection>('lineage');
  const [activeMapMode, setActiveMapMode] = useState<MapModeType>('topographic_1870');

  const [activeTab, setActiveTab] = useState<DockTab>('build');
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const [selectedBuildType, setSelectedBuildType] = useState<BuildingType | null>(null);
  const [buildRotation, setBuildRotation] = useState(0);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedVillagerId, setSelectedVillagerId] = useState<string | null>(null);
  const [placementStatus, setPlacementStatus] = useState<{
    valid: boolean;
    reason?: string;
    arReason?: string;
  } | null>(null);

  const [visitingNeighbor, setVisitingNeighbor] = useState<NeighborValley | null>(null);
  const [isVisitActionModalOpen, setIsVisitActionModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const valleyRef = useRef(valley);
  useEffect(() => {
    valleyRef.current = valley;
  }, [valley]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Mirror lifecycleState to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = lifecycleState;
  }, [lifecycleState]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const commitValley = useCallback((next: ValleyState) => {
    setValley(next);
    saveValleyState(next);
  }, []);

  // Real-time background tick
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (lifecycleState !== 'playing') return;
      const now = Date.now();
      const updated = tick(valleyRef.current, now);
      if (updated !== valleyRef.current) {
        setValley(updated);
        saveValleyState(updated);
      }
    }, 1000);

    const batchSaveInterval = window.setInterval(() => {
      saveValleyState(valleyRef.current);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(batchSaveInterval);
    };
  }, [lifecycleState]);

  // Continuous Variable Time Speed Interval
  useEffect(() => {
    if (lifecycleState !== 'playing' || timeSpeed <= 0) return;
    const intervalMs = Math.max(250, Math.round(4000 / timeSpeed));
    const speedTimer = window.setInterval(() => {
      const cur = valleyRef.current;
      if (cur.activeEvent) return;
      const now = Date.now();
      const fastForwarded: ValleyState = {
        ...cur,
        buildings: cur.buildings.map((b) =>
          b.finishAt !== null && b.finishAt <= now + 3000 * timeSpeed
            ? { ...b, finishAt: now - 1 }
            : b
        ),
      };
      const next = advanceGameDays(fastForwarded, 1, now);
      setValley(next);
      saveValleyState(next);
    }, intervalMs);

    return () => clearInterval(speedTimer);
  }, [lifecycleState, timeSpeed]);

  // Start Game Handler
  const handleStartGame = useCallback(
    (amgharName: string, valleyName: string, isNewReset: boolean) => {
      soundEngine.playClick();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      if (isNewReset) {
        const fresh = resetValleyState(amgharName, valleyName);
        setValley(fresh);
      } else {
        const next: ValleyState = {
          ...valleyRef.current,
          amgharName,
          name: valleyName,
        };
        commitValley(next);
      }
      setHasSavedValley(true);
      setLifecycleState('playing');
    },
    [commitValley]
  );

  // Advance Game Days Handler
  const handleAdvanceTime = useCallback(
    (days: number) => {
      soundEngine.playHarvest();
      const now = Date.now();
      const fastForwarded: ValleyState = {
        ...valleyRef.current,
        buildings: valleyRef.current.buildings.map((b) =>
          b.finishAt !== null ? { ...b, finishAt: now - 1 } : b
        ),
        orders: valleyRef.current.orders.map((o) =>
          o.status === 'pending' ? { ...o, arriveAt: now - 1 } : o
        ),
      };
      const next = advanceGameDays(fastForwarded, days, now);
      if (next.tutorialStep === 2) {
        next.tutorialStep = 3;
      }
      commitValley(next);
      const isAr = settingsRef.current.language === 'ar';
      showToast(
        isAr
          ? `تقدم الزمن ${days} أيام ← يوم ${next.dayInSeason} (${next.year}م / ${next.hijriYear}هـ)`
          : `Advanced ${days} days → ${next.season.toUpperCase()} Day ${next.dayInSeason}, ${next.year} AD / ${next.hijriYear} AH`
      );
    },
    [commitValley, showToast]
  );

  // Forage for Food Action
  const handleForageFood = useCallback(() => {
    soundEngine.playHarvest();
    const { nextState, message, arMessage } = forageForFoodAction(valleyRef.current, Date.now());
    commitValley(nextState);
    showToast(settingsRef.current.language === 'ar' ? arMessage : message);
  }, [commitValley, showToast]);

  // Welcome Newcomer Family Action
  const handleWelcomeNewcomer = useCallback(() => {
    const { nextState, message, arMessage, success } = welcomeNewcomerFamilyAction(
      valleyRef.current,
      Date.now()
    );
    if (success) {
      soundEngine.playCaravanBell();
      commitValley(nextState);
    } else {
      soundEngine.playClick();
    }
    showToast(settingsRef.current.language === 'ar' ? arMessage : message);
  }, [commitValley, showToast]);

  // Expand Sous-Massa Village Territory Action
  const handleExpandTerritory = useCallback(() => {
    const { nextState, message, arMessage, success } = expandTerritoryAction(
      valleyRef.current,
      Date.now()
    );
    if (success) {
      soundEngine.playHarvest();
      commitValley(nextState);
    } else {
      soundEngine.playClick();
    }
    showToast(settingsRef.current.language === 'ar' ? arMessage : message);
  }, [commitValley, showToast]);

  // Arrange Lineage Marriage Action
  const handleArrangeMarriage = useCallback(() => {
    const { nextState, message, arMessage, success } = arrangeMarriageAction(
      valleyRef.current,
      Date.now()
    );
    if (success) {
      soundEngine.playCaravanBell();
      commitValley(nextState);
    } else {
      soundEngine.playClick();
    }
    showToast(settingsRef.current.language === 'ar' ? arMessage : message);
  }, [commitValley, showToast]);

  // Train Villager Lineage Skill Action
  const handleTrainVillagerSkill = useCallback(
    (villagerId: string) => {
      const { nextState, message, arMessage, success } = trainLineageSkillAction(
        valleyRef.current,
        villagerId
      );
      if (success) {
        soundEngine.playHarvest();
        commitValley(nextState);
      } else {
        soundEngine.playClick();
      }
      showToast(settingsRef.current.language === 'ar' ? arMessage : message);
    },
    [commitValley, showToast]
  );

  // Reassign Household Skill on a Clicked House / Building
  const handleAssignHouseSkill = useCallback(
    (buildingId: string, skill: keyof PopulationRoles) => {
      soundEngine.playClick();
      const next = assignHouseSkillAction(valleyRef.current, buildingId, skill);
      commitValley(next);
      const isAr = settingsRef.current.language === 'ar';
      const arSkillMap: Record<keyof PopulationRoles, string> = {
        farmers: 'الفلاحة والري',
        shepherds: 'رعي القطعان والأركان',
        builders: 'البناء والعمارة',
        artisans: 'نسج الزرابي والحرف',
        guards: 'الحراسة والدفاع',
      };
      showToast(
        isAr
          ? `تم تحديث حرفة الأسرة في هذا المبنى إلى: ${arSkillMap[skill]}`
          : `Updated resident household specialization to: ${skill}`
      );
    },
    [commitValley, showToast]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (lifecycleState === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartGame(valleyRef.current.amgharName, valleyRef.current.name, false);
        }
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        setSettings((prev) => {
          const nextSound = !prev.soundEnabled;
          soundEngine.setMuted(!nextSound);
          const next = { ...prev, soundEnabled: nextSound };
          saveSettings(next);
          return next;
        });
        return;
      }

      if (e.code === 'KeyH' && lifecycleState === 'playing') {
        e.preventDefault();
        setIsHudCollapsed((c) => !c);
        return;
      }

      if (e.code === 'KeyR' && lifecycleState === 'playing') {
        if (selectedBuildType) {
          e.preventDefault();
          soundEngine.playClick();
          setBuildRotation((r) => (r + Math.PI / 2) % (Math.PI * 2));
        }
        return;
      }

      if (e.code === 'Space' && lifecycleState === 'playing' && !valleyRef.current.activeEvent) {
        e.preventDefault();
        handleAdvanceTime(10);
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (isWorldMapModalOpen) {
          setIsWorldMapModalOpen(false);
          return;
        }
        if (isArchitectureModalOpen) {
          setIsArchitectureModalOpen(false);
          return;
        }
        if (selectedBuildType) {
          setSelectedBuildType(null);
          return;
        }
        if (isVisitActionModalOpen) {
          setIsVisitActionModalOpen(false);
          return;
        }
        setLifecycleState((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    lifecycleState,
    selectedBuildType,
    isVisitActionModalOpen,
    isArchitectureModalOpen,
    isWorldMapModalOpen,
    handleStartGame,
    handleAdvanceTime,
  ]);

  // Place Building in 3D Valley
  const handlePlaceBuilding = useCallback(
    (x: number, z: number, rotation: number) => {
      const cur = valleyRef.current;
      if (!selectedBuildType || visitingNeighbor) return;

      const def = BUILDINGS_CONFIG[selectedBuildType];
      const cost = def.baseCost;

      const isAr = settingsRef.current.language === 'ar';
      if (!canAffordCost(cur.resources, cost)) {
        showToast(
          isAr
            ? `الموارد غير كافية لبناء ${def.arName}`
            : `Insufficient resources to build ${def.name}`
        );
        return;
      }

      const check = validateBuildingPlacement(
        selectedBuildType,
        x,
        z,
        rotation,
        cur.buildings,
        cur.meters.makhzenFavor,
        cur.territoryLevel || 1
      );
      if (!check.valid) {
        showToast(
          isAr
            ? check.arReason || check.reason || 'موقع غير صالح للبناء'
            : check.reason || 'Invalid placement location'
        );
        return;
      }

      soundEngine.playBuild();
      const now = Date.now();
      const builderSpeedup = Math.max(1, cur.roles.builders);
      const durationMs = Math.round((def.buildTimeSec * 1000) / builderSpeedup);

      const newBuilding = {
        id: `b_${selectedBuildType}_${now}_${Math.random().toString(36).slice(2, 6)}`,
        type: selectedBuildType,
        level: 1,
        x,
        z,
        rotation,
        finishAt: now + durationMs,
        plantedSeasonCount: 0,
      };

      const next: ValleyState = {
        ...cur,
        resources: {
          ...cur.resources,
          earth: cur.resources.earth - cost.earth,
          timber: cur.resources.timber - cost.timber,
          stone: cur.resources.stone - cost.stone,
          silver: cur.resources.silver - cost.silver,
        },
        buildings: [...cur.buildings, newBuilding],
        tutorialStep: cur.tutorialStep === 1 ? 2 : cur.tutorialStep,
      };

      commitValley(next);
      setSelectedBuildType(null);
      setSelectedBuildingId(newBuilding.id);
      showToast(
        isAr
          ? `جاري بناء ${def.arName} في الإحداثيات (${x}, ${z})!`
          : `Constructing ${def.name} at (${x}, ${z})!`
      );
    },
    [selectedBuildType, visitingNeighbor, commitValley, showToast]
  );

  // Upgrade Existing Building (Level 1 -> 2 -> 3)
  const handleUpgradeBuilding = useCallback(
    (buildingId: string) => {
      const cur = valleyRef.current;
      const target = cur.buildings.find((b) => b.id === buildingId);
      if (!target || target.level >= 3) return;

      const nextLevel = target.level + 1;
      const cost = getUpgradeCost(target.type, nextLevel);
      const isAr = settingsRef.current.language === 'ar';
      if (!canAffordCost(cur.resources, cost)) {
        showToast(
          isAr ? 'الموارد غير كافية لترقية هذا المبنى' : 'Not enough materials for upgrade'
        );
        return;
      }

      soundEngine.playBuild();
      const next: ValleyState = {
        ...cur,
        resources: {
          ...cur.resources,
          earth: cur.resources.earth - cost.earth,
          timber: cur.resources.timber - cost.timber,
          stone: cur.resources.stone - cost.stone,
          silver: cur.resources.silver - cost.silver,
        },
        buildings: cur.buildings.map((b) =>
          b.id === buildingId ? { ...b, level: nextLevel, finishAt: null } : b
        ),
        meters: {
          ...cur.meters,
          prestige: cur.meters.prestige + 3,
        },
      };
      next.resources.prestige = next.meters.prestige;
      commitValley(next);
      showToast(
        isAr
          ? `تمت ترقية ${BUILDINGS_CONFIG[target.type].arName} إلى المستوى ${nextLevel} (+3 هيبة)!`
          : `Upgraded ${BUILDINGS_CONFIG[target.type].name} to Level ${nextLevel} (+3 Prestige)!`
      );
    },
    [commitValley, showToast]
  );

  const handleUpdateRoles = useCallback(
    (roles: PopulationRoles) => {
      soundEngine.playClick();
      const cur = valleyRef.current;
      const balanced = rebalanceRolesForHouseholds(roles, cur.households);
      commitValley({ ...cur, roles: balanced });
    },
    [commitValley]
  );

  const handleResolveEvent = useCallback(
    (choiceId: string) => {
      const cur = valleyRef.current;
      if (!cur.activeEvent) return;
      soundEngine.playHarvest();
      const { nextState, summary, arSummary } = resolveEventChoice(cur, cur.activeEvent, choiceId);
      commitValley(nextState);
      showToast(settingsRef.current.language === 'ar' ? arSummary : summary);
    },
    [commitValley, showToast]
  );

  // Souk Caravan Order Creation
  const handleAcceptSoukOffer = useCallback(
    (offer: SoukOffer) => {
      const cur = valleyRef.current;
      if ((cur.resources[offer.wantResource] || 0) < offer.wantAmount) return;

      soundEngine.playCaravanBell();
      const now = Date.now();
      const winterMult = cur.season === 'winter' ? GAME_CONFIG.WINTER_TRAVEL_TIME_MULTIPLIER : 1;
      const travelMs = Math.round(offer.distanceKm * 600 * winterMult);

      const newOrder: Order = {
        orderId: `ord_souk_${now}`,
        type: 'trade',
        fromValleyId: cur.valleyId,
        fromValleyName: cur.name,
        toValleyId: offer.sellerValleyId,
        toValleyName: offer.sellerName,
        createdAt: now,
        arriveAt: now + travelMs,
        resolvedAt: null,
        status: 'pending',
        seed: now % 1000000,
        payload: {
          giveResource: offer.wantResource,
          giveAmount: offer.wantAmount,
          wantResource: offer.giveResource,
          wantAmount: offer.giveAmount,
        },
      };

      const next: ValleyState = {
        ...cur,
        resources: {
          ...cur.resources,
          [offer.wantResource]: cur.resources[offer.wantResource] - offer.wantAmount,
        },
        orders: [newOrder, ...cur.orders],
        soukOffers: cur.soukOffers.filter((o) => o.offerId !== offer.offerId),
      };

      commitValley(next);
      const isAr = settingsRef.current.language === 'ar';
      showToast(
        isAr
          ? `انطلقت القافلة التجارية نحو ${offer.arSellerName || offer.sellerName} (تصل خلال ${Math.round(
              travelMs / 1000
            )} ثانية أو اضغط +10 أيام)`
          : `Caravan dispatched to ${offer.sellerName} (arrives in ${Math.round(travelMs / 1000)}s or press +10d)`
      );
    },
    [commitValley, showToast]
  );

  // Neighbor Visit Actions
  const handleSendGift = useCallback(
    (resource: keyof Resources, amount: number) => {
      const cur = valleyRef.current;
      if (!visitingNeighbor || cur.resources[resource] < amount) return;
      soundEngine.playCaravanBell();
      const now = Date.now();
      const order: Order = {
        orderId: `ord_gift_${now}`,
        type: 'gift',
        fromValleyId: cur.valleyId,
        fromValleyName: cur.name,
        toValleyId: visitingNeighbor.valleyId,
        toValleyName: visitingNeighbor.name,
        createdAt: now,
        arriveAt: now + 3000,
        resolvedAt: null,
        status: 'pending',
        seed: now,
        payload: { giveResource: resource, giveAmount: amount },
      };
      const next = resolveEventAndTickOrder(cur, order, resource, amount);
      commitValley(next);
      setIsVisitActionModalOpen(false);
      const isAr = settingsRef.current.language === 'ar';
      showToast(
        isAr
          ? `أُرسلت هدية الضيافة إلى ${visitingNeighbor.arName || visitingNeighbor.name} (+6 هيبة)!`
          : `Hospitality gift sent to ${visitingNeighbor.name} (+6 Prestige)!`
      );
    },
    [visitingNeighbor, commitValley, showToast]
  );

  const handleSendDirectTrade = useCallback(
    (
      giveRes: keyof Resources,
      giveAmt: number,
      wantRes: keyof Resources,
      wantAmt: number
    ) => {
      const cur = valleyRef.current;
      if (!visitingNeighbor || cur.resources[giveRes] < giveAmt) return;
      soundEngine.playCaravanBell();
      const now = Date.now();
      const order: Order = {
        orderId: `ord_trade_${now}`,
        type: 'trade',
        fromValleyId: cur.valleyId,
        fromValleyName: cur.name,
        toValleyId: visitingNeighbor.valleyId,
        toValleyName: visitingNeighbor.name,
        createdAt: now,
        arriveAt: now + 3000,
        resolvedAt: null,
        status: 'pending',
        seed: now,
        payload: {
          giveResource: giveRes,
          giveAmount: giveAmt,
          wantResource: wantRes,
          wantAmount: wantAmt,
        },
      };
      const next = resolveEventAndTickOrder(cur, order, giveRes, giveAmt);
      commitValley(next);
      setIsVisitActionModalOpen(false);
      const isAr = settingsRef.current.language === 'ar';
      showToast(
        isAr
          ? `انطلقت قافلة المقايضة نحو ${visitingNeighbor.arName || visitingNeighbor.name}!`
          : `Caravan dispatched to ${visitingNeighbor.name}!`
      );
    },
    [visitingNeighbor, commitValley, showToast]
  );

  const handleProposePact = useCallback(() => {
    const cur = valleyRef.current;
    if (!visitingNeighbor || cur.resources.silver < 10) return;
    soundEngine.playHarvest();
    const now = Date.now();
    const order: Order = {
      orderId: `ord_pact_${now}`,
      type: 'pact',
      fromValleyId: cur.valleyId,
      fromValleyName: cur.name,
      toValleyId: visitingNeighbor.valleyId,
      toValleyName: visitingNeighbor.name,
      createdAt: now,
      arriveAt: now - 1,
      resolvedAt: null,
      status: 'pending',
      seed: now,
      payload: {},
    };
    const next = tick(
      {
        ...cur,
        resources: { ...cur.resources, silver: cur.resources.silver - 10 },
        orders: [order, ...cur.orders],
      },
      now
    );
    commitValley(next);
    setVisitingNeighbor(
      next.neighbors.find((n) => n.valleyId === visitingNeighbor.valleyId) || null
    );
    setIsVisitActionModalOpen(false);
    const isAr = settingsRef.current.language === 'ar';
    showToast(
      isAr
        ? `تم إبرام معاهدة تاضا المقدسة مع ${visitingNeighbor.arName || visitingNeighbor.name} (+8 هيبة)!`
        : `Sealed sacred Tada Pact with ${visitingNeighbor.name} (+8 Prestige)!`
    );
  }, [visitingNeighbor, commitValley, showToast]);

  const handleSendMessage = useCallback(
    (msgKey: PresetMessageKey) => {
      const cur = valleyRef.current;
      if (!visitingNeighbor) return;
      soundEngine.playClick();
      const now = Date.now();
      const order: Order = {
        orderId: `ord_msg_${now}`,
        type: 'message',
        fromValleyId: cur.valleyId,
        fromValleyName: cur.name,
        toValleyId: visitingNeighbor.valleyId,
        toValleyName: visitingNeighbor.name,
        createdAt: now,
        arriveAt: now - 1,
        resolvedAt: null,
        status: 'pending',
        seed: now,
        payload: { presetMessage: msgKey },
      };
      const next = tick({ ...cur, orders: [order, ...cur.orders] }, now);
      commitValley(next);
      setIsVisitActionModalOpen(false);
      const isAr = settingsRef.current.language === 'ar';
      showToast(
        isAr
          ? `سلّم المبعوث رسالتك إلى مجلس جماعة ${visitingNeighbor.arName || visitingNeighbor.name}.`
          : `Envoy delivered message to ${visitingNeighbor.name}.`
      );
    },
    [visitingNeighbor, commitValley, showToast]
  );

  const handleLaunchRaid = useCallback(
    (fighters: number, arms: number) => {
      const cur = valleyRef.current;
      if (!visitingNeighbor) return;
      soundEngine.playRaidHorn();
      const now = Date.now();
      const order: Order = {
        orderId: `ord_raid_${now}`,
        type: 'raid',
        fromValleyId: cur.valleyId,
        fromValleyName: cur.name,
        toValleyId: visitingNeighbor.valleyId,
        toValleyName: visitingNeighbor.name,
        createdAt: now,
        arriveAt: now - 1,
        resolvedAt: null,
        status: 'pending',
        seed: (now % 999983) + 17,
        payload: { fighters, armsUsed: arms },
      };
      const next = tick(
        {
          ...cur,
          resources: {
            ...cur.resources,
            arms: Math.max(0, cur.resources.arms - Math.ceil(arms * 0.2)),
          },
          orders: [order, ...cur.orders],
        },
        now
      );
      commitValley(next);
      setVisitingNeighbor(
        next.neighbors.find((n) => n.valleyId === visitingNeighbor.valleyId) || null
      );
      setIsVisitActionModalOpen(false);
      const latestReport = next.reports[0];
      if (latestReport) {
        const isAr = settingsRef.current.language === 'ar';
        showToast(
          isAr
            ? `${latestReport.arTitle || latestReport.title}: ${latestReport.arSummary || latestReport.summary}`
            : `${latestReport.title}: ${latestReport.summary}`
        );
      }
    },
    [visitingNeighbor, commitValley, showToast]
  );

  const displayedBuildings = visitingNeighbor
    ? visitingNeighbor.buildings
    : valley.buildings;

  const isAr = settings.language === 'ar';

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none">
      {/* 1. Isolated Full-Viewport 3D Three.js Valley Canvas */}
      <ValleyCanvas
        lifecycleState={lifecycleState}
        season={valley.season}
        weather={valley.weather || 'clear'}
        buildings={displayedBuildings}
        roles={valley.roles}
        households={visitingNeighbor ? visitingNeighbor.households : valley.households}
        villagerRoster={valley.villagerRoster}
        territoryLevel={valley.territoryLevel || 1}
        timeSpeed={timeSpeed}
        selectedBuildType={selectedBuildType}
        buildRotation={buildRotation}
        makhzenFavor={valley.meters.makhzenFavor}
        isVisitMode={visitingNeighbor !== null}
        selectedBuildingId={selectedBuildingId}
        selectedVillagerId={selectedVillagerId}
        onPlaceBuilding={handlePlaceBuilding}
        onSelectBuilding={(id) => {
          setSelectedBuildingId(id);
          if (id) setSelectedVillagerId(null);
        }}
        onSelectVillager={(id) => {
          setSelectedVillagerId(id);
          if (id) setSelectedBuildingId(null);
        }}
        onPlacementStatusChange={setPlacementStatus}
      />

      {/* 2. Title Screen Overlay */}
      {lifecycleState === 'title' && (
        <TitleScreen
          initialAmgharName={valley.amgharName}
          initialValleyName={valley.name}
          hasSavedValley={hasSavedValley}
          language={settings.language}
          onStartGame={handleStartGame}
        />
      )}

      {/* 3. Active Playing HUD (Top Perimeter Bar + Collapsible Left 1/3 Amghar Profile Drawer + Full-Screen 1870 Map Page + Dedicated 1870 Archival Page + Bottom Dock) */}
      {lifecycleState !== 'title' && (
        <>
          <TopBar
            valley={valley}
            visitingNeighbor={visitingNeighbor}
            language={settings.language}
            isMuted={!settings.soundEnabled}
            isHudCollapsed={isHudCollapsed}
            isProfileDrawerOpen={isProfileDrawerOpen}
            isMapPageOpen={isWorldMapModalOpen}
            isArchivalPageOpen={isArchivalPageOpen}
            activeMapMode={activeMapMode}
            timeSpeed={timeSpeed}
            onToggleProfileDrawer={() => {
              soundEngine.playClick();
              setIsProfileDrawerOpen((open) => !open);
            }}
            onToggleMapPage={(mode) => {
              soundEngine.playClick();
              setIsArchivalPageOpen(false);
              if (mode) {
                setActiveMapMode(mode);
                setIsWorldMapModalOpen(true);
              } else {
                setIsWorldMapModalOpen((open) => !open);
              }
            }}
            onToggleArchivalPage={() => {
              soundEngine.playClick();
              setArchivalSection('lineage');
              setIsWorldMapModalOpen(false);
              setIsArchivalPageOpen((open) => !open);
            }}
            onSelectDockTab={(tab) => {
              soundEngine.playClick();
              setActiveTab(tab);
              setArchivalSection(tab);
              setIsWorldMapModalOpen(false);
              setIsArchivalPageOpen(true);
            }}
            onSetTimeSpeed={(spd) => {
              soundEngine.playClick();
              setTimeSpeed(spd);
            }}
            onAdvanceTime={handleAdvanceTime}
            onOpenWorldMapModal={() => {
              soundEngine.playClick();
              setIsArchivalPageOpen(false);
              setIsWorldMapModalOpen(true);
            }}
            onExitVisitMode={() => {
              setVisitingNeighbor(null);
              setIsVisitActionModalOpen(false);
            }}
            onOpenVisitActionModal={() => setIsVisitActionModalOpen(true)}
            onToggleMute={() => {
              const nextSound = !settings.soundEnabled;
              soundEngine.setMuted(!nextSound);
              const next = { ...settings, soundEnabled: nextSound };
              setSettings(next);
              saveSettings(next);
            }}
            onTogglePause={() =>
              setLifecycleState((s) => (s === 'playing' ? 'paused' : 'playing'))
            }
          />

          {/* Collapsible Left 1/3 Amghar Character & Dynasty Drawer (Opens when clicking Top-Left Profile Button) */}
          <AmgharProfileDrawer
            isOpen={isProfileDrawerOpen}
            valley={valley}
            language={settings.language}
            onClose={() => setIsProfileDrawerOpen(false)}
            onSelectTerritory={() => {
              setIsArchivalPageOpen(false);
              setActiveMapMode('topographic_1870');
              setIsWorldMapModalOpen(true);
            }}
            onOpenFullMapPage={() => {
              setIsArchivalPageOpen(false);
              setActiveMapMode('topographic_1870');
              setIsWorldMapModalOpen(true);
            }}
            onOpenArchivalPage={(pid) => {
              soundEngine.playClick();
              if (pid) setArchivalPortraitId(pid);
              setIsProfileDrawerOpen(false);
              setIsWorldMapModalOpen(false);
              setIsArchivalPageOpen(true);
            }}
            onVisitNeighbor={(neighbor) => {
              setIsProfileDrawerOpen(false);
              setIsWorldMapModalOpen(false);
              setIsArchivalPageOpen(false);
              setSelectedBuildType(null);
              setSelectedBuildingId(null);
              setVisitingNeighbor(neighbor);
              setIsVisitActionModalOpen(true);
            }}
            onArrangeMarriage={handleArrangeMarriage}
          />

          {/* Action Feedback Banner */}
          {toastMessage && (
            <div
              role="status"
              dir={isAr ? 'rtl' : 'ltr'}
              className="fixed top-16 right-4 z-50 pointer-events-none px-3.5 py-1.5 bg-[#12151a]/95 border border-[#e5c158] rounded text-xs font-medium text-[#f4ead5] shadow-xl"
            >
              {toastMessage}
            </div>
          )}

          {/* Dedicated Full-Screen 1870 Dynasty, Heirs & Territory Archival Page */}
          {isArchivalPageOpen && (
            <AmgharArchivalPage
              valley={valley}
              language={settings.language}
              settings={settings}
              initialPortraitId={archivalPortraitId}
              initialSection={archivalSection}
              selectedVillagerId={selectedVillagerId}
              selectedBuildingId={selectedBuildingId}
              onClose={() => setIsArchivalPageOpen(false)}
              onSelectVillagerIn3D={(vid) => {
                setSelectedVillagerId(vid);
                setSelectedBuildingId(null);
                setSelectedBuildType(null);
              }}
              onSelectBuildingIn3D={(bid) => {
                setSelectedBuildingId(bid);
                setSelectedVillagerId(null);
                setSelectedBuildType(null);
              }}
              onSelectBuildTypeIn3D={(bType) => {
                soundEngine.playClick();
                setSelectedBuildType(bType);
                setSelectedBuildingId(null);
                setSelectedVillagerId(null);
              }}
              onUpgradeBuilding={handleUpgradeBuilding}
              onUpdateRoles={handleUpdateRoles}
              onAcceptSoukOffer={handleAcceptSoukOffer}
              onUpdateSettings={(partial) => {
                const next = { ...settings, ...partial };
                if (partial.soundEnabled !== undefined) {
                  soundEngine.setMuted(!partial.soundEnabled);
                }
                setSettings(next);
                saveSettings(next);
              }}
              onResetValley={() => {
                const fresh = resetValleyState(valley.amgharName, valley.name);
                setValley(fresh);
                setVisitingNeighbor(null);
                showToast(
                  isAr ? 'تمت إعادة ضبط القرية إلى ربيع 1870م.' : 'Valley reset to Spring 1870.'
                );
              }}
              onTrainVillagerSkill={handleTrainVillagerSkill}
              onAssignHouseSkill={handleAssignHouseSkill}
              onArrangeMarriage={handleArrangeMarriage}
              onWelcomeNewcomer={handleWelcomeNewcomer}
              onExpandTerritory={handleExpandTerritory}
              onForageFood={handleForageFood}
              onOpenWorldMap={() => {
                setIsArchivalPageOpen(false);
                setActiveMapMode('topographic_1870');
                setIsWorldMapModalOpen(true);
              }}
              onVisitNeighbor={(neighbor) => {
                setIsArchivalPageOpen(false);
                setSelectedBuildType(null);
                setSelectedBuildingId(null);
                setVisitingNeighbor(neighbor);
                setIsVisitActionModalOpen(true);
              }}
            />
          )}

          {/* Dedicated Full-Screen 1870 Morocco Strategy Map Page */}
          {isWorldMapModalOpen && (
            <WorldAndPoliticalMaps
              valley={valley}
              language={settings.language}
              isDrawerOpen={isProfileDrawerOpen}
              activeMapMode={activeMapMode}
              onSelectMapMode={setActiveMapMode}
              onClose={() => setIsWorldMapModalOpen(false)}
              onSelectBuildingId={(id) => {
                setSelectedBuildingId(id);
                setIsWorldMapModalOpen(false);
              }}
              onVisitNeighbor={(neighbor) => {
                setIsWorldMapModalOpen(false);
                setSelectedBuildType(null);
                setSelectedBuildingId(null);
                setVisitingNeighbor(neighbor);
                setIsVisitActionModalOpen(true);
              }}
              onExpandTerritory={handleExpandTerritory}
              onTriggerMonthlyEvent={() => {
                setIsWorldMapModalOpen(false);
                const evt = pickMonthlyEvent(valley);
                commitValley({ ...valley, activeEvent: evt });
              }}
              onTriggerMahalla={() => {
                setIsWorldMapModalOpen(false);
                const evt = buildMahallaEvent(valley);
                commitValley({ ...valley, activeEvent: evt });
              }}
            />
          )}

          {/* Minimalist Bottom Village Dock (Hidden when on the dedicated Full-Screen 1870 Map or Archival Page) */}
          {!isWorldMapModalOpen && !isArchivalPageOpen && (
            <BottomDock
              valley={valley}
              activeTab={activeTab}
              isCollapsed={isHudCollapsed}
              selectedBuildType={selectedBuildType}
              buildRotation={buildRotation}
              selectedBuildingId={selectedBuildingId}
              selectedVillagerId={selectedVillagerId}
              placementStatus={placementStatus}
              visitingNeighbor={visitingNeighbor}
              settings={settings}
              onSelectTab={(tab) => {
                soundEngine.playClick();
                setActiveTab(tab);
                setIsHudCollapsed(false);
              }}
              onToggleCollapse={() => {
                soundEngine.playClick();
                setIsHudCollapsed((c) => !c);
              }}
              onSelectBuildType={(type) => {
                soundEngine.playClick();
                setSelectedBuildType(type);
                if (type) {
                  setSelectedBuildingId(null);
                  setSelectedVillagerId(null);
                }
              }}
              onSelectBuildingId={(id) => {
                soundEngine.playClick();
                setSelectedBuildingId(id);
                if (id) {
                  setSelectedBuildType(null);
                  setSelectedVillagerId(null);
                }
              }}
              onSelectVillagerId={(id) => {
                soundEngine.playClick();
                setSelectedVillagerId(id);
                if (id) {
                  setSelectedBuildType(null);
                  setSelectedBuildingId(null);
                }
              }}
              onOpenArchivalPage={(pid, section) => {
                soundEngine.playClick();
                if (pid) setArchivalPortraitId(pid);
                if (section) setArchivalSection(section);
                else setArchivalSection('lineage');
                setIsWorldMapModalOpen(false);
                setIsArchivalPageOpen(true);
              }}
              onAssignHouseSkill={handleAssignHouseSkill}
              onRotateBuilding={() => {
                soundEngine.playClick();
                setBuildRotation((r) => (r + Math.PI / 2) % (Math.PI * 2));
              }}
              onUpgradeBuilding={handleUpgradeBuilding}
              onUpdateRoles={handleUpdateRoles}
              onForageFood={handleForageFood}
              onWelcomeNewcomer={handleWelcomeNewcomer}
              onArrangeMarriage={handleArrangeMarriage}
              onTrainVillagerSkill={handleTrainVillagerSkill}
              onExpandTerritory={handleExpandTerritory}
              onTriggerMonthlyEvent={() => {
                soundEngine.playClick();
                const evt = pickMonthlyEvent(valley);
                commitValley({ ...valley, activeEvent: evt });
              }}
              onTriggerMahalla={() => {
                soundEngine.playRaidHorn();
                const evt = buildMahallaEvent(valley);
                commitValley({ ...valley, activeEvent: evt });
              }}
              onVisitNeighbor={(neighbor) => {
                soundEngine.playClick();
                setSelectedBuildType(null);
                setSelectedBuildingId(null);
                setIsWorldMapModalOpen(false);
                setVisitingNeighbor(neighbor);
                setIsVisitActionModalOpen(true);
                if (valley.tutorialStep === 3) {
                  commitValley({ ...valley, tutorialStep: 99 });
                }
              }}
              onAcceptSoukOffer={handleAcceptSoukOffer}
              onMarkReportsRead={() => {
                const marked = valley.reports.map((r) => ({ ...r, read: true }));
                commitValley({ ...valley, reports: marked });
              }}
              onUpdateSettings={(partial) => {
                const next = { ...settings, ...partial };
                if (partial.soundEnabled !== undefined) {
                  soundEngine.setMuted(!partial.soundEnabled);
                }
                setSettings(next);
                saveSettings(next);
              }}
              onResetValley={() => {
                const fresh = resetValleyState(valley.amgharName, valley.name);
                setValley(fresh);
                setVisitingNeighbor(null);
                showToast(
                  isAr ? 'تمت إعادة ضبط القرية إلى ربيع 1870م.' : 'Valley reset to Spring 1870.'
                );
              }}
            />
          )}
        </>
      )}

      {/* 5. Full-Screen D3.js Module Dependency & Data Flow Modal */}
      {isArchitectureModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="D3.js Module Dependency Graph"
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="w-full max-w-5xl bg-[#18110c] border-2 border-[#c87d32] rounded-md p-4 shadow-2xl">
            <ArchitectureGraphView
              valley={valley}
              isModal={true}
              onClose={() => setIsArchitectureModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 6. Event Card & Mahalla Tribute Decision Modal */}
      {lifecycleState === 'playing' && valley.activeEvent && (
        <EventModal
          valley={valley}
          event={valley.activeEvent}
          language={settings.language}
          onChoose={handleResolveEvent}
        />
      )}

      {/* 7. Neighbor Visit Action Modal */}
      {lifecycleState === 'playing' && visitingNeighbor && isVisitActionModalOpen && (
        <NeighborActionModal
          valley={valley}
          neighbor={visitingNeighbor}
          language={settings.language}
          onClose={() => setIsVisitActionModalOpen(false)}
          onSendGift={handleSendGift}
          onSendTrade={handleSendDirectTrade}
          onProposePact={handleProposePact}
          onSendMessage={handleSendMessage}
          onLaunchRaid={handleLaunchRaid}
          onBlockNeighbor={(valleyId) => {
            const nextSettings = {
              ...settings,
              blockedValleyIds: [...settings.blockedValleyIds, valleyId],
            };
            setSettings(nextSettings);
            saveSettings(nextSettings);
            setVisitingNeighbor(null);
            showToast(isAr ? 'تمت إضافة القبيلة إلى قائمة الحظر.' : 'Tribe added to block list.');
          }}
        />
      )}

      {/* 8. Pause / Victory / Game Over Modal */}
      {(lifecycleState === 'paused' || lifecycleState === 'gameover') && (
        <StatusModal
          mode={lifecycleState}
          isVictory={valley.isQaid || valley.meters.prestige >= 50}
          valley={valley}
          language={settings.language}
          onResume={() => setLifecycleState('playing')}
          onRestart={() => {
            const fresh = resetValleyState(valley.amgharName, valley.name);
            setValley(fresh);
            setLifecycleState('playing');
          }}
          onReturnTitle={() => setLifecycleState('title')}
        />
      )}
    </main>
  );
}

function resolveEventAndTickOrder(
  cur: ValleyState,
  order: Order,
  deductRes: keyof Resources,
  deductAmt: number
): ValleyState {
  const now = Date.now();
  const immediateOrder = { ...order, arriveAt: now - 1 };
  return tick(
    {
      ...cur,
      resources: {
        ...cur.resources,
        [deductRes]: Math.max(0, cur.resources[deductRes] - deductAmt),
      },
      orders: [immediateOrder, ...cur.orders],
    },
    now
  );
}
