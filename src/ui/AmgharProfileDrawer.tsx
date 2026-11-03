import React, { useState } from 'react';
import { LanguageCode, NeighborValley, ValleyState } from '../game/types';
import { createInitialVillagerRoster, FAMILY_LINEAGES } from '../game/villagers';
import { Amazigh1870Icon, Amazigh1870IconName, MoroccanSealEmblem } from './Icons';

export interface AmgharProfileDrawerProps {
  isOpen: boolean;
  valley: ValleyState;
  language: LanguageCode;
  onClose: () => void;
  onSelectTerritory?: (territoryId: string) => void;
  onOpenFullMapPage?: () => void;
  onVisitNeighbor?: (neighbor: NeighborValley) => void;
  onArrangeMarriage?: () => void;
}

type DrawerTab = 'family' | 'jmaa' | 'artisans' | 'warriors';

interface TerritoryBadge {
  id: string;
  nameEn: string;
  nameAr: string;
  typeLabelEn: string;
  typeLabelAr: string;
  icon: Amazigh1870IconName;
  bgColor: string;
}

export const MOROCCO_1870_TERRITORY_TITLES: TerritoryBadge[] = [
  {
    id: 'ait_tamda',
    nameEn: 'Ksar Aït Tamda',
    nameAr: 'قصر آيت تامدا',
    typeLabelEn: 'Ancestral Kasbah',
    typeLabelAr: 'القصبة الأم',
    icon: 'kasbah',
    bgColor: '#7c2d12',
  },
  {
    id: 'taroudant',
    nameEn: 'Bab Taroudant',
    nameAr: 'حاضرة تارودانت',
    typeLabelEn: 'Walled Citadel',
    typeLabelAr: 'الحاضرة المسورة',
    icon: 'city_gate',
    bgColor: '#854d0e',
  },
  {
    id: 'tiznit',
    nameEn: 'Ribat Tiznit',
    nameAr: 'رباط تزنيت',
    typeLabelEn: 'Southern Fortress',
    typeLabelAr: 'رباط الجنوب',
    icon: 'kasbah',
    bgColor: '#1e3a8a',
  },
  {
    id: 'tafraout',
    nameEn: 'Agadir Tafraout',
    nameAr: 'أكادير تافراوت',
    typeLabelEn: 'Mountain Granary',
    typeLabelAr: 'حصن الأطلس الصغير',
    icon: 'mountains',
    bgColor: '#3f6212',
  },
  {
    id: 'iligh',
    nameEn: 'Zawiya of Iligh',
    nameAr: 'إيليغ وتازروالت',
    typeLabelEn: 'Caravan Hub',
    typeLabelAr: 'زاوية التجارة',
    icon: 'mosque_arch',
    bgColor: '#065f46',
  },
  {
    id: 'tafilalet',
    nameEn: 'Oasis of Tafilalet',
    nameAr: 'واحة تافيلالت',
    typeLabelEn: 'Date & Caravan Oasis',
    typeLabelAr: 'واحة القوافل',
    icon: 'caravan',
    bgColor: '#92400e',
  },
  {
    id: 'wad_noun',
    nameEn: 'Souk of Wad Noun',
    nameAr: 'سوق واد نون (كلميم)',
    typeLabelEn: 'Saharan Market',
    typeLabelAr: 'سوق القوافل',
    icon: 'market_tent',
    bgColor: '#6b21a8',
  },
  {
    id: 'saguia_hamra',
    nameEn: 'Saguia el Hamra',
    nameAr: 'الساقية الحمراء',
    typeLabelEn: 'Southern Ribat',
    typeLabelAr: 'رباط الصحراء المغربية',
    icon: 'caravan',
    bgColor: '#9a3412',
  },
];

interface LineageMember {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  age: string;
  variant: 'elder_m' | 'elder_f' | 'amghar' | 'lalla' | 'youth_m' | 'youth_f';
  opinion?: number;
}

const PARENTS_LIST: LineageMember[] = [
  {
    id: 'p1',
    nameEn: 'Amghar Sidi Brahim',
    nameAr: 'الأمغار سيدي إبراهيم',
    roleEn: 'Late Father',
    roleAr: 'الوالد الراحل',
    age: '†68',
    variant: 'elder_m',
  },
  {
    id: 'p2',
    nameEn: 'Lalla Fadma n-Aït Atta',
    nameAr: 'لالة فاطمة آيت عطا',
    roleEn: 'Mother',
    roleAr: 'الوالدة',
    age: '81',
    variant: 'elder_f',
    opinion: 23,
  },
];

const GRANDPARENTS_LIST: LineageMember[] = [
  {
    id: 'gp1',
    nameEn: 'Sheikh Mhand u-Ali',
    nameAr: 'الشيخ محند أوعلي',
    roleEn: 'Paternal Grandfather',
    roleAr: 'الجد للأب',
    age: '†74',
    variant: 'elder_m',
  },
  {
    id: 'gp2',
    nameEn: 'Lalla Tuda n-Souss',
    nameAr: 'لالة تودة السوسية',
    roleEn: 'Paternal Grandmother',
    roleAr: 'الجدة للأب',
    age: '†70',
    variant: 'elder_f',
  },
  {
    id: 'gp3',
    nameEn: 'Qaid Said n-Dades',
    nameAr: 'القائد سعيد ندادس',
    roleEn: 'Maternal Grandfather',
    roleAr: 'الجد للأم',
    age: '†79',
    variant: 'elder_m',
  },
  {
    id: 'gp4',
    nameEn: 'Lalla Itto n-Tafilalet',
    nameAr: 'لالة إيطو الفيلالية',
    roleEn: 'Maternal Grandmother',
    roleAr: 'الجدة للأم',
    age: '†72',
    variant: 'elder_f',
  },
];

const CHILDREN_LIST: LineageMember[] = [
  {
    id: 'ch1',
    nameEn: 'Amzwaro Sidi Youssef',
    nameAr: 'أمزوارو سيدي يوسف',
    roleEn: 'Player Heir',
    roleAr: 'ولي العهد (أمزوارو)',
    age: '26',
    variant: 'youth_m',
    opinion: 18,
  },
  {
    id: 'ch2',
    nameEn: 'Lalla Zaynab',
    nameAr: 'لالة زينب',
    roleEn: 'Daughter',
    roleAr: 'الابنة',
    age: '21',
    variant: 'youth_f',
    opinion: 25,
  },
  {
    id: 'ch3',
    nameEn: 'Idir u-Hassan',
    nameAr: 'إيدير بن الحسن',
    roleEn: 'Younger Son',
    roleAr: 'الابن الأصغر',
    age: '17',
    variant: 'youth_m',
    opinion: 14,
  },
];

const SIBLINGS_LIST: LineageMember[] = [
  {
    id: 'sb1',
    nameEn: 'Lalla Khadija',
    nameAr: 'لالة خديجة',
    roleEn: 'Elder Sister',
    roleAr: 'الأخت الكبرى',
    age: '64',
    variant: 'elder_f',
    opinion: 12,
  },
  {
    id: 'sb2',
    nameEn: 'Lalla Aicha',
    nameAr: 'لالة عائشة',
    roleEn: 'Sister',
    roleAr: 'الأخت',
    age: '58',
    variant: 'lalla',
    opinion: 9,
  },
  {
    id: 'sb3',
    nameEn: 'Sidi Hammou',
    nameAr: 'سيدي حمو',
    roleEn: 'Brother (Envoys)',
    roleAr: 'الأخ (المبعوث)',
    age: '55',
    variant: 'amghar',
    opinion: 14,
  },
  {
    id: 'sb4',
    nameEn: 'Lalla Maryam',
    nameAr: 'لالة مريم',
    roleEn: 'Sister (Iligh)',
    roleAr: 'الأخت (إيليغ)',
    age: '51',
    variant: 'lalla',
    opinion: -12,
  },
  {
    id: 'sb5',
    nameEn: 'Amghar Lahcen',
    nameAr: 'الأمغار لحسن',
    roleEn: 'Brother (Khayyal)',
    roleAr: 'الأخ (قائد الخيالة)',
    age: '48',
    variant: 'youth_m',
    opinion: 14,
  },
  {
    id: 'sb6',
    nameEn: 'Sidi Moussa',
    nameAr: 'سيدي موسى',
    roleEn: 'Younger Brother',
    roleAr: 'الأخ الأصغر',
    age: '44',
    variant: 'elder_m',
    opinion: 8,
  },
];

/**
 * Authentic 1870 Moroccan Amazigh Mini-Portrait SVG
 */
const AmazighMiniPortrait: React.FC<{
  variant: LineageMember['variant'];
  deceased?: boolean;
}> = ({ variant, deceased }) => {
  const isFemale = variant === 'elder_f' || variant === 'lalla' || variant === 'youth_f';
  const isElder = variant === 'elder_m' || variant === 'elder_f';
  return (
    <svg
      viewBox="0 0 48 56"
      className={`w-full h-full ${deceased ? 'grayscale opacity-80' : ''}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Horseshoe Arch Kasbah Backdrop */}
      <rect width="48" height="56" fill="#17191d" />
      <path d="M9 56V26a15 15 0 1 1 30 0v30" fill="#22252a" stroke="#6b5636" strokeWidth="1" />
      {/* Shoulders / Burnous or Indigo Amazigh Garment */}
      <path
        d="M6 56c2-11 8-16 18-16s16 5 18 16"
        fill={isFemale ? '#1e3a8a' : '#292524'}
        stroke="#a68956"
        strokeWidth="1"
      />
      {isFemale ? (
        <>
          {/* Silver Tizerzai Fibula Brooches & Amber Necklace */}
          <polygon points="15,43 20,43 17.5,49" fill="#cbd5e1" />
          <polygon points="28,43 33,43 30.5,49" fill="#cbd5e1" />
          <path d="M17.5 44c3 3 7 3 13 0" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="2 1" />
        </>
      ) : (
        /* Burnous Collar & Silver Koumya Cord */
        <path d="M18 40l6 10 6-10" stroke="#c8a464" strokeWidth="1.3" />
      )}
      {/* Head & Turban / Headscarf */}
      <ellipse cx="24" cy="25" rx="8.5" ry="10" fill="#c69c72" />
      {isFemale ? (
        <>
          {/* Amazigh Headpiece & Silver Diadem (Tagemmout) */}
          <path d="M14 23c0-8 4.5-12 10-12s10 4 10 12v14H14V23z" fill="#172554" opacity="0.65" />
          <path d="M15 17h18" stroke="#e2e8f0" strokeWidth="2.2" />
          <circle cx="24" cy="17" r="1.6" fill="#f59e0b" />
        </>
      ) : (
        <>
          {/* White Razza Turban */}
          <path
            d="M14.5 20c0-5.5 4.2-9 9.5-9s9.5 3.5 9.5 9c0 1.2-4.2 2-9.5 2s-9.5-.8-9.5-2z"
            fill="#f5ebd6"
            stroke="#c8a464"
            strokeWidth="0.9"
          />
          <path d="M16 17.5h16" stroke="#d6c7b2" strokeWidth="1" />
          {/* Beard */}
          <path
            d="M16.5 27c.8 6 3.5 8.5 7.5 8.5s6.7-2.5 7.5-8.5"
            fill={isElder ? '#e5e7eb' : '#292524'}
          />
        </>
      )}
      {/* Eyes */}
      <circle cx="21" cy="24" r="1" fill="#1c1917" />
      <circle cx="27" cy="24" r="1" fill="#1c1917" />
    </svg>
  );
};

/**
 * Left 1/3 Docked Dark Slate Character & Dynasty Panel (Reference 1 Layout + Reference 3 1870 Moroccan Iconography)
 * Hidden when closed; opens when clicking the Top-Left Circular Amghar Profile Medallion.
 */
export const AmgharProfileDrawer: React.FC<AmgharProfileDrawerProps> = ({
  isOpen,
  valley,
  language,
  onClose,
  onSelectTerritory,
  onOpenFullMapPage,
  onVisitNeighbor,
  onArrangeMarriage,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('family');
  const [selectedTitleId, setSelectedTitleId] = useState<string>('ait_tamda');
  const isAr = language === 'ar';

  if (!isOpen) return null;

  const goldDinars = 1431 + Math.round(valley.resources.silver * 2);
  const silverDirhams = 1102 + Math.round(valley.resources.silver);
  const prestigeScore = Math.max(141, Math.round(valley.meters.prestige));
  const totalWarriors =
    120 + valley.roles.guards * 35 + valley.households * 12 + Math.round(valley.resources.arms * 4);

  const roster =
    valley.villagerRoster && valley.villagerRoster.length > 0
      ? valley.villagerRoster
      : createInitialVillagerRoster();

  const traits = [
    {
      id: 'just',
      nameEn: 'Master of Azref (Customary Law)',
      nameAr: 'حكيم أعراف أزرف',
      icon: 'scales' as Amazigh1870IconName,
      bg: 'from-[#3b2f1e] to-[#1e1810]',
    },
    {
      id: 'caravan_lord',
      nameEn: 'Protector of Souss Caravans',
      nameAr: 'حامي قوافل سوس والصحراء',
      icon: 'caravan' as Amazigh1870IconName,
      bg: 'from-[#1f3328] to-[#111c16]',
    },
    {
      id: 'veteran',
      nameEn: 'High Atlas Strategist',
      nameAr: 'قائد دفاعات الأطلس',
      icon: 'moukhala' as Amazigh1870IconName,
      bg: 'from-[#3b1d1d] to-[#1f1010]',
    },
    {
      id: 'scholar',
      nameEn: 'Patron of Zawiya Naciriya',
      nameAr: 'راعي الزاوية الناصرية',
      icon: 'qalam' as Amazigh1870IconName,
      bg: 'from-[#28263b] to-[#141320]',
    },
  ];

  const skills: Array<{
    id: string;
    labelEn: string;
    labelAr: string;
    value: number;
    icon: Amazigh1870IconName;
  }> = [
    { id: 'regulation', labelEn: 'Regulation', labelAr: 'الأحكام', value: 14, icon: 'scales' },
    { id: 'admin', labelEn: 'Administration', labelAr: 'التدبير', value: 12, icon: 'qalam' },
    { id: 'trade', labelEn: 'Trade', labelAr: 'القوافل', value: 15, icon: 'caravan' },
    { id: 'martial', labelEn: 'Martial', labelAr: 'الفروسية', value: 11, icon: 'moukhala' },
    { id: 'diplomacy', labelEn: 'Diplomacy', labelAr: 'الشورى', value: 13, icon: 'council' },
    { id: 'records', labelEn: 'Knowledge', labelAr: 'العلم', value: 9, icon: 'records' },
  ];

  return (
    <aside
      aria-label="Amghar Character and Dynasty Sheet"
      className="fixed top-0 left-0 bottom-0 z-30 w-full sm:w-[430px] md:w-[450px] bg-[#13161b]/95 backdrop-blur-md border-r border-[#a68956]/45 text-[#e8dfd1] flex flex-col select-none shadow-2xl overflow-y-auto"
    >
      {/* Thin Ornate Amazigh Bronze Geometric Weaving Header Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#5c4522] via-[#c8a464] to-[#5c4522] shrink-0" />

      {/* 1. TOP CHARACTER SCENE & TRIBAL EMBLEM */}
      <div className="relative h-[220px] w-full bg-[#181512] border-b border-[#a68956]/35 overflow-hidden shrink-0">
        {/* 1870 Moroccan Kasbah Courtyard with Horseshoe Arch & Zellij Tilework */}
        <svg viewBox="0 0 450 220" className="w-full h-full object-cover" aria-hidden="true">
          <defs>
            <linearGradient id="courtyardWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#261e17" />
              <stop offset="60%" stopColor="#1b1510" />
              <stop offset="100%" stopColor="#100d0a" />
            </linearGradient>
            <pattern id="zellijPattern" width="18" height="18" patternUnits="userSpaceOnUse">
              <rect width="18" height="18" fill="#172026" />
              <polygon points="9,1 17,9 9,17 1,9" fill="none" stroke="#a68956" strokeWidth="0.6" opacity="0.45" />
              <circle cx="9" cy="9" r="2" fill="#0f5257" opacity="0.55" />
            </pattern>
          </defs>

          {/* Courtyard Archways & Zellij Dado */}
          <rect width="450" height="220" fill="url(#courtyardWall)" />
          <rect x="0" y="135" width="450" height="85" fill="url(#zellijPattern)" />
          <line x1="0" y1="135" x2="450" y2="135" stroke="#c8a464" strokeWidth="1" opacity="0.6" />

          {/* Background Horseshoe Arches */}
          <path
            d="M40 165V88a48 48 0 1 1 96 0v77"
            fill="#12161f"
            stroke="#a68956"
            strokeWidth="1.5"
          />
          <path
            d="M175 165V88a48 48 0 1 1 96 0v77"
            fill="#161b26"
            stroke="#c8a464"
            strokeWidth="1.5"
          />
          <path
            d="M310 165V88a45 45 0 1 1 90 0v77"
            fill="#12161f"
            stroke="#a68956"
            strokeWidth="1.5"
          />

          {/* FIGURE 1 (LEFT): AMGHAR EL-HAJJ AL-HASSAN (62, white beard, dark wool burnous, white razza turban, silver koumya dagger) */}
          <g transform="translate(46, 20)">
            {/* Dark Wool Burnous Cloak */}
            <path
              d="M12 195c5-58 26-85 68-85s63 27 68 85"
              fill="#221f1d"
              stroke="#a68956"
              strokeWidth="1.4"
            />
            {/* Cream Djellaba Tunic Underneath */}
            <path d="M56 112h48l8 83H48l8-83z" fill="#dfd3be" />
            {/* Crimson Silk Shoulder Cord & Silver Curved Koumya Dagger */}
            <path d="M52 118l48 54" stroke="#991b1b" strokeWidth="3" />
            <path
              d="M86 168c12-4 22-14 25-24l5 3c-4 14-15 24-28 28z"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <circle cx="88" cy="168" r="3.5" fill="#f59e0b" />
            {/* Head & Sun-Weathered Face */}
            <ellipse cx="80" cy="68" rx="24" ry="29" fill="#c6966b" />
            {/* Full White Beard & Mustache */}
            <path
              d="M57 74c2 22 11 33 23 33s21-11 23-33c-6 4-14 6-23 6s-17-2-23-6z"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <path d="M68 78c4-2 8-2 12 0 4-2 8-2 12 0" stroke="#94a3b8" strokeWidth="2" />
            {/* Eyes & Brows */}
            <path d="M65 58h9M86 58h9" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="70" cy="63" r="2.2" fill="#1c1917" />
            <circle cx="90" cy="63" r="2.2" fill="#1c1917" />
            {/* White Folded Razza Turban */}
            <path
              d="M52 52c0-18 12-29 28-29s28 11 28 29c0 5-12 8-28 8s-28-3-28-8z"
              fill="#f8f4ec"
              stroke="#c8a464"
              strokeWidth="1.2"
            />
            <path d="M55 44c12-5 38-5 50 0M57 50c12-4 34-4 46 0" stroke="#d6cbb9" strokeWidth="1.2" />
          </g>

          {/* FIGURE 2 (CENTER): SPOUSE LALLA (Indigo Amazigh garments, silver fibula brooches, amber jewelry) */}
          <g transform="translate(178, 38)">
            {/* Deep Indigo Amazigh Melhfa / Garment */}
            <path
              d="M15 178c6-48 22-68 54-68s48 20 54 68"
              fill="#172554"
              stroke="#93c5fd"
              strokeWidth="1"
            />
            {/* Crimson & Gold Woven Belt */}
            <rect x="38" y="156" width="62" height="8" fill="#991b1b" stroke="#e5c158" strokeWidth="0.8" />
            {/* Silver Tizerzai Fibula Brooches & Chain */}
            <polygon points="44,122 58,122 51,138" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            <polygon points="80,122 94,122 87,138" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            <path d="M51 128c10 9 26 9 36 0" stroke="#f59e0b" strokeWidth="2.8" strokeDasharray="3 2" />
            {/* Amber & Coral Necklace */}
            <circle cx="69" cy="124" r="3.5" fill="#d97706" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="60" cy="122" r="2.5" fill="#b91c1c" />
            <circle cx="78" cy="122" r="2.5" fill="#b91c1c" />
            {/* Head & Indigo Veil */}
            <path d="M44 65c0-20 11-30 25-30s25 10 25 30v48H44V65z" fill="#1e3a8a" />
            <ellipse cx="69" cy="68" rx="19" ry="23" fill="#d2a679" />
            {/* Silver & Amber Amazigh Forehead Diadem (Tagemmout) */}
            <rect x="49" y="46" width="40" height="6" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.9" />
            <circle cx="69" cy="49" r="2.5" fill="#d97706" />
            <circle cx="57" cy="49" r="1.8" fill="#991b1b" />
            <circle cx="81" cy="49" r="1.8" fill="#991b1b" />
            {/* Eyes */}
            <circle cx="62" cy="65" r="1.8" fill="#1c1917" />
            <circle cx="76" cy="65" r="1.8" fill="#1c1917" />
          </g>
        </svg>

        {/* Top-Right Drawer Controls (Pin & Close X, matching Reference 1) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          {onOpenFullMapPage && (
            <button
              type="button"
              onClick={onOpenFullMapPage}
              title={isAr ? 'فتح خريطة المغرب 1870 الكاملة' : 'Open Full 1870 Strategy Map'}
              className="w-7 h-7 rounded bg-[#14171c]/85 hover:bg-[#232830] border border-[#a68956]/50 flex items-center justify-center text-[#c8a464] cursor-pointer"
            >
              <Amazigh1870Icon name="historical_map" className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="Close Amghar Profile Panel"
            onClick={onClose}
            className="w-7 h-7 rounded bg-[#14171c]/85 hover:bg-[#2c1919] border border-[#a68956]/50 flex items-center justify-center text-[#e5c158] font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Spouse Caption Badge */}
        <div className="absolute bottom-2 left-[195px] px-2 py-0.5 bg-[#101317]/85 border border-[#a68956]/40 rounded text-[10px] text-[#d6cbb9] flex items-center gap-1">
          <span>{isAr ? 'الزوجة (لالة)' : 'Spouse (Lalla)'}</span>
          <span className="text-[#4ade80] font-mono-num">+24</span>
        </div>

        {/* FIGURE 3 (RIGHT INSET): PLAYER HEIR (AMZWARO) */}
        <div className="absolute bottom-2 right-3 w-[76px] bg-[#14171d]/95 border border-[#c8a464]/65 rounded overflow-hidden shadow-xl">
          <div className="h-[68px] w-full relative">
            <AmazighMiniPortrait variant="youth_m" />
            <span className="absolute bottom-0.5 right-1 px-1 bg-[#101318]/90 text-[#4ade80] font-mono-num text-[9px] rounded">
              +18
            </span>
          </div>
          <div className="py-0.5 text-center text-[10px] text-[#d6cbb9] bg-[#0f1216] border-t border-[#a68956]/30 truncate px-1">
            {isAr ? 'ولي العهد (أمزوارو)' : 'Player Heir'}
          </div>
        </div>
      </div>

      {/* 1B. NAME BAR & 1870 MOROCCAN OFFICIAL SEAL / YAZ EMBLEM */}
      <div className="relative px-3.5 py-2.5 bg-[#161920] border-b border-[#a68956]/30 flex items-start justify-between gap-2 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="font-display font-bold text-[13px] leading-snug text-[#f5ebd6]">
              Amghar El-Hajj Al-Hassan of the Aït Atta, 62
            </h2>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] shrink-0" title="Healthy" />
          </div>
          <div className="text-[11px] text-[#a69882] flex items-center gap-1.5 mt-0.5">
            <span>{isAr ? 'الأمغار الحاج الحسن — آيت عطا وسوس' : 'Amghar of the Confederation'}</span>
            <span>·</span>
            <span className="text-[#c8a464]">{valley.name}</span>
          </div>

          {/* 4 Personality Trait Squares directly above the numbered skill icons */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {traits.map((tr) => (
              <div
                key={tr.id}
                title={isAr ? tr.nameAr : tr.nameEn}
                className={`w-8 h-8 rounded bg-gradient-to-b ${tr.bg} border border-[#c8a464]/60 flex items-center justify-center shadow-inner`}
              >
                <Amazigh1870Icon name={tr.icon} className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Ornate 1870 Moroccan Official Seal & Yaz (ⵣ) Tribal Emblem in tarnished brass & crimson wax */}
        <div className="flex flex-col items-center shrink-0">
          <MoroccanSealEmblem className="w-14 h-16 drop-shadow-lg" />
          <span className="text-[11px] font-display font-semibold text-[#e5c158] mt-0.5">
            {isAr ? 'آيت عطا' : 'Aït Atta'}
          </span>
        </div>
      </div>

      {/* 2. SKILLS ROW & CENTER AFFILIATION ("Zawiya Naciriya / Souss-Sahara Confederation") */}
      <div className="px-3.5 py-2 bg-[#111419] border-b border-[#a68956]/25 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Numbered Skill Columns */}
        <div className="flex items-center gap-1.5">
          {skills.map((sk) => (
            <div
              key={sk.id}
              title={isAr ? sk.labelAr : sk.labelEn}
              className="flex flex-col items-center bg-[#181c23] border border-[#a68956]/30 rounded px-1.5 py-1 min-w-[28px]"
            >
              <Amazigh1870Icon name={sk.icon} className="w-3.5 h-3.5" />
              <span className="font-mono-num font-bold text-xs text-[#f5ebd6] mt-0.5">
                {sk.value}
              </span>
            </div>
          ))}
        </div>

        {/* Right/Center Affiliation: Mosque Arch & Tifinagh/Yaz symbols */}
        <div className="flex items-center gap-2 bg-[#171b22] border border-[#a68956]/30 rounded px-2.5 py-1.5 min-w-0">
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <Amazigh1870Icon name="mosque_arch" className="w-4 h-4" />
            <Amazigh1870Icon name="yaz" className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#e5c158] truncate">
              Zawiya Naciriya
            </div>
            <div className="text-[10px] text-[#b8ab96] truncate">
              Souss-Sahara Confederation
            </div>
          </div>
        </div>
      </div>

      {/* 2B. RESOURCE BAR (4 Clean Counters: Gold, Silver, Prestige, Warriors) */}
      <div className="px-3.5 py-2 bg-[#151920] border-b border-[#a68956]/25 grid grid-cols-4 gap-2 text-xs shrink-0">
        <div className="flex items-center gap-1.5" title="Gold Dinars">
          <Amazigh1870Icon name="gold_dinar" className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-mono-num font-bold text-[#f5ebd6]">{goldDinars}</div>
            <div className="text-[9px] text-[#9ca3af]">{isAr ? 'الذهب' : 'Gold'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5" title="Silver Dirhams (Hassani)">
          <Amazigh1870Icon name="silver_dirham" className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-mono-num font-bold text-[#e2e8f0]">{silverDirhams}</div>
            <div className="text-[9px] text-[#9ca3af]">{isAr ? 'الفضة' : 'Silver'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5" title="Prestige (Official Seal)">
          <Amazigh1870Icon name="official_seal" className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-mono-num font-bold text-[#e5c158]">{prestigeScore}</div>
            <div className="text-[9px] text-[#9ca3af]">{isAr ? 'الهيبة' : 'Prestige'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5" title="Warriors (Khayyal & Moukhala)">
          <Amazigh1870Icon name="horse" className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-mono-num font-bold text-[#f5ebd6]">{totalWarriors}</div>
            <div className="text-[9px] text-[#9ca3af]">{isAr ? 'المقاتلون' : 'Warriors'}</div>
          </div>
        </div>
      </div>

      {/* 3. CONTROLLED TERRITORIES ("8 Titles") & DIPLOMACY STATUS */}
      <div className="px-3.5 py-2.5 bg-[#12161c] border-b border-[#a68956]/30 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Amazigh1870Icon name="kasbah" className="w-4 h-4" />
            <div>
              <div className="text-xs font-semibold text-[#f5ebd6]">
                {isAr
                  ? 'حلف سوس والأطلس وتافيلالت'
                  : 'Souss-Atlas & Tafilalet Confederation'}
              </div>
              <div className="text-[10px] text-[#c8a464]">
                {isAr ? 'إمارة قبلية ومجلس جماعة' : 'Tribal Confederation Realm'}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#a69882] font-semibold">
            ▸ {isAr ? 'الدبلوماسية' : 'Diplomacy'}
          </span>
        </div>

        {/* "8 Titles" Row + Right-side Diplomacy Banners */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#d6cbb9] me-1">8 Titles</span>
            {MOROCCO_1870_TERRITORY_TITLES.map((tBadge) => {
              const isSelected = selectedTitleId === tBadge.id;
              return (
                <button
                  key={tBadge.id}
                  type="button"
                  onClick={() => {
                    setSelectedTitleId(tBadge.id);
                    if (onSelectTerritory) onSelectTerritory(tBadge.id);
                  }}
                  title={`${tBadge.nameEn} (${tBadge.typeLabelEn})`}
                  className={`w-7 h-8 rounded-b-lg border flex items-center justify-center transition-transform cursor-pointer ${
                    isSelected
                      ? 'border-[#f5ebd6] scale-110 shadow-md'
                      : 'border-[#c8a464]/60 hover:scale-105'
                  }`}
                  style={{ backgroundColor: tBadge.bgColor }}
                >
                  <Amazigh1870Icon name={tBadge.icon} className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {/* Right side Diplomacy Banners (Tribal Alliances, Truces, Conflicts) */}
          <div className="flex items-center gap-1 shrink-0">
            <div
              title={isAr ? 'معاهدة تاضا مع قبائل سوس' : 'Active Tada Alliance: Souss & Iligh'}
              className="w-6 h-8 bg-gradient-to-b from-[#065f46] to-[#042f2e] border border-[#c8a464]/70 rounded-b flex items-center justify-center"
            >
              <Amazigh1870Icon name="council" className="w-3.5 h-3.5" />
            </div>
            <div
              title={isAr ? 'هدنة المحلة السلطانية (مراكش)' : 'Makhzen Truce & Caravan Safe-Conduct'}
              className="w-6 h-8 bg-gradient-to-b from-[#991b1b] to-[#450a0a] border border-[#c8a464]/70 rounded-b flex items-center justify-center"
            >
              <Amazigh1870Icon name="official_seal" className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. VILLAGE ROLE TABS & LINEAGE GRID (Bottom Left) */}
      <div className="bg-[#161a22] border-b border-[#a68956]/30 grid grid-cols-4 text-[11px] font-semibold shrink-0">
        {(
          [
            { id: 'family', label: 'Family', count: 12 },
            { id: 'jmaa', label: 'Jmaa Council', count: 5 },
            { id: 'artisans', label: 'Artisans & Souk', count: roster.length },
            { id: 'warriors', label: 'Warriors', count: Math.max(8, valley.roles.guards * 4) },
          ] as Array<{ id: DrawerTab; label: string; count: number }>
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1.5 border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                active
                  ? 'border-[#e5c158] bg-[#1e232d] text-[#f5ebd6]'
                  : 'border-transparent text-[#9ca3af] hover:text-[#e5c158]'
              }`}
            >
              <span className="truncate">{tab.label}</span>
              <span className="font-mono-num text-[10px] text-[#c8a464]">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {activeTab === 'family' && (
          <>
            {/* Top Row: Parents (2) & Grandparents (4) */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-4">
                <div className="text-[11px] text-[#a69882] mb-1 font-medium">Parents</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PARENTS_LIST.map((member) => (
                    <div
                      key={member.id}
                      title={`${member.nameEn} (${member.roleEn})`}
                      className="relative h-14 bg-[#181c23] border border-[#a68956]/45 rounded overflow-hidden"
                    >
                      <AmazighMiniPortrait
                        variant={member.variant}
                        deceased={member.age.startsWith('†')}
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/75 text-[9px] font-mono-num rounded text-[#d6cbb9]">
                        {member.opinion !== undefined ? `+${member.opinion}` : member.age}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-8">
                <div className="text-[11px] text-[#a69882] mb-1 font-medium">Grandparents</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRANDPARENTS_LIST.map((member) => (
                    <div
                      key={member.id}
                      title={`${member.nameEn} (${member.roleEn})`}
                      className="relative h-14 bg-[#181c23] border border-[#a68956]/40 rounded overflow-hidden"
                    >
                      <AmazighMiniPortrait variant={member.variant} deceased={true} />
                      <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/75 text-[9px] font-mono-num rounded text-[#9ca3af]">
                        {member.age}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Row: Children (3) + Marriage Action */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#a69882] font-medium">
                  Children ({CHILDREN_LIST.length})
                </span>
                {onArrangeMarriage && (
                  <button
                    type="button"
                    onClick={onArrangeMarriage}
                    className="px-2 py-0.5 bg-[#2a2117] hover:bg-[#3a2d1f] border border-[#c8a464]/50 rounded text-[10px] text-[#e5c158] cursor-pointer"
                  >
                    {isAr ? '+ عقد مصاهرة قبلية' : '+ Arrange Tribal Marriage'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {CHILDREN_LIST.map((child) => (
                  <div
                    key={child.id}
                    title={`${child.nameEn} — ${child.roleEn}`}
                    className="relative h-14 bg-[#181c23] border border-[#c8a464]/55 rounded overflow-hidden"
                  >
                    <AmazighMiniPortrait variant={child.variant} />
                    <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 text-[9px] font-mono-num text-[#4ade80] rounded">
                      +{child.opinion}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Siblings (6) */}
            <div>
              <div className="text-[11px] text-[#a69882] mb-1 font-medium">
                Siblings ({SIBLINGS_LIST.length})
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {SIBLINGS_LIST.map((sib) => (
                  <div
                    key={sib.id}
                    title={`${sib.nameEn} (${sib.roleEn})`}
                    className="relative h-14 bg-[#181c23] border border-[#a68956]/45 rounded overflow-hidden"
                  >
                    <AmazighMiniPortrait variant={sib.variant} />
                    <span
                      className={`absolute bottom-0.5 right-0.5 px-1 bg-black/80 text-[9px] font-mono-num rounded ${
                        (sib.opinion || 0) >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                      }`}
                    >
                      {(sib.opinion || 0) >= 0 ? `+${sib.opinion}` : sib.opinion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'jmaa' && (
          <div className="space-y-2 text-xs">
            <div className="text-[11px] text-[#c8a464] font-semibold">
              {isAr
                ? 'أعيان مجلس الجماعة والقبائل المجاورة:'
                : 'Elders of the Jmaa Council & Allied Chieftains:'}
            </div>
            {valley.neighbors.slice(0, 5).map((n) => (
              <div
                key={n.valleyId}
                className="p-2 bg-[#181c23] border border-[#a68956]/35 rounded flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#f5ebd6] truncate">
                    {isAr ? n.arOwnerName || n.ownerName : n.ownerName}
                  </div>
                  <div className="text-[10px] text-[#9ca3af] truncate">
                    {isAr ? n.arName || n.name : n.name} ·{' '}
                    {isAr ? n.arTribeName || n.tribeName : n.tribeName}
                  </div>
                </div>
                {onVisitNeighbor && (
                  <button
                    type="button"
                    onClick={() => onVisitNeighbor(n)}
                    className="px-2.5 py-1 bg-[#2b2218] hover:bg-[#3d3022] border border-[#c8a464]/50 rounded text-[11px] text-[#e5c158] cursor-pointer shrink-0"
                  >
                    {isAr ? 'مبعوث' : 'Envoy'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'artisans' && (
          <div className="space-y-2 text-xs">
            <div className="text-[11px] text-[#c8a464] font-semibold">
              {isAr
                ? 'أسر الحرفيين والسلالات الماهرة في القرية:'
                : 'Skilled Artisan Lineages & Souk Masters:'}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {roster.slice(0, 8).map((v) => {
                const lin = FAMILY_LINEAGES[v.lineageId];
                return (
                  <div
                    key={v.id}
                    className="p-2 bg-[#181c23] border border-[#a68956]/35 rounded flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#f5ebd6] text-[11px] truncate">
                        {isAr ? v.arName : v.name}
                      </div>
                      <div className="text-[10px] text-[#9ca3af] truncate">
                        {isAr ? lin.arName : lin.name}
                      </div>
                    </div>
                    <span className="font-mono-num text-[10px] text-[#e5c158] font-bold">
                      ★{v.skillLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'warriors' && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#181c23] border border-[#a68956]/35 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Amazigh1870Icon name="horse" className="w-5 h-5" />
                <div>
                  <div className="font-semibold text-[#f5ebd6]">
                    {isAr ? 'فرسان الخيالة وحماة القصبة' : 'Khayyal Cavalry & Kasbah Guards'}
                  </div>
                  <div className="text-[10px] text-[#9ca3af]">
                    {isAr
                      ? `البنادق (المكحلة): ${valley.resources.arms} · الحراس: ${valley.roles.guards}`
                      : `Moukhala Rifles: ${valley.resources.arms} · Guards: ${valley.roles.guards}`}
                  </div>
                </div>
              </div>
              <span className="font-mono-num font-bold text-sm text-[#e5c158]">
                {totalWarriors}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
