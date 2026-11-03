import React from 'react';
import {
  BUILDING_LIST,
  BUILDINGS_CONFIG,
  RESOURCE_ARABIC_LABELS,
  SEASON_INFO,
  UI_TRANSLATIONS,
} from '../game/config';
import { canAffordCost, getUpgradeCost } from '../game/tick';
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
import { BuildingIcon, ResourceIcon } from './Icons';

export type DockTab =
  | 'build'
  | 'population'
  | 'region'
  | 'souk'
  | 'reports'
  | 'notes';

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
  isCollapsed,
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
  onAssignHouseSkill,
  onRotateBuilding,
  onUpgradeBuilding,
  onUpdateRoles,
  onForageFood,
  onWelcomeNewcomer,
  onArrangeMarriage,
  onTrainVillagerSkill,
  onVisitNeighbor,
  onAcceptSoukOffer,
  onMarkReportsRead,
  onUpdateSettings,
  onResetValley,
}) => {
  const isAr = settings.language === 'ar';
  const t = UI_TRANSLATIONS[settings.language];
  const unreadReports = valley.reports.filter((r) => !r.read).length;
  const selectedBuilding = valley.buildings.find((b) => b.id === selectedBuildingId) || null;

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

  const adjustRole = (role: keyof PopulationRoles, delta: number) => {
    const next = { ...valley.roles };
    if (delta > 0) {
      const donors: Array<keyof PopulationRoles> = [
        'farmers',
        'builders',
        'shepherds',
        'artisans',
        'guards',
      ];
      const donor = donors.find((d) => d !== role && next[d] > 0);
      if (!donor) return;
      next[donor] -= 1;
      next[role] += 1;
      onUpdateRoles(next);
    } else if (delta < 0 && next[role] > 0) {
      next[role] -= 1;
      const receiver: keyof PopulationRoles = role === 'farmers' ? 'builders' : 'farmers';
      next[receiver] += 1;
      onUpdateRoles(next);
    }
  };

  return (
    <div
      className="fixed bottom-3 left-3 z-10 pointer-events-none w-[calc(100vw-395px)] max-w-[740px] flex flex-col items-start"
      dir={t.dir}
    >
      {/* 1. Compact Placement Helper Pill */}
      {selectedBuildType && !visitingNeighbor && (
        <div className="pointer-events-auto mb-2 px-3.5 py-1.5 bg-[#12151a]/92 backdrop-blur-md border border-[#a68956]/40 rounded flex flex-wrap items-center gap-3 text-xs shadow-xl">
          <BuildingIcon type={selectedBuildType} className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-[#e5c158]">
            {isAr
              ? `بناء: ${BUILDINGS_CONFIG[selectedBuildType].arName}`
              : `Placing: ${BUILDINGS_CONFIG[selectedBuildType].name}`}
          </span>
          {placementStatus && (
            <span className={placementStatus.valid ? 'text-[#34d399]' : 'text-[#f87171]'}>
              ·{' '}
              {placementStatus.valid
                ? isAr
                  ? 'موقع صالح'
                  : 'Valid site'
                : isAr
                ? placementStatus.arReason || placementStatus.reason
                : placementStatus.reason}
            </span>
          )}
          <button
            type="button"
            onClick={onRotateBuilding}
            className="px-2 py-0.5 bg-[#1b2028] hover:bg-[#262d38] border border-[#a68956]/35 rounded text-[#f4ead5] cursor-pointer"
          >
            {isAr ? 'تدوير [R]' : 'Rotate [R]'} ({Math.round((buildRotation * 180) / Math.PI)}°)
          </button>
          <button
            type="button"
            onClick={() => onSelectBuildType(null)}
            className="px-2 py-0.5 bg-[#3b1a1a] hover:bg-[#522323] rounded text-[#fca5a5] cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      )}

      {/* 2. Clean Compact Building / House Inspector Bar */}
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
            className="pointer-events-auto mb-2 w-full bg-[#12151a]/92 backdrop-blur-md border border-[#a68956]/45 rounded px-3.5 py-2.5 text-xs shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <BuildingIcon type={selectedBuilding.type} className="w-6 h-6 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-[#e5c158]">
                    {report.buildingName} ({isAr ? `م${selectedBuilding.level}` : `L${selectedBuilding.level}`})
                  </span>
                  <span className="text-[#34d399] text-[11px]">
                    {report.productionItems.map((p) => `${p.label}: ${p.amountText}`).join(' · ')}
                  </span>
                </div>
                <div className="text-[11px] text-[#9ca3af] flex flex-wrap items-center gap-2 mt-0.5">
                  <span>
                    {report.consumptionItems.map((c) => `${c.label}: ${c.amountText}`).join(' · ')}
                  </span>
                  <span>·</span>
                  <span className="text-[#e8dfd1]">{report.residentSummary}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
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
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    report.skillRole === sk.key
                      ? 'bg-[#c8a464] text-[#12151a] font-bold'
                      : 'bg-[#1b2028] text-[#d6cbb9] hover:bg-[#262d38]'
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
                  className={`px-2.5 py-1 rounded font-semibold cursor-pointer ms-1 ${
                    affordable
                      ? 'bg-[#34d399] text-[#0b130e]'
                      : 'bg-[#1c2026] text-[#6b7280] cursor-not-allowed'
                  }`}
                >
                  {isAr ? `ترقية (م${selectedBuilding.level + 1})` : `Upgrade (L${selectedBuilding.level + 1})`}
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectBuildingId(null)}
                className="px-2 py-1 bg-[#1b2028] hover:bg-[#2a313d] text-[#e8dfd1] rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })()}

      {/* 2B. Compact Villager Inspector Bar */}
      {selectedVillagerAgent && !selectedBuildType && !visitingNeighbor && (() => {
        const lineage = FAMILY_LINEAGES[selectedVillagerAgent.lineageId];
        return (
          <div
            role="region"
            aria-label="Interactive Villager Inspector"
            className="pointer-events-auto mb-2 w-full bg-[#12151a]/92 backdrop-blur-md border border-[#34d399]/50 rounded px-3.5 py-2 text-xs shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-sm text-[#e5c158]">
                {isAr ? selectedVillagerAgent.arName : selectedVillagerAgent.name}
              </span>
              <span className="text-[#9ca3af]">
                ({selectedVillagerAgent.age} {isAr ? 'سنة' : 'yrs'})
              </span>
              <span
                className="px-2 py-0.5 rounded text-[11px] font-semibold text-[#f4ead5]"
                style={{ backgroundColor: lineage.badgeColor }}
              >
                {isAr ? lineage.arName : lineage.name} · ★{selectedVillagerAgent.skillLevel}/5
              </span>
              <span className="text-[#34d399] text-[11px]">
                {isAr ? selectedVillagerAgent.arHabitLabel : selectedVillagerAgent.habitLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedVillagerAgent.skillLevel < 5 && onTrainVillagerSkill && (
                <button
                  type="button"
                  onClick={() => onTrainVillagerSkill(selectedVillagerAgent.id)}
                  className="px-2.5 py-1 bg-[#c8a464] hover:bg-[#dab776] text-[#12151a] font-semibold rounded cursor-pointer text-[11px]"
                >
                  {isAr ? '+ تدريب المهارة' : '+ Train Skill'}
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectVillagerId && onSelectVillagerId(null)}
                className="px-2 py-1 bg-[#1b2028] hover:bg-[#2a313d] text-[#e8dfd1] rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })()}

      {/* 3. Minimalist Dark Slate Tab Bar */}
      <div className="pointer-events-auto w-full bg-[#12151a]/90 backdrop-blur-md border border-[#a68956]/35 rounded-t px-3 py-1.5 flex items-center justify-between gap-2 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'build', label: t.build },
              { id: 'population', label: t.population },
              { id: 'region', label: t.regionMap },
              { id: 'souk', label: t.souk },
              { id: 'reports', label: t.reports, badge: unreadReports },
              { id: 'notes', label: t.notes },
            ] as Array<{ id: DockTab; label: string; badge?: number }>
          ).map((tab) => {
            const isActive = activeTab === tab.id && !isCollapsed;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'reports') onMarkReportsRead();
                  onSelectTab(tab.id);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#c8a464] text-[#12151a] font-semibold'
                    : 'text-[#d6cbb9] hover:bg-[#1c2129]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="font-mono-num text-[10px] font-bold px-1.5 rounded bg-[#7c2d12] text-[#f4ead5]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Simple Quick Forage Button right in the dock header */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onForageFood}
            className="px-2.5 py-1 bg-[#1b2028] hover:bg-[#252c37] border border-[#a68956]/35 text-[#e5c158] font-semibold text-xs rounded flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <ResourceIcon type="walnuts" className="w-3.5 h-3.5" />
            <span>{isAr ? 'جمع الغذاء' : 'Forage'}</span>
          </button>
        </div>
      </div>

      {/* 4. Clean, Uncluttered Dark Slate Content Drawer */}
      {!isCollapsed && (
        <div className="pointer-events-auto w-full bg-[#111419]/92 backdrop-blur-md border-x border-b border-[#a68956]/35 rounded-b p-2.5 overflow-y-auto shadow-2xl max-h-[165px]">
          {/* TAB 1: CLEAN BUILD CARDS */}
          {activeTab === 'build' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {BUILDING_LIST.map((bDef) => {
                const cost = bDef.baseCost;
                const affordable = canAffordCost(valley.resources, cost);
                const favorMet =
                  !bDef.minMakhzenFavor || valley.meters.makhzenFavor >= bDef.minMakhzenFavor;
                const count = valley.buildings.filter((b) => b.type === bDef.type).length;
                const isSelected = selectedBuildType === bDef.type;

                return (
                  <button
                    key={bDef.type}
                    type="button"
                    onClick={() => onSelectBuildType(isSelected ? null : bDef.type)}
                    className={`text-start p-2 rounded border transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#36261a] border-[#f0b429]'
                        : affordable && favorMet
                        ? 'bg-[#221811] hover:bg-[#2d2017] border-[#c87d32]/40'
                        : 'bg-[#17100c] border-[#523a28]/40 opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BuildingIcon type={bDef.type} className="w-6 h-6 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-[#f4ead5] truncate">
                            {isAr ? bDef.arName : bDef.name}
                          </span>
                          <span className="font-mono-num text-[10px] text-[#d4a359]">×{count}</span>
                        </div>
                        <div className="text-[10px] text-[#b89f80] truncate">
                          {isAr ? bDef.arEffectText : bDef.effectText}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-[#c87d32]/20 font-mono-num text-[10px] text-[#e6d5b8] flex flex-wrap gap-x-2">
                      {cost.earth > 0 && <span>{cost.earth}{isAr ? ' طين' : 'E'}</span>}
                      {cost.timber > 0 && <span>{cost.timber}{isAr ? ' خشب' : 'T'}</span>}
                      {cost.stone > 0 && <span>{cost.stone}{isAr ? ' حجر' : 'S'}</span>}
                      {cost.silver > 0 && <span>{cost.silver}{isAr ? ' فضة' : 'Ag'}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: SIMPLE VILLAGERS & ROLE DISTRIBUTION */}
          {activeTab === 'population' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              {/* Role Assignment */}
              <div className="md:col-span-5 bg-[#221811] border border-[#c87d32]/40 rounded p-2.5 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#f0b429]">
                    {isAr ? 'توزيع الحرف في القرية' : 'Village Roles'}
                  </span>
                  <div className="flex items-center gap-1">
                    {onArrangeMarriage && (
                      <button
                        type="button"
                        onClick={onArrangeMarriage}
                        className="px-2 py-0.5 bg-[#831843] hover:bg-[#9d174d] text-[#f4ead5] rounded text-[10px] cursor-pointer"
                      >
                        {isAr ? '💍 زواج السلالات' : '💍 Marriage'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onWelcomeNewcomer}
                      className="px-2 py-0.5 bg-[#15803d] hover:bg-[#16a34a] text-[#f4ead5] rounded text-[10px] cursor-pointer"
                    >
                      {isAr ? '+ أسرة وافدة' : '+ New Family'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(
                    [
                      { key: 'farmers', label: isAr ? 'المزارعون' : 'Farmers' },
                      { key: 'shepherds', label: isAr ? 'الرعاة' : 'Shepherds' },
                      { key: 'builders', label: isAr ? 'البنّاؤون' : 'Builders' },
                      { key: 'guards', label: isAr ? 'الحراس' : 'Guards' },
                      { key: 'artisans', label: isAr ? 'الحرفيون' : 'Artisans' },
                    ] as Array<{ key: keyof PopulationRoles; label: string }>
                  ).map((r) => (
                    <div
                      key={r.key}
                      className="bg-[#16100b] border border-[#c87d32]/25 rounded px-2 py-1 flex items-center justify-between"
                    >
                      <span className="text-[#e6d5b8] text-[11px]">{r.label}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Decrease ${r.label}`}
                          onClick={() => adjustRole(r.key, -1)}
                          className="w-4 h-4 bg-[#2e2118] rounded text-[#f4ead5] flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono-num font-bold text-[#f0b429] w-4 text-center">
                          {valley.roles[r.key]}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${r.label}`}
                          onClick={() => adjustRole(r.key, 1)}
                          className="w-4 h-4 bg-[#c87d32] text-[#18120e] font-bold rounded flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clean Villager Cards */}
              <div className="md:col-span-7 bg-[#221811] border border-[#c87d32]/40 rounded p-2.5">
                <div className="text-[11px] font-semibold text-[#f0b429] mb-1.5">
                  {isAr
                    ? `أهل القرية الأحياء (${roster.length} فرداً — اضغط على أي شخص لتحديد موقعه):`
                    : `Living Villagers (${roster.length} — Click to locate in 3D):`}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {livingVillagers
                    .filter((v) => !v.isNewcomer)
                    .map((v) => {
                      const lin = FAMILY_LINEAGES[v.lineageId];
                      const isSelected = selectedVillagerId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => onSelectVillagerId && onSelectVillagerId(isSelected ? null : v.id)}
                          className={`text-start p-1.5 rounded border text-[11px] cursor-pointer flex items-center justify-between gap-1 ${
                            isSelected
                              ? 'bg-[#1e3a2f] border-[#34d399]'
                              : 'bg-[#16100b] hover:bg-[#241a12] border-[#c87d32]/30'
                          }`}
                        >
                          <span className="font-semibold text-[#f4ead5] truncate">
                            {isAr ? v.arName : v.name}
                          </span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] text-[#f4ead5] shrink-0"
                            style={{ backgroundColor: lin.badgeColor }}
                          >
                            ★{v.skillLevel}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEARBY TRIBES */}
          {activeTab === 'region' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              {valley.neighbors
                .filter((n) => !settings.blockedValleyIds.includes(n.valleyId))
                .slice(0, 15)
                .map((n) => {
                  const isVisiting = visitingNeighbor?.valleyId === n.valleyId;
                  return (
                    <div
                      key={n.valleyId}
                      className={`p-2 rounded border flex flex-col justify-between ${
                        isVisiting
                          ? 'bg-[#1d3557]/80 border-[#38bdf8]'
                          : 'bg-[#221811] border-[#c87d32]/40'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-[#f4ead5] truncate">
                          {isAr ? n.arName || n.name : n.name}
                        </div>
                        <div className="text-[10px] text-[#b89f80] truncate">
                          {isAr ? n.arOwnerName || n.ownerName : n.ownerName}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono-num text-[#f59e0b]">
                          {n.prestige} {isAr ? 'هيبة' : 'Prest'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onVisitNeighbor(n)}
                          className="px-2 py-0.5 bg-[#c87d32] hover:bg-[#df8f40] text-[#18120e] font-semibold text-[10px] rounded cursor-pointer"
                        >
                          {isAr ? 'زيارة' : 'Visit'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* TAB 4: REGIONAL SOUK */}
          {activeTab === 'souk' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {valley.soukOffers.map((offer) => {
                const canAfford = (valley.resources[offer.wantResource] || 0) >= offer.wantAmount;
                const giveLabel = isAr
                  ? RESOURCE_ARABIC_LABELS[offer.giveResource] || offer.giveResource
                  : offer.giveResource.toUpperCase();
                const wantLabel = isAr
                  ? RESOURCE_ARABIC_LABELS[offer.wantResource] || offer.wantResource
                  : offer.wantResource.toUpperCase();
                return (
                  <div
                    key={offer.offerId}
                    className="p-2 bg-[#221811] border border-[#c87d32]/40 rounded flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#f4ead5] truncate">
                        {isAr ? offer.arSellerName || offer.sellerName : offer.sellerName}
                      </div>
                      <div className="mt-1 font-mono-num text-[#34d399]">
                        +{offer.giveAmount} {giveLabel} ← -{offer.wantAmount} {wantLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onAcceptSoukOffer(offer)}
                      className={`mt-1.5 w-full py-1 px-2 rounded font-semibold cursor-pointer ${
                        canAfford
                          ? 'bg-[#c87d32] hover:bg-[#df8f40] text-[#18120e]'
                          : 'bg-[#2a2019] text-[#7a6a58] cursor-not-allowed'
                      }`}
                    >
                      {canAfford
                        ? isAr
                          ? 'إرسال القافلة'
                          : 'Send Caravan'
                        : isAr
                        ? `تحتاج ${offer.wantAmount} ${wantLabel}`
                        : `Need ${offer.wantAmount} ${offer.wantResource}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-1.5 text-xs">
              {valley.reports.length === 0 ? (
                <div className="text-[#b89f80] py-3 text-center">
                  {isAr ? 'لا توجد رسائل أو تقارير بعد.' : 'No reports recorded yet.'}
                </div>
              ) : (
                valley.reports.slice(0, 12).map((rep) => (
                  <div
                    key={rep.id}
                    className="p-2 bg-[#221811] border border-[#c87d32]/30 rounded flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-[#f0b429]">
                        {isAr ? rep.arTitle || rep.title : rep.title}:{' '}
                      </span>
                      <span className="text-[#e6d5b8]">
                        {isAr ? rep.arSummary || rep.summary : rep.summary}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#b89f80] font-mono-num shrink-0">
                      {isAr
                        ? `${SEASON_INFO[rep.season].arName} ${rep.gameYear}م`
                        : `${rep.season} ${rep.gameYear}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'notes' && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#221811] border border-[#c87d32]/40 rounded p-3 text-xs">
              <div className="flex items-center gap-3">
                <label htmlFor="lang-select" className="text-[#e6d5b8] font-medium">
                  {isAr ? 'اللغة / Language:' : 'Language / اللغة:'}
                </label>
                <select
                  id="lang-select"
                  value={settings.language}
                  onChange={(e) =>
                    onUpdateSettings({ language: e.target.value as GameSettings['language'] })
                  }
                  className="bg-[#120d0a] border border-[#c87d32]/50 rounded px-2.5 py-1 text-[#f4ead5]"
                >
                  <option value="ar">العربية الفصحى (Arabic)</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="tzm">Tamazight</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ raidingOptIn: !settings.raidingOptIn })}
                  className="px-3 py-1 bg-[#2e2118] border border-[#c87d32]/50 rounded text-[#f0b429] cursor-pointer"
                >
                  {settings.raidingOptIn
                    ? isAr
                      ? 'نظام الغارات: مفعّل'
                      : 'Raiding: Enabled'
                    : isAr
                    ? 'الوضع السلمي'
                    : 'Peaceful Mode'}
                </button>

                <button
                  type="button"
                  onClick={onResetValley}
                  className="px-3 py-1 bg-[#451a1a] hover:bg-[#5c2323] text-[#fca5a5] rounded cursor-pointer"
                >
                  {isAr ? 'إعادة ضبط القرية' : 'Reset Valley'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
