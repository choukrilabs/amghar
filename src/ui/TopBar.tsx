import React, { useEffect, useState } from 'react';
import { SEASON_INFO, UI_TRANSLATIONS, WEATHER_INFO } from '../game/config';
import { formatTifinaghHistoricalDate } from '../game/tick';
import { LanguageCode, NeighborValley, ValleyState } from '../game/types';
import { ArchivalPortraitAvatar } from './ArchivalPortraits';
import { DockTab } from './BottomDock';
import { Amazigh1870Icon, Amazigh1870IconName, MoroccanSealEmblem } from './Icons';
import { MapModeType } from './WorldAndPoliticalMaps';

export interface TopBarProps {
  valley: ValleyState;
  visitingNeighbor: NeighborValley | null;
  language: LanguageCode;
  isMuted: boolean;
  isHudCollapsed: boolean;
  isProfileDrawerOpen: boolean;
  isMapPageOpen: boolean;
  isArchivalPageOpen?: boolean;
  activeMapMode: MapModeType;
  timeSpeed: number;
  onToggleProfileDrawer: () => void;
  onToggleMapPage: (mode?: MapModeType) => void;
  onToggleArchivalPage?: () => void;
  onSelectDockTab: (tab: DockTab) => void;
  onSetTimeSpeed: (speed: number) => void;
  onAdvanceTime: (days: number) => void;
  onOpenWorldMapModal: () => void;
  onExitVisitMode: () => void;
  onOpenVisitActionModal: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

const SPEED_OPTIONS: Array<{ speed: number; label: string }> = [
  { speed: 0, label: '0×' },
  { speed: 1, label: '1×' },
  { speed: 2, label: '2×' },
  { speed: 5, label: '5×' },
];

export const TopBar: React.FC<TopBarProps> = ({
  valley,
  visitingNeighbor,
  language,
  isMuted,
  isProfileDrawerOpen,
  isMapPageOpen,
  isArchivalPageOpen,
  activeMapMode,
  timeSpeed,
  onToggleProfileDrawer,
  onToggleMapPage,
  onToggleArchivalPage,
  onSelectDockTab,
  onSetTimeSpeed,
  onAdvanceTime,
  onExitVisitMode,
  onOpenVisitActionModal,
  onToggleMute,
  onTogglePause,
}) => {
  const [liveNow, setLiveNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAr = language === 'ar';
  const t = UI_TRANSLATIONS[language];
  const activeWeather = valley.weather || 'clear';
  const wInfo = WEATHER_INFO[activeWeather] || WEATHER_INFO.clear;
  const sInfo = SEASON_INFO[valley.season] || SEASON_INFO.spring;

  const goldDinars = 1431 + Math.round(valley.resources.silver * 2);
  const silverDirhams = 1102 + Math.round(valley.resources.silver);
  const prestigeScore = Math.max(141, Math.round(valley.meters.prestige));
  const totalWarriors =
    120 + valley.roles.guards * 35 + valley.households * 12 + Math.round(valley.resources.arms * 4);
  const dateInfo = formatTifinaghHistoricalDate(valley, liveNow);

  const mapModeButtons: Array<{
    mode: MapModeType;
    icon: Amazigh1870IconName;
    labelEn: string;
    labelAr: string;
  }> = [
    {
      mode: 'topographic_1870',
      icon: 'kasbah',
      labelEn: 'Holdings & Ksour',
      labelAr: 'القصور والقصبات',
    },
    {
      mode: 'caravan_routes',
      icon: 'caravan',
      labelEn: 'Caravan Routes',
      labelAr: 'طرق القوافل',
    },
    {
      mode: 'topographic_1870',
      icon: 'mountains',
      labelEn: 'Atlas Topography',
      labelAr: 'تضاريس الأطلس وسوس',
    },
    {
      mode: 'engraved_1870',
      icon: 'historical_map',
      labelEn: '1870 Historical Plates',
      labelAr: 'خرائط 1870 التاريخية',
    },
    {
      mode: 'village_survey',
      icon: 'location_pin',
      labelEn: 'Village Lands Survey',
      labelAr: 'مخطط أراضي القرية',
    },
  ];

  return (
    <>
      {/* TOP PERIMETER BAR */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none px-3 py-2 flex items-start justify-between gap-2">
        {/* TOP-LEFT HUD: Reference 2 Circular Amghar Profile Medallion + View Switcher */}
        <div
          className={`pointer-events-auto flex items-center gap-2 transition-all duration-200 ${
            isProfileDrawerOpen ? 'sm:translate-x-[430px] md:translate-x-[450px]' : ''
          }`}
        >
          {/* Circular Amghar Portrait Button with Crimson/Brass Yaz Crest Badge */}
          <button
            type="button"
            aria-label={
              isAr
                ? 'فتح أو إغلاق لوحة الأمغار والسلالة'
                : 'Toggle Amghar Character & Dynasty Profile'
            }
            aria-expanded={isProfileDrawerOpen}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleProfileDrawer();
            }}
            className="relative w-14 h-14 rounded-full bg-[#15181f] border-2 border-[#c8a464] shadow-2xl flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
            title={
              isAr
                ? 'الأمغار الحاج الحسن (اضغط لفتح لوحة الشخصية والسلالة)'
                : 'Amghar El-Hajj Al-Hassan (Click to open Character & Dynasty Sheet)'
            }
          >
            <ArchivalPortraitAvatar
              portraitId="amghar"
              shape="circle"
              className="w-full h-full"
            />

            {/* Lower-Left Ornate Moroccan Seal & Yaz (ⵣ) Crest Badge */}
            <div className="absolute -bottom-1 -left-1 w-6 h-7 pointer-events-none">
              <MoroccanSealEmblem className="w-full h-full drop-shadow" />
            </div>
          </button>

          {/* Compact Dark-Slate Council & View Strip next to Medallion */}
          <div className="flex items-center gap-1.5 bg-[#12151a]/90 backdrop-blur-md border border-[#a68956]/35 rounded-full px-3 py-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => onToggleMapPage()}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isMapPageOpen
                  ? 'bg-[#c8a464] text-[#12151a]'
                  : 'bg-[#1c2028] hover:bg-[#272c37] text-[#e5c158] border border-[#a68956]/40'
              }`}
              title={
                isMapPageOpen
                  ? isAr
                    ? 'العودة إلى القرية ثلاثية الأبعاد'
                    : 'Return to 3D Village View'
                  : isAr
                  ? 'فتح صفحة خريطة المغرب 1870 الكاملة'
                  : 'Open Full-Screen 1870 Morocco Map Page'
              }
            >
              <Amazigh1870Icon
                name={isMapPageOpen ? 'moroccan_door' : 'historical_map'}
                className="w-3.5 h-3.5"
              />
              <span>
                {isMapPageOpen
                  ? isAr
                    ? 'القرية (3D)'
                    : '3D Village'
                  : isAr
                  ? 'خريطة 1870'
                  : '1870 Map'}
              </span>
            </button>

            {onToggleArchivalPage && (
              <button
                type="button"
                onClick={() => onToggleArchivalPage()}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  isArchivalPageOpen
                    ? 'bg-[#c8a464] text-[#12151a]'
                    : 'bg-[#6e2219] hover:bg-[#8a2b20] text-[#fef3c7] border border-[#d4af37]/60'
                }`}
                title={
                  isAr
                    ? 'فتح صفحة سلالة الأمغار وأهل القرية المفصلة (1870)'
                    : 'Open Detailed 1870 Dynasty, Heirs & Territory Page'
                }
              >
                <span>📜</span>
                <span>{isAr ? 'صفحة السلالة' : 'Dynasty Page'}</span>
              </button>
            )}

            <span className="text-[#a68956]/40">|</span>

            <span className="font-display font-semibold text-xs text-[#e8dfd1] whitespace-nowrap">
              {visitingNeighbor
                ? isAr
                  ? visitingNeighbor.arName || visitingNeighbor.name
                  : visitingNeighbor.name
                : valley.name}
            </span>

            {/* Passive System-Controlled Weather Icon */}
            {!visitingNeighbor && (
              <span
                className="text-xs opacity-90"
                title={
                  isAr
                    ? `${wInfo.arName}: ${wInfo.arSummary}`
                    : `${wInfo.name}: ${wInfo.summary}`
                }
              >
                {wInfo.icon}
              </span>
            )}

            {visitingNeighbor && (
              <div className="flex items-center gap-1 ms-1">
                <button
                  type="button"
                  onClick={onOpenVisitActionModal}
                  className="px-2 py-0.5 bg-[#c8a464] text-[#12151a] font-semibold text-[11px] rounded-full cursor-pointer"
                >
                  {isAr ? 'دبلوماسية' : 'Interact'}
                </button>
                <button
                  type="button"
                  onClick={onExitVisitMode}
                  className="px-2 py-0.5 bg-[#1f242d] text-[#e8dfd1] border border-[#a68956]/40 text-[11px] rounded-full cursor-pointer"
                >
                  {t.returnHome}
                </button>
              </div>
            )}
          </div>

          {/* TOP HUD DECORATIVE TIFINAGH REAL-TIME AD & AH CALENDAR DATE TICKER */}
          <div
            role="timer"
            aria-label="Top HUD Tifinagh AD and AH Real-Time Date Ticker"
            className="hidden xl:flex items-center gap-2 bg-gradient-to-b from-[#2b1a0e]/95 to-[#1a1008]/95 border border-[#c8a464]/65 rounded-full px-3.5 py-1 shadow-xl text-xs whitespace-nowrap"
          >
            <span className="text-[#e5c158] font-bold tracking-wider font-mono text-[11px] whitespace-nowrap">
              ⵣ {dateInfo.seasonTifinagh}
            </span>
            <span className="text-[#c8a464]/45">|</span>
            <span className="font-mono-num font-bold text-[#f5ebd6] whitespace-nowrap">
              {isAr ? dateInfo.formattedAr : dateInfo.formattedEn}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#4d2c16] border border-[#c8a464]/40 font-mono-num text-[10px] text-[#fef3c7] whitespace-nowrap">
              {dateInfo.liveSolarClock}
            </span>
            <span className="text-[#e5c158] font-bold text-[11px]">ⵣ</span>
          </div>
        </div>

        {/* TOP-RIGHT HUD: Sleek Dark Slate Resource Bar & Reference 3 Navigation Icons */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#12151a]/92 backdrop-blur-md border border-[#a68956]/35 rounded px-3 py-1.5 shadow-2xl text-xs">
          {/* 4 Core Strategy Counters: Gold, Silver, Prestige, Warriors + Holdings */}
          <div className="hidden sm:flex items-center gap-3.5 pe-2 border-e border-[#a68956]/25">
            <div className="flex items-center gap-1.5" title="Gold Dinars">
              <Amazigh1870Icon name="gold_dinar" className="w-4 h-4" />
              <div className="leading-tight">
                <div className="font-mono-num font-bold text-[#f5ebd6]">{goldDinars}</div>
                <div className="text-[9px] text-[#4ade80] font-mono-num">+9.2</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5" title="Silver Dirhams (Hassani)">
              <Amazigh1870Icon name="silver_dirham" className="w-4 h-4" />
              <div className="leading-tight">
                <div className="font-mono-num font-bold text-[#e2e8f0]">{silverDirhams}</div>
                <div className="text-[9px] text-[#4ade80] font-mono-num">+4.4</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5" title="Prestige (Official Seal)">
              <Amazigh1870Icon name="official_seal" className="w-4 h-4" />
              <div className="leading-tight">
                <div className="font-mono-num font-bold text-[#e5c158]">{prestigeScore}</div>
                <div className="text-[9px] text-[#e5c158] font-mono-num">+1.8</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5" title="Warriors (Khayyal & Moukhala)">
              <Amazigh1870Icon name="horse" className="w-4 h-4" />
              <div className="leading-tight">
                <div className="font-mono-num font-bold text-[#f5ebd6]">{totalWarriors}</div>
                <div className="text-[9px] text-[#9ca3af] font-mono-num">
                  {valley.roles.guards}G
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1" title="Controlled Ksour & Kasbah Holdings">
              <Amazigh1870Icon name="kasbah" className="w-3.5 h-3.5" />
              <span className="font-mono-num font-bold text-[#d6cbb9]">8/8</span>
            </div>
          </div>

          {/* Reference 3 Navigation Icons: Compass (Dashboard/Map), Moroccan Door (Home), Archive Chest (Reports), Gears (Settings) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Dashboard & 1870 Strategy Map"
              title={isAr ? 'لوحة الخريطة الاستراتيجية 1870' : '1870 Strategy Map Dashboard'}
              onClick={() => onToggleMapPage('topographic_1870')}
              className={`w-7 h-7 rounded flex items-center justify-center border cursor-pointer transition-colors ${
                isMapPageOpen
                  ? 'bg-[#2a2216] border-[#e5c158]'
                  : 'bg-[#181c23] hover:bg-[#232832] border-[#a68956]/35'
              }`}
            >
              <Amazigh1870Icon name="compass" className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Return to 3D Village Home"
              title={isAr ? 'قرية سوس ماسة (ثلاثية الأبعاد)' : 'Home — 3D Village View'}
              onClick={() => {
                if (isMapPageOpen) onToggleMapPage();
                if (isArchivalPageOpen && onToggleArchivalPage) onToggleArchivalPage();
              }}
              className={`w-7 h-7 rounded flex items-center justify-center border cursor-pointer transition-colors ${
                !isMapPageOpen && !isArchivalPageOpen
                  ? 'bg-[#2a2216] border-[#e5c158]'
                  : 'bg-[#181c23] hover:bg-[#232832] border-[#a68956]/35'
              }`}
            >
              <Amazigh1870Icon name="moroccan_door" className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Chronicle & Archive Chest"
              title={isAr ? 'خزانة السجلات والتقارير' : 'Archive Chest — Reports & Chronicle'}
              onClick={() => {
                if (isMapPageOpen) onToggleMapPage();
                onSelectDockTab('reports');
              }}
              className="w-7 h-7 rounded bg-[#181c23] hover:bg-[#232832] border border-[#a68956]/35 flex items-center justify-center cursor-pointer"
            >
              <Amazigh1870Icon name="archive_chest" className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Settings"
              title={isAr ? 'الإعدادات واللغة' : 'Settings & Language'}
              onClick={() => {
                if (isMapPageOpen) onToggleMapPage();
                onSelectDockTab('notes');
              }}
              className="w-7 h-7 rounded bg-[#181c23] hover:bg-[#232832] border border-[#a68956]/35 flex items-center justify-center cursor-pointer"
            >
              <Amazigh1870Icon name="gears" className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label={isMuted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              onClick={onToggleMute}
              className="w-7 h-7 rounded bg-[#181c23] hover:bg-[#232832] border border-[#a68956]/35 flex items-center justify-center text-[#c8a464] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                {isMuted ? (
                  <path d="M11 5L6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6" />
                ) : (
                  <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07" />
                )}
              </svg>
            </button>

            <button
              type="button"
              aria-label="Pause Game [P]"
              onClick={onTogglePause}
              className="w-7 h-7 rounded bg-[#181c23] hover:bg-[#232832] border border-[#a68956]/35 flex items-center justify-center text-[#c8a464] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT HUD: Reference 1 & 3 Circular Map-Mode Buttons + Decorative Tifinagh AD & AH Date Ticker */}
      <div className="fixed bottom-3 right-3 z-20 pointer-events-auto flex flex-col items-end gap-1.5 select-none">
        {/* Map Modes Box ("Details Map — Selecting: Holdings") */}
        <div className="bg-[#12151a]/92 backdrop-blur-md border border-[#a68956]/40 rounded px-2.5 py-2 shadow-2xl flex flex-col items-center gap-1.5">
          <div className="text-[10px] text-[#c8a464] leading-tight text-center">
            <div className="font-semibold text-[#e8dfd1]">Details Map</div>
            <div className="text-[#9ca3af]">Selecting: Holdings</div>
          </div>

          <div className="flex items-center gap-1.5">
            {mapModeButtons.map((btn, i) => {
              const active = isMapPageOpen && activeMapMode === btn.mode;
              return (
                <button
                  key={`${btn.mode}_${i}`}
                  type="button"
                  title={isAr ? btn.labelAr : btn.labelEn}
                  onClick={() => onToggleMapPage(btn.mode)}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                    active
                      ? 'bg-[#2c2216] border-[#e5c158] scale-110 shadow'
                      : 'bg-[#181c23] hover:bg-[#242a34] border-[#a68956]/50'
                  }`}
                >
                  <Amazigh1870Icon name={btn.icon} className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Decorative Tifinagh-Styled Date Ticker & Speed Bar (Real-time AD & AH Calendars) */}
        <div className="bg-[#12151a]/95 backdrop-blur-md border border-[#c8a464]/55 rounded px-3 py-1.5 shadow-2xl flex flex-col items-end gap-1 text-xs">
          <div className="w-full flex items-center justify-between gap-2 text-[10px] font-mono text-[#c8a464] border-b border-[#a68956]/30 pb-0.5">
            <span>{dateInfo.tifinaghTicker}</span>
            <span className="font-mono-num text-[#fef3c7]">
              {isAr ? sInfo.arName : sInfo.name} · {dateInfo.liveSolarClock}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono-num font-bold text-[#e5c158] whitespace-nowrap">
              {isAr ? dateInfo.dualCalendarBadgeAr : dateInfo.dualCalendarBadgeEn}
            </span>

            <div
              className="flex items-center bg-[#0c0e12] border border-[#a68956]/30 rounded p-0.5"
              role="group"
              aria-label={isAr ? 'سرعة الزمن' : 'Time speed'}
            >
              {SPEED_OPTIONS.map((opt) => {
                const active = timeSpeed === opt.speed;
                return (
                  <button
                    key={opt.speed}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSetTimeSpeed(opt.speed);
                    }}
                    className={`px-1.5 py-0.5 text-[10px] font-mono-num font-semibold rounded transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#c8a464] text-[#12151a]'
                        : 'text-[#9ca3af] hover:text-[#f5ebd6]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onAdvanceTime(10);
              }}
              className="px-2 py-0.5 bg-[#c8a464] hover:bg-[#dab776] text-[#12151a] font-semibold text-[11px] rounded cursor-pointer whitespace-nowrap"
            >
              {t.advanceSeason}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
