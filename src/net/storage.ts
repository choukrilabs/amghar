import { generateRegionalSoukOffers, generateRegionalValleys } from '../game/raid';
import { convertAdToAhYear, createInitialValleyState, tick } from '../game/tick';
import { GameSettings, ValleyState } from '../game/types';
import { createInitialVillagerRoster } from '../game/villagers';

const VALLEY_STORAGE_KEY = 'atlas_1870_valley_v1';
const SETTINGS_STORAGE_KEY = 'atlas_1870_settings_v2';

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'ar',
  soundEnabled: true,
  graphicsQuality: 'high',
  raidingOptIn: true,
  blockedValleyIds: [],
};

export function loadSavedValley(nowMs = Date.now()): ValleyState | null {
  try {
    const raw = localStorage.getItem(VALLEY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ValleyState;
    if (!parsed || !parsed.valleyId || !parsed.resources) return null;
    if (typeof parsed.hijriYear !== 'number' || !Number.isFinite(parsed.hijriYear)) {
      parsed.hijriYear = convertAdToAhYear(
        parsed.year || 1870,
        parsed.season || 'spring',
        parsed.dayInSeason || 1
      );
    }
    if (!parsed.villagerRoster || parsed.villagerRoster.length === 0) {
      parsed.villagerRoster = createInitialVillagerRoster();
    }
    if (
      parsed.name === 'Ait Tamda of Sous-Massa' ||
      parsed.name === 'Ait Tamda of Tafza'
    ) {
      parsed.name = 'آيت تامدا - سوس ماسة';
    }
    if (parsed.amgharName === 'Amghar Tariq') {
      parsed.amgharName = 'الأمغار طارق';
    }
    if (parsed.neighbors && parsed.neighbors.length > 0 && !parsed.neighbors[0].arName) {
      const freshNeighbors = generateRegionalValleys(parsed.slotIndex ?? 14);
      parsed.neighbors = parsed.neighbors.map((n, i) => ({
        ...n,
        arName: freshNeighbors[i]?.arName || n.name,
        arOwnerName: freshNeighbors[i]?.arOwnerName || n.ownerName,
        arTribeName: freshNeighbors[i]?.arTribeName || n.tribeName,
      }));
      parsed.soukOffers = generateRegionalSoukOffers(parsed.neighbors);
    }
    if (parsed.reports && parsed.reports.length > 0) {
      parsed.reports = parsed.reports.map((r) => {
        if (r.id === 'rep_welcome_1870' && !r.arTitle) {
          return {
            ...r,
            arTitle: 'اختيارك أمغاراً للقرية من قِبل مجلس الجماعة (ربيع 1870م)',
            arSummary:
              'اختارك شيوخ وأعيان الأسر أمغاراً للوادي في سهل سوس ماسة. تتدفق مياه الربيع في النهر؛ اعتنِ بالحقول المدرجة الخمسة، وشيّد ساقية الري الحجرية وحصن أكادير الجماعي قبل حلول الخريف.',
          };
        }
        return r;
      });
    }
    // Run pure offline catch-up tick on load (Section 2 & 9)
    return tick(parsed, nowMs);
  } catch {
    return null;
  }
}

export function saveValleyState(state: ValleyState): void {
  try {
    localStorage.setItem(VALLEY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function resetValleyState(
  amgharName = 'الأمغار طارق',
  valleyName = 'آيت تامدا - سوس ماسة'
): ValleyState {
  const fresh = createInitialValleyState(amgharName, valleyName, Date.now());
  saveValleyState(fresh);
  return fresh;
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}
