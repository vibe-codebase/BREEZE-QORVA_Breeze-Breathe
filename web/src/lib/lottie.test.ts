import { describe, expect, it } from 'vitest';
import * as S from '../lottie/scenes';
import type { Anim } from '../lottie/build';
import { rubber, shouldDismiss, springEasing } from './motion';

/** Every scene in lottie/scenes.ts, in every theme: valid bodymovin, sensible length, no NaN, keyframes in order, colours 0..1. */
const pals = Object.values((S as unknown as { PALETTES: Record<string, unknown> }).PALETTES);
const makers = Object.entries(S).filter(([k, v]) => typeof v === 'function' && k !== 'PALETTES' && (v as (...a: unknown[]) => unknown).length === 1) as [string, (p: unknown) => Anim][];
const all = makers.flatMap(([name, f]) => pals.map((p) => ({ name, a: f(p) }))).filter((x) => x.a && Array.isArray((x.a as { layers?: unknown }).layers));
const walk = (x: unknown, fn: (k: string, v: unknown, parent: Record<string, unknown>) => void) => {
  if (Array.isArray(x)) x.forEach((y) => walk(y, fn));
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) { fn(k, v, x as Record<string, unknown>); walk(v, fn); }
};
describe('generated Lottie animations', () => {
  it('cover a tour of three, an empty state and a success moment in every theme', () => {
    expect(makers.length).toBeGreaterThanOrEqual(5);
    expect(all.length).toBeGreaterThanOrEqual(5 * pals.length);
  });
  it('have the bodymovin header, a real duration and painted layers', () => {
    for (const { name, a } of all) {
      for (const k of ['v', 'fr', 'ip', 'op', 'w', 'h', 'layers']) expect(a, name).toHaveProperty(k);
      expect(a.fr).toBe(60);
      const secs = a.op / a.fr;
      if (name === 'success') expect(secs).toBeLessThan(2); else { expect(secs, name).toBeGreaterThanOrEqual(2); expect(secs, name).toBeLessThanOrEqual(4); }
      for (const l of a.layers as { ty: number; shapes: unknown[]; ip: number; op: number }[]) { expect(l.ty).toBe(4); expect(l.shapes.length, name).toBeGreaterThan(0); expect(l.op).toBeGreaterThan(l.ip); }
    }
  });
  it('contain no NaN, keyframes in time order inside the clip, colours in 0..1', () => {
    for (const { name, a } of all) {
      walk(a, (k, v, parent) => {
        if (typeof v === 'number') expect(Number.isFinite(v), name).toBe(true);
        if (k === 'k' && parent.a === 1 && Array.isArray(v)) {
          const ts = (v as { t: number }[]).map((f) => f.t);
          for (let i = 1; i < ts.length; i++) expect(ts[i], name).toBeGreaterThanOrEqual(ts[i - 1]);
          expect(ts.length, name).toBeGreaterThan(1);
          expect(ts[ts.length - 1], name).toBeLessThanOrEqual(a.op);
        }
        if ((parent.ty === 'fl' || parent.ty === 'st') && k === 'c') {
          const c = v as { a: number; k: number[] | { s: number[] }[] };
          const cols = c.a === 1 ? (c.k as { s: number[] }[]).map((f) => f.s) : [c.k as number[]];
          for (const col of cols) { expect(col).toHaveLength(4); for (const x of col) { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(1); } }
        }
      });
    }
  });
});
describe('motion maths', () => {
  it('springs settle at 1 and flicks dismiss sheets', () => {
    const s = springEasing(230, 24);
    expect(s.easing.startsWith('linear(0,')).toBe(true);
    expect(s.easing.endsWith(', 1)')).toBe(true);
    expect(shouldDismiss(5, 400, 2)).toBe(false);
    expect(shouldDismiss(140, 400, 0)).toBe(true);
    expect(rubber(-1000)).toBeGreaterThan(-60);
  });
});
