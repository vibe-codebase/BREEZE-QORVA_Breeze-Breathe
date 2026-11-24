/** Versioned local save, validated field by field. */
import { cleanTiming, PATTERNS, type Entry, type Timing } from './breath';

export const SAVE_KEY = 'breathe.save';
export const SAVE_VERSION = 1;
export type ThemeId = 'dusk' | 'dawn';
export type Mix = { rain: number; brown: number; ocean: number };
export type Settings = { theme: ThemeId; chime: boolean; haptics: boolean; awake: boolean; minutes: number; reduceMotion: boolean; toured: boolean };
export type Save = { v: number; settings: Settings; pattern: string; custom: Timing; mix: Mix; log: Entry[] };
export const MINUTES = [1, 2, 3, 5, 10, 15];
export function defaults(): Save {
  return {
    v: SAVE_VERSION,
    settings: { reduceMotion: false, toured: false, theme: 'dusk', chime: true, haptics: true, awake: true, minutes: 3 },
    pattern: 'coherent', custom: [4, 1, 6, 1], mix: { rain: 0, brown: 0, ocean: 0.5 }, log: [],
  };
}
type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const lvl = (x: unknown, d: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : d);
export function parseSave(text: string | null): Save {
  const d = defaults();
  if (!text) return d;
  let o: unknown;
  try { o = JSON.parse(text); } catch { return d; }
  if (!isObj(o) || typeof o.v !== 'number' || o.v > SAVE_VERSION) return d;
  const s = isObj(o.settings) ? o.settings : {};
  const m = isObj(o.mix) ? o.mix : {};
  const log = Array.isArray(o.log) ? o.log.filter((e): e is Entry => isObj(e) && typeof e.at === 'number' && Number.isFinite(e.at) && e.at > 0
    && typeof e.sec === 'number' && e.sec > 0 && e.sec <= 7200 && typeof e.pattern === 'string' && e.pattern.length <= 20).map((e) => ({ at: e.at, sec: Math.round(e.sec), pattern: e.pattern })) : [];
  return {
    v: SAVE_VERSION,
    settings: { reduceMotion: s.reduceMotion === true, toured: s.toured === true,
      theme: s.theme === 'dawn' ? 'dawn' : 'dusk', chime: s.chime !== false, haptics: s.haptics !== false, awake: s.awake !== false,
      minutes: MINUTES.includes(s.minutes as number) ? (s.minutes as number) : d.settings.minutes,
    },
    pattern: o.pattern === 'custom' || PATTERNS.some((p) => p.id === o.pattern) ? (o.pattern as string) : d.pattern,
    custom: cleanTiming(o.custom) ?? d.custom,
    mix: { rain: lvl(m.rain, d.mix.rain), brown: lvl(m.brown, d.mix.brown), ocean: lvl(m.ocean, d.mix.ocean) },
    log: log.sort((a, b) => a.at - b.at).slice(-500),
  };
}
export function load(): Save { try { return parseSave(localStorage.getItem(SAVE_KEY)); } catch { return defaults(); } }
export function persist(s: Save) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* keep running from memory */ } }
export function timingOf(s: Save): { name: string; t: Timing } {
  if (s.pattern === 'custom') return { name: 'Your pattern', t: s.custom };
  const p = PATTERNS.find((x) => x.id === s.pattern) ?? PATTERNS[0];
  return { name: p.name, t: p.t };
}
