import React from 'react';
import { BuildingType, ResourceKey } from '../game/types';

export type Amazigh1870IconName =
  | 'compass'
  | 'moroccan_door'
  | 'gears'
  | 'search'
  | 'bell'
  | 'profile'
  | 'menu'
  | 'archive_chest'
  | 'palace'
  | 'council'
  | 'documents'
  | 'official_seal'
  | 'records'
  | 'scales'
  | 'kasbah'
  | 'city_gate'
  | 'caravan'
  | 'horse'
  | 'moukhala'
  | 'market_tent'
  | 'mosque_arch'
  | 'historical_map'
  | 'yaz'
  | 'tifinagh'
  | 'weaving'
  | 'fibula'
  | 'pottery'
  | 'mountains'
  | 'qalam'
  | 'calendar'
  | 'clock'
  | 'location_pin'
  | 'gold_dinar'
  | 'silver_dirham';

/**
 * 1870 Amazigh & Moroccan Engraved Brass / Sepia Icon Library (Reference Sheet 2/3)
 */
export const Amazigh1870Icon: React.FC<{
  name: Amazigh1870IconName;
  className?: string;
}> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'compass':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="13" r="8.5" stroke="#c8a464" strokeWidth="1.6" fill="#1b1814" />
          <circle cx="12" cy="13" r="6.5" stroke="#8c6d3b" strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          <circle cx="12" cy="3" r="1.4" stroke="#c8a464" strokeWidth="1.2" />
          <polygon points="12,6.5 14,13 12,11.5 10,13" fill="#e5c158" />
          <polygon points="12,19.5 14,13 12,14.5 10,13" fill="#8c6d3b" />
        </svg>
      );
    case 'moroccan_door':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" stroke="#c8a464" strokeWidth="1.5" fill="#181512" />
          <path
            d="M8 21V13.5a4.5 4.5 0 1 1 8 0V21"
            stroke="#e5c158"
            strokeWidth="1.5"
            fill="#271e16"
          />
          <line x1="12" y1="8.5" x2="12" y2="21" stroke="#c8a464" strokeWidth="1" />
          <circle cx="10.2" cy="15" r="0.8" fill="#e5c158" />
          <circle cx="13.8" cy="15" r="0.8" fill="#e5c158" />
        </svg>
      );
    case 'gears':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="9.5" cy="9.5" r="3.2" stroke="#c8a464" strokeWidth="1.6" fill="#231c14" />
          <path
            d="M9.5 4v1.8M9.5 13.2V15M4 9.5h1.8M13.2 9.5H15M5.6 5.6l1.3 1.3M12.1 12.1l1.3 1.3M13.4 5.6l-1.3 1.3M6.9 12.1l-1.3 1.3"
            stroke="#c8a464"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="15.5" r="2.6" stroke="#a68956" strokeWidth="1.4" fill="#1c1610" />
          <path
            d="M16 11.4v1.2M16 18.4v1.2M11.9 15.5h1.2M18.9 15.5h1.2"
            stroke="#a68956"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'archive_chest':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M3.5 9.5C3.5 7 6 5.5 12 5.5S20.5 7 20.5 9.5v9.5h-17V9.5z"
            fill="#2b2015"
            stroke="#c8a464"
            strokeWidth="1.5"
          />
          <line x1="3.5" y1="11" x2="20.5" y2="11" stroke="#e5c158" strokeWidth="1.4" />
          <rect x="10.5" y="9.5" width="3" height="3.8" rx="0.6" fill="#e5c158" stroke="#18120c" strokeWidth="0.9" />
          <path d="M6.5 6.2v12.8M17.5 6.2v12.8" stroke="#a68956" strokeWidth="1.1" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M5 20.5c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5"
            fill="#231c15"
            stroke="#c8a464"
            strokeWidth="1.5"
          />
          <path
            d="M7.5 10.5C7.5 6.5 9.3 4 12 4s4.5 2.5 4.5 6.5c0 2.5-1.5 4.5-4.5 4.5s-4.5-2-4.5-4.5z"
            fill="#2e241b"
            stroke="#e5c158"
            strokeWidth="1.4"
          />
          <path d="M8.5 7.5h7" stroke="#f5ebd6" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9.8 12.2c.8.8 1.5 1.1 2.2 1.1s1.4-.3 2.2-1.1" stroke="#d4c5b0" strokeWidth="1.2" />
        </svg>
      );
    case 'palace':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="9" width="4.5" height="11" fill="#2c2219" stroke="#c8a464" strokeWidth="1.3" />
          <rect x="16.5" y="9" width="4.5" height="11" fill="#2c2219" stroke="#c8a464" strokeWidth="1.3" />
          <rect x="7.5" y="7" width="9" height="13" fill="#382b1e" stroke="#e5c158" strokeWidth="1.4" />
          <path d="M9.5 7a2.5 2.5 0 0 1 5 0" fill="#c8a464" />
          <path d="M10 20v-4.2a2 2 0 1 1 4 0V20" fill="#14110e" stroke="#e5c158" strokeWidth="1.1" />
        </svg>
      );
    case 'council':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <ellipse cx="12" cy="15.5" rx="8" ry="3.8" fill="#2a2017" stroke="#c8a464" strokeWidth="1.4" />
          <circle cx="12" cy="7.5" r="1.8" fill="#e5c158" />
          <circle cx="7" cy="9.5" r="1.6" fill="#c8a464" />
          <circle cx="17" cy="9.5" r="1.6" fill="#c8a464" />
          <circle cx="5.2" cy="14" r="1.6" fill="#a68956" />
          <circle cx="18.8" cy="14" r="1.6" fill="#a68956" />
        </svg>
      );
    case 'documents':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M5 9.5L16.5 5l2.5 4.5-11.5 4.5L5 9.5z" fill="#d8c39e" stroke="#6b5132" strokeWidth="1.3" />
          <path d="M4.5 14.5l12-3.5 1.8 4.5-12 3.5-1.8-4.5z" fill="#e8d7b6" stroke="#6b5132" strokeWidth="1.3" />
          <path d="M11 7.2l2.5 9.5" stroke="#991b1b" strokeWidth="1.6" />
        </svg>
      );
    case 'official_seal':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <ellipse cx="12" cy="17.5" rx="5.8" ry="2.6" fill="#8c6d3b" stroke="#e5c158" strokeWidth="1.4" />
          <path
            d="M9.5 15.5l1.2-5.5c-.8-1.2-1-3 .3-4.2a2 2 0 0 1 2 0c1.3 1.2 1.1 3 .3 4.2l1.2 5.5H9.5z"
            fill="#c8a464"
            stroke="#2b1e12"
            strokeWidth="1.2"
          />
          <ellipse cx="12" cy="19.5" rx="6.5" ry="1.5" fill="#991b1b" opacity="0.85" />
        </svg>
      );
    case 'records':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3.5" y="14" width="9.5" height="3" rx="0.6" fill="#8c6d3b" stroke="#e5c158" strokeWidth="1.1" />
          <rect x="3.5" y="10.5" width="9.5" height="3" rx="0.6" fill="#6b5132" stroke="#c8a464" strokeWidth="1.1" />
          <rect x="3.5" y="17.5" width="9.5" height="3" rx="0.6" fill="#4a3722" stroke="#c8a464" strokeWidth="1.1" />
          <path d="M14.5 6.5l3-1 3 13.5-3 1-3-13.5z" fill="#7c5c38" stroke="#e5c158" strokeWidth="1.2" />
        </svg>
      );
    case 'scales':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 3.5v16.5M8 20h8M5 7.5h14" stroke="#e5c158" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M5.5 7.5L3.2 13.5h4.6L5.5 7.5z" fill="#c8a464" stroke="#e5c158" strokeWidth="1.1" />
          <path d="M18.5 7.5l-2.3 6h4.6l-2.3-6z" fill="#c8a464" stroke="#e5c158" strokeWidth="1.1" />
        </svg>
      );
    case 'kasbah':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="6,6 18,6 19.5,20.5 4.5,20.5" fill="#8c6239" stroke="#e5c158" strokeWidth="1.4" />
          <path d="M5.5 6V4h2.5v2h2.5V4h3v2h2.5V4h2.5v2" stroke="#e5c158" strokeWidth="1.4" />
          <rect x="10.5" y="15" width="3" height="5.5" rx="1.2" fill="#18120c" stroke="#c8a464" strokeWidth="1" />
          <rect x="9" y="9.5" width="1.8" height="2.4" fill="#18120c" />
          <rect x="13.2" y="9.5" width="1.8" height="2.4" fill="#18120c" />
        </svg>
      );
    case 'city_gate':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="16" fill="#6b4e31" stroke="#e5c158" strokeWidth="1.4" />
          <path
            d="M8.2 20.5v-6a4.2 4.2 0 1 1 7.6 0v6"
            fill="#14110e"
            stroke="#e5c158"
            strokeWidth="1.4"
          />
          <rect x="6" y="7" width="12" height="10" stroke="#c8a464" strokeWidth="0.9" fill="none" />
        </svg>
      );
    case 'caravan':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M4 18v-5c0-2 1.8-3.8 4-3.8 1.2 0 2.2-1.8 3.5-1.8 1.4 0 2.2 1.8 3.2 2.2l1.8-2.8c.4-.6 1.2-.8 1.8-.3.5.4.3 1.3-.2 2l-1.6 3.2V18"
            stroke="#e5c158"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="#8c6239"
          />
          <line x1="6" y1="14.5" x2="6" y2="19.5" stroke="#e5c158" strokeWidth="1.5" />
          <line x1="10.5" y1="14.5" x2="10.5" y2="19.5" stroke="#e5c158" strokeWidth="1.5" />
          <line x1="14.5" y1="14.5" x2="14.5" y2="19.5" stroke="#e5c158" strokeWidth="1.5" />
          <circle cx="20" cy="12" r="1.2" fill="#c8a464" />
          <path d="M19 19.5l1-5 1 5" stroke="#c8a464" strokeWidth="1.4" />
        </svg>
      );
    case 'horse':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M5 18.5l1.2-5.5c.5-2 2.5-3 5.5-3h3.2l2.3-4.2 2.3 1.5-1.5 3.8c-.3.9-.8 1.6-1.8 2v5.4"
            fill="#7c5c38"
            stroke="#e5c158"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect x="9" y="9.5" width="3.5" height="2.6" fill="#991b1b" stroke="#e5c158" strokeWidth="0.9" />
          <line x1="7.5" y1="13.5" x2="7" y2="19.5" stroke="#e5c158" strokeWidth="1.4" />
          <line x1="14.5" y1="13.5" x2="15" y2="19.5" stroke="#e5c158" strokeWidth="1.4" />
        </svg>
      );
    case 'moukhala':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <line x1="4" y1="19.5" x2="20" y2="4.5" stroke="#e5c158" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="20" y1="19.5" x2="4" y2="4.5" stroke="#c8a464" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="3.5,19.5 6.8,17.2 5.5,15.8 2.5,18.2" fill="#8c5828" stroke="#e5c158" strokeWidth="0.9" />
          <polygon points="20.5,19.5 17.2,17.2 18.5,15.8 21.5,18.2" fill="#8c5828" stroke="#e5c158" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="2" fill="#991b1b" stroke="#e5c158" strokeWidth="1.1" />
        </svg>
      );
    case 'market_tent':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="12,5 21,12.5 3,12.5" fill="#8c6239" stroke="#e5c158" strokeWidth="1.4" />
          <path d="M4.5 12.5v6.5h15v-6.5" fill="#261d15" stroke="#c8a464" strokeWidth="1.3" />
          <path d="M9 19v-4.5h6V19" fill="#140f0a" stroke="#e5c158" strokeWidth="1.1" />
          <line x1="12" y1="5" x2="12" y2="12.5" stroke="#e5c158" strokeWidth="1.1" />
        </svg>
      );
    case 'mosque_arch':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="5" y="3.5" width="14" height="17" fill="#261e16" stroke="#c8a464" strokeWidth="1.4" />
          <path
            d="M8.2 20.5v-6.5a4.2 4.2 0 1 1 7.6 0v6.5"
            fill="#120f0c"
            stroke="#e5c158"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="6.2" r="1" fill="#e5c158" />
        </svg>
      );
    case 'historical_map':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="5.5" width="16" height="13" rx="1" fill="#d8c39e" stroke="#c8a464" strokeWidth="1.4" />
          <path d="M4 7v10M20 7v10" stroke="#6b5132" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8 9.5c2-.8 3.5.5 5-.3s2.5-1.2 3.5 0M7.5 14c1.8-1 4-1.2 6.5-.2" stroke="#5c4024" strokeWidth="1.2" />
          <circle cx="10.5" cy="12" r="1.3" fill="#991b1b" />
        </svg>
      );
    case 'yaz':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M12 3.5v17M6.5 5.5C6.5 9.2 9 11 12 11s5.5-1.8 5.5-5.5M6.5 18.5C6.5 14.8 9 13 12 13s5.5 1.8 5.5 5.5"
            stroke="#e5c158"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'tifinagh':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M5 7v10M2.5 10.5h5M12 7v10M16.5 7h4.5M18.8 7v10M16.5 17h4.5" stroke="#e5c158" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2.2" stroke="#c8a464" strokeWidth="1.5" />
        </svg>
      );
    case 'weaving':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="12,4 19,12 12,20 5,12" stroke="#e5c158" strokeWidth="1.6" fill="#2b2016" />
          <polygon points="12,7.5 15.8,12 12,16.5 8.2,12" stroke="#c8a464" strokeWidth="1.2" fill="#991b1b" />
          <circle cx="12" cy="12" r="1.2" fill="#e5c158" />
        </svg>
      );
    case 'fibula':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="6,8 18,8 12,19.5" fill="#2c2520" stroke="#cbd5e1" strokeWidth="1.6" />
          <line x1="4" y1="8" x2="20" y2="8" stroke="#e5c158" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="6.2" r="1.8" stroke="#cbd5e1" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="1.5" fill="#991b1b" />
        </svg>
      );
    case 'pottery':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M9.5 4.5h5l-.8 3.2c2.5 1.8 3.5 4.5 2.5 8.2-.6 2.2-1.8 3.8-4.2 3.8s-3.6-1.6-4.2-3.8c-1-3.7 0-6.4 2.5-8.2L9.5 4.5z"
            fill="#9a5b32"
            stroke="#e5c158"
            strokeWidth="1.4"
          />
          <path d="M7.5 7.5c-2 0-2.5 3-.4 4M16.5 7.5c2 0 2.5 3 .4 4" stroke="#c8a464" strokeWidth="1.3" />
        </svg>
      );
    case 'mountains':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="2,19 9,8.5 15.5,19" fill="#3b3127" stroke="#c8a464" strokeWidth="1.4" />
          <polygon points="8.5,19 15,7 22,19" fill="#524334" stroke="#e5c158" strokeWidth="1.5" />
          <path d="M10.5 4.2a2.2 2.2 0 1 0 2.4 2.8 1.8 1.8 0 0 1-2.4-2.8z" fill="#e5c158" />
        </svg>
      );
    case 'qalam':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M4.5 19.5l3.5-1.2L19.5 6.8 17.2 4.5 5.7 16l-1.2 3.5z" fill="#c8a464" stroke="#e5c158" strokeWidth="1.3" />
          <rect x="14.5" y="15" width="4.5" height="4.5" rx="0.6" fill="#231c15" stroke="#c8a464" strokeWidth="1.3" />
        </svg>
      );
    case 'location_pin':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 1 1 13 0c0 4.8-6.5 11-6.5 11z"
            fill="#8c6239"
            stroke="#e5c158"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="10" r="2.5" fill="#18120c" stroke="#e5c158" strokeWidth="1.2" />
        </svg>
      );
    case 'gold_dinar':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="#d49b35" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="5.5" stroke="#78350f" strokeWidth="1" strokeDasharray="2 1.5" />
          <polygon points="12,8 15,12 12,16 9,12" fill="#fef08a" />
        </svg>
      );
    case 'silver_dirham':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="#94a3b8" stroke="#f1f5f9" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="5.5" stroke="#334155" strokeWidth="1" strokeDasharray="2 1.5" />
          <polygon points="12,8.2 14.8,12 12,15.8 9.2,12" fill="#e2e8f0" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7" stroke="#c8a464" strokeWidth="1.5" />
        </svg>
      );
  }
};

/**
 * Ornate 1870 Moroccan Official Seal & Yaz (ⵣ) Tribal Emblem in tarnished brass & crimson wax
 */
export const MoroccanSealEmblem: React.FC<{ className?: string }> = ({
  className = 'w-14 h-16',
}) => (
  <svg viewBox="0 0 64 74" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="sealBrass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f3d689" />
        <stop offset="50%" stopColor="#b88c42" />
        <stop offset="100%" stopColor="#6e4e1e" />
      </linearGradient>
      <radialGradient id="crimsonWax" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#b91c1c" />
        <stop offset="70%" stopColor="#7f1d1d" />
        <stop offset="100%" stopColor="#450a0a" />
      </radialGradient>
    </defs>
    {/* Shield / Seal Outer Tarnished Brass Frame */}
    <path
      d="M8 6h48v34c0 16-24 28-24 28S8 56 8 40V6z"
      fill="url(#crimsonWax)"
      stroke="url(#sealBrass)"
      strokeWidth="3.2"
    />
    {/* Inner Geometric Zellij / Amazigh Border */}
    <path
      d="M13 11h38v28c0 12.5-19 22-19 22S13 51.5 13 39V11z"
      fill="none"
      stroke="#e5c158"
      strokeWidth="1"
      strokeDasharray="3 1.5"
    />
    {/* Top Horseshoe Arch Crown Motif (No European Crown) */}
    <path
      d="M20 6c3-4 9-5 12-5s9 1 12 5"
      stroke="url(#sealBrass)"
      strokeWidth="2.2"
      fill="#7f1d1d"
    />
    {/* Central Tarnished Brass Yaz (ⵣ) Symbol */}
    <path
      d="M32 17v34M21 21c0 6.5 4.8 9.5 11 9.5s11-3 11-9.5M21 47c0-6.5 4.8-9.5 11-9.5s11 3 11 9.5"
      stroke="url(#sealBrass)"
      strokeWidth="3.8"
      strokeLinecap="round"
    />
    {/* Corner Brass Rosettes */}
    <circle cx="17" cy="15" r="1.6" fill="#f3d689" />
    <circle cx="47" cy="15" r="1.6" fill="#f3d689" />
  </svg>
);

/**
 * Richly shaded, tactile inline <svg> icons for resources and political meters
 */
export const ResourceIcon: React.FC<{
  type: ResourceKey | 'favor' | 'unrest' | 'vault' | 'homes';
  className?: string;
}> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'grain':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="grainGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M12 2.5v19" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx="9" cy="6.5" rx="2.3" ry="3.4" transform="rotate(-28 9 6.5)" fill="url(#grainGold)" stroke="#451a03" strokeWidth="1.2" />
          <ellipse cx="15" cy="6.5" rx="2.3" ry="3.4" transform="rotate(28 15 6.5)" fill="url(#grainGold)" stroke="#451a03" strokeWidth="1.2" />
          <ellipse cx="8.8" cy="11.5" rx="2.4" ry="3.5" transform="rotate(-30 8.8 11.5)" fill="url(#grainGold)" stroke="#451a03" strokeWidth="1.2" />
          <ellipse cx="15.2" cy="11.5" rx="2.4" ry="3.5" transform="rotate(30 15.2 11.5)" fill="url(#grainGold)" stroke="#451a03" strokeWidth="1.2" />
          <ellipse cx="9.2" cy="16.5" rx="2.2" ry="3.2" transform="rotate(-25 9.2 16.5)" fill="url(#grainGold)" stroke="#451a03" strokeWidth="1.2" />
          <ellipse cx="14.8" cy="16.5" rx="2.2" ry="3.2" transform="rotate(25 14.8 16.5)" fill="url(#grainGold)" stroke="#451a03" strokeWidth="1.2" />
          <path d="M12 3v18" stroke="#fef08a" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="waterBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="55%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
          </defs>
          <path d="M12 2.5C12 2.5 5 10.2 5 15a7 7 0 0014 0c0-4.8-7-12.5-7-12.5z" fill="url(#waterBlue)" stroke="#082f49" strokeWidth="1.8" />
          <path d="M8.5 14.5c0 2.2 1.5 3.8 3.5 4" stroke="#e0f2fe" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="9.5" cy="11" r="1" fill="#ffffff" opacity="0.85" />
        </svg>
      );
    case 'flocks':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M7.5 16.5v4M10.5 17v3.5M14.5 17v3.5M17 16.5v4" stroke="#3f2718" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="9" cy="11.5" r="4.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.4" />
          <circle cx="14" cy="11" r="5" fill="#f1f5f9" stroke="#334155" strokeWidth="1.4" />
          <circle cx="11.5" cy="8.5" r="4" fill="#ffffff" />
          <ellipse cx="6.2" cy="10.5" rx="2.6" ry="2.2" fill="#475569" stroke="#0f172a" strokeWidth="1.4" />
          <path d="M5.5 8.5c-1.8-.8-2.5.8-1.2 1.8" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="5.6" cy="10.2" r="0.65" fill="#fef08a" />
        </svg>
      );
    case 'earth':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="piseBrick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
          </defs>
          <polygon points="12,4 21,8.5 21,16.5 12,21 3,16.5 3,8.5" fill="url(#piseBrick)" stroke="#2a1205" strokeWidth="1.8" />
          <polygon points="12,4 21,8.5 12,13 3,8.5" fill="#fb923c" opacity="0.65" />
          <path d="M3 12.5l9 4.5 9-4.5M12 13v8" stroke="#431407" strokeWidth="1.4" />
        </svg>
      );
    case 'timber':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M6 7h13a3 3 0 010 6H6V7z" fill="#78350f" stroke="#271203" strokeWidth="1.6" />
          <circle cx="6" cy="10" r="3" fill="#fcd34d" stroke="#271203" strokeWidth="1.6" />
          <path d="M5 13h13a3 3 0 010 6H5v-6z" fill="#92400e" stroke="#271203" strokeWidth="1.6" />
          <circle cx="5" cy="16" r="3" fill="#fde68a" stroke="#271203" strokeWidth="1.6" />
          <circle cx="5" cy="16" r="1.2" fill="#b45309" />
        </svg>
      );
    case 'stone':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="11,3 20,7.5 18.5,18.5 6.5,20 3,11" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.8" />
          <polygon points="11,3 20,7.5 12.5,12 3,11" fill="#cbd5e1" />
          <polygon points="12.5,12 20,7.5 18.5,18.5 6.5,20" fill="#64748b" />
          <polyline points="3,11 12.5,12 18.5,18.5" stroke="#e2e8f0" strokeWidth="1.2" />
        </svg>
      );
    case 'walnuts':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <ellipse cx="12" cy="12.5" rx="6.8" ry="8" fill="#a16207" stroke="#271203" strokeWidth="1.8" />
          <ellipse cx="12" cy="12.5" rx="4.5" ry="5.6" fill="#d97706" stroke="#451a03" strokeWidth="1.1" />
          <path d="M12 4.5v16M8.5 9.5c2 1.2 5 1.2 7 0M8.5 15.5c2-1.2 5-1.2 7 0" stroke="#451a03" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'textiles':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="1.5" fill="#991b1b" stroke="#18120e" strokeWidth="1.8" />
          <rect x="4" y="7" width="16" height="10" fill="#1e3a8a" />
          <polygon points="12,7.5 16.5,12 12,16.5 7.5,12" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="1.4" fill="#991b1b" />
          <path d="M5 3v1.5M9 3v1.5M15 3v1.5M19 3v1.5M5 19.5V21M9 19.5V21M15 19.5V21M19 19.5V21" stroke="#fef3c7" strokeWidth="1.3" />
        </svg>
      );
    case 'silver':
      return <Amazigh1870Icon name="silver_dirham" className={className} />;
    case 'arms':
      return <Amazigh1870Icon name="moukhala" className={className} />;
    case 'prestige':
      return <Amazigh1870Icon name="official_seal" className={className} />;
    case 'favor':
      return <Amazigh1870Icon name="palace" className={className} />;
    case 'vault':
      return <Amazigh1870Icon name="archive_chest" className={className} />;
    case 'homes':
      return <Amazigh1870Icon name="kasbah" className={className} />;
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="12,3 21,19 3,19" fill="#ef4444" stroke="#18120e" strokeWidth="2" />
          <path d="M12 9v5M12 16.5v1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * Architectural miniature icons for each of the 15 High Atlas buildings in the Build Menu
 */
export const BuildingIcon: React.FC<{ type: BuildingType; className?: string }> = ({
  type,
  className = 'w-7 h-7',
}) => {
  switch (type) {
    case 'tighremt':
    case 'kasbah':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="7" width="6" height="21" fill="#b45309" stroke="#271203" strokeWidth="1.5" />
          <rect x="22" y="7" width="6" height="21" fill="#b45309" stroke="#271203" strokeWidth="1.5" />
          <rect x="9" y="11" width="14" height="17" fill="#d97706" stroke="#271203" strokeWidth="1.5" />
          <rect x="4" y="6" width="6" height="2.5" fill="#fef3c7" />
          <rect x="22" y="6" width="6" height="2.5" fill="#fef3c7" />
          <rect x="13.5" y="20" width="5" height="8" rx="2" fill="#451a03" />
          {type === 'kasbah' && <circle cx="16" cy="7" r="2.5" fill="#fbbf24" />}
        </svg>
      );
    case 'terrace_field':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="21" width="26" height="6" rx="1" fill="#64748b" stroke="#1e293b" strokeWidth="1.4" />
          <rect x="5" y="15" width="22" height="6" rx="1" fill="#65a30d" stroke="#1e293b" strokeWidth="1.4" />
          <rect x="8" y="9" width="16" height="6" rx="1" fill="#84cc16" stroke="#1e293b" strokeWidth="1.4" />
          <path d="M10 9V6M14 9V6M18 9V6M22 9V6" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'seguia':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="2" y="14" width="28" height="10" rx="1.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="2" y="16" width="28" height="5" fill="#0284c7" />
          <path d="M6 18.5h6M16 18.5h8" stroke="#bae6fd" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'walnut_grove':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="14" y="18" width="4" height="10" fill="#78350f" />
          <circle cx="12" cy="14" r="6" fill="#15803d" stroke="#052e16" strokeWidth="1.4" />
          <circle cx="19" cy="15" r="5.5" fill="#16a34a" stroke="#052e16" strokeWidth="1.4" />
          <circle cx="15.5" cy="10" r="5.5" fill="#22c55e" stroke="#052e16" strokeWidth="1.4" />
          <circle cx="14" cy="12" r="1.5" fill="#d97706" />
          <circle cx="18" cy="15" r="1.5" fill="#d97706" />
        </svg>
      );
    case 'sheepfold':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="16" width="24" height="10" rx="1" fill="#78350f" stroke="#271203" strokeWidth="1.5" />
          <circle cx="12" cy="19" r="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
          <circle cx="19" cy="19" r="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
          <path d="M3 16l13-7 13 7" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'water_mill':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="5" y="10" width="14" height="16" fill="#c2410c" stroke="#271203" strokeWidth="1.5" />
          <circle cx="20" cy="18" r="7" fill="#451a03" stroke="#d97706" strokeWidth="2" />
          <path d="M20 11v14M13 18h14M15 13l10 10M25 13L15 23" stroke="#fcd34d" strokeWidth="1.4" />
          <path d="M4 26h24" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'agadir':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="8" width="24" height="20" fill="#c2410c" stroke="#271203" strokeWidth="1.6" />
          <rect x="7" y="11" width="4" height="3" fill="#271203" />
          <rect x="14" y="11" width="4" height="3" fill="#271203" />
          <rect x="21" y="11" width="4" height="3" fill="#271203" />
          <rect x="7" y="16" width="4" height="3" fill="#271203" />
          <rect x="14" y="16" width="4" height="3" fill="#271203" />
          <rect x="21" y="16" width="4" height="3" fill="#271203" />
          <path d="M4 8h24" stroke="#fef3c7" strokeWidth="2.5" />
        </svg>
      );
    case 'watchtower':
    case 'wall_gate':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <polygon points="10,6 22,6 25,28 7,28" fill="#b45309" stroke="#271203" strokeWidth="1.6" />
          <rect x="9" y="4" width="14" height="3" fill="#fef3c7" />
          <rect x="14" y="11" width="4" height="5" fill="#271203" />
        </svg>
      );
    case 'mosque_zawiya':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <path d="M6 18a7 7 0 0114 0v10H6V18z" fill="#fef3c7" stroke="#271203" strokeWidth="1.5" />
          <rect x="21" y="6" width="6" height="22" fill="#d97706" stroke="#271203" strokeWidth="1.5" />
          <circle cx="24" cy="4" r="1.5" fill="#fbbf24" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="5" y="10" width="22" height="16" rx="1.5" fill="#b45309" stroke="#271203" strokeWidth="1.5" />
          <polygon points="3,11 16,5 29,11" fill="#991b1b" stroke="#fef3c7" strokeWidth="1.2" />
          <rect x="13" y="17" width="6" height="9" fill="#1e3a8a" />
        </svg>
      );
  }
};
