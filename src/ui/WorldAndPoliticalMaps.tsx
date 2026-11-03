import React, { useState } from 'react';
import { BUILDINGS_CONFIG } from '../game/config';
import { getTerritoryRadius } from '../game/terrain';
import { LanguageCode, NeighborValley, ValleyState } from '../game/types';
import { Amazigh1870Icon, Amazigh1870IconName, MoroccanSealEmblem } from './Icons';

export type MapModeType =
  | 'topographic_1870'
  | 'caravan_routes'
  | 'engraved_1870'
  | 'village_survey';

export interface WorldAndPoliticalMapsProps {
  valley: ValleyState;
  language: LanguageCode;
  isDrawerOpen?: boolean;
  activeMapMode?: MapModeType;
  onSelectMapMode?: (mode: MapModeType) => void;
  initialMode?: 'world' | 'politics';
  onVisitNeighbor: (neighbor: NeighborValley) => void;
  onSelectBuildingId?: (id: string) => void;
  onExpandTerritory: () => void;
  onTriggerMahalla: () => void;
  onTriggerMonthlyEvent: () => void;
  onClose?: () => void;
}

// Direct local paths to the user's 3 attached 1870 vintage engraved maps
const MAP_IMG_EMPIRE_1870 = `${import.meta.env.BASE_URL}assets/aistudio/cdf5649a-ca29-4e1b-9fd5-1615b04923c2_c8a8fb27.jpeg`;
const MAP_IMG_BARBARY_MOROCCO = `${import.meta.env.BASE_URL}assets/aistudio/914c15e4-e2ba-4430-96d1-c62d529c2b6e_7722907d.jpeg`;
const MAP_IMG_MAROCCO_INSET = `${import.meta.env.BASE_URL}assets/aistudio/pGvx5gdA_Ru8w9y0EOs8Y5LmvG9jN73aL4a5DEqqDUZf3eJp_W3_NOZvFvEQVc7d1K6IiSuGB0ufVVIpFSWckEnbj0CzEI1yeDm4MfkeBq7-lZil4FzhWrKxslzPs_f9BrNcDtnXrm22m7DKVJRKDFnOXJliXJXg0a5OWOt_CzyAotQ9jeOphHZFS-cL38vK_c55ba2b7.jpeg`;

interface KsarHoldingNode {
  id: string;
  nameEn: string;
  nameAr: string;
  regionEn: string;
  regionAr: string;
  x: number;
  y: number;
  garrison: number;
  levies: number;
  icon: Amazigh1870IconName;
  bannerColor: string;
  isCapital?: boolean;
  neighborIndex: number;
}

const MOROCCO_1870_HOLDINGS: KsarHoldingNode[] = [
  {
    id: 'ait_tamda',
    nameEn: 'Ksar Aït Tamda',
    nameAr: 'قصر آيت تامدا',
    regionEn: 'Souss-Massa Valley',
    regionAr: 'سهل سوس ماسة',
    x: 49,
    y: 52,
    garrison: 276,
    levies: 1340,
    icon: 'kasbah',
    bannerColor: '#7c2d12',
    isCapital: true,
    neighborIndex: 0,
  },
  {
    id: 'taroudant',
    nameEn: 'Kasbah Taroudant',
    nameAr: 'قصبة تارودانت',
    regionEn: 'Capital of Souss',
    regionAr: 'حاضرة سوس',
    x: 41,
    y: 47,
    garrison: 340,
    levies: 1580,
    icon: 'city_gate',
    bannerColor: '#854d0e',
    neighborIndex: 1,
  },
  {
    id: 'tiznit',
    nameEn: 'Ribat Tiznit',
    nameAr: 'رباط تزنيت',
    regionEn: 'Southern Souss',
    regionAr: 'سوس الأقصى',
    x: 34,
    y: 59,
    garrison: 220,
    levies: 980,
    icon: 'kasbah',
    bannerColor: '#1e3a8a',
    neighborIndex: 2,
  },
  {
    id: 'tafraout',
    nameEn: 'Agadir Tafraout',
    nameAr: 'أكادير تافراوت',
    regionEn: 'Anti-Atlas',
    regionAr: 'الأطلس الصغير',
    x: 45,
    y: 63,
    garrison: 195,
    levies: 840,
    icon: 'mountains',
    bannerColor: '#3f6212',
    neighborIndex: 3,
  },
  {
    id: 'marrakech',
    nameEn: 'Dar El-Makhzen Marrakech',
    nameAr: 'مراكش المحروسة',
    regionEn: 'Al-Haouz & High Atlas',
    regionAr: 'الحوز والأطلس الكبير',
    x: 48,
    y: 28,
    garrison: 520,
    levies: 2450,
    icon: 'palace',
    bannerColor: '#991b1b',
    neighborIndex: 4,
  },
  {
    id: 'tafilalet',
    nameEn: 'Ksar Sijilmasa — Tafilalet',
    nameAr: 'قصر تافيلالت وسجلماسة',
    regionEn: 'Ziz Oasis & Aït Atta',
    regionAr: 'واحة تافيلالت وآيت عطا',
    x: 72,
    y: 44,
    garrison: 310,
    levies: 1992,
    icon: 'caravan',
    bannerColor: '#92400e',
    neighborIndex: 5,
  },
  {
    id: 'iligh',
    nameEn: 'Zawiya of Iligh',
    nameAr: 'زاوية إيليغ وتازروالت',
    regionEn: 'Tazerwalt',
    regionAr: 'إمارة تازروالت',
    x: 39,
    y: 71,
    garrison: 240,
    levies: 1018,
    icon: 'mosque_arch',
    bannerColor: '#065f46',
    neighborIndex: 6,
  },
  {
    id: 'wad_noun',
    nameEn: 'Souk Guelmim — Wad Noun',
    nameAr: 'سوق كلميم — واد نون',
    regionEn: 'Gateway of the Sahara',
    regionAr: 'بوابة الصحراء المغربية',
    x: 31,
    y: 77,
    garrison: 260,
    levies: 1120,
    icon: 'market_tent',
    bannerColor: '#6b21a8',
    neighborIndex: 7,
  },
  {
    id: 'saguia_hamra',
    nameEn: 'Ribat Saguia el Hamra',
    nameAr: 'رباط الساقية الحمراء',
    regionEn: 'The Moroccan Sahara',
    regionAr: 'الصحراء المغربية',
    x: 52,
    y: 78,
    garrison: 185,
    levies: 890,
    icon: 'caravan',
    bannerColor: '#9a3412',
    neighborIndex: 8,
  },
  {
    id: 'draa_zawiya',
    nameEn: 'Zawiya Naciriya — Tamgrout',
    nameAr: 'الزاوية الناصرية — تامكروت',
    regionEn: 'Draa Valley Oasis',
    regionAr: 'وادي درعة',
    x: 61,
    y: 58,
    garrison: 210,
    levies: 1140,
    icon: 'mosque_arch',
    bannerColor: '#047857',
    neighborIndex: 9,
  },
];

/**
 * Full-Screen 1870 Moroccan Topographic & Historical Strategy Map Page
 * Fills 100% of the screen (`fixed inset-0 w-screen h-screen`) and adapts cleanly when the Left 1/3 Amghar Profile Drawer is open.
 */
export const WorldAndPoliticalMaps: React.FC<WorldAndPoliticalMapsProps> = ({
  valley,
  language,
  isDrawerOpen = false,
  activeMapMode = 'topographic_1870',
  onSelectMapMode,
  onVisitNeighbor,
  onSelectBuildingId,
  onExpandTerritory,
  onTriggerMahalla,
  onTriggerMonthlyEvent,
  onClose,
}) => {
  const isAr = language === 'ar';
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>('ait_tamda');
  const [engravedPlateIndex, setEngravedPlateIndex] = useState<0 | 1 | 2>(0);

  const selectedHolding =
    MOROCCO_1870_HOLDINGS.find((h) => h.id === selectedHoldingId) || MOROCCO_1870_HOLDINGS[0];
  const linkedNeighbor =
    valley.neighbors[selectedHolding.neighborIndex % Math.max(1, valley.neighbors.length)] ||
    valley.neighbors[0];

  const territoryLevel = valley.territoryLevel || 1;
  const territoryRadius = getTerritoryRadius(territoryLevel);
  const nextExpandCost = {
    earth: 35 * territoryLevel,
    stone: 20 * territoryLevel,
    silver: 20 * territoryLevel,
  };
  const canAffordExpand =
    territoryLevel < 4 &&
    valley.resources.earth >= nextExpandCost.earth &&
    valley.resources.stone >= nextExpandCost.stone &&
    valley.resources.silver >= nextExpandCost.silver;

  return (
    <section
      aria-label="Full-Screen 1870 Moroccan Strategy Map Page"
      className={`fixed inset-0 z-10 h-screen overflow-hidden bg-[#1b1a16] select-none transition-all duration-200 ${
        isDrawerOpen ? 'sm:pl-[430px] md:pl-[450px]' : ''
      }`}
    >
      {/* MODE 1 & 2: 1870 MOROCCAN TOPOGRAPHIC STRATEGY MAP & CARAVAN NETWORK */}
      {(activeMapMode === 'topographic_1870' || activeMapMode === 'caravan_routes') && (
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full object-cover"
          >
            <defs>
              {/* Rich Topographic Relief Gradients (Atlas Greens, Souss Ochres, Saharan Golds) */}
              <linearGradient id="atlanticSea" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1b2a32" />
                <stop offset="65%" stopColor="#233742" />
                <stop offset="100%" stopColor="#2c444e" />
              </linearGradient>
              <linearGradient id="moroccoTerrain" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="#4f5d3b" />
                <stop offset="35%" stopColor="#5e6840" />
                <stop offset="62%" stopColor="#7c7347" />
                <stop offset="85%" stopColor="#947c4c" />
                <stop offset="100%" stopColor="#a68750" />
              </linearGradient>
              <radialGradient id="soussPlainGlow" cx="45%" cy="52%" r="28%">
                <stop offset="0%" stopColor="#586f38" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#6c7842" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#857649" stopOpacity="0" />
              </radialGradient>
              <filter id="mountainRelief" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#14110c" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* 1. Atlantic Ocean & Coastline */}
            <rect width="1200" height="800" fill="url(#atlanticSea)" />
            {/* Coastal Wave Lines */}
            <path
              d="M 410 0 C 370 120, 310 240, 260 360 C 215 470, 170 590, 95 720 L 70 800"
              fill="none"
              stroke="#6c8c96"
              strokeWidth="8"
              opacity="0.25"
            />

            {/* 2. Main 1870 Moroccan Landmass (Haouz, High Atlas, Souss-Massa, Tafilalet, Wad Noun, Saguia el Hamra) */}
            <path
              d="M 425 0 L 1200 0 L 1200 800 L 80 800 C 155 640, 210 510, 265 375 C 315 250, 375 125, 425 0 Z"
              fill="url(#moroccoTerrain)"
              stroke="#3b3222"
              strokeWidth="3"
            />
            <rect width="1200" height="800" fill="url(#soussPlainGlow)" />

            {/* 3. Soft Fading Territorial Borders (1870 Confederations & Sultanate Domains) */}
            {/* Domain A: Souss-Massa & Aït Atta Confederation (Central Realm Border) */}
            <path
              d="M 255 395 C 340 355, 465 340, 585 355 C 685 370, 770 340, 895 375 C 945 435, 920 555, 825 620 C 710 675, 540 685, 390 665 C 290 650, 225 570, 215 495 C 225 450, 240 420, 255 395 Z"
              fill="#4a3b69"
              fillOpacity="0.16"
              stroke="#5c3d7a"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M 255 395 C 340 355, 465 340, 585 355 C 685 370, 770 340, 895 375 C 945 435, 920 555, 825 620 C 710 675, 540 685, 390 665 C 290 650, 225 570, 215 495 C 225 450, 240 420, 255 395 Z"
              fill="none"
              stroke="#e5c158"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />

            {/* Domain B: Sultanate of Morocco — Haouz & Marrakech Border */}
            <path
              d="M 425 0 L 1050 0 L 990 340 C 820 325, 670 350, 550 340 C 430 330, 330 350, 265 380 C 315 250, 375 125, 425 0 Z"
              fill="#7c2d12"
              fillOpacity="0.12"
              stroke="#8c3b20"
              strokeWidth="4"
              strokeDasharray="10 5"
            />

            {/* Domain C: Wad Noun & Saguia el Hamra (Southern Moroccan Sahara) */}
            <path
              d="M 215 495 C 295 595, 465 655, 760 645 L 980 800 L 80 800 C 135 680, 180 580, 215 495 Z"
              fill="#b45309"
              fillOpacity="0.14"
              stroke="#a66324"
              strokeWidth="4"
            />

            {/* 4. Rivers & Seguia Valleys (Oued Tensift, Oued Souss, Oued Massa, Oued Draa, Oued Ziz) */}
            <g fill="none" stroke="#2c5263" strokeLinecap="round">
              {/* Oued Souss */}
              <path d="M 250 430 C 360 445, 480 455, 630 415" strokeWidth="5.5" />
              {/* Oued Massa */}
              <path d="M 230 515 C 330 530, 440 545, 540 525" strokeWidth="4" />
              {/* Oued Draa */}
              <path d="M 650 375 C 690 480, 660 585, 460 695 C 330 740, 220 755, 145 765" strokeWidth="5" />
              {/* Oued Ziz (Tafilalet) */}
              <path d="M 830 260 C 855 360, 865 450, 895 570" strokeWidth="4.5" />
            </g>

            {/* 5. Sculpted High Atlas & Anti-Atlas Mountain Ranges */}
            <g filter="url(#mountainRelief)">
              {/* High Atlas Range (Adrar n Dren) */}
              <polygon points="440,350 515,275 590,350" fill="#4a443b" stroke="#292520" strokeWidth="1.5" />
              <polygon points="500,350 565,255 640,350" fill="#575046" stroke="#292520" strokeWidth="1.5" />
              <polygon points="545,280 565,255 588,282 565,292" fill="#e2e8f0" opacity="0.85" />
              <polygon points="585,345 660,260 735,345" fill="#4a443b" stroke="#292520" strokeWidth="1.5" />
              <polygon points="642,282 660,260 680,285 660,295" fill="#e2e8f0" opacity="0.85" />
              <polygon points="680,335 755,250 830,335" fill="#575046" stroke="#292520" strokeWidth="1.5" />
              {/* Anti-Atlas Range */}
              <polygon points="390,575 455,505 520,575" fill="#63533e" stroke="#2e251a" strokeWidth="1.4" />
              <polygon points="465,580 535,510 605,580" fill="#594a37" stroke="#2e251a" strokeWidth="1.4" />
              <polygon points="540,570 600,515 660,570" fill="#63533e" stroke="#2e251a" strokeWidth="1.4" />
            </g>

            {/* 6. Oasis Palm Groves & Saharan Sand Dunes */}
            {[
              { x: 580, y: 430 },
              { x: 470, y: 460 },
              { x: 740, y: 470 },
              { x: 855, y: 390 },
              { x: 380, y: 635 },
              { x: 695, y: 515 },
            ].map((grove, i) => (
              <g key={i} transform={`translate(${grove.x}, ${grove.y})`}>
                <circle cx="0" cy="0" r="14" fill="#2d4c2b" opacity="0.55" />
                <circle cx="10" cy="5" r="11" fill="#365933" opacity="0.65" />
                <circle cx="-8" cy="6" r="10" fill="#254024" opacity="0.65" />
              </g>
            ))}

            {/* 7. Caravan Trade Routes (Highlighted strongly in Caravan Mode) */}
            <g
              fill="none"
              stroke={activeMapMode === 'caravan_routes' ? '#fbbf24' : '#d6b87c'}
              strokeWidth={activeMapMode === 'caravan_routes' ? '3.5' : '2'}
              strokeDasharray="7 5"
              opacity={activeMapMode === 'caravan_routes' ? '0.95' : '0.6'}
            >
              {/* Marrakech -> Taroudant -> Aït Tamda -> Tiznit -> Wad Noun -> Saguia el Hamra */}
              <path d="M 576 224 L 492 376 L 588 416 L 408 472 L 372 616 L 312 704" />
              {/* Aït Tamda -> Draa Tamgrout -> Tafilalet */}
              <path d="M 588 416 L 732 464 L 864 352" />
              {/* Tiznit -> Iligh -> Tafraout -> Aït Tamda */}
              <path d="M 408 472 L 468 568 L 540 504 L 588 416" />
            </g>

            {/* 8. Authentic Engraved Regional Typography on the Map */}
            <g
              fontFamily="Cinzel, Georgia, serif"
              fontWeight="bold"
              fill="#1e1912"
              opacity="0.58"
              letterSpacing="4"
              textAnchor="middle"
            >
              <text x="640" y="165" fontSize="26" transform="rotate(-8 640 165)">
                EMPIRE OF MOROCCO
              </text>
              <text x="615" y="325" fontSize="22" transform="rotate(-14 615 325)">
                HIGH ATLAS MOUNTAINS
              </text>
              <text x="535" y="455" fontSize="24" fill="#14110c">
                SOUSS VALLEY
              </text>
              <text x="545" y="575" fontSize="19" transform="rotate(-10 545 575)">
                ANTI-ATLAS
              </text>
              <text x="920" y="385" fontSize="23" transform="rotate(-6 920 385)">
                TAFILALET
              </text>
              <text x="880" y="485" fontSize="21" transform="rotate(12 880 485)">
                AÏT ATTA
              </text>
              <text x="455" y="675" fontSize="20">
                WAD NOUN
              </text>
              <text x="530" y="750" fontSize="25" letterSpacing="6">
                SAGUIA EL HAMRA • MOROCCAN SAHARA
              </text>
            </g>
          </svg>

          {/* 9. Interactive Ksour, Kasbahs & Oasis Holdings with Troop/Garrison Banners */}
          {MOROCCO_1870_HOLDINGS.map((node) => {
            const isSelected = node.id === selectedHolding.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedHoldingId(node.id)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
                  isSelected ? 'z-20 scale-110' : 'z-10 hover:scale-105'
                }`}
              >
                {/* Capital Kasbah gets the Ornate Moroccan Yaz Emblem Crest */}
                {node.isCapital && (
                  <div className="mb-0.5">
                    <MoroccanSealEmblem className="w-8 h-9 drop-shadow-lg" />
                  </div>
                )}

                {/* Town / Ksar Nameplate Banner */}
                <div
                  className={`px-2.5 py-0.5 rounded-sm border flex items-center gap-1.5 shadow-lg whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1a1f29]/95 border-[#e5c158] text-[#f5ebd6]'
                      : 'bg-[#14171e]/90 border-[#a68956]/65 text-[#e8dfd1]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: node.bannerColor }}
                  >
                    <Amazigh1870Icon name={node.icon} className="w-3 h-3" />
                  </span>
                  <span className="font-display font-bold text-[11px] tracking-wide">
                    {isAr ? node.nameAr : node.nameEn}
                  </span>
                </div>

                {/* Garrison & Warrior Levy Counter Badge ("276 • 1340" style from Reference 1) */}
                <div className="mt-0.5 px-2 py-0.5 bg-[#111318]/92 border border-[#a68956]/55 rounded-sm flex items-center gap-1.5 text-[10px] font-mono-num text-[#f5ebd6] shadow">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span>{node.garrison}</span>
                  <span className="text-[#e5c158]">◆</span>
                  <span className="font-bold text-[#e5c158]">{node.levies}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MODE 3: VINTAGE 1870 ENGRAVED HISTORICAL PLATES (FULL VIEWPORT) */}
      {activeMapMode === 'engraved_1870' && (
        <div className="relative w-full h-full bg-[#e8d7b6] flex items-center justify-center">
          <img
            src={
              engravedPlateIndex === 0
                ? MAP_IMG_EMPIRE_1870
                : engravedPlateIndex === 1
                ? MAP_IMG_BARBARY_MOROCCO
                : MAP_IMG_MAROCCO_INSET
            }
            alt="1870 Engraved Historical Map of Morocco"
            className="w-full h-full object-contain bg-[#dfd0b2]"
          />

          {/* Minimalist Plate Switcher at Top-Center */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#12151a]/92 backdrop-blur-md border border-[#a68956]/45 rounded px-3 py-1.5 text-xs">
            {(
              [
                { idx: 0, en: '1870 Empire of Morocco', ar: 'إمبراطورية المغرب 1870' },
                { idx: 1, en: 'Atlas & Tafilalet Plate', ar: 'لوحة الأطلس وتافيلالت' },
                { idx: 2, en: 'Detailed Souss & Marrakech', ar: 'لوحة سوس ومراكش المفصلة' },
              ] as const
            ).map((pl) => (
              <button
                key={pl.idx}
                type="button"
                onClick={() => setEngravedPlateIndex(pl.idx)}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  engravedPlateIndex === pl.idx
                    ? 'bg-[#c8a464] text-[#12151a] font-bold'
                    : 'text-[#e5c158] hover:bg-[#1e232b]'
                }`}
              >
                {isAr ? pl.ar : pl.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODE 4: LOCAL KSAR & SEGUIA TERRITORY SURVEY (FULL VIEWPORT) */}
      {activeMapMode === 'village_survey' && (
        <div className="relative w-full h-full bg-[#181612] flex items-center justify-center p-6">
          <svg
            viewBox="-95 -95 190 190"
            className="w-full h-full max-w-[780px] max-h-[780px]"
            aria-label="Village Territory Survey"
          >
            <rect x="-92" y="-92" width="184" height="184" fill="#e8d7b6" stroke="#a68956" strokeWidth="1.5" />
            {[-60, -30, 0, 30, 60].map((coord) => (
              <g key={coord} stroke="#8c6b48" strokeWidth="0.25" strokeDasharray="2 2">
                <line x1={coord} y1="-89" x2={coord} y2="89" />
                <line x1="-89" y1={coord} x2="89" y2={coord} />
              </g>
            ))}
            <path
              d="M -18 -89 C -8 -35, 10 25, -12 89"
              fill="none"
              stroke="#3b6978"
              strokeWidth="7"
              opacity="0.5"
            />
            <rect
              x={-territoryRadius}
              y={-territoryRadius}
              width={territoryRadius * 2}
              height={territoryRadius * 2}
              fill="#c8a464"
              fillOpacity="0.22"
              stroke="#7c2d12"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
            {valley.buildings.map((b) => {
              const def = BUILDINGS_CONFIG[b.type];
              const isField = b.type === 'terrace_field' || b.type === 'walnut_grove';
              return (
                <g
                  key={b.id}
                  transform={`translate(${b.x}, ${b.z})`}
                  className="cursor-pointer"
                  onClick={() => {
                    if (onSelectBuildingId) onSelectBuildingId(b.id);
                    if (onClose) onClose();
                  }}
                >
                  <rect
                    x={isField ? -4.5 : -3.5}
                    y={-3.5}
                    width={isField ? 9 : 7}
                    height={7}
                    fill={isField ? '#4d7c0f' : '#7c2d12'}
                    stroke="#1c1917"
                    strokeWidth="0.7"
                  />
                  <title>{isAr ? def.arName : def.name}</title>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* SELECTED HOLDING / PROVINCE MINIMALIST SLATE CARD (Bottom-Left of Map Canvas) */}
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className={`fixed bottom-4 z-20 w-[320px] sm:w-[350px] bg-[#12151a]/92 backdrop-blur-md border border-[#a68956]/40 rounded p-3 text-xs text-[#e8dfd1] shadow-2xl space-y-2 transition-all ${
          isDrawerOpen ? 'left-4 sm:left-[462px]' : 'left-4'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#a68956]/25 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded flex items-center justify-center border border-[#c8a464]/60 shrink-0"
              style={{ backgroundColor: selectedHolding.bannerColor }}
            >
              <Amazigh1870Icon name={selectedHolding.icon} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm text-[#f5ebd6] truncate">
                {isAr ? selectedHolding.nameAr : selectedHolding.nameEn}
              </div>
              <div className="text-[10px] text-[#c8a464] truncate">
                {isAr ? selectedHolding.regionAr : selectedHolding.regionEn}
              </div>
            </div>
          </div>

          <div className="text-end font-mono-num shrink-0">
            <div className="text-[#e5c158] font-bold">{selectedHolding.levies}</div>
            <div className="text-[9px] text-[#9ca3af]">{isAr ? 'مقاتل' : 'Warriors'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          {linkedNeighbor && (
            <button
              type="button"
              onClick={() => onVisitNeighbor(linkedNeighbor)}
              className="flex-1 py-1.5 px-2.5 bg-[#261f16] hover:bg-[#382d1f] border border-[#c8a464]/50 rounded text-[#e5c158] font-semibold cursor-pointer flex items-center justify-center gap-1"
            >
              <Amazigh1870Icon name="caravan" className="w-3.5 h-3.5" />
              <span>{isAr ? 'إرسال قافلة / زيارة' : 'Visit & Caravan'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTriggerMonthlyEvent}
            className="py-1.5 px-2.5 bg-[#1b2028] hover:bg-[#262d38] border border-[#a68956]/40 rounded text-[#d6cbb9] cursor-pointer"
          >
            {isAr ? 'مجلس الجماعة' : 'Jmaa Council'}
          </button>

          {territoryLevel < 4 && (
            <button
              type="button"
              disabled={!canAffordExpand}
              onClick={onExpandTerritory}
              title={
                isAr
                  ? `توسيع أراضي القرية للمستوى ${territoryLevel + 1}`
                  : `Expand Territory to Lvl ${territoryLevel + 1}`
              }
              className={`py-1.5 px-2 rounded border cursor-pointer ${
                canAffordExpand
                  ? 'bg-[#1e3a2f] border-[#34d399]/60 text-[#4ade80]'
                  : 'bg-[#181b20] border-[#a68956]/20 text-[#6b7280] cursor-not-allowed'
              }`}
            >
              +1
            </button>
          )}
        </div>

        {onClose && (
          <div className="pt-1 border-t border-[#a68956]/20 flex items-center justify-between">
            <span className="text-[10px] text-[#9ca3af]">
              {isAr ? 'عرض الخريطة الكاملة (1870م)' : 'Full-Screen 1870 Map View'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (onSelectMapMode) onSelectMapMode('topographic_1870');
                onClose();
              }}
              className="text-[11px] text-[#e5c158] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <Amazigh1870Icon name="moroccan_door" className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة إلى القرية ثلاثية الأبعاد' : 'Return to 3D Village'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
