/** Breathing patterns as pure timing: which phase you're in at any second, how the orb should size, and the session log. */
export type Kind = 'in' | 'hold' | 'out' | 'rest';
export const KINDS: Kind[] = ['in', 'hold', 'out', 'rest'];
export const WORDS: Record<Kind, string> = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' };
/** Seconds for in, hold, out, rest. A zero phase is skipped. */
export type Timing = [number, number, number, number];
export type Pattern = { id: string; name: string; blurb: string; use: string; t: Timing };
export const PATTERNS: Pattern[] = [
  { id: 'coherent', name: 'Coherent', blurb: 'Slow, even waves at about five and a half breaths a minute.', use: 'Everyday calm', t: [5.5, 0, 5.5, 0] },
  { id: 'box', name: 'Box', blurb: 'Four equal sides: in, hold, out, hold. Used by pilots and divers.', use: 'Focus under pressure', t: [4, 4, 4, 4] },
  { id: '478', name: '4 · 7 · 8', blurb: 'A short breath in, a long hold, a longer sigh out.', use: 'Winding down for sleep', t: [4, 7, 8, 0] },
  { id: 'calm', name: 'Long exhale', blurb: 'Breathing out longer than in slows the heart.', use: 'Easing anxiety', t: [4, 2, 6, 0] },
  { id: 'wake', name: 'Wake up', blurb: 'Deep, quick breaths in with short sharp exhales.', use: 'A gentle energy lift', t: [4, 0, 2, 0] },
];
export const cycleLength = (t: Timing) => t.reduce((a, b) => a + b, 0);
export const perMinute = (t: Timing) => 60 / cycleLength(t);
/** In and out need at least a second; holds may be zero; nothing longer than 12 s. */
export function cleanTiming(t: unknown): Timing | null {
  if (!Array.isArray(t) || t.length !== 4 || !t.every((x) => typeof x === 'number' && Number.isFinite(x))) return null;
  const v = t.map((x) => Math.round(Math.min(12, Math.max(0, x)) * 2) / 2) as Timing;
  if (v[0] < 1 || v[2] < 1) return null;
  return v;
}

export type PhaseAt = { kind: Kind; index: number; elapsed: number; left: number; progress: number; cycle: number; step: number };
/** Where you are t seconds into a session. `step` counts every phase so far, so it changes exactly once per phase. */
export function phaseAt(t: Timing, sec: number): PhaseAt {
  const len = cycleLength(t);
  const s = Math.max(0, sec);
  const cycle = Math.floor(s / len);
  let r = s - cycle * len;
  const live = KINDS.map((k, i) => ({ k, i, d: t[i] })).filter((x) => x.d > 0);
  for (let j = 0; j < live.length; j++) {
    const p = live[j];
    if (r < p.d || j === live.length - 1) {
      const e = Math.min(r, p.d);
      return { kind: p.k, index: p.i, elapsed: e, left: p.d - e, progress: e / p.d, cycle, step: cycle * live.length + j };
    }
    r -= p.d;
  }
  throw new Error('unreachable');
}
const ease = (x: number) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, x))) / 2;
/** Orb size from 0 (empty lungs) to 1 (full): grows on in, stays on hold, shrinks on out, rests small. */
export function fullness(p: PhaseAt, t: Timing): number {
  if (p.kind === 'in') return ease(p.progress);
  if (p.kind === 'out') return 1 - ease(p.progress);
  if (p.kind === 'hold') return t[0] > 0 ? 1 : 0;
  return 0;
}
/** Round a session to whole cycles so it never ends mid-breath. */
export const sessionSeconds = (t: Timing, minutes: number) => Math.max(1, Math.round((minutes * 60) / cycleLength(t))) * cycleLength(t);
export const clock = (sec: number) => { const s = Math.max(0, Math.ceil(sec)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// ---------- journal ----------
export type Entry = { at: number; sec: number; pattern: string };
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function byDay(log: Entry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of log) { const k = dayKey(new Date(e.at)); m.set(k, (m.get(k) ?? 0) + e.sec); }
  return m;
}
/** Days in a row with at least one session, counting today, or up to yesterday if today is still empty. */
export function streak(log: Entry[], now: Date): number {
  const days = byDay(log);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
/** Seconds for each of the last seven days, oldest first, today last. */
export function week(log: Entry[], now: Date): { key: string; sec: number; day: Date }[] {
  const days = byDay(log);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i)); return { key: dayKey(d), sec: days.get(dayKey(d)) ?? 0, day: d }; });
}
export const total = (log: Entry[]) => log.reduce((a, e) => a + e.sec, 0);
