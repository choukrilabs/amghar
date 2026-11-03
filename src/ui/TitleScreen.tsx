import React, { useState } from 'react';
import { FICTIONAL_TRIBES } from '../game/config';
import { LanguageCode } from '../game/types';

export interface TitleScreenProps {
  initialAmgharName: string;
  initialValleyName: string;
  hasSavedValley: boolean;
  language?: LanguageCode;
  onStartGame: (amgharName: string, valleyName: string, isNewReset: boolean) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  initialAmgharName,
  initialValleyName,
  hasSavedValley,
  language = 'ar',
  onStartGame,
}) => {
  const isAr = language === 'ar';
  const defaultAmghar = isAr ? 'الأمغار طارق' : 'Amghar Tariq';
  const defaultValley = isAr ? 'آيت تامدا - سوس ماسة' : 'Ait Tamda of Tafza';

  const [amgharName, setAmgharName] = useState(initialAmgharName || defaultAmghar);
  const [valleyName, setValleyName] = useState(initialValleyName || defaultValley);
  const [selectedRegion, setSelectedRegion] = useState('Tafza-n-Ait Tamda (High Atlas)');

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAmghar = amgharName.trim() || defaultAmghar;
    const cleanValley = valleyName.trim() || defaultValley;
    onStartGame(cleanAmghar, cleanValley, false);
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-12"
    >
      {/* Asymmetric Composition over calm scrim; leaves live 3D valley camera tour unobstructed */}
      <div className="pointer-events-auto max-w-md w-full bg-[#1a130e]/92 border-2 border-[#c87d32]/70 rounded-md p-6 md:p-7 shadow-2xl">
        {/* Bespoke Inline <svg> Amazigh Title Emblem & Lockup */}
        <div className="mb-5">
          <svg
            viewBox="0 0 380 96"
            className="w-full h-auto"
            role="img"
            aria-label={isAr ? 'أطلس 1870 — أمغار سوس ماسة والأطلس' : 'Atlas 1870 — Amghar of the High Atlas'}
          >
            {/* Geometric Amazigh Zigzag & Diamond Crest */}
            <rect x="2" y="2" width="376" height="92" rx="4" fill="#231912" stroke="#c87d32" strokeWidth="2" />
            <path
              d="M12 12 L24 6 L36 12 L48 6 L60 12 L72 6 L84 12 M296 12 L308 6 L320 12 L332 6 L344 12 L356 6 L368 12"
              stroke="#c87d32"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <polygon points="34,48 48,32 62,48 48,64" fill="#1d3557" stroke="#f0b429" strokeWidth="2" />
            <polygon points="48,39 55,48 48,57 41,48" fill="#c87d32" />
            <polygon points="332,32 346,48 332,64 318,48" fill="#1d3557" stroke="#f0b429" strokeWidth="2" />
            <polygon points="332,39 339,48 332,57 325,48" fill="#c87d32" />

            {/* Display Lockup Lettering */}
            <text
              x="190"
              y="46"
              textAnchor="middle"
              fill="#f4ead5"
              fontFamily="Cinzel, Georgia, serif"
              fontWeight="700"
              fontSize="26"
              letterSpacing={isAr ? '0' : '4'}
            >
              {isAr ? 'أطلس 1870م' : 'ATLAS 1870'}
            </text>
            <text
              x="190"
              y="72"
              textAnchor="middle"
              fill="#e09f5a"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight="600"
              fontSize="11.5"
              letterSpacing={isAr ? '0' : '2.5'}
            >
              {isAr ? 'أمغار سهل سوس ماسة والأطلس · 1287 هـ' : 'AMGHAR OF THE HIGH ATLAS · 1287 AH'}
            </text>
          </svg>
        </div>

        <p className="text-sm text-[#dfd1b8] leading-relaxed mb-5">
          {isAr
            ? 'قُد قريتك في سهل سوس ماسة والأطلس عبر الفصول الأربعة. ازرع حقول الشعير والقمح وبساتين الأركان والجوز، وشيّد سواقي الري الحجرية وحصن أكادير الجماعي، ووازن بين استقلال مجلس الجماعة ومطالب محلة السلطان.'
            : 'Guide your Amazigh mountain valley through the four seasons. Build terraced barley fields, channel snowmelt into stone seguias, store grain in a fortified agadir, and balance tribal autonomy against the Sultan’s mahalla.'}
        </p>

        <form onSubmit={handleStart} className="space-y-3.5">
          <div>
            <label htmlFor="amghar-name-input" className="block text-xs font-medium text-[#d4a359] mb-1">
              {isAr ? 'اسمك (الأمغار)' : 'Your Name (Amghar)'}
            </label>
            <input
              id="amghar-name-input"
              type="text"
              value={amgharName}
              onChange={(e) => setAmgharName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#120d0a] border border-[#c87d32]/50 rounded text-[#f4ead5] focus:outline-none focus:border-[#f0b429]"
              placeholder={defaultAmghar}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="valley-name-input" className="block text-xs font-medium text-[#d4a359] mb-1">
                {isAr ? 'اسم القرية والقبيلة' : 'Valley & Clan Name'}
              </label>
              <input
                id="valley-name-input"
                type="text"
                value={valleyName}
                onChange={(e) => setValleyName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#120d0a] border border-[#c87d32]/50 rounded text-[#f4ead5] focus:outline-none focus:border-[#f0b429]"
                placeholder={defaultValley}
                required
              />
            </div>

            <div>
              <label htmlFor="region-select" className="block text-xs font-medium text-[#d4a359] mb-1">
                {isAr ? 'إقليم سوس ماسة والأطلس (30 قرية)' : 'High Atlas Region (30 Valleys)'}
              </label>
              <select
                id="region-select"
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  const preset = FICTIONAL_TRIBES.find((t) => e.target.value.includes(t.tribe));
                  if (preset) {
                    setValleyName(
                      isAr ? `${preset.arTribe} - ${preset.arValley}` : `${preset.tribe} of ${preset.valley}`
                    );
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-[#120d0a] border border-[#c87d32]/50 rounded text-[#f4ead5] focus:outline-none focus:border-[#f0b429]"
              >
                <option value="Tafza-n-Ait Tamda (High Atlas)">
                  {isAr ? 'تافزة · آيت تامدا (سوس ماسة)' : 'Tafza · Ait Tamda'}
                </option>
                <option value="Taroudant · Ait Ouzir">
                  {isAr ? 'واحة تارودانت · آيت أوزير' : 'Taroudant · Ait Ouzir'}
                </option>
                <option value="Oued Massa · Ait Massa">
                  {isAr ? 'مصب وادي ماسة · آيت ماسة' : 'Oued Massa · Ait Massa'}
                </option>
                <option value="Tazerwalt · Ait Iligh">
                  {isAr ? 'وادي تازروالت · آيت إيليغ' : 'Tazerwalt · Ait Iligh'}
                </option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
              }}
              className="flex-1 py-2.5 px-5 bg-[#c87d32] hover:bg-[#d98e43] text-[#18120e] font-semibold text-sm rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              {hasSavedValley
                ? isAr
                  ? 'متابعة حكم القرية'
                  : 'Continue in Valley'
                : isAr
                ? 'ادخل إلى سهل ووادي سوس ماسة'
                : 'Enter the Valley'}
            </button>

            {hasSavedValley && (
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartGame(amgharName.trim() || defaultAmghar, valleyName.trim() || defaultValley, true);
                }}
                className="py-2.5 px-4 bg-[#2a1f18] hover:bg-[#3b2c22] text-[#e6d5b8] border border-[#c87d32]/40 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAr ? 'تأسيس قرية جديدة' : 'Found New Valley'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Single flat, borderless inline control-hint line in the bottom safe margin */}
      <div className="text-xs text-[#f4ead5]/90 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        {isAr
          ? 'WASD / السحب للتحريك · عجلة الفأرة للتقريب · Q/E لتدوير الكاميرا · R لتدوير المبنى · المسافة لتسريع الزمن · Esc للإيقاف المؤقت'
          : 'WASD / Drag Pan · Scroll Zoom · Q/E Rotate Camera · R Rotate Building · Space Advance Time · Esc Pause'}
      </div>
    </div>
  );
};
