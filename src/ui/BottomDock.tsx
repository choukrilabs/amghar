import React, { useEffect, useState } from 'react';
import {
  BUILDINGS_CONFIG,
  SEASON_INFO,
  UI_TRANSLATIONS,
} from '../game/config';
import { canAffordCost, formatTifinaghHistoricalDate, getUpgradeCost } from '../game/tick';
import {
  BuildingType,
  GameSettings,
  NeighborValley,
  PopulationRoles,
  SoukOffer,
  ValleyState,
} from '../game/types';
import {
  createInitialVillagerRoster,
  deriveLivingVillagers,
  FAMILY_LINEAGES,
  inspectBuildingEconomics,
} from '../game/villagers';
import {
  ArchivalPortraitAvatar,
  ArchivalPortraitId,
  getVillagerArchivalPortraitId,
} from './ArchivalPortraits';
import { BuildingIcon, ResourceIcon } from './Icons';

export type DockTab =
  | 'build'
  | 'population'
  | 'region'
  | 'souk'
  | 'reports'
  | 'notes';

export type ArchivalManagementSection =
  | DockTab
  | 'lineage'
  | 'houses'
  | 'archival_plate';

export interface BottomDockProps {
  valley: ValleyState;
  activeTab: DockTab;
  isCollapsed: boolean;
  selectedBuildType: BuildingType | null;
  buildRotation: number;
  selectedBuildingId: string | null;
  selectedVillagerId?: string | null;
  placementStatus: { valid: boolean; reason?: string; arReason?: string } | null;
  visitingNeighbor: NeighborValley | null;
  settings: GameSettings;
  onSelectTab: (tab: DockTab) => void;
  onToggleCollapse: () => void;
  onSelectBuildType: (type: BuildingType | null) => void;
  onSelectBuildingId: (id: string | null) => void;
  onSelectVillagerId?: (id: string | null) => void;
  onOpenArchivalPage?: (
    portraitId?: ArchivalPortraitId,
    section?: ArchivalManagementSection
  ) => void;
  onAssignHouseSkill: (buildingId: string, skill: keyof PopulationRoles) => void;
  onRotateBuilding: () => void;
  onUpgradeBuilding: (buildingId: string) => void;
  onUpdateRoles: (roles: PopulationRoles) => void;
  onForageFood: () => void;
  onWelcomeNewcomer: () => void;
  onArrangeMarriage?: () => void;
  onTrainVillagerSkill?: (villagerId: string) => void;
  onExpandTerritory: () => void;
  onTriggerMonthlyEvent: () => void;
  onTriggerMahalla: () => void;
  onVisitNeighbor: (neighbor: NeighborValley) => void;
  onAcceptSoukOffer: (offer: SoukOffer) => void;
  onMarkReportsRead: () => void;
  onUpdateSettings: (next: Partial<GameSettings>) => void;
  onResetValley: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  valley,
  activeTab,
  selectedBuildType,
  buildRotation,
  selectedBuildingId,
  selectedVillagerId,
  placementStatus,
  visitingNeighbor,
  settings,
  onSelectTab,
  onSelectBuildType,
  onSelectBuildingId,
  onSelectVillagerId,
  onOpenArchivalPage,
  onAssignHouseSkill,
  onRotateBuilding,
  onUpgradeBuilding,
  onForageFood,
  onTrainVillagerSkill,
  onMarkReportsRead,
}) => {
  const [liveNow, setLiveNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAr = settings.language === 'ar';
  const t = UI_TRANSLATIONS[settings.language];
  const unreadReports = valley.reports.filter((r) => !r.read).length;
  const selectedBuilding = valley.buildings.find((b) => b.id === selectedBuildingId) || null;
  const sInfo = SEASON_INFO[valley.season] || SEASON_INFO.spring;
  const dateInfo = formatTifinaghHistoricalDate(valley, liveNow);

  const roster =
    valley.villagerRoster && valley.villagerRoster.length > 0
      ? valley.villagerRoster
      : createInitialVillagerRoster();
  const livingVillagers = deriveLivingVillagers(
    valley.buildings,
    valley.roles,
    valley.households,
    roster
  );
  const selectedVillagerAgent =
    livingVillagers.find((v) => v.id === selectedVillagerId) || null;

  const openDedicatedSection = (
    section: ArchivalManagementSection,
    portraitId: ArchivalPortraitId = 'amghar'
  ) => {
    if (section === 'reports') {
      onMarkReportsRead();
    }
    if (
      section === 'build' ||
      section === 'population' ||
      section === 'region' ||
      section === 'souk' ||
      section === 'reports' ||
      section === 'notes'
    ) {
      onSelectTab(section);
    }
    if (onOpenArchivalPage) {
      onOpenArchivalPage(portraitId, section);
    }
  };

  return (
    <div
      className="fixed bottom-3 left-3 z-10 pointer-events-none w-[calc(100vw-460px)] max-w-[830px] flex flex-col items-start gap-1"
      dir={t.dir}
    >
      {/* 1. Selected Element 1 (div:nth-of-type(1)): Decorative Tifinagh-Styled Real-Time AD & AH Date Ticker + Contextual 3D Inspector Strip */}
      <div className="pointer-events-auto w-full bg-gradient-to-b from-[#2b1a0e]/95 to-[#1c1109]/95 border border-[#a87b4c] rounded px-2.5 py-1 shadow-2xl flex flex-col gap-1">
        <div
          role="timer"
          aria-label="BottomDock Decorative Tifinagh Real-Time AD and AH Date Ticker"
          className="w-full flex items-center justify-between gap-2 text-[11px] overflow-x-auto"
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-sm bg-[#4d2c16] border border-[#c8a464]/60 text-[#e5c158] font-mono font-bold text-[10px] tracking-wider whitespace-nowrap">
              {dateInfo.tifinaghTicker}
            </span>
            <span className="font-mono-num font-bold text-[#f5ebd6] whitespace-nowrap">
              {isAr ? dateInfo.formattedAr : dateInfo.formattedEn}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#e8d8b7] shrink-0 whitespace-nowrap">
            <span className="font-semibold">
              {isAr ? sInfo.arName : sInfo.name} ·{' '}
              {isAr ? `يوم ${valley.dayInSeason}/30` : `Day ${valley.dayInSeason}/30`}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#12151a] border border-[#c8a464]/45 font-mono-num text-[#e5c158] font-bold">
              {dateInfo.liveSolarClock}
            </span>
          </div>
        </div>

        {/* Active 3D Placement Pill (only shown when placing a building on the 3D terrain) */}
        {selectedBuildType && !visitingNeighbor && (
          <div className="px-2.5 py-1 bg-[#f2e5c9] border border-[#6e2219] rounded-sm flex flex-wrap items-center justify-between gap-2 text-xs text-[#2b180a]">
            <div className="flex items-center gap-2">
              <BuildingIcon type={selectedBuildType} className="w-4 h-4 shrink-0" />
              <span className="font-bold text-[#6e2219]">
                {isAr
                  ? `وضع البناء في الوادي: ${BUILDINGS_CONFIG[selectedBuildType].arName}`
                  : `Placing in 3D Valley: ${BUILDINGS_CONFIG[selectedBuildType].name}`}
              </span>
              {placementStatus && (
                <span
                  className={
                    placementStatus.valid
                      ? 'text-[#14532d] font-semibold'
                      : 'text-[#991b1b] font-semibold'
                  }
                >
                  ·{' '}
                  {placementStatus.valid
                    ? isAr
                      ? 'موقع صالح (اضغط للبناء)'
                      : 'Valid site (Click to place)'
                    : isAr
                    ? placementStatus.arReason || placementStatus.reason
                    : placementStatus.reason}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRotateBuilding}
                className="px-2 py-0.5 bg-[#4d2c16] text-[#f5ebd6] rounded-sm cursor-pointer font-semibold"
              >
                {isAr ? 'تدوير [R]' : 'Rotate [R]'} ({Math.round((buildRotation * 180) / Math.PI)}°)
              </button>
              <button
                type="button"
                onClick={() => onSelectBuildType(null)}
                className="px-2 py-0.5 bg-[#7c2d12] text-[#fef3c7] rounded-sm cursor-pointer font-semibold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Compact Clicked 3D Building Inspector Strip (only shown when clicking a house/building in the 3D scene) */}
        {selectedBuilding && !selectedBuildType && !visitingNeighbor && (() => {
          const report = inspectBuildingEconomics(valley, selectedBuilding, settings.language);
          const upCost =
            selectedBuilding.level < 3
              ? getUpgradeCost(selectedBuilding.type, selectedBuilding.level + 1)
              : null;
          const affordable = upCost ? canAffordCost(valley.resources, upCost) : false;

          return (
            <div
              role="region"
              aria-label="Interactive House and Building Inspector"
              className="w-full bg-[#f5ebd6] border border-[#5c3a1b] rounded-sm px-2.5 py-1.5 text-xs text-[#2b180a] flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <BuildingIcon type={selectedBuilding.type} className="w-5 h-5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-[#2b180a]">
                      {report.buildingName} ({isAr ? `م${selectedBuilding.level}` : `L${selectedBuilding.level}`})
                    </span>
                    <span className="text-[#14532d] font-semibold text-[11px]">
                      {report.productionItems.map((p) => `${p.label}: ${p.amountText}`).join(' · ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5c3e21]">
                    {report.consumptionItems.map((c) => `${c.label}: ${c.amountText}`).join(' · ')} ·{' '}
                    <span className="font-semibold text-[#2b180a]">{report.residentSummary}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { key: 'farmers', en: 'Farmer', ar: 'فلاحة' },
                    { key: 'shepherds', en: 'Shepherd', ar: 'رعي' },
                    { key: 'builders', en: 'Builder', ar: 'بناء' },
                    { key: 'artisans', en: 'Weaver', ar: 'نسيج' },
                    { key: 'guards', en: 'Guard', ar: 'حراسة' },
                  ] as Array<{ key: keyof PopulationRoles; en: string; ar: string }>
                ).map((sk) => (
                  <button
                    key={sk.key}
                    type="button"
                    onClick={() => onAssignHouseSkill(selectedBuilding.id, sk.key)}
                    className={`px-1.5 py-0.5 rounded-sm text-[10px] cursor-pointer ${
                      report.skillRole === sk.key
                        ? 'bg-[#6e2219] text-[#f8f1e0] font-bold'
                        : 'bg-[#dfcca4] text-[#2b180a] border border-[#8c6742]/60'
                    }`}
                  >
                    {isAr ? sk.ar : sk.en}
                  </button>
                ))}

                {upCost && (
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => onUpgradeBuilding(selectedBuilding.id)}
                    className={`px-2 py-0.5 rounded-sm font-bold text-[10px] cursor-pointer ${
                      affordable
                        ? 'bg-[#15803d] text-[#f8f1e0]'
                        : 'bg-[#b8a582] text-[#6e5c42] cursor-not-allowed'
                    }`}
                  >
                    {isAr ? `ترقية (م${selectedBuilding.level + 1})` : `Upgrade (L${selectedBuilding.level + 1})`}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openDedicatedSection('houses', 'village_laborer')}
                  className="px-2 py-0.5 bg-[#4d2c16] text-[#f5ebd6] rounded-sm font-semibold text-[10px] cursor-pointer"
                >
                  {isAr ? '📜 إدارة في الصفحة' : '📜 Manage in Page'}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectBuildingId(null)}
                  className="px-1.5 py-0.5 bg-[#4d2c16] text-[#f5ebd6] rounded-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })()}

        {/* Compact Clicked 3D Villager Inspector Strip */}
        {selectedVillagerAgent && !selectedBuildType && !visitingNeighbor && (() => {
          const lineage = FAMILY_LINEAGES[selectedVillagerAgent.lineageId];
          const portraitId = getVillagerArchivalPortraitId(selectedVillagerAgent);
          return (
            <div
              role="region"
              aria-label="Interactive Villager Inspector"
              className="w-full bg-[#f5ebd6] border border-[#6e2219] rounded-sm px-2.5 py-1 text-xs text-[#2b180a] flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <ArchivalPortraitAvatar
                  portraitId={portraitId}
                  shape="square"
                  className="w-8 h-9 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-xs text-[#2b180a]">
                      {isAr ? selectedVillagerAgent.arName : selectedVillagerAgent.name}
                    </span>
                    <span className="text-[10px] text-[#5c3e21]">
                      ({selectedVillagerAgent.age} {isAr ? 'سنة' : 'yrs'})
                    </span>
                    <span
                      className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold text-[#f4ead5]"
                      style={{ backgroundColor: lineage.badgeColor }}
                    >
                      {isAr ? lineage.arName : lineage.name} · ★{selectedVillagerAgent.skillLevel}/5
                    </span>
                  </div>
                  <div className="text-[#14532d] font-semibold text-[10px]">
                    {isAr ? selectedVillagerAgent.arHabitLabel : selectedVillagerAgent.habitLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedVillagerAgent.skillLevel < 5 && onTrainVillagerSkill && (
                  <button
                    type="button"
                    onClick={() => onTrainVillagerSkill(selectedVillagerAgent.id)}
                    className="px-2 py-0.5 bg-[#6e2219] text-[#f8f1e0] font-bold rounded-sm cursor-pointer text-[10px]"
                  >
                    {isAr ? '+ تدريب المهارة' : '+ Train Skill'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openDedicatedSection('population', portraitId)}
                  className="px-2 py-0.5 bg-[#4d2c16] text-[#f5ebd6] font-bold rounded-sm cursor-pointer text-[10px]"
                >
                  {isAr ? '📜 عرض في صفحة السلالة' : '📜 View in Dynasty Page'}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectVillagerId && onSelectVillagerId(null)}
                  className="px-1.5 py-0.5 bg-[#4d2c16] text-[#f5ebd6] rounded-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 2. Selected Element 2 (div:nth-of-type(2)): Clean Buttons-Only Bar to Open the Dedicated Management Page */}
      <div className="pointer-events-auto w-full bg-gradient-to-b from-[#332012]/96 to-[#21140b]/96 border border-[#8c6239] rounded px-2 py-1 flex items-center justify-between gap-1.5 shadow-2xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: 'build', label: t.build, icon: '🏗️' },
              { id: 'population', label: t.population, icon: '👥' },
              { id: 'region', label: t.regionMap, icon: '🗺️' },
              { id: 'souk', label: t.souk, icon: '🐪' },
              { id: 'reports', label: t.reports, badge: unreadReports, icon: '✉️' },
              { id: 'notes', label: t.notes, icon: '⚙️' },
            ] as Array<{ id: DockTab; label: string; badge?: number; icon: string }>
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => openDedicatedSection(tab.id, 'amghar')}
                className={`px-2 py-1 rounded-sm text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 border ${
                  isActive
                    ? 'bg-gradient-to-b from-[#e8d8b7] to-[#cbb282] text-[#26160a] border-[#5c3a1b] shadow-sm'
                    : 'bg-[#2a1a0e] text-[#dfd1b8] border-[#6b492a]/60 hover:bg-[#3d2615]'
                }`}
              >
                <span className="text-[10px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="font-mono-num text-[9px] font-bold px-1 rounded bg-[#7c2d12] text-[#f4ead5]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated 1870 Archival Dynasty & People Page Button + Quick Forage */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openDedicatedSection('lineage', 'amghar')}
            className="px-2 py-1 bg-gradient-to-b from-[#7c2d12] to-[#571d0b] hover:from-[#9a3412] border border-[#d4af37] text-[#fef3c7] font-bold text-[11px] rounded-sm flex items-center gap-1 cursor-pointer whitespace-nowrap shadow"
          >
            <span>📜</span>
            <span>{isAr ? 'سجل السلالة والأهل' : 'Dynasty & People Page'}</span>
          </button>
          <button
            type="button"
            onClick={onForageFood}
            className="px-2 py-1 bg-gradient-to-b from-[#4a3219] to-[#2e1e0f] hover:from-[#5c3e20] border border-[#a87b4c] text-[#f5ebd6] font-semibold text-[11px] rounded-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <ResourceIcon type="walnuts" className="w-3.5 h-3.5" />
            <span>{isAr ? 'جمع الغذاء' : 'Forage'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

