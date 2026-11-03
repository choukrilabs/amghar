import React, { useEffect, useState } from 'react';
import {
  BUILDING_LIST,
  BUILDINGS_CONFIG,
  RESOURCE_ARABIC_LABELS,
  SEASON_INFO,
} from '../game/config';
import { canAffordCost, formatTifinaghHistoricalDate, getUpgradeCost } from '../game/tick';
import {
  BuildingType,
  GameSettings,
  LanguageCode,
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
import { MOROCCO_1870_TERRITORY_TITLES } from './AmgharProfileDrawer';
import {
  ARCHIVAL_CHARACTER_ORDER,
  ARCHIVAL_CHARACTERS,
  ARCHIVAL_FAMILY_SHEET_URL,
  ArchivalPortraitAvatar,
  ArchivalPortraitId,
  getVillagerArchivalPortraitId,
} from './ArchivalPortraits';
import { ArchivalManagementSection } from './BottomDock';
import { Amazigh1870Icon, BuildingIcon } from './Icons';

export interface AmgharArchivalPageProps {
  valley: ValleyState;
  language: LanguageCode;
  settings?: GameSettings;
  initialPortraitId?: ArchivalPortraitId;
  initialSection?: ArchivalManagementSection;
  selectedVillagerId?: string | null;
  selectedBuildingId?: string | null;
  onClose: () => void;
  onSelectVillagerIn3D: (villagerId: string) => void;
  onSelectBuildingIn3D: (buildingId: string) => void;
  onSelectBuildTypeIn3D?: (type: BuildingType) => void;
  onUpgradeBuilding?: (buildingId: string) => void;
  onUpdateRoles?: (roles: PopulationRoles) => void;
  onAcceptSoukOffer?: (offer: SoukOffer) => void;
  onUpdateSettings?: (partial: Partial<GameSettings>) => void;
  onResetValley?: () => void;
  onTrainVillagerSkill: (villagerId: string) => void;
  onAssignHouseSkill: (buildingId: string, skill: keyof PopulationRoles) => void;
  onArrangeMarriage: () => void;
  onWelcomeNewcomer: () => void;
  onExpandTerritory: () => void;
  onForageFood: () => void;
  onOpenWorldMap: () => void;
  onVisitNeighbor: (neighbor: NeighborValley) => void;
}

export const AmgharArchivalPage: React.FC<AmgharArchivalPageProps> = ({
  valley,
  language,
  settings,
  initialPortraitId = 'amghar',
  initialSection = 'lineage',
  selectedVillagerId,
  selectedBuildingId,
  onClose,
  onSelectVillagerIn3D,
  onSelectBuildingIn3D,
  onSelectBuildTypeIn3D,
  onUpgradeBuilding,
  onUpdateRoles,
  onAcceptSoukOffer,
  onUpdateSettings,
  onResetValley,
  onTrainVillagerSkill,
  onAssignHouseSkill,
  onArrangeMarriage,
  onWelcomeNewcomer,
  onExpandTerritory,
  onForageFood,
  onOpenWorldMap,
  onVisitNeighbor,
}) => {
  const [liveNow, setLiveNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAr = language === 'ar';
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

  // If a villager is currently selected, default to their matching archival portrait
  const matchedInitialVillager = livingVillagers.find((v) => v.id === selectedVillagerId);
  const [activePortraitId, setActivePortraitId] = useState<ArchivalPortraitId>(() =>
    matchedInitialVillager
      ? getVillagerArchivalPortraitId(matchedInitialVillager)
      : initialPortraitId
  );
  const [activeVillagerId, setActiveVillagerId] = useState<string | null>(
    selectedVillagerId || (livingVillagers[0]?.id ?? null)
  );
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(
    selectedBuildingId || (valley.buildings[0]?.id ?? null)
  );
  const [subView, setSubView] = useState<ArchivalManagementSection>(initialSection);
  const [carouselOffset, setCarouselOffset] = useState<number>(0);

  useEffect(() => {
    setSubView(initialSection);
  }, [initialSection]);

  const adjustRole = (role: keyof PopulationRoles, delta: number) => {
    if (!onUpdateRoles) return;
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

  const primaryChar = ARCHIVAL_CHARACTERS[activePortraitId] || ARCHIVAL_CHARACTERS.amghar;
  const companionChar =
    ARCHIVAL_CHARACTERS[primaryChar.companionId] || ARCHIVAL_CHARACTERS.amghar_wife;

  const selectedVillager =
    livingVillagers.find((v) => v.id === activeVillagerId) || null;
  const selectedBuilding =
    valley.buildings.find((b) => b.id === activeBuildingId) || valley.buildings[0] || null;
  const buildingReport = selectedBuilding
    ? inspectBuildingEconomics(valley, selectedBuilding, language)
    : null;

  const visibleCarouselIds = ARCHIVAL_CHARACTER_ORDER.slice(
    carouselOffset,
    carouselOffset + 6
  );

  const handleSelectCharacter = (id: ArchivalPortraitId) => {
    setActivePortraitId(id);
    // Also pair with a matching living villager if one exists
    const matchingVillager = livingVillagers.find(
      (v) => getVillagerArchivalPortraitId(v) === id
    );
    if (matchingVillager) {
      setActiveVillagerId(matchingVillager.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        isAr
          ? 'صفحة سلالة الأمغار وأهل القرية والإمارة — 1870م'
          : 'Territory & Dynasty of the Amghar — 1870 Archival Page'
      }
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-40 overflow-y-auto select-none bg-[#1b1109] p-2 sm:p-4 flex items-start justify-center"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, rgba(45,26,12,0.88) 0px, rgba(32,18,8,0.94) 18px, rgba(52,31,15,0.9) 36px)',
      }}
    >
      {/* OUTER CARVED CEDARWOOD & AGED PARCHMENT SHEET (Reference Image 2) */}
      <div className="relative w-full max-w-[1400px] bg-gradient-to-b from-[#e4d5b7] via-[#d8c59e] to-[#cbb386] border-[6px] border-[#3d2514] rounded shadow-[0_0_60px_rgba(0,0,0,0.9)] p-2.5 sm:p-4 text-[#2b1d0f] flex flex-col justify-between overflow-hidden">
        {/* Subtle Aged Parchment Vignette & Paper Grain Overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, transparent 55%, rgba(92,58,28,0.28) 100%)',
          }}
        />

        {/* 4 Tarnished Brass Riveted Corner Brackets (Matching Reference Image 2) */}
        <div className="pointer-events-none absolute top-0 left-0 w-9 h-9 bg-gradient-to-br from-[#b87b43] to-[#6e421c] border-r-2 border-b-2 border-[#2d1a0b] rounded-br-lg flex items-center justify-center shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e6c687] border border-[#3d2514]" />
        </div>
        <div className="pointer-events-none absolute top-0 right-0 w-9 h-9 bg-gradient-to-bl from-[#b87b43] to-[#6e421c] border-l-2 border-b-2 border-[#2d1a0b] rounded-bl-lg flex items-center justify-center shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e6c687] border border-[#3d2514]" />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-9 h-9 bg-gradient-to-tr from-[#b87b43] to-[#6e421c] border-r-2 border-t-2 border-[#2d1a0b] rounded-tr-lg flex items-center justify-center shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e6c687] border border-[#3d2514]" />
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-tl from-[#b87b43] to-[#6e421c] border-l-2 border-t-2 border-[#2d1a0b] rounded-tl-lg flex items-center justify-center shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e6c687] border border-[#3d2514]" />
        </div>

        {/* Inner Engraved Geometric Border Line */}
        <div className="pointer-events-none absolute inset-2 border-2 border-[#6b492a]/70 rounded-sm" />

        {/* TOP HEADER ROW: Tifinagh Marginalia + Unfurled Parchment Scroll Banner + Map Vignette & Close Button */}
        <div className="relative z-10 grid grid-cols-12 items-center gap-2 pb-2 border-b border-[#8c6742]/45">
          {/* Top-Left Tifinagh & Arabic Archival Calligraphic Marginalia */}
          <div className="col-span-12 lg:col-span-3 flex flex-col justify-center px-2">
            <div className="font-mono text-xs sm:text-sm tracking-widest text-[#4a321a] font-bold">
              +◦⊏⊔LmO+ | ⵣ YMICOΣ8I
            </div>
            <div className="text-xs text-[#5c3e21] font-semibold">
              {isAr
                ? 'سجل أنساب وأهل قصر آيت تامدا — سوس ماسة'
                : 'Chronicle of the House of Aït Tamda — Souss-Massa'}
            </div>
            <div className="text-[11px] text-[#735130] italic">
              {isAr
                ? `العام ${valley.year}م (1287 هـ) · ${valley.households} أسرة · ${roster.length} فرداً`
                : `Year ${valley.year} AD (1287 AH) · ${valley.households} Households · ${roster.length} Souls`}
            </div>
          </div>

          {/* Center Unfurled Parchment Scroll Banner ("TERRITORY OF THE AMGHAR MOGO – 1870") */}
          <div className="col-span-12 lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[580px] bg-gradient-to-b from-[#efe3c8] via-[#e2cfab] to-[#cfb689] border-2 border-[#5c3c1e] rounded-md px-5 py-1.5 shadow-[0_6px_18px_rgba(43,29,15,0.35)] text-center">
              {/* Left & Right Rolled Parchment Scroll Cylinders */}
              <div className="hidden sm:block absolute -left-3 -top-1 -bottom-1 w-5 bg-gradient-to-r from-[#8f6840] via-[#decb9f] to-[#9c7449] border-2 border-[#4a2f16] rounded-full shadow-md" />
              <div className="hidden sm:block absolute -right-3 -top-1 -bottom-1 w-5 bg-gradient-to-l from-[#8f6840] via-[#decb9f] to-[#9c7449] border-2 border-[#4a2f16] rounded-full shadow-md" />

              <h1 className="font-display font-bold text-base sm:text-lg tracking-wider text-[#26170a] uppercase">
                TERRITORY OF THE AMGHAR — 1870
              </h1>
              <div className="text-xs font-bold text-[#5c3a1b]">
                {isAr
                  ? `إمارة وسلالة ${valley.amgharName} — ${valley.name} (${valley.year}م)`
                  : `Dynasty, Heirs & People of ${valley.amgharName} — ${valley.name}`}
              </div>
            </div>
          </div>

          {/* Top-Right Coastal Map Vignette & Navigation Actions */}
          <div className="col-span-12 lg:col-span-3 flex items-center justify-end gap-2 px-2">
            <button
              type="button"
              onClick={onOpenWorldMap}
              className="px-3 py-1.5 bg-[#3b2614] hover:bg-[#52351c] border border-[#a87b4c] rounded text-xs font-semibold text-[#f5ebd6] flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Amazigh1870Icon name="historical_map" className="w-4 h-4" />
              <span>{isAr ? 'خريطة المغرب 1870' : '1870 Strategy Map'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={isAr ? 'العودة إلى القرية' : 'Return to 3D Valley'}
              className="px-3.5 py-1.5 bg-[#6e2219] hover:bg-[#8a2b20] border border-[#d4af37] rounded text-xs font-bold text-[#f8f1e0] cursor-pointer shadow-md"
            >
              {isAr ? '✕ العودة للقرية' : '✕ Return to Valley'}
            </button>
          </div>
        </div>

        {/* MIDDLE SPLIT SECTION: LEFT DUAL MOORISH ARCH PORTRAITS + RIGHT ARCHIVAL PARCHMENT LEDGER BOX */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 my-2 items-stretch">
          {/* LEFT 5 COLUMNS: DUAL MOORISH HORSESHOE ARCHED PORTRAITS & ORNATE PARCHMENT NAMEPLATES */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-2">
            {/* Two Side-by-Side Moorish Horseshoe Arches (Matching Reference Image 2) */}
            <div className="grid grid-cols-2 gap-3">
              {/* ARCH 1: Primary Selected Person (Copper Filigree Moorish Arch) */}
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-[10/11] rounded shadow-xl overflow-hidden border-2 border-[#3b2312]">
                  <ArchivalPortraitAvatar
                    portraitId={primaryChar.id}
                    shape="arch"
                    archVariant="copper"
                    className="w-full h-full"
                  />
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#26170a]/85 border border-[#c8a464]/60 rounded text-[10px] font-semibold text-[#f5ebd6] whitespace-nowrap">
                    {primaryChar.generationYearLabel}
                  </span>
                </div>
              </div>

              {/* ARCH 2: Companion / Spouse / Counterpart (Dark Bronze Filigree Moorish Arch) */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleSelectCharacter(companionChar.id)}
                  title={
                    isAr
                      ? `اضغط لعرض تفاصيل: ${companionChar.nameAr}`
                      : `Click to inspect: ${companionChar.nameEn}`
                  }
                  className="relative w-full aspect-[10/11] rounded shadow-xl overflow-hidden border-2 border-[#3b2312] cursor-pointer group text-start"
                >
                  <ArchivalPortraitAvatar
                    portraitId={companionChar.id}
                    shape="arch"
                    archVariant="bronze"
                    className="w-full h-full group-hover:scale-[1.02] transition-transform"
                  />
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#26170a]/85 border border-[#c8a464]/60 rounded text-[10px] font-semibold text-[#e5c158] whitespace-nowrap">
                    {isAr ? 'القرين / الشريك (اضغط)' : 'Companion (Click)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Two Ornate Rectangular Scalloped Parchment Nameplates Below the Arches */}
            <div className="grid grid-cols-2 gap-3">
              {/* Nameplate 1 (Under Arch 1) */}
              <div className="relative bg-gradient-to-b from-[#efe3c8] to-[#dcc8a0] border-[3px] border-[#4d2c16] rounded p-2 shadow-md flex flex-col justify-between min-h-[92px]">
                <div className="pointer-events-none absolute inset-1 border border-[#9c6334]/60 rounded-sm" />
                <div>
                  <div className="font-display font-bold text-xs sm:text-sm text-[#2b180a] leading-tight">
                    {isAr ? primaryChar.nameAr : primaryChar.nameEn}
                  </div>
                  <div className="text-[11px] font-semibold text-[#7c3f16] mt-0.5">
                    {isAr ? primaryChar.titleAr : primaryChar.titleEn}
                  </div>
                  <div className="text-[10px] text-[#594128]">
                    {isAr ? primaryChar.ageLabelAr : primaryChar.ageLabelEn}
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-[#8c6742]/40 text-[10px] text-[#45311c] truncate">
                  {isAr ? primaryChar.attireNotesAr : primaryChar.attireNotesEn}
                </div>
              </div>

              {/* Nameplate 2 (Under Arch 2) */}
              <div className="relative bg-gradient-to-b from-[#efe3c8] to-[#dcc8a0] border-[3px] border-[#3d3522] rounded p-2 shadow-md flex flex-col justify-between min-h-[92px]">
                <div className="pointer-events-none absolute inset-1 border border-[#736544]/60 rounded-sm" />
                <div>
                  <div className="font-display font-bold text-xs sm:text-sm text-[#2b180a] leading-tight">
                    {isAr ? companionChar.nameAr : companionChar.nameEn}
                  </div>
                  <div className="text-[11px] font-semibold text-[#5e4d26] mt-0.5">
                    {isAr ? primaryChar.companionRelationAr : primaryChar.companionRelationEn}
                  </div>
                  <div className="text-[10px] text-[#594128]">
                    {isAr ? companionChar.roleLabelAr : companionChar.roleLabelEn}
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-[#8c6742]/40 flex items-center justify-between text-[10px]">
                  <span className="text-[#45311c] truncate">
                    {isAr ? companionChar.ageLabelAr : companionChar.ageLabelEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectCharacter(companionChar.id)}
                    className="px-1.5 py-0.5 bg-[#4d2c16] text-[#f5ebd6] rounded text-[9px] font-semibold cursor-pointer shrink-0"
                  >
                    {isAr ? 'عرض' : 'Inspect'}
                  </button>
                </div>
              </div>
            </div>

            {/* Two Thin Ornamental Filigree Divider Bars Underneath Nameplates (Matching Reference Image 2) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-2.5 bg-gradient-to-r from-[#5c361b] via-[#b8864c] to-[#5c361b] border border-[#2e1a0c] rounded-sm flex items-center justify-center">
                <span className="text-[8px] text-[#261509] font-mono tracking-widest">
                  ◆ ━━━ ⵣ ━━━ ◆
                </span>
              </div>
              <div className="h-2.5 bg-gradient-to-r from-[#453c27] via-[#9c8c64] to-[#453c27] border border-[#262115] rounded-sm flex items-center justify-center">
                <span className="text-[8px] text-[#1f1b11] font-mono tracking-widest">
                  ◆ ━━━ ⵣ ━━━ ◆
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLUMNS: DARK WALNUT-FRAMED ARCHIVAL PARCHMENT LEDGER BOX (Matching Reference Image 2) */}
          <div className="lg:col-span-7 bg-[#291b10] border-[4px] border-[#3d2614] rounded shadow-2xl p-2.5 flex flex-col justify-between gap-2">
            {/* 1. UPPER AGED PARCHMENT LEDGER SHEET (3 Columns + 5 Stat Lines + Ink Splatters) */}
            <div className="relative bg-gradient-to-br from-[#efe3c6] via-[#e5d4b0] to-[#d6be92] border-2 border-[#4d3319] rounded-sm p-3 shadow-inner">
              {/* Top Centered Ornamental Divider */}
              <div className="text-center text-xs text-[#593c1f] tracking-widest mb-1.5 font-serif">
                ─── ❖ {isAr ? primaryChar.generationTitleAr : primaryChar.generationTitleEn} ❖ ───
              </div>

              {/* Authentic 19th-Century Ink Splatter Accents on Right Edge (Matching Reference Image 2) */}
              <div className="pointer-events-none absolute top-6 right-3 flex flex-col gap-1.5 opacity-65">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1a1109]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a1109] ms-2" />
                <span className="w-2 h-2 rounded-full bg-[#1a1109] -ms-1 mt-8" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                {/* Column 1 (3 cols): 5-Row Archival Stat Lines with Engraved Icons */}
                <div className="md:col-span-3 md:border-e border-[#8c6742]/50 md:pe-3 flex flex-col justify-between space-y-1">
                  <div className="text-[11px] font-bold text-[#4a3016] uppercase tracking-wide">
                    {isAr ? 'قدرات الشخصية' : 'Character Stats'}
                  </div>
                  {(
                    [
                      {
                        labelEn: 'Martial',
                        labelAr: 'الفروسية',
                        val: primaryChar.stats.martial,
                        glyph: '⚔',
                      },
                      {
                        labelEn: 'Defense',
                        labelAr: 'الحصانة',
                        val: primaryChar.stats.defense,
                        glyph: '🛡',
                      },
                      {
                        labelEn: 'Diplomacy',
                        labelAr: 'الشورى',
                        val: primaryChar.stats.diplomacy,
                        glyph: '⛨',
                      },
                      {
                        labelEn: 'Harvest',
                        labelAr: 'الإنتاج',
                        val: primaryChar.stats.harvest,
                        glyph: '🌾',
                      },
                      {
                        labelEn: 'Commerce',
                        labelAr: 'التجارة',
                        val: primaryChar.stats.trade,
                        glyph: '⚖',
                      },
                    ] as const
                  ).map((st) => (
                    <div
                      key={st.labelEn}
                      className="flex items-center justify-between border-b border-[#8c6742]/55 pb-1"
                    >
                      <span className="flex items-center gap-1.5 text-[#382410] font-semibold">
                        <span className="text-sm leading-none">{st.glyph}</span>
                        <span className="text-[11px]">{isAr ? st.labelAr : st.labelEn}</span>
                      </span>
                      <span className="font-mono-num font-bold text-xs text-[#6e2219]">
                        {st.val}/20
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column 2 (5 cols): Biography, Production & Consumption Details */}
                <div className="md:col-span-5 md:border-e border-[#8c6742]/50 md:pe-3 flex flex-col justify-between space-y-1.5">
                  <div>
                    <div className="text-[11px] font-bold text-[#4a3016]">
                      {isAr ? 'السيرة التاريخية والدور في الوادي:' : 'Archival Biography & Role:'}
                    </div>
                    <p className="text-[11px] leading-snug text-[#2f1e0e] mt-0.5">
                      {isAr ? primaryChar.biographyAr : primaryChar.biographyEn}
                    </p>
                  </div>

                  <div className="bg-[#dfcca4]/80 border border-[#8c6742]/45 rounded p-1.5 space-y-0.5">
                    <div className="text-[11px] font-bold text-[#14532d]">
                      {isAr ? 'الإنتاج والمساهمة:' : 'Production & Contribution:'}
                    </div>
                    <div className="text-[11px] text-[#1e3a1e] font-medium">
                      {isAr ? primaryChar.productionAr : primaryChar.productionEn}
                    </div>
                    <div className="text-[11px] font-bold text-[#7c2d12] pt-0.5">
                      {isAr ? 'الاستهلاك الدوري:' : 'Seasonal Consumption:'}
                    </div>
                    <div className="text-[11px] text-[#5c2410]">
                      {isAr ? primaryChar.consumptionAr : primaryChar.consumptionEn}
                    </div>
                  </div>
                </div>

                {/* Column 3 (4 cols): Linked Villager / Household Status & Direct Actions */}
                <div className="md:col-span-4 flex flex-col justify-between space-y-1.5">
                  <div>
                    <div className="text-[11px] font-bold text-[#4a3016] border-b border-[#8c6742]/45 pb-1">
                      {isAr ? 'التكليف الميداني في القرية' : 'Active Valley Assignment'}
                    </div>
                    <div className="mt-1 text-[11px] text-[#382410] space-y-1">
                      <div>
                        <span className="font-semibold">
                          {isAr ? 'الاختصاص: ' : 'Specialization: '}
                        </span>
                        <span>{isAr ? primaryChar.roleLabelAr : primaryChar.roleLabelEn}</span>
                      </div>
                      {selectedVillager && (
                        <div className="p-1.5 bg-[#d6c094] border border-[#8c6742]/50 rounded">
                          <div className="font-bold text-[#26170a]">
                            {isAr ? selectedVillager.arName : selectedVillager.name} (
                            {selectedVillager.age} {isAr ? 'سنة' : 'yrs'})
                          </div>
                          <div className="text-[10px] text-[#4d3319]">
                            {isAr
                              ? selectedVillager.arHabitLabel
                              : selectedVillager.habitLabel}{' '}
                            · ★{selectedVillager.skillLevel}/5
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons in Column 3 */}
                  <div className="space-y-1 pt-1 border-t border-[#8c6742]/45">
                    {selectedVillager && (
                      <div className="flex flex-wrap gap-1">
                        {selectedVillager.skillLevel < 5 && (
                          <button
                            type="button"
                            onClick={() => onTrainVillagerSkill(selectedVillager.id)}
                            className="flex-1 px-2 py-1 bg-[#4d2c16] hover:bg-[#63391d] text-[#f5ebd6] rounded text-[10px] font-semibold cursor-pointer"
                          >
                            {isAr ? '+ تدريب المهارة' : '+ Train Skill'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectVillagerIn3D(selectedVillager.id);
                            onClose();
                          }}
                          className="flex-1 px-2 py-1 bg-[#1e3a2f] hover:bg-[#274d3e] text-[#f5ebd6] rounded text-[10px] font-semibold cursor-pointer"
                        >
                          {isAr ? 'تحديد في القرية 3D' : 'Locate in 3D'}
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={onArrangeMarriage}
                      className="w-full px-2 py-1 bg-[#6e2219] hover:bg-[#872a1f] text-[#f8f1e0] rounded text-[10px] font-semibold cursor-pointer"
                    >
                      {isAr
                        ? '💍 عقد مصاهرة لتعزيز السلالة'
                        : '💍 Arrange Lineage Marriage'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE HORIZONTAL CAROUSEL OF 6 SQUARE PARCHMENT SLOTS WITH ◀ ▶ ARROWS (Matching Reference Image 2) */}
            <div
              dir="ltr"
              className="bg-gradient-to-b from-[#cbb48c] to-[#b59b70] border-2 border-[#3d2614] rounded-sm px-2 py-1.5 flex items-center justify-between gap-2 shadow-inner"
            >
              <button
                type="button"
                aria-label={isAr ? 'السابق' : 'Previous characters'}
                disabled={carouselOffset <= 0}
                onClick={() => setCarouselOffset((o) => Math.max(0, o - 1))}
                className="w-7 h-11 bg-[#8c6d46] hover:bg-[#a38054] disabled:opacity-40 border border-[#3d2614] rounded-sm flex items-center justify-center text-[#26170a] font-bold cursor-pointer shrink-0"
              >
                ◀
              </button>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-1">
                {visibleCarouselIds.map((cid) => {
                  const charDef = ARCHIVAL_CHARACTERS[cid];
                  const isSelected = cid === activePortraitId;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => handleSelectCharacter(cid)}
                      className={`group relative p-1 rounded-sm border-2 transition-all cursor-pointer flex flex-col items-center ${
                        isSelected
                          ? 'bg-[#efe3c6] border-[#6e2219] scale-105 shadow-md'
                          : 'bg-[#d6bf96] hover:bg-[#e5d2ad] border-[#5c3e21]'
                      }`}
                    >
                      <ArchivalPortraitAvatar
                        portraitId={cid}
                        shape="square"
                        className="w-full h-12 rounded-sm"
                      />
                      <span className="mt-0.5 text-[10px] font-bold text-[#2b180a] truncate w-full text-center">
                        {isAr ? charDef.nameAr.split(' ')[0] + ' ' + (charDef.nameAr.split(' ')[1] || '') : charDef.titleEn.replace('The ', '')}
                      </span>
                      <span className="text-[9px] text-[#5c3e21] font-mono-num">
                        {charDef.ageYears} {isAr ? 'سنة' : 'y'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                aria-label={isAr ? 'التالي' : 'Next characters'}
                disabled={carouselOffset >= ARCHIVAL_CHARACTER_ORDER.length - 6}
                onClick={() =>
                  setCarouselOffset((o) =>
                    Math.min(ARCHIVAL_CHARACTER_ORDER.length - 6, o + 1)
                  )
                }
                className="w-7 h-11 bg-[#8c6d46] hover:bg-[#a38054] disabled:opacity-40 border border-[#3d2614] rounded-sm flex items-center justify-center text-[#26170a] font-bold cursor-pointer shrink-0"
              >
                ▶
              </button>
            </div>

            {/* 3. LOWER ROW OF RIVETED DARK-SLATE TAB BUTTONS FOR ALL VILLAGE MANAGEMENT SECTIONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
              {(
                [
                  {
                    id: 'lineage',
                    labelAr: '📜 شجرة السلالة (1850–1910)',
                    labelEn: '📜 Dynasty Tree (1850–1910)',
                  },
                  {
                    id: 'build',
                    labelAr: `🏗️ البناء والعمارة (${valley.buildings.length})`,
                    labelEn: `🏗️ Build & Upgrade (${valley.buildings.length})`,
                  },
                  {
                    id: 'population',
                    labelAr: `👥 الأسر والحرف (${livingVillagers.length})`,
                    labelEn: `👥 People & Roles (${livingVillagers.length})`,
                  },
                  {
                    id: 'houses',
                    labelAr: '🏠 البيوت والإنتاج',
                    labelEn: '🏠 Houses & Economics',
                  },
                  {
                    id: 'region',
                    labelAr: `🗺️ القرى المجاورة (${valley.neighbors.length})`,
                    labelEn: `🗺️ Nearby Tribes (${valley.neighbors.length})`,
                  },
                  {
                    id: 'souk',
                    labelAr: `🐪 السوق والقوافل (${valley.soukOffers.length})`,
                    labelEn: `🐪 Souk & Caravans (${valley.soukOffers.length})`,
                  },
                  {
                    id: 'reports',
                    labelAr: `✉️ التقارير والرسائل (${valley.reports.length})`,
                    labelEn: `✉️ Chronicle (${valley.reports.length})`,
                  },
                  {
                    id: 'notes',
                    labelAr: '⚙️ الإعدادات والوثيقة',
                    labelEn: '⚙️ Settings & Plate',
                  },
                ] as Array<{ id: ArchivalManagementSection; labelAr: string; labelEn: string }>
              ).map((tab) => {
                const active = subView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubView(tab.id)}
                    className={`py-1.5 px-2 rounded-sm border-2 text-[11px] font-bold transition-colors cursor-pointer shadow-inner truncate ${
                      active
                        ? 'bg-gradient-to-b from-[#545b66] to-[#2f353d] border-[#d4af37] text-[#f8f1e0]'
                        : 'bg-gradient-to-b from-[#3d424a] to-[#25282e] hover:from-[#4a5059] border-[#5c4934] text-[#d6cbb9]'
                    }`}
                  >
                    {isAr ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* DECORATIVE TIFINAGH REAL-TIME AD & AH DATE TICKER FRIEZE BAR */}
        <div className="relative z-10 my-1 py-1 px-3 bg-[#d4be94] border-y border-[#735130] flex flex-wrap items-center justify-between gap-2 text-xs text-[#3d2514] font-bold">
          <span className="font-mono tracking-wider text-[#4a321a]">
            {dateInfo.tifinaghTicker}
          </span>
          <span className="font-mono-num text-[#6e2219]">
            {isAr ? dateInfo.dualCalendarBadgeAr : dateInfo.dualCalendarBadgeEn} · {dateInfo.liveSolarClock}
          </span>
        </div>

        {/* BOTTOM SECTION: LEFT RIBBON BANNERS & RIVETED PLATES + CENTER PARCHMENT WINDOWS + RIGHT WAX SEAL & COMPASS */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 items-stretch">
          {/* BOTTOM-LEFT (3 cols): 3 Riveted Wood/Bronze/Slate Plates & Parchment Ribbon Banners */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-2 bg-[#d6c198]/70 border-2 border-[#6b492a] rounded p-2.5">
            <div className="text-xs font-bold text-[#3d2514] border-b border-[#8c6742]/50 pb-1">
              {isAr ? 'أوامر الأمغار ومراسيم الجماعة' : 'Amghar Decrees & Council Actions'}
            </div>

            {/* 3 Stacked Riveted Action Plates (Matching Left-Bottom of Reference Image 2) */}
            <button
              type="button"
              onClick={onWelcomeNewcomer}
              className="w-full py-1.5 px-3 bg-gradient-to-b from-[#4a301d] to-[#2e1c10] hover:from-[#5c3c24] border-2 border-[#8c6239] rounded-full text-xs font-bold text-[#f5ebd6] flex items-center justify-between cursor-pointer shadow"
            >
              <span>●</span>
              <span>{isAr ? '+ استقبال أسرة وافدة' : '+ Welcome Newcomer Family'}</span>
              <span>●</span>
            </button>

            <button
              type="button"
              onClick={onArrangeMarriage}
              className="w-full py-1.5 px-3 bg-gradient-to-b from-[#6e3b26] to-[#472315] hover:from-[#82462d] border-2 border-[#b87b43] rounded-full text-xs font-bold text-[#f8f1e0] flex items-center justify-between cursor-pointer shadow"
            >
              <span>●</span>
              <span>{isAr ? '💍 زواج ومصاهرة السلالات' : '💍 Arrange Tribal Marriage'}</span>
              <span>●</span>
            </button>

            <button
              type="button"
              onClick={onExpandTerritory}
              className="w-full py-1.5 px-3 bg-gradient-to-b from-[#3d4652] to-[#252b33] hover:from-[#4b5663] border-2 border-[#8c7a5b] rounded-full text-xs font-bold text-[#e5e7eb] flex items-center justify-between cursor-pointer shadow"
            >
              <span>●</span>
              <span>
                {isAr
                  ? `توسيع أراضي القرية (م${valley.territoryLevel || 1})`
                  : `Expand Territory (L${valley.territoryLevel || 1})`}
              </span>
              <span>●</span>
            </button>

            {/* Crimson & Parchment Ribbon Banner */}
            <button
              type="button"
              onClick={onForageFood}
              className="w-full py-1.5 px-3 bg-gradient-to-r from-[#7c2d12] via-[#991b1b] to-[#7c2d12] border border-[#d4af37] rounded text-xs font-bold text-[#fef3c7] cursor-pointer shadow"
            >
              {isAr ? '🌾 جمع غلال الأركان واللوز من الوادي' : '🌾 Forage Valley Walnuts & Argan'}
            </button>
          </div>

          {/* BOTTOM-CENTER (6 cols): DETAILED PARCHMENT LEDGER WINDOWS FOR SELECTED SUBVIEW */}
          <div className="lg:col-span-6 bg-[#dfcca4] border-[3px] border-[#4d3319] rounded shadow-inner p-3 max-h-[260px] overflow-y-auto">
            {/* SUBVIEW 1: 3-GENERATION ARCHIVAL FAMILY TREE (1850 -> 1870 -> 1890-1910) */}
            {subView === 'lineage' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#8c6742]/50 pb-1">
                  <span className="font-display font-bold text-xs text-[#2b180a]">
                    {isAr
                      ? 'شجرة السلالة الأرشيفية عبر 3 أجيال (1850م – 1910م) — اضغط على أي فرد:'
                      : 'Archival 3-Generation Lineage Tree (1850–1910) — Click any person:'}
                  </span>
                  <span className="text-[10px] font-mono text-[#5c3e21]">1850 ── 1870 ── 1910</span>
                </div>

                {(
                  [
                    {
                      genKey: '1850_1860',
                      titleAr: 'الجيل الأول (1850–1860م): الأجداد والشيوخ المؤسسون',
                      titleEn: 'Generation I (1850–1860): The Ancestors & Elders',
                      ids: ['amghar', 'amghar_wife', 'elder_advisor'] as ArchivalPortraitId[],
                    },
                    {
                      genKey: '1870',
                      titleAr: 'الجيل الثاني (1870م): الأبناء والورثة وبناة القرية',
                      titleEn: 'Generation II (1870): Heirs, Spouses & Village Builders',
                      ids: [
                        'oldest_son_heir',
                        'daughter_in_law',
                        'daughter',
                        'village_laborer',
                      ] as ArchivalPortraitId[],
                    },
                    {
                      genKey: '1890_1900',
                      titleAr: 'الجيل الثالث (1890–1910م): الأحفاد وورثة القرن العشرين',
                      titleEn: 'Generation III (1890–1910): Grandchildren & Next Heirs',
                      ids: [
                        'teenage_grandson',
                        'young_granddaughter',
                        'young_boy_heir',
                      ] as ArchivalPortraitId[],
                    },
                  ] as const
                ).map((gen) => (
                  <div
                    key={gen.genKey}
                    className="bg-[#ebdcc0] border border-[#8c6742]/50 rounded p-2"
                  >
                    <div className="text-[11px] font-bold text-[#5c361b] mb-1">
                      {isAr ? gen.titleAr : gen.titleEn}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {gen.ids.map((id) => {
                        const ch = ARCHIVAL_CHARACTERS[id];
                        const active = id === activePortraitId;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleSelectCharacter(id)}
                            className={`p-1.5 rounded border text-start flex items-center gap-2 cursor-pointer transition-colors ${
                              active
                                ? 'bg-[#d4b682] border-[#6e2219] shadow'
                                : 'bg-[#f5ebd6] hover:bg-[#e6d5b3] border-[#8c6742]/45'
                            }`}
                          >
                            <ArchivalPortraitAvatar
                              portraitId={id}
                              shape="square"
                              className="w-10 h-12 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] text-[#26170a] truncate">
                                {isAr ? ch.nameAr : ch.nameEn}
                              </div>
                              <div className="text-[9px] text-[#6e3b1b] truncate">
                                {isAr ? ch.titleAr : ch.titleEn}
                              </div>
                              <div className="text-[9px] text-[#4d3319] font-mono-num">
                                {ch.ageYears} {isAr ? 'سنة' : 'yrs'}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUBVIEW 2: BUILD & UPGRADE IN VALLEY */}
            {subView === 'build' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#8c6742]/50 pb-1">
                  <span className="font-display font-bold text-xs text-[#2b180a]">
                    {isAr
                      ? 'البناء والعمارة في الوادي (اضغط على أي مبنى لوضعه في القرية ثلاثية الأبعاد):'
                      : 'Construct Buildings in 3D Valley (Click any building to place on terrain):'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUILDING_LIST.map((bDef) => {
                    const cost = bDef.baseCost;
                    const affordable = canAffordCost(valley.resources, cost);
                    const favorMet =
                      !bDef.minMakhzenFavor || valley.meters.makhzenFavor >= bDef.minMakhzenFavor;
                    const count = valley.buildings.filter((b) => b.type === bDef.type).length;

                    return (
                      <button
                        key={bDef.type}
                        type="button"
                        onClick={() => {
                          if (onSelectBuildTypeIn3D) {
                            onSelectBuildTypeIn3D(bDef.type);
                            onClose();
                          }
                        }}
                        className={`text-start p-2 rounded border-2 transition-colors cursor-pointer flex flex-col justify-between ${
                          affordable && favorMet
                            ? 'bg-[#f5ebd6] hover:bg-[#e6d5b3] border-[#6b492a]'
                            : 'bg-[#cbb68e]/70 border-[#8c6d46]/60 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BuildingIcon type={bDef.type} className="w-6 h-6 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-[#26170a] truncate">
                                {isAr ? bDef.arName : bDef.name}
                              </span>
                              <span className="font-mono-num font-bold text-[10px] text-[#6e2219]">
                                ×{count}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#5c3e21] truncate">
                              {isAr ? bDef.arEffectText : bDef.effectText}
                            </div>
                          </div>
                        </div>
                        <div className="mt-1.5 pt-1 border-t border-[#8c6742]/40 font-mono-num font-semibold text-[10px] text-[#3d2514] flex flex-wrap gap-x-2">
                          {cost.earth > 0 && <span>{cost.earth}{isAr ? ' طين' : 'E'}</span>}
                          {cost.timber > 0 && <span>{cost.timber}{isAr ? ' خشب' : 'T'}</span>}
                          {cost.stone > 0 && <span>{cost.stone}{isAr ? ' حجر' : 'S'}</span>}
                          {cost.silver > 0 && <span>{cost.silver}{isAr ? ' فضة' : 'Ag'}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUBVIEW 3: POPULATION, ROLES & ALL LIVING VILLAGERS */}
            {subView === 'population' && (
              <div className="space-y-2.5">
                {onUpdateRoles && (
                  <div className="bg-[#ebdcc0] border border-[#8c6742]/60 rounded p-2">
                    <div className="text-[11px] font-bold text-[#2b180a] mb-1.5">
                      {isAr ? 'توزيع الحرف في القرية:' : 'Assign Village Roles:'}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
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
                          className="bg-[#f5ebd6] border border-[#8c6742] rounded-sm px-2 py-1 flex items-center justify-between text-xs"
                        >
                          <span className="text-[#26170a] font-semibold text-[10px] truncate">
                            {r.label}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={`Decrease ${r.label}`}
                              onClick={() => adjustRole(r.key, -1)}
                              className="w-4 h-4 bg-[#6b492a] rounded-sm text-[#f5ebd6] flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono-num font-bold text-[#6e2219] w-3.5 text-center text-[11px]">
                              {valley.roles[r.key]}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${r.label}`}
                              onClick={() => adjustRole(r.key, 1)}
                              className="w-4 h-4 bg-[#4d2c16] text-[#f5ebd6] font-bold rounded-sm flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="font-display font-bold text-xs text-[#2b180a] border-b border-[#8c6742]/50 pb-1">
                  {isAr
                    ? `جميع سكان القرية الأحياء (${livingVillagers.length} فرداً — اضغط لعرض صورتهم وتفاصيلهم):`
                    : `All Living Valley Villagers (${livingVillagers.length} — Click to inspect portrait & details):`}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {livingVillagers.map((v) => {
                    const portraitId = getVillagerArchivalPortraitId(v);
                    const lin = FAMILY_LINEAGES[v.lineageId];
                    const isSelected = activeVillagerId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setActiveVillagerId(v.id);
                          setActivePortraitId(portraitId);
                        }}
                        className={`p-2 rounded border flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#d4b682] border-[#6e2219] shadow'
                            : 'bg-[#f2e5c9] hover:bg-[#e6d5b3] border-[#8c6742]/45'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ArchivalPortraitAvatar
                            portraitId={portraitId}
                            shape="square"
                            className="w-10 h-12 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#26170a] truncate">
                              {isAr ? v.arName : v.name}{' '}
                              <span className="font-normal text-[10px] text-[#5c3e21]">
                                ({v.age} {isAr ? 'سنة' : 'y'})
                              </span>
                            </div>
                            <div className="text-[10px] text-[#5c361b] truncate">
                              {isAr ? lin.arName : lin.name} · ★{v.skillLevel}/5
                            </div>
                            <div className="text-[10px] text-[#14532d] truncate">
                              {isAr ? v.arHabitLabel : v.habitLabel}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          {v.skillLevel < 5 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTrainVillagerSkill(v.id);
                              }}
                              className="px-2 py-0.5 bg-[#4d2c16] text-[#f5ebd6] rounded text-[10px] font-semibold cursor-pointer"
                            >
                              {isAr ? '+ تدريب' : '+ Train'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectVillagerIn3D(v.id);
                              onClose();
                            }}
                            className="px-2 py-0.5 bg-[#1e3a2f] text-[#f5ebd6] rounded text-[10px] font-semibold cursor-pointer"
                          >
                            {isAr ? 'موقع 3D' : '3D View'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUBVIEW 4: INTERACTIVE HOUSES & BUILDINGS (PRODUCTION, CONSUMPTION, UPGRADE & SKILL ASSIGNMENT) */}
            {subView === 'houses' && (
              <div className="space-y-2">
                <div className="font-display font-bold text-xs text-[#2b180a] border-b border-[#8c6742]/50 pb-1">
                  {isAr
                    ? 'تفاصيل البيوت والمنشآت (كم تستهلك؟ كم تنتج؟ وما حرفة أهلها؟):'
                    : 'Interactive Houses & Buildings (Consumption, Production & Household Skill):'}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {valley.buildings.map((b) => {
                    const def = BUILDINGS_CONFIG[b.type];
                    const active = b.id === (selectedBuilding?.id ?? null);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setActiveBuildingId(b.id)}
                        className={`p-1.5 rounded border text-start cursor-pointer ${
                          active
                            ? 'bg-[#d4b682] border-[#6e2219] font-bold'
                            : 'bg-[#f2e5c9] hover:bg-[#e6d5b3] border-[#8c6742]/45'
                        }`}
                      >
                        <div className="text-[11px] text-[#26170a] truncate">
                          {isAr ? def.arName : def.name} ({isAr ? `م${b.level}` : `L${b.level}`})
                        </div>
                        <div className="text-[9px] text-[#5c3e21] font-mono-num">
                          ({b.x}, {b.z})
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedBuilding && buildingReport && (
                  <div className="mt-2 p-2.5 bg-[#f5ebd6] border-2 border-[#6b492a] rounded space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2b180a]">
                        {buildingReport.buildingName} — {buildingReport.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        {selectedBuilding.level < 3 && onUpgradeBuilding && (
                          <button
                            type="button"
                            onClick={() => onUpgradeBuilding(selectedBuilding.id)}
                            className="px-2 py-0.5 bg-[#15803d] text-[#f8f1e0] rounded text-[10px] font-bold cursor-pointer"
                          >
                            {isAr
                              ? `ترقية إلى م${selectedBuilding.level + 1}`
                              : `Upgrade to L${selectedBuilding.level + 1}`}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBuildingIn3D(selectedBuilding.id);
                            onClose();
                          }}
                          className="px-2 py-0.5 bg-[#1e3a2f] text-[#f5ebd6] rounded text-[10px] font-semibold cursor-pointer"
                        >
                          {isAr ? 'معاينة المبنى في 3D' : 'Inspect in 3D'}
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#14532d] font-semibold">
                      {isAr ? 'الإنتاج: ' : 'Produces: '}
                      {buildingReport.productionItems
                        .map((p) => `${p.label} (${p.amountText})`)
                        .join(' · ')}
                    </div>
                    <div className="text-[11px] text-[#7c2d12] font-semibold">
                      {isAr ? 'الاستهلاك: ' : 'Consumes: '}
                      {buildingReport.consumptionItems
                        .map((c) => `${c.label} (${c.amountText})`)
                        .join(' · ')}
                    </div>
                    <div className="text-[11px] text-[#382410]">
                      {buildingReport.residentSummary} — {buildingReport.skillLabel}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] font-bold text-[#4a3016]">
                        {isAr ? 'تخصيص حرفة الدار:' : 'Household Skill:'}
                      </span>
                      {(
                        [
                          { key: 'farmers', ar: 'فلاحة', en: 'Farmer' },
                          { key: 'shepherds', ar: 'رعي', en: 'Shepherd' },
                          { key: 'builders', ar: 'بناء', en: 'Builder' },
                          { key: 'artisans', ar: 'نسيج', en: 'Weaver' },
                          { key: 'guards', ar: 'حراسة', en: 'Guard' },
                        ] as Array<{ key: keyof PopulationRoles; ar: string; en: string }>
                      ).map((sk) => (
                        <button
                          key={sk.key}
                          type="button"
                          onClick={() => onAssignHouseSkill(selectedBuilding.id, sk.key)}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                            buildingReport.skillRole === sk.key
                              ? 'bg-[#6e2219] text-[#f8f1e0] font-bold'
                              : 'bg-[#dfcca4] text-[#2b180a] border border-[#8c6742]/50'
                          }`}
                        >
                          {isAr ? sk.ar : sk.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBVIEW 5: NEARBY TRIBES & DIPLOMACY */}
            {subView === 'region' && (
              <div className="space-y-2">
                <div className="font-display font-bold text-xs text-[#2b180a] border-b border-[#8c6742]/50 pb-1">
                  {isAr
                    ? `القرى والقبائل المجاورة في سوس والأطلس (${valley.neighbors.length} قبيلة):`
                    : `Neighboring Valleys & Tribes (${valley.neighbors.length}):`}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {valley.neighbors.slice(0, 18).map((n) => (
                    <div
                      key={n.valleyId}
                      className="p-2 rounded border border-[#6b492a] bg-[#f2e5c9] flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#26170a] truncate">
                          {isAr ? n.arName || n.name : n.name}
                        </div>
                        <div className="text-[10px] text-[#5c3e21] truncate">
                          {isAr ? n.arOwnerName || n.ownerName : n.ownerName}
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono-num font-bold text-[#6e2219]">
                          {n.prestige} {isAr ? 'هيبة' : 'Prest'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onVisitNeighbor(n)}
                          className="px-2 py-0.5 bg-[#4d2c16] hover:bg-[#63391d] text-[#f5ebd6] font-semibold text-[10px] rounded-sm cursor-pointer"
                        >
                          {isAr ? 'زيارة ودبلوماسية' : 'Visit'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBVIEW 6: REGIONAL SOUK & CARAVANS */}
            {subView === 'souk' && (
              <div className="space-y-2">
                <div className="font-display font-bold text-xs text-[#2b180a] border-b border-[#8c6742]/50 pb-1">
                  {isAr
                    ? 'السوق الأسبوعي وقوافل المقايضة في سوس ماسة:'
                    : 'Weekly Souk & Regional Caravan Offers:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {valley.soukOffers.map((offer) => {
                    const canAfford =
                      (valley.resources[offer.wantResource] || 0) >= offer.wantAmount;
                    const giveLabel = isAr
                      ? RESOURCE_ARABIC_LABELS[offer.giveResource] || offer.giveResource
                      : offer.giveResource.toUpperCase();
                    const wantLabel = isAr
                      ? RESOURCE_ARABIC_LABELS[offer.wantResource] || offer.wantResource
                      : offer.wantResource.toUpperCase();
                    return (
                      <div
                        key={offer.offerId}
                        className="p-2 bg-[#f2e5c9] border border-[#6b492a] rounded flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-[#26170a] truncate">
                            {isAr ? offer.arSellerName || offer.sellerName : offer.sellerName}
                          </div>
                          <div className="mt-1 font-mono-num font-bold text-[#14532d]">
                            +{offer.giveAmount} {giveLabel} ← -{offer.wantAmount} {wantLabel}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!canAfford || !onAcceptSoukOffer}
                          onClick={() => onAcceptSoukOffer && onAcceptSoukOffer(offer)}
                          className={`mt-1.5 w-full py-1 px-2 rounded-sm font-bold cursor-pointer ${
                            canAfford
                              ? 'bg-[#4d2c16] hover:bg-[#63391d] text-[#f5ebd6]'
                              : 'bg-[#cbb68e] text-[#6e5c42] cursor-not-allowed'
                          }`}
                        >
                          {canAfford
                            ? isAr
                              ? 'إرسال القافلة التجارية'
                              : 'Send Caravan'
                            : isAr
                            ? `تحتاج ${offer.wantAmount} ${wantLabel}`
                            : `Need ${offer.wantAmount} ${offer.wantResource}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUBVIEW 7: REPORTS & CHRONICLE */}
            {subView === 'reports' && (
              <div className="space-y-1.5 text-xs">
                <div className="font-display font-bold text-xs text-[#2b180a] border-b border-[#8c6742]/50 pb-1">
                  {isAr ? 'خزانة السجلات والتقارير والرسائل:' : 'Valley Chronicle & Envoy Reports:'}
                </div>
                {valley.reports.length === 0 ? (
                  <div className="text-[#5c3e21] py-3 text-center">
                    {isAr ? 'لا توجد رسائل أو تقارير بعد.' : 'No reports recorded yet.'}
                  </div>
                ) : (
                  valley.reports.slice(0, 15).map((rep) => (
                    <div
                      key={rep.id}
                      className="p-2 bg-[#f2e5c9] border border-[#6b492a] rounded-sm flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-[#6e2219]">
                          {isAr ? rep.arTitle || rep.title : rep.title}:{' '}
                        </span>
                        <span className="text-[#26170a]">
                          {isAr ? rep.arSummary || rep.summary : rep.summary}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5c3e21] font-mono-num shrink-0">
                        {isAr
                          ? `${SEASON_INFO[rep.season].arName} ${rep.gameYear}م`
                          : `${rep.season} ${rep.gameYear}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUBVIEW 8: SETTINGS & FULL 1870 ARCHIVAL PLATE */}
            {(subView === 'notes' || subView === 'archival_plate') && (
              <div className="space-y-3 text-xs">
                {settings && onUpdateSettings && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f2e5c9] border border-[#6b492a] rounded p-2.5">
                    <div className="flex items-center gap-2">
                      <label htmlFor="archival-lang-select" className="text-[#26170a] font-bold">
                        {isAr ? 'اللغة / Language:' : 'Language / اللغة:'}
                      </label>
                      <select
                        id="archival-lang-select"
                        value={settings.language}
                        onChange={(e) =>
                          onUpdateSettings({
                            language: e.target.value as GameSettings['language'],
                          })
                        }
                        className="bg-[#f5ebd6] border border-[#6b492a] rounded-sm px-2 py-1 text-[#26170a] font-semibold"
                      >
                        <option value="ar">العربية الفصحى (Arabic)</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="tzm">Tamazight</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings({ raidingOptIn: !settings.raidingOptIn })
                        }
                        className="px-2.5 py-1 bg-[#4d2c16] text-[#f5ebd6] rounded-sm font-semibold cursor-pointer"
                      >
                        {settings.raidingOptIn
                          ? isAr
                            ? 'نظام الغارات: مفعّل'
                            : 'Raiding: Enabled'
                          : isAr
                          ? 'الوضع السلمي'
                          : 'Peaceful Mode'}
                      </button>

                      {onResetValley && (
                        <button
                          type="button"
                          onClick={onResetValley}
                          className="px-2.5 py-1 bg-[#7c2d12] hover:bg-[#991b1b] text-[#fef3c7] rounded-sm font-semibold cursor-pointer"
                        >
                          {isAr ? 'إعادة ضبط القرية' : 'Reset Valley'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-[#2b180a]">
                  {isAr
                    ? 'اللوحة الأرشيفية الكاملة لسلالة الأمغار (1850–1910م):'
                    : 'Full 19th-Century Archival Lineage Sheet (1850–1910):'}
                </div>
                <div className="relative w-full rounded border-2 border-[#4d3319] overflow-hidden shadow-md">
                  <img
                    src={ARCHIVAL_FAMILY_SHEET_URL}
                    alt="19th Century Archival Family and Heirs of the Amghar 1870"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM-RIGHT (3 cols): 4-QUADRANT TERRITORY GRID + CRIMSON WAX SEAL (ⵣ) & COMPASS ROSE */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-2 bg-[#d6c198]/70 border-2 border-[#6b492a] rounded p-2.5">
            <div className="text-xs font-bold text-[#3d2514] border-b border-[#8c6742]/50 pb-1">
              {isAr ? 'أقاليم وقصبات الأمغار (1870م)' : 'Controlled Ksour & Neighboring Tribes'}
            </div>

            {/* 4-Quadrant Parchment Grid Window (Matching Reference Image 2) */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#b89f74] border-2 border-[#4d3319] p-1.5 rounded-sm">
              {MOROCCO_1870_TERRITORY_TITLES.slice(0, 4).map((tBadge, idx) => {
                const neighbor = valley.neighbors[idx];
                return (
                  <button
                    key={tBadge.id}
                    type="button"
                    onClick={() => {
                      if (neighbor) onVisitNeighbor(neighbor);
                      else onOpenWorldMap();
                    }}
                    className="p-1.5 bg-[#e5d2ad] hover:bg-[#f2e4c6] border border-[#6b492a] rounded-sm text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      <Amazigh1870Icon name={tBadge.icon} className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold text-[10px] text-[#26170a] truncate">
                        {isAr ? tBadge.nameAr : tBadge.nameEn}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#5c3e21] truncate mt-0.5">
                      {isAr ? tBadge.typeLabelAr : tBadge.typeLabelEn}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Crimson Wax Seal (ⵣ), Compass Rose (N-E-S-W) & Amazigh Lattice Colophon (Matching Reference Image 2) */}
            <div className="flex items-center justify-around pt-1">
              {/* Amazigh Geometric Lattice */}
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#6e3b1b] leading-none">ⵣ</span>
                <span className="text-[9px] font-mono text-[#4a321a] mt-0.5">AMAZIGH</span>
              </div>

              {/* Crimson Wax Seal */}
              <div
                title={isAr ? 'الختم الرسمي للأمغار (1870م)' : 'Official Crimson Wax Seal of the Amghar'}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] border-2 border-[#b45309] shadow-lg flex items-center justify-center text-[#f59e0b] font-bold text-lg"
              >
                ⵣ
              </div>

              {/* N-E-S-W Compass Rose */}
              <svg viewBox="0 0 48 48" className="w-12 h-12" aria-hidden="true">
                <circle cx="24" cy="24" r="18" fill="none" stroke="#4a321a" strokeWidth="1.2" />
                <polygon points="24,4 27,21 24,24 21,21" fill="#4a321a" />
                <polygon points="24,44 27,27 24,24 21,27" fill="#8c6742" />
                <polygon points="4,24 21,21 24,24 21,27" fill="#8c6742" />
                <polygon points="44,24 27,21 24,24 27,27" fill="#4a321a" />
                <text x="24" y="3.5" textAnchor="middle" fontSize="5" fill="#26170a" fontWeight="bold">
                  N
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
