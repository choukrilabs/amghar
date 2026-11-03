import React, { useState } from 'react';
import { PRESET_MESSAGES, SEASON_INFO } from '../game/config';
import { checkRaidEligibility } from '../game/raid';
import {
  EventCard,
  LanguageCode,
  NeighborValley,
  PresetMessageKey,
  Resources,
  ValleyState,
} from '../game/types';

export interface EventModalProps {
  valley: ValleyState;
  event: EventCard;
  language?: LanguageCode;
  onChoose: (choiceId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  valley,
  event,
  language = 'ar',
  onChoose,
}) => {
  const isAr = language === 'ar';
  const hasMosque = valley.buildings.some(
    (b) => b.type === 'mosque_zawiya' && b.finishAt === null
  );
  const seasonLabel = isAr
    ? SEASON_INFO[valley.season].arName
    : valley.season.toUpperCase();

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="max-w-lg w-full bg-[#12151a]/95 backdrop-blur-md border border-[#a68956]/45 rounded p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#a68956]/25 pb-2">
          <span className="text-xs font-medium text-[#f0b429] tracking-wide">
            {event.isMahalla
              ? isAr
                ? '👑 الحملة السلطانية — محلة المخزن الشريفة'
                : 'ROYAL MAHALLA EXPEDITION'
              : isAr
              ? '📜 سجل أحداث الوادي ومجلس الجماعة'
              : 'CHRONICLE OF THE VALLEY'}
          </span>
          <span className="text-xs text-[#b89f80] font-mono-num">
            {seasonLabel} {valley.year}
            {isAr ? 'م' : ''}
          </span>
        </div>

        <h2 id="event-modal-title" className="font-display text-xl font-bold text-[#f4ead5]">
          {isAr ? event.arTitle || event.title : event.title}
        </h2>

        <p className="text-sm text-[#e6d5b8] leading-relaxed">
          {isAr ? event.arDescription || event.description : event.description}
        </p>

        <div className="p-3 bg-[#120d09] border border-[#c87d32]/30 rounded text-xs text-[#b89f80]">
          <strong className="text-[#d4a359]">
            {isAr ? 'السياق التاريخي (1870م): ' : 'Historical Context (1870): '}
          </strong>
          {isAr ? event.arHistoricalContext || event.historicalContext : event.historicalContext}
        </div>

        <div className="space-y-2.5 pt-2">
          {event.choices.map((ch) => {
            const missingBuilding = ch.requiresBuilding === 'mosque_zawiya' && !hasMosque;
            return (
              <button
                key={ch.id}
                type="button"
                disabled={missingBuilding}
                onClick={() => onChoose(ch.id)}
                className={`w-full ${
                  isAr ? 'text-right' : 'text-left'
                } p-3 rounded border transition-colors cursor-pointer ${
                  missingBuilding
                    ? 'bg-[#17110d] border-[#4a3728]/40 opacity-50 cursor-not-allowed'
                    : 'bg-[#281c14] hover:bg-[#38271c] border-[#c87d32]/60'
                }`}
              >
                <div className="font-semibold text-sm text-[#f4ead5]">
                  {isAr ? ch.arLabel || ch.label : ch.label}
                </div>
                <div className="text-xs text-[#c9b79c] mt-0.5">
                  {isAr ? ch.arDescription || ch.description : ch.description}
                </div>
                {(ch.costText || ch.arCostText) && (
                  <div className="text-xs font-mono-num text-[#f0b429] mt-1">
                    {isAr ? ch.arCostText || ch.costText : ch.costText}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export interface NeighborModalProps {
  valley: ValleyState;
  neighbor: NeighborValley;
  language?: LanguageCode;
  onClose: () => void;
  onSendGift: (resource: keyof Resources, amount: number) => void;
  onSendTrade: (
    giveRes: keyof Resources,
    giveAmt: number,
    wantRes: keyof Resources,
    wantAmt: number
  ) => void;
  onProposePact: () => void;
  onSendMessage: (msgKey: PresetMessageKey) => void;
  onLaunchRaid: (fighters: number, arms: number) => void;
  onBlockNeighbor: (valleyId: string) => void;
}

export const NeighborActionModal: React.FC<NeighborModalProps> = ({
  valley,
  neighbor,
  language = 'ar',
  onClose,
  onSendGift,
  onSendTrade,
  onProposePact,
  onSendMessage,
  onLaunchRaid,
  onBlockNeighbor,
}) => {
  const isAr = language === 'ar';
  const [fighters, setFighters] = useState(Math.max(1, valley.roles.guards));
  const [arms, setArms] = useState(Math.min(10, valley.resources.arms));
  const [presetKey, setPresetKey] = useState<PresetMessageKey>('greeting');

  const raidCheck = checkRaidEligibility(valley, neighbor, fighters, Date.now());

  const strengthText =
    neighbor.strengthLabel === 'Strong'
      ? isAr
        ? 'قوية'
        : 'Strong'
      : neighbor.strengthLabel === 'Moderate'
      ? isAr
        ? 'متوسطة'
        : 'Moderate'
      : isAr
      ? 'ضعيفة'
      : 'Weak';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="neighbor-modal-title"
    >
      <div className="max-w-lg w-full bg-[#12151a]/95 backdrop-blur-md border border-[#a68956]/45 rounded p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#a68956]/25 pb-2">
          <div>
            <h2 id="neighbor-modal-title" className="font-display text-lg font-bold text-[#f4ead5]">
              {isAr ? neighbor.arName || neighbor.name : neighbor.name}
            </h2>
            <p className="text-xs text-[#b89f80]">
              {isAr ? neighbor.arOwnerName || neighbor.ownerName : neighbor.ownerName} ·{' '}
              {isAr ? neighbor.arTribeName || neighbor.tribeName : neighbor.tribeName} ·{' '}
              {isAr ? `القوة الدفاعية: ${strengthText}` : `Strength: ${strengthText}`} ·{' '}
              {isAr ? `الهيبة: ${neighbor.prestige}` : `Prestige: ${neighbor.prestige}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-[#2c2017] hover:bg-[#3d2c20] text-xs rounded text-[#f4ead5] cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* 1. Gift & Pact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <button
            type="button"
            disabled={valley.resources.walnuts < 15}
            onClick={() => onSendGift('walnuts', 15)}
            className={`p-2.5 bg-[#281c14] hover:bg-[#38271c] border border-[#c87d32]/50 rounded ${
              isAr ? 'text-right' : 'text-left'
            } cursor-pointer disabled:opacity-50`}
          >
            <div className="font-semibold text-[#f4ead5]">
              {isAr ? 'إرسال هدية ضيافة ومودة' : 'Send Hospitality Gift'}
            </div>
            <div className="text-[#f0b429] font-mono-num">
              {isAr ? '-15 جوز وأركان · +6 هيبة' : '-15 Walnuts · +6 Prestige'}
            </div>
          </button>

          <button
            type="button"
            disabled={neighbor.hasPactWithPlayer || valley.resources.silver < 10}
            onClick={onProposePact}
            className={`p-2.5 bg-[#281c14] hover:bg-[#38271c] border border-[#c87d32]/50 rounded ${
              isAr ? 'text-right' : 'text-left'
            } cursor-pointer disabled:opacity-50`}
          >
            <div className="font-semibold text-[#f4ead5]">
              {neighbor.hasPactWithPlayer
                ? isAr
                  ? 'حليف معاهدة تاضا المقدسة'
                  : 'Sworn Tada Ally'
                : isAr
                ? 'عقد حلف ومعاهدة تاضا المقدسة'
                : 'Pledge Sacred Tada Pact'}
            </div>
            <div className="text-[#34d399] font-mono-num">
              {isAr
                ? '-10 فضة · هدنة متبادلة و+8 هيبة'
                : '-10 Silver · Mutual Truce & +8 Prestige'}
            </div>
          </button>
        </div>

        {/* 2. Direct Caravan Trade */}
        <div className="p-3 bg-[#140e0a] border border-[#c87d32]/30 rounded flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#f4ead5]">
              {isAr ? 'قافلة مقايضة تجارية مباشرة' : 'Direct Caravan Barter'}
            </div>
            <div className="text-[#b89f80]">
              {isAr
                ? 'إرسال 40 من الحبوب مقابل +18 من الفضة'
                : 'Send 40 Grain in escrow for +18 Silver'}
            </div>
          </div>
          <button
            type="button"
            disabled={valley.resources.grain < 40}
            onClick={() => onSendTrade('grain', 40, 'silver', 18)}
            className="px-3 py-1.5 bg-[#c87d32] hover:bg-[#df8f40] text-[#18120e] font-semibold rounded cursor-pointer disabled:opacity-50"
          >
            {isAr ? 'إرسال القافلة' : 'Send Caravan'}
          </button>
        </div>

        {/* 3. Preset Diplomatic Message */}
        <div className="p-3 bg-[#140e0a] border border-[#c87d32]/30 rounded space-y-2 text-xs">
          <div className="font-semibold text-[#f4ead5]">
            {isAr ? 'إرسال مبعوث برسالة دبلوماسية' : 'Send Envoy with Preset Message'}
          </div>
          <div className="flex gap-2">
            <select
              aria-label={isAr ? 'اختر الرسالة الدبلوماسية' : 'Select preset message'}
              value={presetKey}
              onChange={(e) => setPresetKey(e.target.value as PresetMessageKey)}
              className="flex-1 bg-[#1f1610] border border-[#c87d32]/40 rounded px-2 py-1 text-[#f4ead5]"
            >
              {Object.entries(PRESET_MESSAGES).map(([k, v]) => (
                <option key={k} value={k}>
                  {isAr
                    ? `${v.arLabel}: "${v.arText.slice(0, 42)}..."`
                    : `${v.label}: "${v.text.slice(0, 38)}..."`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSendMessage(presetKey)}
              className="px-3 py-1 bg-[#2c2017] hover:bg-[#3d2c20] border border-[#c87d32]/50 rounded text-[#f4ead5] cursor-pointer whitespace-nowrap"
            >
              {isAr ? 'إرسال المبعوث' : 'Send Envoy'}
            </button>
          </div>
        </div>

        {/* 4. Launch Raid (Seeded deterministic battle with fairness checks) */}
        <div className="p-3 bg-[#241210] border border-[#ef4444]/50 rounded space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#fca5a5]">
              {isAr ? 'إرسال سرية غزو (غارة قبلية)' : 'Send Raiding Party'}
            </span>
            <span className="font-mono-num text-[11px] text-[#f87171]">
              {isAr
                ? 'أقصى غنيمة: 15% حبوب غير محمية، 10% قطعان'
                : 'Max Loot: 15% Unprotected Grain, 10% Flocks'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="raid-fighters" className="block text-[11px] text-[#e6d5b8]">
                {isAr ? `المقاتلون: ${fighters}` : `Fighters: ${fighters}`}
              </label>
              <input
                id="raid-fighters"
                type="range"
                min={1}
                max={Math.max(1, valley.roles.guards + Math.floor(valley.households * 0.5))}
                value={fighters}
                onChange={(e) => setFighters(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="raid-arms" className="block text-[11px] text-[#e6d5b8]">
                {isAr ? `البنادق والبارود: ${arms}` : `Rifles & Powder: ${arms}`}
              </label>
              <input
                id="raid-arms"
                type="range"
                min={0}
                max={Math.max(0, valley.resources.arms)}
                value={arms}
                onChange={(e) => setArms(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {!raidCheck.allowed && (
            <div className="text-[11px] text-[#fca5a5]">
              {isAr ? raidCheck.arReason || raidCheck.reason : raidCheck.reason}
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => {
                onBlockNeighbor(neighbor.valleyId);
                onClose();
              }}
              className="text-[11px] text-[#94a3b8] hover:text-[#f4ead5] underline cursor-pointer"
            >
              {isAr ? 'حظر هذه القبيلة' : 'Block / Report Tribe'}
            </button>

            <button
              type="button"
              disabled={!raidCheck.allowed}
              onClick={() => onLaunchRaid(fighters, arms)}
              className="px-4 py-1.5 bg-[#b91c1c] hover:bg-[#dc2626] text-white font-semibold rounded cursor-pointer disabled:opacity-40"
            >
              {isAr ? 'شن الغارة' : 'Launch Raid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface StatusModalProps {
  mode: 'paused' | 'gameover';
  isVictory: boolean;
  valley: ValleyState;
  language?: LanguageCode;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  mode,
  isVictory,
  valley,
  language = 'ar',
  onResume,
  onRestart,
  onReturnTitle,
}) => {
  const isAr = language === 'ar';
  const seasonLabel = isAr
    ? SEASON_INFO[valley.season].arName
    : valley.season.toUpperCase();

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-md w-full bg-[#12151a]/95 backdrop-blur-md border border-[#a68956]/45 rounded p-6 shadow-2xl space-y-5 text-center">
        <h2 className="font-display text-2xl font-bold text-[#f4ead5]">
          {mode === 'paused'
            ? isAr
              ? 'إيقاف مؤقت — مجلس الجماعة'
              : 'Jemaa Council Paused'
            : isVictory
            ? isAr
              ? 'نلت ظهير القائد السلطاني في سوس والأطلس!'
              : 'Recognized as Qaid of the High Atlas!'
            : isAr
            ? 'هجر الأهالي القرية'
            : 'The Valley Was Abandoned'}
        </h2>

        <p className="text-xs text-[#d4b895]">
          {mode === 'paused'
            ? `${valley.name} · ${seasonLabel} ${valley.year}${isAr ? 'م' : ''}`
            : isVictory
            ? isAr
              ? 'تقف قصبتك وحصن أكادير شامخين كأقوى حاضرة في سهل سوس ماسة والأطلس.'
              : 'Your fortified ighrem and agadir stand unmatched across the High Atlas passes.'
            : isAr
            ? 'أدى نقص المؤونة وارتفاع التوتر إلى رحيل الأسر بحثاً عن المأوى في قرى أخرى.'
            : 'Hunger and high unrest drove the households to seek refuge in other valleys.'}
        </p>

        {/* 3 Tabular-Nums Mastery Stat Tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 bg-[#120d09] border border-[#c87d32]/40 rounded">
            <div className="font-mono-num text-lg font-bold text-[#f59e0b]">
              {Math.round(valley.meters.prestige)}
            </div>
            <div className="text-[10px] text-[#b89f80]">{isAr ? 'الهيبة' : 'PRESTIGE'}</div>
          </div>
          <div className="p-2.5 bg-[#120d09] border border-[#c87d32]/40 rounded">
            <div className="font-mono-num text-lg font-bold text-[#34d399]">
              {Math.round(valley.meters.makhzenFavor)}
            </div>
            <div className="text-[10px] text-[#b89f80]">
              {isAr ? 'رضا المخزن' : 'MAKHZEN FAVOR'}
            </div>
          </div>
          <div className="p-2.5 bg-[#120d09] border border-[#c87d32]/40 rounded">
            <div className="font-mono-num text-lg font-bold text-[#f4ead5]">
              {valley.buildings.length}
            </div>
            <div className="text-[10px] text-[#b89f80]">
              {isAr ? 'المباني المشيدة' : 'STRUCTURES'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {mode === 'paused' ? (
            <button
              type="button"
              onClick={onResume}
              className="flex-1 py-2.5 px-4 bg-[#c87d32] hover:bg-[#df8f40] text-[#18120e] font-semibold text-sm rounded cursor-pointer"
            >
              {isAr ? 'استئناف اللعب [Esc]' : 'Resume Valley [Esc]'}
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="flex-1 py-2.5 px-4 bg-[#c87d32] hover:bg-[#df8f40] text-[#18120e] font-semibold text-sm rounded cursor-pointer"
            >
              {isAr ? 'تأسيس قرية جديدة' : 'Found New Valley'}
            </button>
          )}

          <button
            type="button"
            onClick={onReturnTitle}
            className="py-2.5 px-4 bg-[#2c2017] hover:bg-[#3d2c20] text-[#f4ead5] border border-[#c87d32]/50 text-xs font-medium rounded cursor-pointer"
          >
            {isAr ? 'شاشة البداية' : 'Title Screen'}
          </button>
        </div>
      </div>
    </div>
  );
};
