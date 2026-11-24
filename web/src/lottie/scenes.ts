/** Breathe's Lottie scenes: a glowing orb that swells and settles with the breath, patterns traced as a light around a shape,
 *  sound as slow ripples, a resting orb for an empty journal, and petals of light closing into a soft tick. */
import { EASE, anim, ellipse, fill, group, path, stroke, trim, type Anim, type Key } from './build';
import type { ThemeId } from '../lib/store';

export type Pal = { bg: string; card: string; teal: string; lilac: string; rose: string; ink: string; muted: string };
export const PALETTES: Record<ThemeId, Pal> = {
  dusk: { bg: '#0f1a24', card: '#182a3a', teal: '#5fd4c4', lilac: '#b9a3f0', rose: '#f2a7b9', ink: '#eaf2f5', muted: '#93a8b6' },
  dawn: { bg: '#f4eff6', card: '#ffffff', teal: '#179a8b', lilac: '#7b61d1', rose: '#d9718a', ink: '#24203a', muted: '#6c6684' },
};
const CALM = { o: [0.45, 0], i: [0.55, 1] } as { o: [number, number]; i: [number, number] };
/** A breath curve for scale: in, hold, out, rest, across the clip. */
const breath = (op: number, lo: number, hi: number): Key[] => [
  { t: 0, v: [lo, lo], e: CALM }, { t: op * 0.36, v: [hi, hi], e: CALM }, { t: op * 0.5, v: [hi, hi], e: CALM }, { t: op * 0.9, v: [lo, lo], e: CALM }, { t: op, v: [lo, lo] },
];
const stars = (p: Pal, w: number, h: number, n: number, op: number) => Array.from({ length: n }, (_, i) => {
  const x = (i * 97) % w, y = (i * 53) % (h * 0.6) + 10, at = 30 + (i * 23) % (op - 60);
  return group(`s${i}`, [ellipse(0, 0, 3 + (i % 3)), fill(p.ink)], { p: [x, y], o: [{ t: 0, v: 20 }, { t: at - 20, v: 20 }, { t: at, v: 80 }, { t: op, v: 20 }] });
});

/** Card 1: the orb breathes: four seconds in, a pause, six out, with a halo that follows a beat behind. */
export function tourOrb(p: Pal): Anim {
  const op = 240;
  return anim('breathe-orb', 360, 240, op, [
    { nm: 'core', shapes: [group('c', [ellipse(0, 0, 100), fill(p.teal, 90)], { p: [180, 124], s: breath(op, 62, 100) }), group('hi', [ellipse(-14, -16, 34, 26), fill('#ffffff', 22)], { p: [180, 124], s: breath(op, 62, 100) })] },
    { nm: 'halo', shapes: [group('h', [ellipse(0, 0, 150), fill(p.lilac, 22)], { p: [180, 124], s: [{ t: 0, v: [60, 60], e: CALM }, { t: op * 0.42, v: [100, 100], e: CALM }, { t: op * 0.56, v: [100, 100], e: CALM }, { t: op * 0.96, v: [60, 60] }, { t: op, v: [60, 60] }] })] },
    { nm: 'ring', shapes: [group('r', [ellipse(0, 0, 200), stroke(p.lilac, 2, 45)], { p: [180, 124], s: breath(op, 70, 100), o: [{ t: 0, v: 20 }, { t: op * 0.4, v: 70 }, { t: op * 0.9, v: 20 }, { t: op, v: 20 }] })] },
    { nm: 'stars', shapes: stars(p, 360, 240, 10, op) },
  ]);
}

/** Card 2: patterns: a point of light travels a box, four sides, four counts, and the side it is on glows. */
export function tourPattern(p: Pal): Anim {
  const op = 240;
  const c = [[130, 70], [230, 70], [230, 170], [130, 170]];
  const dot: Key[] = [...c, c[0]].map((v, i) => ({ t: i * 60, v, e: CALM }));
  const sides = [0, 1, 2, 3].map((i) => group(`side${i}`, [path([c[i], c[(i + 1) % 4]]), stroke(i % 2 ? p.lilac : p.teal, 5), trim([{ t: 0, v: 0 }, { t: i * 60, v: 0, e: CALM }, { t: i * 60 + 56, v: 100 }, { t: 236, v: 100 }, { t: op, v: 0 }])]));
  return anim('breathe-pattern', 360, 240, op, [
    { nm: 'light', shapes: [group('l', [ellipse(0, 0, 18), fill('#ffffff'), ellipse(0, 0, 38), fill(p.teal, 30)], { p: dot })] },
    { nm: 'sides', shapes: sides },
    { nm: 'track', shapes: [group('t', [path(c, true), stroke(p.muted, 2, 40)])] },
    { nm: 'stars', shapes: stars(p, 360, 240, 8, op) },
  ]);
}

/** Card 3: sounds: slow ripples spread from a small orb, like rain on still water. */
export function tourRipples(p: Pal): Anim {
  const op = 180;
  const ring = (d: number, col: string) => group(`r${d}`, [ellipse(0, 0, 60), stroke(col, 2.5)], {
    p: [180, 130], s: [{ t: 0, v: [40, 40] }, { t: d, v: [40, 40], e: EASE.out }, { t: d + 100, v: [380, 380] }, { t: op, v: [380, 380] }],
    o: [{ t: 0, v: 0 }, { t: d, v: 0 }, { t: d + 6, v: 90 }, { t: d + 100, v: 0 }, { t: op, v: 0 }],
  });
  return anim('breathe-ripples', 360, 240, op, [
    { nm: 'drop', shapes: [group('d', [ellipse(0, 0, 26), fill(p.lilac)], { p: [180, 130], s: breath(op, 80, 110) })] },
    { nm: 'rings', shapes: [ring(0, p.teal), ring(40, p.lilac), ring(80, p.teal)] },
    { nm: 'stars', shapes: stars(p, 360, 240, 8, op) },
  ]);
}

/** Empty journal: the orb resting, rising and falling a little, waiting for the first session. */
export function emptyRest(p: Pal): Anim {
  const op = 180;
  return anim('breathe-empty', 240, 160, op, [
    { nm: 'orb', shapes: [group('o', [ellipse(0, 0, 60), fill(p.teal, 85)], { p: [120, 84], s: breath(op, 84, 100) })] },
    { nm: 'halo', shapes: [group('h', [ellipse(0, 0, 100), fill(p.lilac, 18)], { p: [120, 84], s: breath(op, 80, 104) })] },
    { nm: 'stars', shapes: stars(p, 240, 160, 6, op) },
  ]);
}

/** Session logged: six petals of light open around the orb and a tick draws through it. Plays once. */
export function success(p: Pal): Anim {
  const op = 90;
  const petals = Array.from({ length: 6 }, (_, i) => group(`p${i}`, [ellipse(0, -46, 26, 50), fill(i % 2 ? p.lilac : p.teal, 70)], {
    p: [100, 100], r: i * 60, s: [{ t: 0, v: [0, 0], e: EASE.back }, { t: 20 + i * 3, v: [100, 100] }, { t: 70, v: [100, 100], e: EASE.in }, { t: 88, v: [60, 60] }], o: [{ t: 0, v: 0 }, { t: 6, v: 100 }, { t: 70, v: 100 }, { t: 88, v: 0 }],
  }));
  return anim('breathe-success', 200, 200, op, [
    { nm: 'tick', shapes: [group('t', [path([[-16, 2], [-4, 13], [18, -11]]), stroke(p.bg, 7), trim([{ t: 0, v: 0 }, { t: 24, v: 0, e: EASE.out }, { t: 42, v: 100 }])], { p: [100, 100], o: [{ t: 0, v: 100 }, { t: 70, v: 100 }, { t: 86, v: 0 }] })] },
    { nm: 'core', shapes: [group('c', [ellipse(0, 0, 70), fill(p.teal)], { p: [100, 100], s: [{ t: 0, v: [40, 40], e: EASE.back }, { t: 16, v: [100, 100] }, { t: op, v: [100, 100] }], o: [{ t: 0, v: 100 }, { t: 70, v: 100 }, { t: 86, v: 0 }] })] },
    { nm: 'petals', shapes: petals },
  ]);
}
