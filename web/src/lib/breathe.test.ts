import { describe, expect, it } from 'vitest';
import { cleanTiming, clock, cycleLength, fullness, PATTERNS, perMinute, phaseAt, sessionSeconds, streak, total, week, type Entry, type Timing } from './breath';
import { defaults, parseSave, SAVE_VERSION, timingOf } from './store';

const box: Timing = [4, 4, 4, 4];
const f478: Timing = [4, 7, 8, 0];
const at = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h).getTime();

describe('patterns', () => {
  it('have sensible timings', () => {
    for (const p of PATTERNS) {
      expect(cleanTiming(p.t)).toEqual(p.t);
      expect(perMinute(p.t)).toBeGreaterThan(2);
      expect(perMinute(p.t)).toBeLessThan(11);
    }
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length);
  });
  it('coherent breathing is about 5.5 a minute', () => {
    expect(perMinute(PATTERNS.find((p) => p.id === 'coherent')!.t)).toBeCloseTo(5.45, 2);
  });
});

describe('phase timing', () => {
  it('walks the four sides of a box', () => {
    expect(phaseAt(box, 0)).toMatchObject({ kind: 'in', left: 4, cycle: 0, step: 0 });
    expect(phaseAt(box, 5)).toMatchObject({ kind: 'hold', index: 1, elapsed: 1, step: 1 });
    expect(phaseAt(box, 9)).toMatchObject({ kind: 'out', progress: 0.25 });
    expect(phaseAt(box, 15.5)).toMatchObject({ kind: 'rest', step: 3 });
    expect(phaseAt(box, 16)).toMatchObject({ kind: 'in', cycle: 1, step: 4 });
  });
  it('skips zero-length phases', () => {
    expect(phaseAt(f478, 18.9).kind).toBe('out');
    expect(phaseAt(f478, 19)).toMatchObject({ kind: 'in', cycle: 1, step: 3 });
  });
  it('each phase changes the step exactly once', () => {
    const steps = new Set<number>();
    for (let s = 0; s < cycleLength(f478) * 3; s += 0.1) steps.add(phaseAt(f478, s).step);
    expect([...steps]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('the orb fills, waits and empties', () => {
    expect(fullness(phaseAt(box, 0), box)).toBeCloseTo(0);
    expect(fullness(phaseAt(box, 2), box)).toBeCloseTo(0.5);
    expect(fullness(phaseAt(box, 6), box)).toBe(1);
    expect(fullness(phaseAt(box, 10), box)).toBeCloseTo(0.5);
    expect(fullness(phaseAt(box, 14), box)).toBe(0);
  });
});

describe('sessions', () => {
  it('round to whole breaths', () => {
    expect(sessionSeconds(box, 1)).toBe(64);
    expect(sessionSeconds(f478, 3)).toBe(171);
    expect(sessionSeconds([5.5, 0, 5.5, 0], 3) % 11).toBe(0);
  });
  it('formats a clock', () => {
    expect(clock(171)).toBe('2:51');
    expect(clock(59.2)).toBe('1:00');
    expect(clock(-3)).toBe('0:00');
  });
  it('rejects bad custom timings', () => {
    expect(cleanTiming([0, 1, 4, 0])).toBeNull();
    expect(cleanTiming([4, 1, 4])).toBeNull();
    expect(cleanTiming([4, 30, 4.3, -2])).toEqual([4, 12, 4.5, 0]);
  });
});

describe('journal', () => {
  const log: Entry[] = [
    { at: at(2026, 10, 20), sec: 180, pattern: 'box' },
    { at: at(2026, 10, 24), sec: 300, pattern: 'coherent' },
    { at: at(2026, 10, 25), sec: 60, pattern: '478' },
    { at: at(2026, 10, 25, 21), sec: 120, pattern: '478' },
    { at: at(2026, 10, 26), sec: 240, pattern: 'calm' },
  ];
  it('counts a streak through today', () => {
    expect(streak(log, new Date(at(2026, 10, 26, 22)))).toBe(3);
  });
  it('an empty today does not break the streak yet', () => {
    expect(streak(log, new Date(at(2026, 10, 27, 8)))).toBe(3);
    expect(streak(log, new Date(at(2026, 10, 28, 8)))).toBe(0);
  });
  it('sums the last seven days', () => {
    const w = week(log, new Date(at(2026, 10, 26, 22)));
    expect(w.map((d) => d.sec)).toEqual([180, 0, 0, 0, 300, 180, 240]);
    expect(total(log)).toBe(900);
  });
});

describe('save', () => {
  it('falls back to defaults on garbage', () => {
    expect(parseSave(null)).toEqual(defaults());
    expect(parseSave('[')).toEqual(defaults());
    expect(parseSave(JSON.stringify({ v: SAVE_VERSION + 1 }))).toEqual(defaults());
  });
  it('repairs bad fields and keeps good ones', () => {
    const s = parseSave(JSON.stringify({
      v: 1, settings: { theme: 'dawn', minutes: 7, chime: false }, pattern: 'nope', custom: [0, 0, 0, 0], mix: { rain: 3, brown: -1, ocean: 'x' },
      log: [{ at: 5, sec: 60, pattern: 'box' }, { at: 1, sec: 99999, pattern: 'box' }, { at: 2, sec: 30, pattern: 'calm' }, 'junk'],
    }));
    expect(s.settings).toEqual({ theme: 'dawn', chime: false, haptics: true, awake: true, minutes: 3, reduceMotion: false, toured: false });
    expect(s.pattern).toBe('coherent');
    expect(s.custom).toEqual(defaults().custom);
    expect(s.mix).toEqual({ rain: 1, brown: 0, ocean: 0.5 });
    expect(s.log.map((e) => e.at)).toEqual([2, 5]);
  });
  it('resolves the custom pattern', () => {
    const s = { ...defaults(), pattern: 'custom', custom: [3, 0, 6, 0] as Timing };
    expect(timingOf(s)).toEqual({ name: 'Your pattern', t: [3, 0, 6, 0] });
  });
});
